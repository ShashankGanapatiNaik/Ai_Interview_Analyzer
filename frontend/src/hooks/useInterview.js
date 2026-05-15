/**
 * useInterview hook
 * Manages WebSocket connection, webcam capture, real-time analysis state,
 * timer, and question flow for the live interview room.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { WS_URL } from '@/utils/api'
import useAuthStore from '@/context/AuthContext'

const FRAME_INTERVAL_MS = 500   // capture frame every 500ms
const AUDIO_CHUNK_MS = 2000     // audio chunk every 2s

export default function useInterview(interviewId) {
  const { accessToken } = useAuthStore()

  // ── State ────────────────────────────────────────────────────────────────────
  const [status, setStatus] = useState('idle')         // idle | connecting | active | ended
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState([])
  const [timeLeft, setTimeLeft] = useState(120)
  const [transcript, setTranscript] = useState('')
  const [analysis, setAnalysis] = useState({
    emotion: 'Neutral',
    emotion_confidence: 0.5,
    eye_contact_score: 0.75,
    attention_score: 0.8,
    posture_score: 0.7,
    confidence_score: 0.75,
    voice_energy: 0.5,
    speech_rate: 120,
    filler_words: [],
    filler_count: 0,
    live_feedback: null,
    alert: null,
    multiple_faces: false,
  })
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)

  // ── Refs ──────────────────────────────────────────────────────────────────────
  const wsRef = useRef(null)
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const timerRef = useRef(null)
  const frameIntervalRef = useRef(null)
  const recognitionRef = useRef(null)

  // ── WebSocket ─────────────────────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (!interviewId || !accessToken) return

    setStatus('connecting')
    const ws = new WebSocket(`${WS_URL}/ws/interview/${interviewId}?token=${accessToken}`)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      setStatus('active')
      setError(null)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'analysis') {
          setAnalysis(prev => ({ ...prev, ...data }))
        } else if (data.type === 'error') {
          setError(data.message)
        }
      } catch (e) {
        console.warn('WS parse error', e)
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      if (status !== 'ended') setStatus('idle')
    }

    ws.onerror = (e) => {
      setError('WebSocket connection failed. Check your network.')
      setIsConnected(false)
    }
  }, [interviewId, accessToken])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'end' }))
      wsRef.current.close()
    }
  }, [])

  // ── Frame capture & send ──────────────────────────────────────────────────────
  const captureAndSendFrame = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    if (!webcamRef.current) return

    const video = webcamRef.current.video
    if (!video || video.readyState !== 4) return

    const canvas = canvasRef.current || document.createElement('canvas')
    canvas.width = 320
    canvas.height = 240
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, 320, 240)

    const frame_b64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1]

    wsRef.current.send(JSON.stringify({
      type: 'frame',
      frame_b64,
      transcript: transcript.slice(-200),
      question_index: questionIndex,
    }))
  }, [questionIndex, transcript])

  // ── Speech Recognition ────────────────────────────────────────────────────────
  const startSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) finalTranscript += result[0].transcript
        else interimTranscript += result[0].transcript
      }
      setTranscript(prev => prev + finalTranscript + interimTranscript)
    }

    recognition.onerror = (e) => {
      if (e.error !== 'no-speech') console.warn('Speech recognition error:', e.error)
    }

    recognition.start()
    recognitionRef.current = recognition
  }, [])

  // ── Timer ─────────────────────────────────────────────────────────────────────
  const startTimer = useCallback((duration = 120) => {
    setTimeLeft(duration)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  // ── Interview flow ────────────────────────────────────────────────────────────
  const startInterview = useCallback((interviewData) => {
    setQuestions(interviewData.questions || [])
    setCurrentQuestion(interviewData.questions?.[0])
    setQuestionIndex(0)
    setTranscript('')
    connect()
    startTimer(interviewData.question_timer || 120)
    startSpeechRecognition()

    frameIntervalRef.current = setInterval(captureAndSendFrame, FRAME_INTERVAL_MS)
  }, [connect, startTimer, startSpeechRecognition, captureAndSendFrame])

  const nextQuestion = useCallback(() => {
    const next = questionIndex + 1
    if (next >= questions.length) {
      endInterview()
      return
    }
    setQuestionIndex(next)
    setCurrentQuestion(questions[next])
    setTranscript('')
    startTimer(120)
  }, [questionIndex, questions])

  const endInterview = useCallback(() => {
    setStatus('ended')
    clearInterval(timerRef.current)
    clearInterval(frameIntervalRef.current)
    recognitionRef.current?.stop()
    disconnect()
  }, [disconnect])

  // ── Cleanup ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      clearInterval(frameIntervalRef.current)
      recognitionRef.current?.stop()
      disconnect()
    }
  }, [])

  return {
    status,
    currentQuestion,
    questionIndex,
    questions,
    timeLeft,
    transcript,
    analysis,
    isConnected,
    error,
    webcamRef,
    canvasRef,
    startInterview,
    nextQuestion,
    endInterview,
    setTranscript,
  }
}

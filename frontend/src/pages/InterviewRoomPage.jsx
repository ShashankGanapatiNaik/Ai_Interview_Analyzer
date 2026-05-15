import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Webcam from 'react-webcam'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import { Card, SectionLabel, MetricBar, Badge, Button, Spinner } from '@/components/ui'
import useInterview from '@/hooks/useInterview'
import api from '@/utils/api'

export default function InterviewRoomPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [interviewData, setInterviewData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [voiceHistory, setVoiceHistory] = useState(Array(20).fill({ v: 50 }))
  const [feedbackHistory, setFeedbackHistory] = useState([])

  const {
    status, currentQuestion, questionIndex, questions,
    timeLeft, transcript, analysis, isConnected, error,
    webcamRef, startInterview, nextQuestion, endInterview,
  } = useInterview(id)

  // Fetch interview data
  useEffect(() => {
    api.get(`/interviews/${id}`)
      .then(r => { setInterviewData(r.data); setLoading(false) })
      .catch(() => { toast.error('Interview not found'); navigate('/interview/setup') })
  }, [id])

  // Update voice history for mini chart
  useEffect(() => {
    setVoiceHistory(prev => [...prev.slice(1), { v: Math.round(analysis.voice_energy * 100) }])
  }, [analysis.voice_energy])

  // Log live feedback
  useEffect(() => {
    if (analysis.live_feedback) {
      setFeedbackHistory(prev => [
        { text: analysis.live_feedback, time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
        ...prev.slice(0, 7),
      ])
    }
  }, [analysis.live_feedback])

  // Alert toasts
  useEffect(() => {
    if (analysis.alert) toast(analysis.alert, { icon: '⚠️', duration: 3000 })
  }, [analysis.alert])

  const handleStart = async () => {
    await api.patch(`/interviews/${id}/start`)
    startInterview(interviewData)
  }

  const handleEnd = async () => {
    endInterview()
    await api.patch(`/interviews/${id}/complete`)
    toast.success('Interview completed! Generating your report...')
    setTimeout(() => navigate(`/reports/${id}`), 1500)
  }

  const timerPct = (timeLeft / 120) * 100
  const timerColor = timeLeft > 60 ? '#00d4ff' : timeLeft > 30 ? '#f59e0b' : '#ef4444'

  const emotionColors = {
    Confident: '#10b981', Happy: '#10b981', Calm: '#00d4ff',
    Thoughtful: '#f59e0b', Neutral: '#64748b',
    Fear: '#ef4444', Angry: '#ef4444', Sad: '#7c3aed',
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Spinner size={40} />
    </div>
  )

  return (
    <div className="p-6 max-w-screen-xl mx-auto flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Interview <span style={{ color: 'var(--accent)' }}>Room</span>
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted2)' }}>
            {interviewData?.type} · {interviewData?.difficulty} · {interviewData?.target_role}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {status === 'active' && (
            <Badge variant="red" className="animate-pulse">● LIVE AI</Badge>
          )}
          {status === 'idle' && (
            <Button onClick={handleStart} size="lg">▶ Start Interview</Button>
          )}
          {status === 'active' && (
            <Button variant="danger" onClick={handleEnd}>■ End Interview</Button>
          )}
        </div>
      </div>

      {/* MAIN LAYOUT */}
      {status === 'idle' && (
        <Card glow>
          <SectionLabel>Ready to Begin</SectionLabel>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎙️</div>
            <h2 className="text-xl font-bold mb-2">Your AI interview is configured and ready</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted2)' }}>
              {questions.length || interviewData?.total_questions} questions · {interviewData?.question_timer}s per question
            </p>
            <p className="text-xs mb-8" style={{ color: 'var(--muted)' }}>
              Ensure your webcam and microphone are enabled. The AI will analyze your behavior in real time.
            </p>
            <Button onClick={handleStart} size="lg">▶ Begin Interview</Button>
          </div>
        </Card>
      )}

      {status === 'active' && (
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 320px' }}>
          {/* LEFT: Webcam + Question */}
          <div className="flex flex-col gap-4">
            {/* Webcam */}
            <div className="relative rounded-2xl overflow-hidden" style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              aspectRatio: '16/9', minHeight: 300,
            }}>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                style={{ opacity: 0.95 }}
              />

              {/* Top overlay */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(239,68,68,0.9)' }}>
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  LIVE AI
                </div>
                <Badge variant="blue">Q{questionIndex + 1} / {questions.length}</Badge>
              </div>

              {/* Face tracking box */}
              <div className="absolute"
                style={{
                  top: '50%', left: '50%', transform: 'translate(-50%, -60%)',
                  width: 140, height: 170,
                  border: `2px solid ${emotionColors[analysis.emotion] || '#00d4ff'}`,
                  borderRadius: 8,
                  boxShadow: `0 0 20px ${emotionColors[analysis.emotion] || '#00d4ff'}40`,
                  animation: 'pulse-border 2s ease-in-out infinite',
                }}>
              </div>

              {/* Emotion badge */}
              <div className="absolute top-3 right-3 rounded-xl px-3 py-2"
                style={{ background: 'rgba(6,10,15,0.85)', border: '1px solid var(--border2)', backdropFilter: 'blur(10px)' }}>
                <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>EXPRESSION</div>
                <div className="text-base font-bold" style={{ color: emotionColors[analysis.emotion] || '#00d4ff' }}>
                  {analysis.emotion}
                </div>
                <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                  {Math.round(analysis.emotion_confidence * 100)}%
                </div>
              </div>

              {/* Bottom live chips */}
              <div className="absolute bottom-3 left-3 right-3 grid grid-cols-4 gap-2">
                {[
                  { label: 'EMOTION', val: analysis.emotion, color: emotionColors[analysis.emotion] || '#00d4ff' },
                  { label: 'ATTENTION', val: `${Math.round(analysis.attention_score * 100)}%`, color: '#10b981' },
                  { label: 'POSTURE', val: analysis.posture_score > 0.7 ? 'Good' : 'Improve', color: '#f59e0b' },
                  { label: 'PACE', val: analysis.speech_rate > 180 ? 'Fast' : analysis.speech_rate < 100 ? 'Slow' : 'Optimal', color: '#94a3b8' },
                ].map(chip => (
                  <div key={chip.label} className="text-center rounded-xl py-2 px-1"
                    style={{ background: 'rgba(6,10,15,0.85)', border: '1px solid var(--border2)', backdropFilter: 'blur(8px)' }}>
                    <div className="text-xs font-mono" style={{ color: 'var(--muted)', fontSize: 9 }}>{chip.label}</div>
                    <div className="text-xs font-bold mt-0.5" style={{ color: chip.color }}>{chip.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question */}
            <Card>
              <div className="text-xs font-mono mb-2" style={{ color: 'var(--accent)' }}>
                QUESTION {String(questionIndex + 1).padStart(2, '0')} · {interviewData?.type} · {interviewData?.difficulty}
              </div>
              <p className="text-base font-semibold leading-relaxed">
                {currentQuestion?.text || 'Loading question...'}
              </p>
              {/* Timer */}
              <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: timerColor, transition: 'width 1s linear, background 0.5s' }}
                  animate={{ width: `${timerPct}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs font-mono" style={{ color: 'var(--muted)' }}>
                <span>Time remaining</span>
                <span style={{ color: timerColor }}>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
              </div>
            </Card>

            {/* Transcript */}
            <Card>
              <div className="flex justify-between items-center mb-2">
                <SectionLabel>Live Transcription</SectionLabel>
                {isConnected && (
                  <span className="flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--accent3)' }}>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connected
                  </span>
                )}
              </div>
              <div className="rounded-xl p-3 min-h-20 max-h-28 overflow-y-auto text-xs font-mono leading-relaxed"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--muted2)' }}>
                {transcript || 'Listening for speech...'}
                <span className="inline-block w-0.5 h-3.5 bg-cyan-400 ml-0.5 animate-pulse align-middle" />
              </div>
            </Card>

            {/* Next button */}
            <div className="flex gap-3">
              <Button onClick={nextQuestion} className="flex-1">
                → Next Question
              </Button>
              <Button variant="danger" onClick={handleEnd}>End Interview</Button>
            </div>
          </div>

          {/* RIGHT: AI Panel */}
          <div className="flex flex-col gap-4">
            {/* AI Status */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981' }} />
                <span className="text-xs font-mono" style={{ color: '#10b981' }}>AI ENGINE ACTIVE</span>
              </div>
              <MetricBar label="Confidence" value={Math.round(analysis.confidence_score * 100)} color="#7c3aed" />
              <MetricBar label="Attention" value={Math.round(analysis.attention_score * 100)} color="#10b981" />
              <MetricBar label="Eye Contact" value={Math.round(analysis.eye_contact_score * 100)} color="#00d4ff" />
              <MetricBar label="Posture" value={Math.round(analysis.posture_score * 100)} color="#f59e0b" />
            </Card>

            {/* Voice Analysis */}
            <Card>
              <SectionLabel>Voice Analysis</SectionLabel>
              {/* Waveform visualization */}
              <div className="flex items-center gap-0.5 h-10 mb-3">
                {voiceHistory.map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm"
                    style={{
                      height: `${Math.max(4, h.v)}%`,
                      background: 'var(--accent)',
                      opacity: 0.3 + (i / voiceHistory.length) * 0.7,
                    }}
                  />
                ))}
              </div>
              <MetricBar label="Speech Rate" value={Math.min(100, Math.round(analysis.speech_rate / 2.5))} color="#00d4ff" />
              <MetricBar label="Voice Energy" value={Math.round(analysis.voice_energy * 100)} color="#10b981" />
              <MetricBar label="Clarity" value={Math.round((analysis.clarity_score || 0.8) * 100)} color="#7c3aed" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>Filler words</span>
                <Badge variant={analysis.filler_count > 2 ? 'red' : 'green'}>
                  {analysis.filler_count} detected
                </Badge>
              </div>
              {analysis.filler_words?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {analysis.filler_words.map(w => (
                    <Badge key={w} variant="amber">"{w}"</Badge>
                  ))}
                </div>
              )}
            </Card>

            {/* Live AI Feedback */}
            <Card style={{ flex: 1 }}>
              <SectionLabel>Live AI Feedback</SectionLabel>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                <AnimatePresence>
                  {feedbackHistory.map((f, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2 items-start p-2 rounded-lg text-xs"
                      style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
                      <span className="flex-shrink-0 mt-0.5">💡</span>
                      <div>
                        <div style={{ color: 'var(--text)' }}>{f.text}</div>
                        <div className="font-mono mt-0.5" style={{ color: 'var(--muted)', fontSize: 10 }}>{f.time}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {feedbackHistory.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--muted)' }}>
                    AI feedback will appear here as you speak...
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {status === 'ended' && (
        <Card glow>
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Interview Complete!</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted2)' }}>
              Generating your AI behavioral report...
            </p>
            <Spinner size={32} />
          </div>
        </Card>
      )}
    </div>
  )
}

/**
 * WebcamDetector — webcam feed with AI face tracking overlay,
 * emotion badge, live metric chips, and recording indicator.
 */

import { forwardRef } from 'react'
import Webcam from 'react-webcam'
import { motion, AnimatePresence } from 'framer-motion'

const EMOTION_COLORS = {
  Confident: '#10b981', Happy: '#10b981', Calm: '#00d4ff',
  Thoughtful: '#f59e0b', Neutral: '#64748b', Energized: '#a78bfa',
  Fear: '#ef4444', Angry: '#ef4444', Sad: '#7c3aed',
}

const WebcamDetector = forwardRef(function WebcamDetector(
  { analysis, isLive = false, questionIndex = 0, totalQuestions = 5 },
  ref
) {
  const emotionColor = EMOTION_COLORS[analysis?.emotion] || '#64748b'
  const eyeScore     = Math.round((analysis?.eye_contact_score || 0.75) * 100)
  const attentionScore = Math.round((analysis?.attention_score || 0.8) * 100)
  const posture      = (analysis?.posture_score || 0.7) > 0.7 ? 'Good' : 'Improve'
  const pace         = (analysis?.speech_rate || 120) > 180 ? 'Fast' : (analysis?.speech_rate || 120) < 90 ? 'Slow' : 'Optimal'

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: '#0c1219',
        border: '1px solid var(--border)',
        aspectRatio: '16/9',
        minHeight: 280,
      }}
    >
      {/* Webcam feed */}
      <Webcam
        ref={ref}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ width: 1280, height: 720, facingMode: 'user' }}
        className="w-full h-full object-cover"
        style={{ opacity: 0.95 }}
        mirrored
      />

      {/* Face tracking box */}
      <AnimatePresence>
        {isLive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute"
            style={{
              top: '50%', left: '50%',
              transform: 'translate(-50%, -60%)',
              width: 140, height: 170,
              border: `2px solid ${emotionColor}`,
              borderRadius: 8,
              boxShadow: `0 0 24px ${emotionColor}40`,
              animation: 'pulse-border 2s ease-in-out infinite',
            }}
          >
            {/* Corner brackets */}
            {[
              { top: -2, left: -2, borderWidth: '3px 0 0 3px', borderRadius: '4px 0 0 0' },
              { top: -2, right: -2, borderWidth: '3px 3px 0 0', borderRadius: '0 4px 0 0' },
              { bottom: -2, left: -2, borderWidth: '0 0 3px 3px', borderRadius: '0 0 0 4px' },
              { bottom: -2, right: -2, borderWidth: '0 3px 3px 0', borderRadius: '0 0 4px 0' },
            ].map((style, i) => (
              <div key={i} className="absolute" style={{
                width: 16, height: 16,
                borderColor: emotionColor,
                borderStyle: 'solid',
                ...style,
              }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
        {/* Recording badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ background: isLive ? 'rgba(239,68,68,0.9)' : 'rgba(100,116,139,0.7)' }}>
          <span className={`w-2 h-2 rounded-full bg-white ${isLive ? 'animate-pulse' : ''}`} />
          {isLive ? 'LIVE AI' : 'STANDBY'}
        </div>

        {/* Question counter */}
        <div className="px-3 py-1.5 rounded-full text-xs font-bold font-mono"
          style={{ background: 'rgba(6,10,15,0.85)', border: '1px solid var(--border2)', color: 'var(--accent)' }}>
          Q{questionIndex + 1} / {totalQuestions}
        </div>
      </div>

      {/* Emotion badge (top-right) */}
      {isLive && (
        <motion.div
          key={analysis?.emotion}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute rounded-xl px-3 py-2"
          style={{
            top: '3.5rem', right: '0.75rem',
            background: 'rgba(6,10,15,0.88)',
            border: `1px solid ${emotionColor}40`,
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>EXPRESSION</div>
          <div className="text-sm font-bold mt-0.5" style={{ color: emotionColor }}>{analysis?.emotion || 'Neutral'}</div>
          <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
            {Math.round((analysis?.emotion_confidence || 0.5) * 100)}%
          </div>
        </motion.div>
      )}

      {/* Bottom live chips */}
      {isLive && (
        <div className="absolute bottom-3 left-3 right-3 grid grid-cols-4 gap-2">
          {[
            { label: 'EMOTION',    val: analysis?.emotion || 'Neutral', color: emotionColor },
            { label: 'ATTENTION',  val: `${attentionScore}%`,           color: '#10b981' },
            { label: 'POSTURE',    val: posture,                         color: '#f59e0b' },
            { label: 'PACE',       val: pace,                            color: '#94a3b8' },
          ].map(chip => (
            <div key={chip.label} className="text-center rounded-xl py-2 px-1"
              style={{
                background: 'rgba(6,10,15,0.85)',
                border: '1px solid var(--border2)',
                backdropFilter: 'blur(8px)',
              }}>
              <div style={{ color: 'var(--muted)', fontSize: 9 }} className="font-mono">{chip.label}</div>
              <div className="text-xs font-bold mt-0.5 truncate" style={{ color: chip.color }}>{chip.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Multiple faces warning */}
      <AnimatePresence>
        {analysis?.multiple_faces && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-3 top-14 text-center py-2 px-3 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(239,68,68,0.9)', color: 'white' }}
          >
            ⚠️ Multiple faces detected — ensure only you are visible
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

export default WebcamDetector

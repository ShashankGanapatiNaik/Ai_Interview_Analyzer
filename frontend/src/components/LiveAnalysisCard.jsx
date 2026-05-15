/**
 * LiveAnalysisCard — animated real-time behavioral metric card
 * shown in the interview room sidebar.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { MetricBar } from '@/components/ui'

const EMOTION_COLORS = {
  Confident: '#10b981',
  Happy:     '#10b981',
  Calm:      '#00d4ff',
  Thoughtful:'#f59e0b',
  Neutral:   '#64748b',
  Energized: '#a78bfa',
  Fear:      '#ef4444',
  Angry:     '#ef4444',
  Sad:       '#7c3aed',
  Surprise:  '#f59e0b',
}

export default function LiveAnalysisCard({ analysis }) {
  const emotionColor = EMOTION_COLORS[analysis.emotion] || '#64748b'

  return (
    <div className="flex flex-col gap-3">
      {/* Emotion display */}
      <motion.div
        key={analysis.emotion}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-between p-3 rounded-xl"
        style={{ background: emotionColor + '15', border: `1px solid ${emotionColor}30` }}
      >
        <div>
          <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>CURRENT EMOTION</div>
          <div className="text-base font-bold mt-0.5" style={{ color: emotionColor }}>{analysis.emotion}</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-extrabold" style={{ color: emotionColor }}>
            {Math.round(analysis.emotion_confidence * 100)}%
          </div>
          <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>confidence</div>
        </div>
      </motion.div>

      {/* Core metrics */}
      <MetricBar label="Eye Contact"  value={Math.round(analysis.eye_contact_score  * 100)} color="#10b981" />
      <MetricBar label="Attention"    value={Math.round(analysis.attention_score     * 100)} color="#00d4ff" />
      <MetricBar label="Confidence"   value={Math.round(analysis.confidence_score   * 100)} color="#7c3aed" />
      <MetricBar label="Posture"      value={Math.round(analysis.posture_score      * 100)} color="#f59e0b" />
      <MetricBar label="Voice Energy" value={Math.round(analysis.voice_energy       * 100)} color="#06b6d4" />
      <MetricBar label="Speech Clarity" value={Math.round((analysis.clarity_score || 0.8) * 100)} color="#8b5cf6" />

      {/* Gaze direction */}
      <div className="flex items-center justify-between text-xs p-2 rounded-lg"
        style={{ background: 'var(--surface2)' }}>
        <span style={{ color: 'var(--muted)' }}>Gaze Direction</span>
        <span className="font-mono font-semibold capitalize"
          style={{ color: analysis.gaze_direction === 'center' ? '#10b981' : '#f59e0b' }}>
          {analysis.gaze_direction || 'center'}
        </span>
      </div>

      {/* Multiple faces alert */}
      <AnimatePresence>
        {analysis.multiple_faces && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs p-2 rounded-lg font-semibold"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            ⚠️ Multiple faces detected
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speech rate indicator */}
      <div className="flex items-center justify-between text-xs p-2 rounded-lg"
        style={{ background: 'var(--surface2)' }}>
        <span style={{ color: 'var(--muted)' }}>Speech Rate</span>
        <span className="font-mono font-semibold"
          style={{ color: analysis.speech_rate > 180 ? '#ef4444' : analysis.speech_rate < 100 ? '#f59e0b' : '#10b981' }}>
          {Math.round(analysis.speech_rate || 120)} WPM
          {analysis.speech_rate > 180 ? ' (too fast)' : analysis.speech_rate < 100 ? ' (too slow)' : ' ✓'}
        </span>
      </div>
    </div>
  )
}

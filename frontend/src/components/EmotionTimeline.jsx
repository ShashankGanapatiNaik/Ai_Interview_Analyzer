/**
 * EmotionTimeline — displays a scrollable timeline of emotional states
 * during an interview session.
 */

import { motion } from 'framer-motion'

const EMOTION_STYLES = {
  Confident:  { bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
  Happy:      { bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
  Calm:       { bg: 'rgba(0,212,255,0.12)',   color: '#00d4ff' },
  Thoughtful: { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  Energized:  { bg: 'rgba(124,58,237,0.15)',  color: '#a78bfa' },
  Neutral:    { bg: 'rgba(100,116,139,0.15)', color: '#64748b' },
  Surprise:   { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  Fear:       { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
  Angry:      { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
  Sad:        { bg: 'rgba(124,58,237,0.12)',  color: '#7c3aed' },
}

export default function EmotionTimeline({ items = [], maxItems = 8 }) {
  const displayed = items.slice(0, maxItems)

  if (displayed.length === 0) {
    return (
      <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>
        Emotional data will appear as you complete the interview
      </p>
    )
  }

  return (
    <div className="flex flex-col">
      {displayed.map((item, i) => {
        const style = EMOTION_STYLES[item.emotion] || EMOTION_STYLES.Neutral
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex gap-3 items-start py-2.5 border-b last:border-0"
            style={{ borderColor: 'var(--border)' }}
          >
            {/* Timestamp */}
            <span className="text-xs font-mono w-12 flex-shrink-0 pt-0.5" style={{ color: 'var(--muted)' }}>
              {item.time}
            </span>

            {/* Emotion badge */}
            <span
              className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-semibold whitespace-nowrap"
              style={{ background: style.bg, color: style.color }}
            >
              {item.emotion}
            </span>

            {/* Note */}
            {item.note && (
              <span className="text-xs leading-relaxed" style={{ color: 'var(--muted2)' }}>
                {item.note}
              </span>
            )}

            {/* Confidence */}
            {item.confidence != null && (
              <span className="ml-auto text-xs font-mono flex-shrink-0" style={{ color: style.color }}>
                {Math.round(item.confidence)}%
              </span>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

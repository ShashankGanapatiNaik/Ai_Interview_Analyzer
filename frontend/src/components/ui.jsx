/**
 * Shared UI components for the AI Interview Analyzer.
 */

import { motion } from 'framer-motion'
import clsx from 'clsx'

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', glow = false, ...props }) {
  return (
    <div
      className={clsx('relative overflow-hidden rounded-2xl p-6', className)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
      {...props}
    >
      {glow && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 60% 30%, rgba(0,212,255,0.08) 0%, transparent 60%)' }} />
      )}
      {children}
    </div>
  )
}

// ── Section Label ─────────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  )
}

// ── Metric Bar ────────────────────────────────────────────────────────────────
export function MetricBar({ label, value, color = '#00d4ff', max = 100, animated = true }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="text-xs w-32 flex-shrink-0" style={{ color: 'var(--text)' }}>{label}</div>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--surface2)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={animated ? { width: 0 } : { width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>
      <div className="text-xs font-mono w-8 text-right" style={{ color }}>{pct}</div>
    </div>
  )
}

// ── Score Ring ────────────────────────────────────────────────────────────────
export function ScoreRing({ score, label = 'AI Score', size = 140 }) {
  const r = (size / 2) - 12
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="10"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="url(#scoreGrad)" strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center">
        <div className="text-3xl font-extrabold" style={{
          background: 'linear-gradient(135deg,#00d4ff,#7c3aed)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {score}
        </div>
        <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{label}</div>
      </div>
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  blue:   { background: 'rgba(0,212,255,0.1)',   color: '#00d4ff',  border: '1px solid rgba(0,212,255,0.2)' },
  green:  { background: 'rgba(16,185,129,0.1)',  color: '#10b981',  border: '1px solid rgba(16,185,129,0.2)' },
  purple: { background: 'rgba(124,58,237,0.1)',  color: '#a78bfa',  border: '1px solid rgba(124,58,237,0.2)' },
  red:    { background: 'rgba(239,68,68,0.1)',   color: '#ef4444',  border: '1px solid rgba(239,68,68,0.2)' },
  amber:  { background: 'rgba(245,158,11,0.1)',  color: '#f59e0b',  border: '1px solid rgba(245,158,11,0.2)' },
}

export function Badge({ children, variant = 'blue', className = '' }) {
  return (
    <span
      className={clsx('inline-block px-2 py-0.5 rounded-full text-xs font-semibold font-mono', className)}
      style={BADGE_STYLES[variant] || BADGE_STYLES.blue}
    >
      {children}
    </span>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading = false, className = '', ...props }) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer border-none'
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  }
  const variants = {
    primary: {
      background: 'linear-gradient(135deg,#00d4ff,rgba(0,180,220,0.8))',
      color: '#000',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text)',
      border: '1px solid var(--border2)',
    },
    danger: {
      background: 'rgba(239,68,68,0.15)',
      color: '#ef4444',
      border: '1px solid rgba(239,68,68,0.3)',
    },
    secondary: {
      background: 'rgba(124,58,237,0.15)',
      color: '#a78bfa',
      border: '1px solid rgba(124,58,237,0.3)',
    },
  }

  return (
    <button
      className={clsx(base, sizes[size], className)}
      style={variants[variant] || variants.primary}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'currentColor' }} />
      )}
      {children}
    </button>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, delta, color = '#00d4ff', iconBg }) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      whileHover={{ y: -2, borderColor: color + '40' }}
      transition={{ duration: 0.2 }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
        style={iconBg || { background: color + '15', border: `1px solid ${color}30` }}>
        {icon}
      </div>
      <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--muted)' }}>
        {label}
      </div>
      <div className="text-3xl font-extrabold tracking-tight" style={{ color }}>
        {value}
      </div>
      {delta && (
        <div className="text-xs font-mono mt-1" style={{ color: 'var(--accent3)' }}>{delta}</div>
      )}
    </motion.div>
  )
}

// ── Loading Spinner ───────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = 'var(--accent)' }) {
  return (
    <span
      className="inline-block rounded-full border-2 animate-spin"
      style={{
        width: size, height: size,
        borderColor: 'rgba(255,255,255,0.1)',
        borderTopColor: color,
      }}
    />
  )
}

// ── Protected Route ───────────────────────────────────────────────────────────
export function ProtectedRoute() {
  // handled in separate file
  return null
}

// ── Empty State ────────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <div className="text-lg font-bold mb-2">{title}</div>
      <div className="text-sm mb-6" style={{ color: 'var(--muted2)' }}>{subtitle}</div>
      {action}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, Radar,
} from 'recharts'
import { Card, SectionLabel, StatCard, MetricBar, ScoreRing, Badge, Button } from '@/components/ui'
import api from '@/utils/api'
import useAuthStore from '@/context/AuthContext'

const TREND_DATA = [
  { session: 'S1', overall: 58, confidence: 65, eye: 50, voice: 72 },
  { session: 'S2', overall: 63, confidence: 70, eye: 55, voice: 75 },
  { session: 'S3', overall: 68, confidence: 72, eye: 62, voice: 80 },
  { session: 'S4', overall: 74, confidence: 78, eye: 68, voice: 84 },
  { session: 'S5', overall: 78, confidence: 82, eye: 71, voice: 88 },
]

const RADAR_DATA = [
  { subject: 'Confidence', value: 82 },
  { subject: 'Eye Contact', value: 71 },
  { subject: 'Voice', value: 88 },
  { subject: 'Posture', value: 65 },
  { subject: 'Attention', value: 87 },
  { subject: 'Clarity', value: 85 },
]

const EMOTION_TIMELINE = [
  { time: '00:00', emotion: '😊 Confident', note: 'Strong opening, direct eye contact' },
  { time: '02:15', emotion: '🤔 Thoughtful', note: 'Paused to structure answer' },
  { time: '04:30', emotion: '💪 Energized', note: 'Enthusiasm during explanation' },
  { time: '06:45', emotion: '😌 Calm', note: 'Good composure under pressure' },
  { time: '09:10', emotion: '😊 Confident', note: 'Strong closing statement' },
]

const LEADERBOARD = [
  { rank: 1, name: 'Priya S.', score: 94, badge: '🥇' },
  { rank: 2, name: 'Arjun J.', score: 78, badge: '🥈', you: true },
  { rank: 3, name: 'Rahul M.', score: 73, badge: '🥉' },
  { rank: 4, name: 'Sneha K.', score: 69 },
  { rank: 5, name: 'Vikram P.', score: 65 },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState([])

  useEffect(() => {
    api.get('/interviews?limit=5').then(r => setInterviews(r.data)).catch(() => {})
  }, [])

  const scoreColor = (s) => s >= 80 ? '#10b981' : s >= 65 ? '#f59e0b' : '#ef4444'

  return (
    <div className="p-8 flex flex-col gap-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted2)' }}>
            Your behavioral analytics hub — AI-powered interview performance insights
          </p>
        </div>
        <Button onClick={() => navigate('/interview/setup')} size="lg">
          🎙️ Start Interview
        </Button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon="🎯" label="Overall Score" value="78" delta="↑ +12 from last session" color="#00d4ff" />
        <StatCard icon="🧬" label="Confidence Index" value="82%" delta="↑ +5% improvement" color="#7c3aed" />
        <StatCard icon="👁️" label="Eye Contact" value="71%" delta="→ Needs improvement" color="#10b981" />
        <StatCard icon="🎙️" label="Voice Clarity" value="88%" delta="↑ Strong performance" color="#f59e0b" />
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 320px' }}>
        {/* TREND CHART */}
        <Card glow>
          <SectionLabel>Performance Trend (Last 5 Sessions)</SectionLabel>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)" />
              <XAxis dataKey="session" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis domain={[40, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#141e2a', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="overall" stroke="#00d4ff" strokeWidth={2} dot={{ r: 4, fill: '#00d4ff' }} name="Overall" />
              <Line type="monotone" dataKey="confidence" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4, fill: '#7c3aed' }} name="Confidence" />
              <Line type="monotone" dataKey="eye" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} name="Eye Contact" />
              <Line type="monotone" dataKey="voice" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} name="Voice" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* SCORE RING */}
        <div className="flex flex-col gap-4">
          <Card glow style={{ flex: 1 }}>
            <SectionLabel>AI Performance Score</SectionLabel>
            <div className="flex justify-center py-2">
              <ScoreRing score={78} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
              {[['4', 'Sessions'], ['2.1h', 'Practice'], ['3.8★', 'Rating']].map(([v, l]) => (
                <div key={l}>
                  <div className="font-bold text-base" style={{ color: 'var(--accent)' }}>{v}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{l}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* BEHAVIORAL METRICS + RADAR + EMOTION */}
      <div className="grid grid-cols-3 gap-6">
        {/* Metrics */}
        <Card>
          <SectionLabel>Behavioral Metrics</SectionLabel>
          <MetricBar label="Facial Expression" value={82} color="#00d4ff" />
          <MetricBar label="Eye Contact" value={71} color="#10b981" />
          <MetricBar label="Head Posture" value={65} color="#f59e0b" />
          <MetricBar label="Voice Confidence" value={88} color="#7c3aed" />
          <MetricBar label="Speech Clarity" value={85} color="#06b6d4" />
          <MetricBar label="Speaking Pace" value={78} color="#8b5cf6" />
          <MetricBar label="Attention Level" value={87} color="#00d4ff" />
          <MetricBar label="Nervousness" value={22} color="#ef4444" />
        </Card>

        {/* Radar */}
        <Card>
          <SectionLabel>Competency Radar</SectionLabel>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(99,179,237,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
              <Radar name="Score" dataKey="value" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Emotion Timeline */}
        <Card>
          <SectionLabel>Emotional Timeline</SectionLabel>
          {EMOTION_TIMELINE.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-3 items-start py-2.5 border-b last:border-0"
              style={{ borderColor: 'var(--border)' }}>
              <span className="text-xs font-mono w-12 flex-shrink-0 pt-0.5" style={{ color: 'var(--muted)' }}>{item.time}</span>
              <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-semibold"
                style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent)' }}>
                {item.emotion}
              </span>
              <span className="text-xs" style={{ color: 'var(--muted2)' }}>{item.note}</span>
            </motion.div>
          ))}
        </Card>
      </div>

      {/* LEADERBOARD + SESSIONS */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <SectionLabel>🏆 Candidate Leaderboard</SectionLabel>
          {LEADERBOARD.map((c) => (
            <div key={c.rank} className="flex items-center gap-3 py-3 border-b last:border-0"
              style={{ borderColor: 'var(--border)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: c.rank <= 3 ? 'rgba(245,158,11,0.15)' : 'var(--surface2)', color: c.rank <= 3 ? 'var(--accent4)' : 'var(--muted)' }}>
                {c.rank}
              </div>
              <div className="flex-1 font-semibold text-sm">
                {c.badge} {c.name} {c.you && <Badge variant="blue" className="ml-1">you</Badge>}
              </div>
              <Badge variant={c.score >= 80 ? 'green' : c.score >= 65 ? 'amber' : 'red'}>
                {c.score}
              </Badge>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="w-full mt-3" onClick={() => navigate('/leaderboard')}>
            View Full Leaderboard →
          </Button>
        </Card>

        <Card>
          <SectionLabel>Recent Sessions</SectionLabel>
          {interviews.length > 0 ? (
            interviews.map((iv) => (
              <div key={iv.id} className="flex justify-between items-center py-3 border-b last:border-0 cursor-pointer"
                style={{ borderColor: 'var(--border)' }}
                onClick={() => navigate(`/reports/${iv.id}`)}>
                <div>
                  <div className="text-sm font-semibold">{iv.type}</div>
                  <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--muted)' }}>
                    {new Date(iv.created_at).toLocaleDateString()} · {iv.difficulty}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={iv.status === 'completed' ? 'green' : 'purple'}>{iv.status}</Badge>
                  {iv.overall_score && (
                    <Badge variant={iv.overall_score >= 75 ? 'green' : 'amber'}>{iv.overall_score}</Badge>
                  )}
                </div>
              </div>
            ))
          ) : (
            [
              { type: 'Technical + Behavioral', date: 'May 9, 2026', score: 78, diff: '23 min' },
              { type: 'HR & Cultural Fit', date: 'May 7, 2026', score: 72, diff: '18 min' },
              { type: 'Leadership', date: 'May 5, 2026', score: 68, diff: '25 min' },
            ].map((s, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b last:border-0"
                style={{ borderColor: 'var(--border)' }}>
                <div>
                  <div className="text-sm font-semibold">{s.type}</div>
                  <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--muted)' }}>{s.date} · {s.diff}</div>
                </div>
                <Badge variant={s.score >= 75 ? 'green' : 'amber'}>{s.score}</Badge>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  )
}

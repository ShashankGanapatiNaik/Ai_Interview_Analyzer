import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import { Card, SectionLabel, MetricBar, ScoreRing, Badge, Button, Spinner } from '@/components/ui'
import EmotionTimeline from '@/components/EmotionTimeline'
import api from '@/utils/api'

export default function ReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    api.get(`/reports/${id}`)
      .then(r => { setReport(r.data); setLoading(false) })
      .catch(() => { toast.error('Report not found'); navigate('/reports') })
  }, [id])

  const generateAI = async () => {
    setAiLoading(true)
    try {
      const { data } = await api.post(`/reports/${id}/ai-summary`)
      setReport(p => ({ ...p, ai_summary: data.ai_summary }))
      toast.success('AI summary generated!')
    } catch { toast.error('Failed to generate summary') }
    finally { setAiLoading(false) }
  }

  if (loading) return <div className="flex justify-center items-center h-96"><Spinner size={40} /></div>
  if (!report) return null

  const scores = report.scores || {}
  const trendData = [
    { s: 'S1', v: 58 }, { s: 'S2', v: 63 }, { s: 'S3', v: 68 },
    { s: 'S4', v: 74 }, { s: 'S5', v: Math.round(scores.overall_score || 78) },
  ]

  const scoreItems = [
    ['Overall',    scores.overall_score,    '#00d4ff'],
    ['Confidence', scores.confidence_score, '#7c3aed'],
    ['Eye Contact',scores.eye_contact_score,'#10b981'],
    ['Voice',      scores.voice_score,      '#f59e0b'],
    ['Posture',    scores.posture_score,    '#ef4444'],
  ]

  return (
    <div className="p-8 max-w-screen-xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            AI Interview <span style={{ color: 'var(--accent)' }}>Report</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted2)' }}>
            {report.type} · {report.target_role} · {new Date(report.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={generateAI} loading={aiLoading}>🤖 AI Summary</Button>
          <Button size="sm" onClick={() => window.open(`/api/reports/${id}/export/pdf`, '_blank')}>⬇ Export PDF</Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>← Back</Button>
        </div>
      </div>

      {/* Score pills */}
      <div className="grid grid-cols-5 gap-3">
        {scoreItems.map(([label, val, color]) => (
          <motion.div key={label} whileHover={{ y: -2 }}
            className="text-center p-4 rounded-2xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-extrabold" style={{ color }}>{Math.round(val || 0)}</div>
            <div className="text-xs font-mono mt-1" style={{ color: 'var(--muted)' }}>{label.toUpperCase()}</div>
          </motion.div>
        ))}
      </div>

      {/* AI Summary */}
      <Card glow>
        <SectionLabel>🤖 AI Analysis Summary</SectionLabel>
        {report.ai_summary ? (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted2)' }}>{report.ai_summary}</p>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm italic mb-3" style={{ color: 'var(--muted)' }}>
              Click "AI Summary" to generate a personalized behavioral analysis powered by Claude
            </p>
            <Button onClick={generateAI} loading={aiLoading} variant="secondary" size="sm">
              🤖 Generate AI Analysis
            </Button>
          </div>
        )}
      </Card>

      {/* Emotion + Strengths/Weaknesses */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <SectionLabel>😊 Emotional Timeline</SectionLabel>
          <EmotionTimeline items={report.emotion_timeline || []} />
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <SectionLabel>💪 Strengths</SectionLabel>
            {(report.strengths || []).map((s, i) => (
              <div key={i} className="flex gap-2 py-2 border-b last:border-0 text-sm"
                style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--accent3)' }}>✓</span>
                <span style={{ color: 'var(--muted2)' }}>{s}</span>
              </div>
            ))}
          </Card>
          <Card>
            <SectionLabel>⚡ Areas to Improve</SectionLabel>
            {(report.weaknesses || []).map((w, i) => (
              <div key={i} className="flex gap-2 py-2 border-b last:border-0 text-sm"
                style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--accent4)' }}>⚠</span>
                <span style={{ color: 'var(--muted2)' }}>{w}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Recommendations */}
      <Card>
        <SectionLabel>🎯 Personalized AI Recommendations</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {(report.recommendations || []).map((r, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl text-sm"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
              <span>💡</span>
              <span style={{ color: 'var(--muted2)' }}>{r}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Metric bars */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <SectionLabel>Detailed Metric Breakdown</SectionLabel>
          {scoreItems.map(([label, val, color]) => (
            <MetricBar key={label} label={label} value={Math.round(val || 0)} color={color} />
          ))}
        </Card>

        {/* Trend Chart */}
        <Card>
          <SectionLabel>Performance Trend</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)" />
              <XAxis dataKey="s" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis domain={[40, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{
                background: '#141e2a', border: '1px solid rgba(99,179,237,0.2)',
                borderRadius: 10, fontSize: 12,
              }} />
              <Line type="monotone" dataKey="v" stroke="#00d4ff" strokeWidth={2}
                dot={{ r: 4, fill: '#00d4ff' }} name="Overall Score" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}

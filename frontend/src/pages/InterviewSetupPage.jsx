import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Card, SectionLabel, Button } from '@/components/ui'
import api from '@/utils/api'

export default function InterviewSetupPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: 'Technical + Behavioral',
    difficulty: 'Intermediate',
    target_role: 'Senior Software Engineer',
    question_timer: 120,
    total_questions: 5,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleStart = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/interviews/', form)
      toast.success('Interview created! Loading room...')
      navigate(`/interview/${data.id}`)
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to create interview')
    } finally {
      setLoading(false)
    }
  }

  const types = [
    'Technical + Behavioral', 'HR & Cultural Fit',
    'Leadership Assessment', 'Product Management', 'Data Science',
  ]
  const difficulties = [
    { label: 'Beginner', icon: '🌱' },
    { label: 'Intermediate', icon: '🚀' },
    { label: 'Advanced', icon: '⚡' },
  ]

  const sel = {
    background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 10,
    padding: '10px 14px', color: 'var(--text)', fontFamily: 'Syne, sans-serif',
    fontSize: 13, width: '100%', outline: 'none',
  }
  const inp = { ...sel }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Configure <span style={{ color: 'var(--accent)' }}>Interview</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted2)' }}>
          Set up your AI-monitored mock interview session
        </p>
      </div>

      <Card glow>
        {/* Interview Type */}
        <SectionLabel>Interview Type</SectionLabel>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {types.map(t => (
            <motion.button key={t} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => set('type', t)}
              className="p-3 rounded-xl text-xs font-semibold text-left transition-all"
              style={{
                background: form.type === t ? 'rgba(0,212,255,0.1)' : 'var(--surface2)',
                border: form.type === t ? '1px solid rgba(0,212,255,0.4)' : '1px solid var(--border)',
                color: form.type === t ? 'var(--accent)' : 'var(--muted2)',
                cursor: 'pointer',
              }}>
              {t}
            </motion.button>
          ))}
        </div>

        {/* Difficulty */}
        <SectionLabel>Difficulty Level</SectionLabel>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {difficulties.map(d => (
            <motion.button key={d.label} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => set('difficulty', d.label)}
              className="p-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: form.difficulty === d.label ? 'rgba(124,58,237,0.15)' : 'var(--surface2)',
                border: form.difficulty === d.label ? '1px solid rgba(124,58,237,0.4)' : '1px solid var(--border)',
                color: form.difficulty === d.label ? '#a78bfa' : 'var(--muted2)',
                cursor: 'pointer',
              }}>
              {d.icon} {d.label}
            </motion.button>
          ))}
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted2)' }}>Target Role</label>
            <input style={inp} value={form.target_role}
              onChange={e => set('target_role', e.target.value)}
              placeholder="e.g. Senior Software Engineer" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted2)' }}>Question Timer</label>
            <select style={sel} value={form.question_timer}
              onChange={e => set('question_timer', Number(e.target.value))}>
              <option value={60}>60 seconds</option>
              <option value={120}>120 seconds</option>
              <option value={180}>180 seconds</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted2)' }}>Number of Questions</label>
            <select style={sel} value={form.total_questions}
              onChange={e => set('total_questions', Number(e.target.value))}>
              {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n} questions</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted2)' }}>Analysis Mode</label>
            <select style={sel} defaultValue="full">
              <option value="full">Full AI Analysis</option>
              <option value="voice">Voice Only</option>
              <option value="facial">Facial Only</option>
            </select>
          </div>
        </div>

        {/* Features list */}
        <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted2)' }}>AI will analyze in real-time:</p>
          <div className="grid grid-cols-2 gap-1">
            {[
              '😊 Facial expressions & emotions',
              '👁️ Eye contact & gaze tracking',
              '🧘 Head posture & body language',
              '🎙️ Voice confidence & clarity',
              '💬 Speech pace & filler words',
              '📊 Behavioral confidence scoring',
            ].map(f => (
              <p key={f} className="text-xs" style={{ color: 'var(--muted2)' }}>{f}</p>
            ))}
          </div>
        </div>

        <div className="flex justify-end" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <Button onClick={handleStart} loading={loading} size="lg">
            {loading ? 'Generating AI Questions...' : '▶ Start Interview'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

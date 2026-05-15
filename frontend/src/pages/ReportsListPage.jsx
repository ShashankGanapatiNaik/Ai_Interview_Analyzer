import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, SectionLabel, Badge, Button, Spinner, EmptyState } from '@/components/ui'
import api from '@/utils/api'

export default function ReportsListPage() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/interviews?limit=20')
      .then(r => { setInterviews(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center items-center h-96"><Spinner size={40} /></div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Interview <span style={{ color: 'var(--accent)' }}>Reports</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted2)' }}>
            All your AI behavioral analysis reports
          </p>
        </div>
        <Button onClick={() => navigate('/interview/setup')}>+ New Interview</Button>
      </div>

      <Card>
        {interviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-lg font-bold mb-2">No interviews yet</p>
            <p className="text-sm mb-6" style={{ color: 'var(--muted2)' }}>
              Complete your first AI interview to see reports here
            </p>
            <Button onClick={() => navigate('/interview/setup')}>Start an Interview</Button>
          </div>
        ) : (
          interviews.map((iv, i) => (
            <motion.div key={iv.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex justify-between items-center py-4 border-b last:border-0 cursor-pointer"
              style={{ borderColor: 'var(--border)' }}
              onClick={() => iv.status === 'completed' && navigate(`/reports/${iv.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                  🎙️
                </div>
                <div>
                  <div className="font-semibold">{iv.type}</div>
                  <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--muted)' }}>
                    {new Date(iv.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })} · {iv.difficulty} · {iv.target_role}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={iv.status === 'completed' ? 'green' : iv.status === 'active' ? 'red' : 'purple'}>
                  {iv.status}
                </Badge>
                {iv.overall_score != null && (
                  <Badge variant={iv.overall_score >= 75 ? 'green' : iv.overall_score >= 60 ? 'amber' : 'red'}>
                    {Math.round(iv.overall_score)}
                  </Badge>
                )}
                {iv.status === 'completed'
                  ? <Button variant="ghost" size="sm">View Report →</Button>
                  : <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); navigate(`/interview/${iv.id}`) }}>
                      Resume
                    </Button>
                }
              </div>
            </motion.div>
          ))
        )}
      </Card>
    </div>
  )
}

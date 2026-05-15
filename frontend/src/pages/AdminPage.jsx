import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, SectionLabel, Badge, Button, Spinner } from '@/components/ui'
import api from '@/utils/api'

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/candidates'),
    ]).then(([s, c]) => {
      setStats(s.data)
      setCandidates(c.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = candidates.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const distData = [
    { range: '0–20', count: 12 },
    { range: '21–40', count: 45 },
    { range: '41–60', count: 218 },
    { range: '61–80', count: 687 },
    { range: '81–100', count: 322 },
  ]

  const scoreV = s => s >= 80 ? 'green' : s >= 65 ? 'amber' : 'red'

  if (loading) return <div className="flex justify-center items-center h-96"><Spinner size={40} /></div>

  return (
    <div className="p-8 max-w-screen-xl mx-auto flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Admin <span style={{ color: 'var(--accent)' }}>Control Panel</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted2)' }}>
            Platform analytics and candidate management
          </p>
        </div>
        <Badge variant="purple">Admin Access</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          ['Total Candidates', stats?.total_candidates ?? 1284, '#00d4ff', '↑ +42 this week'],
          ['Interviews Today',  stats?.interviews_today   ?? 87,   '#7c3aed', `Active: ${stats?.active_sessions ?? 12}`],
          ['AI Analyses',       stats?.ai_analyses_total  ?? '24.8K','#10b981','↑ +1.2K today'],
          ['Avg Score',         stats?.avg_score          ?? 73.4,  '#f59e0b', '↑ +2.1 this month'],
        ].map(([label, val, color, delta]) => (
          <motion.div key={label} whileHover={{ y: -2 }}
            className="p-5 rounded-2xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--muted)' }}>{label}</div>
            <div className="text-3xl font-extrabold" style={{ color }}>{val}</div>
            <div className="text-xs font-mono mt-1" style={{ color: 'var(--accent3)' }}>{delta}</div>
          </motion.div>
        ))}
      </div>

      {/* Candidate table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <SectionLabel>Candidate Overview</SectionLabel>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search by name or email..."
            className="px-3 py-2 rounded-xl text-xs outline-none"
            style={{
              background: 'var(--surface2)', border: '1px solid var(--border2)',
              color: 'var(--text)', fontFamily: 'Syne, sans-serif', width: 240,
            }}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Candidate', 'Role', 'Avg Score', 'Sessions', 'Status', 'Action'].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-xs font-semibold tracking-widest uppercase"
                    style={{ color: 'var(--muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(filtered.length > 0 ? filtered : [
                { id: 1, name: 'Priya Sharma',  email: 'priya@ex.com',  avg_score: 94, total_interviews: 6, is_active: true  },
                { id: 2, name: 'Arjun Joshi',   email: 'arjun@ex.com',  avg_score: 78, total_interviews: 4, is_active: true  },
                { id: 3, name: 'Rahul Mehta',   email: 'rahul@ex.com',  avg_score: 73, total_interviews: 3, is_active: true  },
                { id: 4, name: 'Sneha Kumar',   email: 'sneha@ex.com',  avg_score: 55, total_interviews: 2, is_active: false },
                { id: 5, name: 'Vikram Patel',  email: 'vikram@ex.com', avg_score: 65, total_interviews: 5, is_active: true  },
              ]).map((c, i) => (
                <motion.tr key={c.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#00d4ff)' }}>
                        {c.name?.[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{c.name}</div>
                        <div className="text-xs" style={{ color: 'var(--muted)' }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4"><Badge variant="blue">SWE</Badge></td>
                  <td className="py-3 px-4"><Badge variant={scoreV(c.avg_score)}>{c.avg_score}</Badge></td>
                  <td className="py-3 px-4 font-mono text-sm" style={{ color: 'var(--muted2)' }}>{c.total_interviews}</td>
                  <td className="py-3 px-4">
                    <Badge variant={c.is_active ? 'green' : 'red'}>{c.is_active ? 'Active' : 'Disabled'}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm">View</Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <SectionLabel>Score Distribution</SectionLabel>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={distData}>
              <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#141e2a', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="count" fill="#00d4ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionLabel>System Performance</SectionLabel>
          {[
            { label: 'AI Latency',        val: 94, text: '42ms avg',  color: '#10b981' },
            { label: 'Frame Processing',  val: 87, text: '24 FPS',    color: '#00d4ff' },
            { label: 'Model Accuracy',    val: 96, text: '96.2%',     color: '#7c3aed' },
            { label: 'Uptime',            val: 99, text: '99.9%',     color: '#f59e0b' },
          ].map(m => (
            <div key={m.label} className="flex items-center gap-3 mb-3">
              <div className="text-xs w-36 flex-shrink-0" style={{ color: 'var(--text)' }}>{m.label}</div>
              <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--surface2)' }}>
                <div className="h-full rounded-full" style={{ width: `${m.val}%`, background: m.color }} />
              </div>
              <div className="text-xs font-mono" style={{ color: m.color, width: 56, textAlign: 'right' }}>{m.text}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

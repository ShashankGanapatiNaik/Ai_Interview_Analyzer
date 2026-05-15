import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, SectionLabel, Badge, Spinner } from '@/components/ui'
import api from '@/utils/api'

const MEDALS = ['🥇', '🥈', '🥉']
const COLORS = ['#f59e0b', '#94a3b8', '#cd7c2f']

export default function LeaderboardPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/leaderboard?limit=20')
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => {
        setData([
          { rank: 1, name: 'Priya Sharma',  avg_score: 94, total_interviews: 6 },
          { rank: 2, name: 'Anita Rao',     avg_score: 88, total_interviews: 4 },
          { rank: 3, name: 'Arjun Joshi',   avg_score: 78, total_interviews: 4, you: true },
          { rank: 4, name: 'Rahul Mehta',   avg_score: 73, total_interviews: 3 },
          { rank: 5, name: 'Sneha Kumar',   avg_score: 69, total_interviews: 5 },
          { rank: 6, name: 'Vikram Patel',  avg_score: 65, total_interviews: 2 },
          { rank: 7, name: 'Kiran Nair',    avg_score: 61, total_interviews: 3 },
          { rank: 8, name: 'Deepa Iyer',    avg_score: 58, total_interviews: 1 },
        ])
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="flex justify-center items-center h-96"><Spinner size={40} /></div>

  const top3 = data.slice(0, 3)
  const rest  = data.slice(3)

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          🏆 <span style={{ color: 'var(--accent)' }}>Leaderboard</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted2)' }}>
          Top performing candidates ranked by AI behavioral scores
        </p>
      </div>

      {/* Top 3 podium */}
      <div className="flex justify-center items-end gap-4 mb-8">
        {[top3[1], top3[0], top3[2]].filter(Boolean).map((c, i) => {
          const podiumOrder = [2, 1, 3]
          const heights     = ['160px', '200px', '140px']
          const rank        = podiumOrder[i]
          return (
            <motion.div key={c.name}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex flex-col items-center gap-2"
              style={{ width: 110 }}>
              <div className="text-3xl">{MEDALS[rank - 1]}</div>
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                style={{ background: `linear-gradient(135deg,${COLORS[rank-1]}60,${COLORS[rank-1]}30)`, border: `2px solid ${COLORS[rank-1]}` }}>
                {c.name[0]}
              </div>
              <div className="text-xs font-semibold text-center">{c.name}</div>
              <div className="text-lg font-extrabold" style={{ color: COLORS[rank - 1] }}>{c.avg_score}</div>
              <div className="w-full rounded-t-xl flex items-end justify-center pb-2 text-xs font-mono"
                style={{ height: heights[i], background: `${COLORS[rank-1]}15`, border: `1px solid ${COLORS[rank-1]}30`, color: 'var(--muted)' }}>
                #{rank}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Rest of the list */}
      <Card>
        {rest.map((c, i) => (
          <motion.div key={c.name || i}
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-4 py-4 border-b last:border-0"
            style={{ borderColor: 'var(--border)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
              {(i + 4)}
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#00d4ff)' }}>
              {c.name?.[0]}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">
                {c.name} {c.you && <Badge variant="blue" className="ml-1">you</Badge>}
              </div>
              <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                {c.total_interviews} sessions completed
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-extrabold" style={{ color: c.avg_score >= 75 ? 'var(--accent3)' : 'var(--accent4)' }}>
                {c.avg_score}
              </div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>avg score</div>
            </div>
          </motion.div>
        ))}
      </Card>

      <p className="text-xs text-center mt-4" style={{ color: 'var(--muted)' }}>
        Scores are based on AI behavioral analysis across all completed interview sessions
      </p>
    </div>
  )
}

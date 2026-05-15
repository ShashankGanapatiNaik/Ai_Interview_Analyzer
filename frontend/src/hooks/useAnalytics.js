/**
 * useAnalytics — fetches and aggregates dashboard analytics data.
 */

import { useState, useEffect, useCallback } from 'react'
import api from '@/utils/api'

export default function useAnalytics() {
  const [interviews, setInterviews]   = useState([])
  const [latestReport, setLatestReport] = useState(null)
  const [platformStats, setPlatformStats] = useState(null)
  const [loading, setLoading]          = useState(true)
  const [error, setError]              = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [ivRes] = await Promise.allSettled([
        api.get('/interviews?limit=10'),
      ])

      if (ivRes.status === 'fulfilled') {
        const ivs = ivRes.value.data
        setInterviews(ivs)

        // Fetch latest completed report
        const completed = ivs.find(iv => iv.status === 'completed')
        if (completed) {
          try {
            const rRes = await api.get(`/reports/${completed.id}`)
            setLatestReport(rRes.data)
          } catch {}
        }
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Derived metrics from latest report
  const scores = latestReport?.scores || {
    overall_score: 0,
    confidence_score: 0,
    eye_contact_score: 0,
    voice_score: 0,
    posture_score: 0,
  }

  const totalSessions  = interviews.length
  const completedSessions = interviews.filter(iv => iv.status === 'completed').length
  const avgScore = completedSessions > 0
    ? Math.round(interviews.filter(iv => iv.overall_score).reduce((s, iv) => s + iv.overall_score, 0) / completedSessions)
    : 0

  return {
    interviews,
    latestReport,
    scores,
    totalSessions,
    completedSessions,
    avgScore,
    loading,
    error,
    refresh: fetchAll,
  }
}

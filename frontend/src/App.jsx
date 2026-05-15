import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import useAuthStore from '@/context/AuthContext'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'

import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import InterviewSetupPage from '@/pages/InterviewSetupPage'
import InterviewRoomPage from '@/pages/InterviewRoomPage'
import ReportPage from '@/pages/ReportPage'
import ReportsListPage from '@/pages/ReportsListPage'
import AdminPage from '@/pages/AdminPage'
import CoachPage from '@/pages/CoachPage'
import LeaderboardPage from '@/pages/LeaderboardPage'

export default function App() {
  const { initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#141e2a',
            color: '#e2e8f0',
            border: '1px solid rgba(99,179,237,0.2)',
            fontFamily: 'Syne, sans-serif',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#141e2a' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#141e2a' } },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/interview/setup" element={<InterviewSetupPage />} />
            <Route path="/interview/:id" element={<InterviewRoomPage />} />
            <Route path="/reports" element={<ReportsListPage />} />
            <Route path="/reports/:id" element={<ReportPage />} />
            <Route path="/coach" element={<CoachPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />

            {/* Admin-only */}
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

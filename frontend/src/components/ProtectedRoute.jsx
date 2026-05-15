import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '@/context/AuthContext'

export default function ProtectedRoute() {
  const { user, accessToken } = useAuthStore()
  if (!user || !accessToken) return <Navigate to="/login" replace />
  return <Outlet />
}

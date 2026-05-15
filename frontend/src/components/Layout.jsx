import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '@/context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/interview/setup', label: 'Interview', icon: '🎙️' },
  { to: '/reports', label: 'Reports', icon: '📋' },
  { to: '/coach', label: 'AI Coach', icon: '🤖' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 h-16"
        style={{ background: 'rgba(6,10,15,0.95)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold"
            style={{ background: 'linear-gradient(135deg,#00d4ff,#7c3aed)' }}>
            🧠
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">InterviewAI</div>
            <div className="text-xs font-mono" style={{ color: 'var(--accent)', fontSize: '10px' }}>BEHAVIOR ANALYZER</div>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="flex gap-1">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`
              }
              style={({ isActive }) => isActive ? {
                background: 'var(--surface2)',
                border: '1px solid rgba(0,212,255,0.2)',
              } : {}}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`
              }
            >
              ⚙️ Admin
            </NavLink>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#00d4ff)' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium">{user?.name}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent)', border: '1px solid rgba(0,212,255,0.2)' }}>
              {user?.role}
            </span>
          </div>
          <button onClick={handleLogout}
            className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors"
            style={{ border: '1px solid var(--border)' }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}

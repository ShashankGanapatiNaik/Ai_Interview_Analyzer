import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import useAuthStore from '@/context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await login(form.email, form.password)
    if (res.success) { toast.success('Welcome back!'); navigate('/dashboard') }
    else toast.error(res.error)
  }

  const inp = {
    background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 10,
    padding: '12px 16px', color: 'var(--text)', fontFamily: 'Syne, sans-serif',
    fontSize: 14, width: '100%', outline: 'none',
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧠</div>
          <h1 className="text-2xl font-extrabold">Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted2)' }}>Sign in to your InterviewAI account</p>
        </div>
        <div className="p-8 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted2)' }}>Email</label>
              <input type="email" style={inp} value={form.email}
                onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted2)' }}>Password</label>
              <input type="password" style={inp} value={form.password}
                onChange={e => set('password', e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
            <button type="submit" disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-sm mt-2 transition-all"
              style={{ background: 'linear-gradient(135deg,#00d4ff,rgba(0,180,220,0.8))', color: '#000', border: 'none', cursor: 'pointer' }}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
            <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
              No account?{' '}
              <span className="cursor-pointer font-semibold" style={{ color: 'var(--accent)' }}
                onClick={() => navigate('/register')}>Register</span>
            </p>
          </form>
        </div>
        <p className="text-xs text-center mt-4" style={{ color: 'var(--muted)' }}>
          Demo: demo@interviewai.com / Demo@123
        </p>
      </motion.div>
    </div>
  )
}

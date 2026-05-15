import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import useAuthStore from '@/context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: doRegister, isLoading, error } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await doRegister(form.name, form.email, form.password)
    if (res.success) { toast.success('Account created!'); navigate('/dashboard') }
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
          <h1 className="text-2xl font-extrabold">Create Account</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted2)' }}>Start your AI interview journey</p>
        </div>
        <div className="p-8 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              ['Full Name', 'name', 'text', 'John Doe'],
              ['Email', 'email', 'email', 'you@example.com'],
              ['Password', 'password', 'password', '••••••••'],
            ].map(([label, key, type, ph]) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted2)' }}>{label}</label>
                <input type={type} style={inp} value={form[key]}
                  onChange={e => set(key, e.target.value)} placeholder={ph} required />
              </div>
            ))}
            {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
            <button type="submit" disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-sm mt-2"
              style={{ background: 'linear-gradient(135deg,#00d4ff,rgba(0,180,220,0.8))', color: '#000', border: 'none', cursor: 'pointer' }}>
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
            <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
              Already have an account?{' '}
              <span className="cursor-pointer font-semibold" style={{ color: 'var(--accent)' }}
                onClick={() => navigate('/login')}>Sign In</span>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

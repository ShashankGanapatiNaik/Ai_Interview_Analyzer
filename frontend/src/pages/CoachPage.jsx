import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Card, SectionLabel, Button, Spinner } from '@/components/ui'
import api from '@/utils/api'

const QUICK_TOPICS = [
  'How can I reduce my filler words like um and ah?',
  'How to improve eye contact during video interviews?',
  'Tips for appearing more confident on camera?',
  'How to improve my speaking pace and clarity?',
  'Give me a practice question for Senior Software Engineer',
  'My eye contact score is 71% — what specific techniques help?',
  'How do I structure a STAR format answer?',
  'How to handle nervousness before an interview?',
]

export default function CoachPage() {
  const [messages, setMessages] = useState([{
    role: 'ai',
    content: `👋 Hello! I'm your AI Interview Coach powered by Claude.\n\nI've reviewed your recent sessions and I'm ready to help you level up!\n\nYour current profile:\n• Overall Score: 78/100\n• Voice Clarity: 88% ✅ (your strength!)\n• Eye Contact: 71% ⚠️ (key focus area)\n• Posture: 65% (needs work)\n\nWhat would you like to work on today?`,
    time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [msgCount, setMsgCount] = useState(1)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (msg) => {
    if (!msg?.trim() || loading) return
    const userMsg = {
      role: 'user', content: msg,
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(p => [...p, userMsg])
    setInput('')
    setLoading(true)
    setMsgCount(c => c + 1)

    const history = messages.map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content,
    }))

    try {
      const { data } = await api.post('/reports/coach/message', {
        message: msg,
        history,
        target_role: 'Senior Software Engineer',
      })
      setMessages(p => [...p, {
        role: 'ai', content: data.reply,
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch {
      setMessages(p => [...p, {
        role: 'ai',
        content: "I'm having trouble connecting right now. Based on your profile, focus on: maintaining camera eye contact (look at the lens, not the screen), and replacing 'um/uh' with deliberate 1-second pauses.",
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-screen-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">
          AI Interview <span style={{ color: 'var(--accent)' }}>Coach</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted2)' }}>
          Personalized coaching powered by Claude AI
        </p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 300px' }}>
        {/* Chat */}
        <Card style={{ display: 'flex', flexDirection: 'column', minHeight: 520 }}>
          <SectionLabel>💬 Chat with AI Coach</SectionLabel>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-1" style={{ maxHeight: 400 }}>
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div style={{ maxWidth: '85%' }}>
                    <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                      style={m.role === 'ai' ? {
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        borderBottomLeftRadius: 4,
                      } : {
                        background: 'linear-gradient(135deg,#7c3aed,rgba(124,58,237,0.7))',
                        borderBottomRightRadius: 4, color: 'white',
                      }}>
                      {m.content}
                    </div>
                    <div className="text-xs font-mono mt-1 px-1" style={{ color: 'var(--muted)' }}>
                      {m.role === 'ai' ? '🤖 AI Coach' : '👤 You'} · {m.time}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl flex items-center gap-2"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                  <Spinner size={14} />
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>Coach is thinking...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <input
              className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{
                background: 'var(--surface2)', border: '1px solid var(--border2)',
                color: 'var(--text)', fontFamily: 'Syne, sans-serif',
              }}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
              placeholder="Ask your AI coach anything... (Enter to send)"
              disabled={loading}
            />
            <Button onClick={() => send(input)} loading={loading} disabled={!input.trim()}>
              Send
            </Button>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <Card>
            <SectionLabel>⚡ Quick Topics</SectionLabel>
            <div className="flex flex-col gap-2">
              {QUICK_TOPICS.map(t => (
                <button key={t} onClick={() => send(t)} disabled={loading}
                  className="text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-colors"
                  style={{
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    color: 'var(--muted2)', cursor: 'pointer',
                  }}
                  onMouseOver={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
                  onMouseOut={e => { e.currentTarget.style.color = 'var(--muted2)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                  {t}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <SectionLabel>📊 Your Focus Areas</SectionLabel>
            {[
              { icon: '👁️', label: 'Eye Contact', val: 71, color: '#10b981' },
              { icon: '🗣️', label: 'Filler Words', val: 25, color: '#ef4444' },
              { icon: '🧘', label: 'Head Posture', val: 65, color: '#f59e0b' },
              { icon: '🎙️', label: 'Voice Clarity', val: 88, color: '#7c3aed' },
            ].map(a => (
              <div key={a.label} className="flex items-center gap-2 mb-2.5">
                <span className="text-base w-6">{a.icon}</span>
                <span className="text-xs w-24 flex-shrink-0">{a.label}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--surface2)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${a.val}%`, background: a.color }} />
                </div>
                <span className="text-xs font-mono" style={{ color: a.color, width: 28, textAlign: 'right' }}>{a.val}</span>
              </div>
            ))}
          </Card>

          <Card>
            <SectionLabel>📈 Session Stats</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: msgCount, label: 'Messages', color: 'var(--accent)' },
                { val: 4,        label: 'Sessions', color: 'var(--accent3)' },
              ].map(s => (
                <div key={s.label} className="text-center p-3 rounded-xl"
                  style={{ background: 'var(--bg3)' }}>
                  <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.val}</div>
                  <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

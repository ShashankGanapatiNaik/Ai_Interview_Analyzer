/**
 * VoiceWaveform — animated audio visualization using canvas.
 * Renders a real-time waveform based on voice_energy values.
 */

import { useEffect, useRef } from 'react'

export default function VoiceWaveform({ energy = 0.5, color = '#00d4ff', height = 48 }) {
  const canvasRef = useRef(null)
  const historyRef = useRef(Array(60).fill(0.1))
  const animRef = useRef(null)

  useEffect(() => {
    // Update history
    historyRef.current = [...historyRef.current.slice(1), energy]
  }, [energy])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      const history = historyRef.current

      ctx.clearRect(0, 0, w, h)

      // Background
      ctx.fillStyle = 'rgba(17,25,34,0.0)'
      ctx.fillRect(0, 0, w, h)

      // Draw waveform bars
      const barW = w / history.length
      history.forEach((val, i) => {
        const barH = Math.max(3, val * h * 0.9)
        const x = i * barW
        const y = (h - barH) / 2

        const alpha = 0.2 + (i / history.length) * 0.8
        ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0')
        ctx.beginPath()
        ctx.roundRect(x + 1, y, barW - 2, barH, 2)
        ctx.fill()
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [color])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      canvas.style.width = '100%'
      canvas.style.height = height + 'px'
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [height])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height, borderRadius: 6 }}
    />
  )
}


/**
 * StaticWaveform — non-animated bars, useful for report display.
 */
export function StaticWaveform({ data = [], color = '#00d4ff', height = 48 }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-center gap-0.5" style={{ height }}>
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${Math.max(4, (v / max) * 100)}%`,
            background: color,
            opacity: 0.3 + (i / data.length) * 0.7,
          }}
        />
      ))}
    </div>
  )
}

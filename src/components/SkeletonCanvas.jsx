import { useEffect, useRef } from 'react'
import { buildSkeleton } from '../utils/posture'

export default function SkeletonCanvas({ landmarks, issue, correctness = 0, width, height }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !landmarks || !landmarks.length) {
      const ctx = canvas?.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const w = canvas.width
    const h = canvas.height
    const segments = buildSkeleton(landmarks, issue)
    const goodColor = '#22c55e'
    const badColor = '#ef4444'
    const neutralColor = 'rgba(255,255,255,0.6)'

    // Draw segments
    segments.forEach(({ from, to, highlighted }) => {
      const a = landmarks[from]
      const b = landmarks[to]
      if (!a || !b) return
      const av = a.visibility ?? a.score ?? 1
      const bv = b.visibility ?? b.score ?? 1
      if (av < 0.3 || bv < 0.3) return

      const color = highlighted
        ? (correctness >= 80 ? goodColor : badColor)
        : neutralColor

      ctx.beginPath()
      ctx.moveTo(a.x * w, a.y * h)
      ctx.lineTo(b.x * w, b.y * h)
      ctx.strokeStyle = color
      ctx.lineWidth = highlighted ? 4 : 2
      ctx.globalAlpha = highlighted ? 0.9 : 0.5
      ctx.stroke()
    })

    // Draw landmark dots
    landmarks.forEach((lm, i) => {
      if (!lm) return
      const v = lm.visibility ?? lm.score ?? 1
      if (v < 0.3) return
      ctx.beginPath()
      ctx.arc(lm.x * w, lm.y * h, 4, 0, Math.PI * 2)
      ctx.fillStyle = neutralColor
      ctx.globalAlpha = 0.7
      ctx.fill()
    })

    ctx.globalAlpha = 1
  }, [landmarks, issue, correctness, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width || 640}
      height={height || 480}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}

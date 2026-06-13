import { useEffect, useRef, useState } from 'react'

const CIRCUMFERENCE = 2 * Math.PI * 45  // r=45

function scoreColor(score) {
  if (score >= 71) return '#22c55e'   // green-500
  if (score >= 41) return '#f59e0b'   // amber-500
  return '#ef4444'                     // red-500
}

export default function AlignScore({ score = 0, size = 140, label = 'Align Score', animate = true }) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    if (!animate) { setDisplayed(score); return }
    const from = displayed
    const to = score
    const duration = 800
    startRef.current = null
    const tick = (ts) => {
      if (!startRef.current) startRef.current = ts
      const p = Math.min(1, (ts - startRef.current) / duration)
      const ease = 1 - (1 - p) ** 3
      setDisplayed(Math.round(from + (to - from) * ease))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => rafRef.current && cancelAnimationFrame(rafRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score])

  const r = 45
  const cx = 60
  const cy = 60
  const color = scoreColor(displayed)
  const offset = CIRCUMFERENCE * (1 - displayed / 100)

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        {/* Progress */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: `${cx}px ${cy}px`,
            transition: 'stroke-dashoffset 0.1s linear, stroke 0.4s ease',
          }}
        />
        {/* Score number */}
        <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="middle"
          fontSize="26" fontWeight="700" fill={color}
          style={{ fontFamily: 'system-ui, sans-serif' }}>
          {displayed}
        </text>
      </svg>
      {label && (
        <span className="text-sm font-medium text-gray-500 tracking-wide">{label}</span>
      )}
    </div>
  )
}

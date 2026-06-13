/** Animated circular countdown — e.g. 5 seconds */
export default function CountdownRing({ seconds, totalSeconds = 5, size = 80 }) {
  const r = 30
  const cx = 40
  const cy = 40
  const circumference = 2 * Math.PI * r
  const progress = seconds / totalSeconds
  const offset = circumference * (1 - progress)

  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="6" />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#22c55e"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: `${cx}px ${cy}px`,
          transition: 'stroke-dashoffset 0.9s linear',
        }}
      />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="22" fontWeight="700" fill="white"
        style={{ fontFamily: 'system-ui, sans-serif' }}>
        {seconds}
      </text>
    </svg>
  )
}

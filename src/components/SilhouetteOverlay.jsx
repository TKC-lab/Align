/**
 * SVG silhouette overlaid on camera feed.
 * Pulses while waiting, turns green when bodyDetected = true.
 */
export default function SilhouetteOverlay({ view = 'front', bodyDetected = false }) {
  const color = bodyDetected ? '#22c55e' : '#ffffff'
  const className = bodyDetected ? '' : 'silhouette-pulse'

  if (view === 'side') {
    return (
      <svg
        viewBox="0 0 200 400"
        className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
        style={{ opacity: bodyDetected ? 0.9 : 0.45 }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Side profile silhouette */}
        <g fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {/* Head */}
          <ellipse cx="108" cy="45" rx="22" ry="26" />
          {/* Neck */}
          <line x1="108" y1="71" x2="108" y2="90" />
          {/* Torso */}
          <path d="M 88 90 Q 95 130 92 170 Q 90 195 88 220" />
          <path d="M 120 90 Q 118 130 116 170 Q 114 195 112 220" />
          <line x1="88" y1="90" x2="120" y2="90" />
          <line x1="88" y1="220" x2="112" y2="220" />
          {/* Arm (front) */}
          <path d="M 120 95 Q 128 130 130 160 Q 132 175 130 195" />
          {/* Leg */}
          <line x1="100" y1="220" x2="98" y2="310" />
          <line x1="98" y1="310" x2="96" y2="370" />
          <line x1="96" y1="370" x2="115" y2="372" />
          <line x1="112" y1="220" x2="108" y2="310" />
          <line x1="108" y1="310" x2="106" y2="370" />
          <line x1="106" y1="370" x2="122" y2="372" />
        </g>
        {/* Direction label */}
        <text x="100" y="395" textAnchor="middle" fontSize="12" fill={color} fontFamily="system-ui">
          {bodyDetected ? 'Hold still' : 'Turn to your side'}
        </text>
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 200 400"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: bodyDetected ? 0.9 : 0.45 }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Front-facing silhouette */}
      <g fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* Head */}
        <ellipse cx="100" cy="45" rx="24" ry="28" />
        {/* Neck */}
        <line x1="100" y1="73" x2="100" y2="90" />
        {/* Shoulders */}
        <line x1="60" y1="95" x2="140" y2="95" />
        {/* Left arm */}
        <line x1="60" y1="95" x2="48" y2="155" />
        <line x1="48" y1="155" x2="44" y2="200" />
        {/* Right arm */}
        <line x1="140" y1="95" x2="152" y2="155" />
        <line x1="152" y1="155" x2="156" y2="200" />
        {/* Torso */}
        <line x1="60" y1="95" x2="68" y2="180" />
        <line x1="140" y1="95" x2="132" y2="180" />
        <line x1="68" y1="180" x2="132" y2="180" />
        {/* Left leg */}
        <line x1="82" y1="180" x2="78" y2="280" />
        <line x1="78" y1="280" x2="76" y2="370" />
        {/* Right leg */}
        <line x1="118" y1="180" x2="122" y2="280" />
        <line x1="122" y1="280" x2="124" y2="370" />
        {/* Feet */}
        <line x1="64" y1="372" x2="88" y2="372" />
        <line x1="112" y1="372" x2="136" y2="372" />
      </g>
      <text x="100" y="395" textAnchor="middle" fontSize="12" fill={color} fontFamily="system-ui">
        {bodyDetected ? 'Hold still' : 'Step back until your full body fits'}
      </text>
    </svg>
  )
}

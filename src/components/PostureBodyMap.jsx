/**
 * Annotated body diagram shown on the Diagnosis screen.
 * Highlights problem areas in red/amber and shows directional correction arrows.
 */

const SEVERITY_COLOR = {
  Significant: { fill: 'rgba(239,68,68,0.25)', stroke: '#ef4444' },
  Moderate:    { fill: 'rgba(249,115,22,0.22)', stroke: '#f97316' },
  Mild:        { fill: 'rgba(245,158,11,0.18)', stroke: '#f59e0b' },
}

// --- Front view figure (viewBox 0 0 80 170) ---
function FrontFigure({ issues }) {
  const byId = Object.fromEntries(issues.map(i => [i.id, i]))

  function Zone({ issueId, children }) {
    const issue = byId[issueId]
    if (!issue) return children
    const { fill, stroke } = SEVERITY_COLOR[issue.severity] || SEVERITY_COLOR.Mild
    return <g style={{ filter: `drop-shadow(0 0 4px ${stroke})` }}>{children}</g>
  }

  function zoneStyle(issueId) {
    const issue = byId[issueId]
    if (!issue) return { fill: 'none', stroke: 'none' }
    return SEVERITY_COLOR[issue.severity] || SEVERITY_COLOR.Mild
  }

  return (
    <svg viewBox="0 0 80 170" className="h-full w-auto" fill="none">
      {/* ── Skeleton lines ── */}
      <g stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round">
        {/* Neck */}
        <line x1="40" y1="22" x2="40" y2="32"/>
        {/* Shoulders */}
        <line x1="18" y1="36" x2="62" y2="36"/>
        {/* Arms */}
        <line x1="18" y1="36" x2="10" y2="64"/>
        <line x1="10" y1="64" x2="8"  y2="88"/>
        <line x1="62" y1="36" x2="70" y2="64"/>
        <line x1="70" y1="64" x2="72" y2="88"/>
        {/* Torso */}
        <line x1="18" y1="36" x2="22" y2="88"/>
        <line x1="62" y1="36" x2="58" y2="88"/>
        {/* Hips */}
        <line x1="22" y1="88" x2="58" y2="88"/>
        {/* Legs */}
        <line x1="30" y1="88" x2="28" y2="130"/>
        <line x1="28" y1="130" x2="27" y2="164"/>
        <line x1="50" y1="88" x2="52" y2="130"/>
        <line x1="52" y1="130" x2="53" y2="164"/>
      </g>

      {/* ── Issue highlights ── */}
      {/* Head tilt */}
      {byId.head_tilt && (
        <ellipse cx="40" cy="12" rx="14" ry="14"
          fill={zoneStyle('head_tilt').fill} stroke={zoneStyle('head_tilt').stroke} strokeWidth="1.5"/>
      )}
      {/* Shoulder imbalance */}
      {byId.shoulder_imbalance && (
        <ellipse cx="40" cy="36" rx="26" ry="9"
          fill={zoneStyle('shoulder_imbalance').fill} stroke={zoneStyle('shoulder_imbalance').stroke} strokeWidth="1.5"/>
      )}
      {/* Hip hiking */}
      {byId.hip_hiking && (
        <ellipse cx="40" cy="88" rx="20" ry="9"
          fill={zoneStyle('hip_hiking').fill} stroke={zoneStyle('hip_hiking').stroke} strokeWidth="1.5"/>
      )}

      {/* ── Head ── */}
      <circle cx="40" cy="12" r="11" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8"/>

      {/* ── Correction arrows ── */}
      {byId.shoulder_imbalance && (
        <Arrow x1="18" y1="30" x2="18" y2="44" color="#facc15" label="↓ lower"/>
      )}
      {byId.head_tilt && (
        <Arrow x1="33" y1="10" x2="40" y2="10" color="#facc15" label="→ center"/>
      )}
      {byId.hip_hiking && (
        <Arrow x1="22" y1="82" x2="22" y2="96" color="#facc15" label="↓"/>
      )}

      {/* Labels for clean areas */}
      {!byId.shoulder_imbalance && !byId.head_tilt && !byId.hip_hiking && (
        <text x="40" y="100" textAnchor="middle" fontSize="7" fill="#22c55e" fontFamily="system-ui">All clear</text>
      )}
    </svg>
  )
}

// --- Side view figure (viewBox 0 0 80 170, person faces right) ---
function SideFigure({ issues }) {
  const byId = Object.fromEntries(issues.map(i => [i.id, i]))

  function zoneStyle(issueId) {
    const issue = byId[issueId]
    if (!issue) return { fill: 'none', stroke: 'none' }
    return SEVERITY_COLOR[issue.severity] || SEVERITY_COLOR.Mild
  }

  return (
    <svg viewBox="0 0 80 170" className="h-full w-auto" fill="none">
      {/* ── Skeleton lines ── */}
      <g stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round">
        {/* Neck */}
        <line x1="46" y1="22" x2="43" y2="32"/>
        {/* Spine */}
        <line x1="43" y1="32" x2="40" y2="88"/>
        {/* Shoulder */}
        <line x1="43" y1="36" x2="32" y2="36"/>
        {/* Front arm */}
        <line x1="43" y1="36" x2="50" y2="62"/>
        <line x1="50" y1="62" x2="52" y2="84"/>
        {/* Back arm */}
        <line x1="32" y1="36" x2="26" y2="60"/>
        {/* Hips */}
        <line x1="38" y1="88" x2="48" y2="88"/>
        {/* Legs */}
        <line x1="40" y1="88" x2="42" y2="130"/>
        <line x1="42" y1="130" x2="44" y2="164"/>
        {/* Foot */}
        <line x1="44" y1="164" x2="56" y2="166"/>
      </g>

      {/* ── Issue highlights ── */}
      {/* Forward head */}
      {byId.forward_head && (
        <ellipse cx="50" cy="12" rx="14" ry="12"
          fill={zoneStyle('forward_head').fill} stroke={zoneStyle('forward_head').stroke} strokeWidth="1.5"/>
      )}
      {/* Rounded back */}
      {byId.rounded_back && (
        <ellipse cx="40" cy="50" rx="12" ry="20"
          fill={zoneStyle('rounded_back').fill} stroke={zoneStyle('rounded_back').stroke} strokeWidth="1.5"/>
      )}
      {/* Pelvic tilt */}
      {byId.pelvic_tilt && (
        <ellipse cx="42" cy="88" rx="12" ry="9"
          fill={zoneStyle('pelvic_tilt').fill} stroke={zoneStyle('pelvic_tilt').stroke} strokeWidth="1.5"/>
      )}

      {/* ── Head ── */}
      <circle cx="50" cy="12" r="11" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8"/>
      {/* Ear dot */}
      <circle cx="56" cy="11" r="2.5" fill="rgba(255,255,255,0.5)"/>

      {/* ── Forward head: dashed ideal alignment line ── */}
      {byId.forward_head && (
        <>
          <line x1="43" y1="2" x2="43" y2="36"
            stroke={zoneStyle('forward_head').stroke} strokeWidth="1" strokeDasharray="3,3"/>
          <Arrow x1="54" y1="10" x2="44" y2="10" color="#facc15" label="pull back"/>
        </>
      )}

      {/* ── Rounded back: arrow opening chest ── */}
      {byId.rounded_back && (
        <Arrow x1="38" y1="44" x2="50" y2="36" color="#facc15" label="open chest"/>
      )}

      {/* ── Pelvic tilt: rotation arrow ── */}
      {byId.pelvic_tilt && (
        <Arrow x1="42" y1="96" x2="38" y2="84" color="#facc15" label="tuck"/>
      )}

      {!byId.forward_head && !byId.rounded_back && !byId.pelvic_tilt && (
        <text x="40" y="100" textAnchor="middle" fontSize="7" fill="#22c55e" fontFamily="system-ui">All clear</text>
      )}
    </svg>
  )
}

function Arrow({ x1, y1, x2, y2, color, label }) {
  const dx = x2 - x1, dy = y2 - y1
  const angle = Math.atan2(dy, dx) * 180 / Math.PI
  const len = Math.sqrt(dx * dx + dy * dy)
  // Head triangle
  const hx1 = x2 - 5 * Math.cos((angle - 25) * Math.PI / 180)
  const hy1 = y2 - 5 * Math.sin((angle - 25) * Math.PI / 180)
  const hx2 = x2 - 5 * Math.cos((angle + 25) * Math.PI / 180)
  const hy2 = y2 - 5 * Math.sin((angle + 25) * Math.PI / 180)

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <polygon points={`${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}`} fill={color}/>
      {label && (
        <text
          x={x2 + (dx > 0 ? 3 : -3)}
          y={y2 + (dy > 0 ? 8 : -3)}
          fontSize="5.5"
          fill={color}
          fontFamily="system-ui"
          fontWeight="bold"
          textAnchor={dx > 0 ? 'start' : 'end'}
        >{label}</text>
      )}
    </g>
  )
}

const SEVERITY_ORDER = { Significant: 0, Moderate: 1, Mild: 2 }
const SEVERITY_DOT = { Significant: 'bg-red-500', Moderate: 'bg-orange-400', Mild: 'bg-amber-400' }

export default function PostureBodyMap({ issues }) {
  const frontIssues = issues.filter(i => i.view === 'front')
  const sideIssues  = issues.filter(i => i.view === 'side')
  const hasFront = frontIssues.length > 0
  const hasSide  = sideIssues.length > 0

  return (
    <div className="bg-slate-900 rounded-2xl p-4 space-y-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Posture map</p>

      {/* Body diagrams */}
      <div className="flex gap-4 justify-center items-end" style={{ height: 170 }}>
        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-xs text-slate-500 font-medium">Front</span>
          <div className="flex-1 flex items-center justify-center">
            <FrontFigure issues={frontIssues} />
          </div>
        </div>
        <div className="w-px bg-slate-700 self-stretch" />
        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-xs text-slate-500 font-medium">Side</span>
          <div className="flex-1 flex items-center justify-center">
            <SideFigure issues={sideIssues} />
          </div>
        </div>
      </div>

      {/* Compact issue chips */}
      {issues.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {issues.map(issue => (
            <div key={issue.id} className="flex items-center gap-1.5 bg-slate-800 rounded-full px-2.5 py-1">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${SEVERITY_DOT[issue.severity]}`}/>
              <span className="text-xs text-slate-300 font-medium">{issue.label}</span>
            </div>
          ))}
        </div>
      )}

      {issues.length === 0 && (
        <p className="text-center text-green-400 text-sm font-medium py-2">No issues detected</p>
      )}
    </div>
  )
}

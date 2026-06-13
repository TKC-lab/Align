const SEVERITY_COLOR = {
  Significant: { fill: 'rgba(239,68,68,0.28)', stroke: '#ef4444' },
  Moderate:    { fill: 'rgba(249,115,22,0.25)', stroke: '#f97316' },
  Mild:        { fill: 'rgba(245,158,11,0.22)', stroke: '#f59e0b' },
}

const SEVERITY_DOT = {
  Significant: 'bg-red-500',
  Moderate:    'bg-orange-400',
  Mild:        'bg-amber-400',
}

function zoneStyle(issue) {
  return issue ? (SEVERITY_COLOR[issue.severity] ?? SEVERITY_COLOR.Mild) : null
}

function Arrow({ x1, y1, x2, y2, color = '#facc15', label }) {
  const dx = x2 - x1, dy = y2 - y1
  const angle = Math.atan2(dy, dx)
  const hl = 6
  const hx1 = x2 - hl * Math.cos(angle - 0.42)
  const hy1 = y2 - hl * Math.sin(angle - 0.42)
  const hx2 = x2 - hl * Math.cos(angle + 0.42)
  const hy2 = y2 - hl * Math.sin(angle + 0.42)
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <polygon points={`${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}`} fill={color}/>
      {label && (
        <text x={x2 + (dx >= 0 ? 3 : -3)} y={y2 + (dy >= 0 ? 9 : -3)}
          fontSize="5.5" fill={color} fontFamily="system-ui" fontWeight="bold"
          textAnchor={dx >= 0 ? 'start' : 'end'}>{label}</text>
      )}
    </g>
  )
}

// Front view — viewBox 0 0 80 155
function FrontFigure({ issues }) {
  const byId = Object.fromEntries(issues.map(i => [i.id, i]))
  const s = (id) => zoneStyle(byId[id])

  return (
    <svg viewBox="0 0 80 155" width="110" height="155" fill="none" overflow="visible">
      {/* Skeleton */}
      <g stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round">
        <line x1="40" y1="21" x2="40" y2="30"/>          {/* neck */}
        <line x1="18" y1="35" x2="62" y2="35"/>          {/* shoulders */}
        <line x1="18" y1="35" x2="10" y2="62"/>          {/* L upper arm */}
        <line x1="10" y1="62" x2="8"  y2="84"/>          {/* L lower arm */}
        <line x1="62" y1="35" x2="70" y2="62"/>          {/* R upper arm */}
        <line x1="70" y1="62" x2="72" y2="84"/>          {/* R lower arm */}
        <line x1="18" y1="35" x2="22" y2="86"/>          {/* L torso */}
        <line x1="62" y1="35" x2="58" y2="86"/>          {/* R torso */}
        <line x1="22" y1="86" x2="58" y2="86"/>          {/* hips */}
        <line x1="30" y1="86" x2="28" y2="122"/>         {/* L thigh */}
        <line x1="28" y1="122" x2="27" y2="150"/>        {/* L shin */}
        <line x1="50" y1="86" x2="52" y2="122"/>         {/* R thigh */}
        <line x1="52" y1="122" x2="53" y2="150"/>        {/* R shin */}
      </g>

      {/* Head */}
      <circle cx="40" cy="11" r="10" stroke="rgba(255,255,255,0.65)" strokeWidth="1.8"/>

      {/* Issue zones */}
      {s('head_tilt') && (
        <ellipse cx="40" cy="11" rx="14" ry="14"
          fill={s('head_tilt').fill} stroke={s('head_tilt').stroke} strokeWidth="1.5"/>
      )}
      {s('shoulder_imbalance') && (
        <ellipse cx="40" cy="35" rx="26" ry="9"
          fill={s('shoulder_imbalance').fill} stroke={s('shoulder_imbalance').stroke} strokeWidth="1.5"/>
      )}
      {s('hip_hiking') && (
        <ellipse cx="40" cy="86" rx="22" ry="9"
          fill={s('hip_hiking').fill} stroke={s('hip_hiking').stroke} strokeWidth="1.5"/>
      )}

      {/* Correction arrows */}
      {byId.shoulder_imbalance && <Arrow x1="18" y1="29" x2="18" y2="43" label="lower"/>}
      {byId.head_tilt          && <Arrow x1="32" y1="10" x2="40" y2="10" label="center"/>}
      {byId.hip_hiking         && <Arrow x1="22" y1="80" x2="22" y2="94" label="level"/>}

      {!byId.head_tilt && !byId.shoulder_imbalance && !byId.hip_hiking && (
        <text x="40" y="92" textAnchor="middle" fontSize="7" fill="#22c55e" fontFamily="system-ui" fontWeight="bold">✓ All clear</text>
      )}
    </svg>
  )
}

// Side view — viewBox 0 0 80 155, person faces right
function SideFigure({ issues }) {
  const byId = Object.fromEntries(issues.map(i => [i.id, i]))
  const s = (id) => zoneStyle(byId[id])

  return (
    <svg viewBox="0 0 80 155" width="110" height="155" fill="none" overflow="visible">
      {/* Skeleton */}
      <g stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round">
        <line x1="46" y1="21" x2="42" y2="30"/>          {/* neck */}
        <line x1="42" y1="30" x2="38" y2="86"/>          {/* spine */}
        <line x1="42" y1="35" x2="30" y2="38"/>          {/* back shoulder */}
        <line x1="42" y1="35" x2="52" y2="60"/>          {/* front upper arm */}
        <line x1="52" y1="60" x2="54" y2="82"/>          {/* front lower arm */}
        <line x1="30" y1="38" x2="24" y2="62"/>          {/* back arm */}
        <line x1="36" y1="86" x2="46" y2="88"/>          {/* pelvis */}
        <line x1="40" y1="86" x2="42" y2="124"/>         {/* thigh */}
        <line x1="42" y1="124" x2="44" y2="150"/>        {/* shin */}
        <line x1="44" y1="150" x2="56" y2="152"/>        {/* foot */}
      </g>

      {/* Head */}
      <circle cx="48" cy="11" r="10" stroke="rgba(255,255,255,0.65)" strokeWidth="1.8"/>
      {/* Ear dot */}
      <circle cx="55" cy="10" r="2.5" fill="rgba(255,255,255,0.45)"/>

      {/* Issue zones */}
      {s('forward_head') && (
        <ellipse cx="50" cy="11" rx="14" ry="12"
          fill={s('forward_head').fill} stroke={s('forward_head').stroke} strokeWidth="1.5"/>
      )}
      {s('rounded_back') && (
        <ellipse cx="38" cy="52" rx="13" ry="22"
          fill={s('rounded_back').fill} stroke={s('rounded_back').stroke} strokeWidth="1.5"/>
      )}
      {s('pelvic_tilt') && (
        <ellipse cx="40" cy="86" rx="13" ry="9"
          fill={s('pelvic_tilt').fill} stroke={s('pelvic_tilt').stroke} strokeWidth="1.5"/>
      )}

      {/* Ideal-alignment guide: vertical dashed line ear→shoulder */}
      {byId.forward_head && (
        <line x1="42" y1="2" x2="42" y2="36"
          stroke={SEVERITY_COLOR[byId.forward_head.severity]?.stroke ?? '#f59e0b'}
          strokeWidth="1.2" strokeDasharray="3,3"/>
      )}

      {/* Correction arrows */}
      {byId.forward_head  && <Arrow x1="54" y1="10" x2="43" y2="10" label="pull back"/>}
      {byId.rounded_back  && <Arrow x1="34" y1="46" x2="48" y2="36" label="open chest"/>}
      {byId.pelvic_tilt   && <Arrow x1="40" y1="94" x2="36" y2="82" label="tuck"/>}

      {!byId.forward_head && !byId.rounded_back && !byId.pelvic_tilt && (
        <text x="40" y="98" textAnchor="middle" fontSize="7" fill="#22c55e" fontFamily="system-ui" fontWeight="bold">✓ All clear</text>
      )}
    </svg>
  )
}

export default function PostureBodyMap({ issues }) {
  const frontIssues = issues.filter(i => i.view === 'front')
  const sideIssues  = issues.filter(i => i.view === 'side')

  return (
    <div className="bg-slate-900 rounded-2xl p-4 space-y-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Posture map</p>

      {/* Body diagrams — fixed height, no flex h-full */}
      <div className="flex justify-around items-start gap-2">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Front</span>
          <FrontFigure issues={frontIssues} />
        </div>
        <div className="w-px bg-slate-700 self-stretch" />
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Side</span>
          <SideFigure issues={sideIssues} />
        </div>
      </div>

      {/* Issue chips */}
      {issues.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800">
          {issues.map(issue => (
            <div key={issue.id} className="flex items-center gap-1.5 bg-slate-800 rounded-full px-2.5 py-1">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${SEVERITY_DOT[issue.severity]}`}/>
              <span className="text-xs text-slate-300 font-medium">{issue.label}</span>
            </div>
          ))}
        </div>
      )}

      {issues.length === 0 && (
        <p className="text-center text-green-400 text-sm font-semibold py-2">No issues detected</p>
      )}
    </div>
  )
}

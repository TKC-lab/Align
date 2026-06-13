import { useState, useEffect } from 'react'
import { getSessions } from '../utils/storage'

function ScoreChart({ sessions }) {
  if (!sessions.length) return null
  const maxScore = 100
  const w = 300
  const h = 120
  const pad = { top: 10, right: 16, bottom: 30, left: 28 }
  const chartW = w - pad.left - pad.right
  const chartH = h - pad.top - pad.bottom

  const points = sessions.map((s, i) => {
    const x = pad.left + (i / Math.max(1, sessions.length - 1)) * chartW
    const y = pad.top + (1 - s.score / maxScore) * chartH
    return { x, y, score: s.score, date: new Date(s.timestamp) }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaD = points.length > 1
    ? `${pathD} L${points[points.length - 1].x},${pad.top + chartH} L${points[0].x},${pad.top + chartH} Z`
    : ''

  // Y grid lines
  const gridLines = [0, 25, 50, 75, 100]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 160 }}>
      {/* Grid */}
      {gridLines.map(v => {
        const y = pad.top + (1 - v / maxScore) * chartH
        return (
          <g key={v}>
            <line x1={pad.left} y1={y} x2={pad.left + chartW} y2={y} stroke="#f1f5f9" strokeWidth="1"/>
            <text x={pad.left - 4} y={y + 3} fontSize="8" fill="#94a3b8" textAnchor="end">{v}</text>
          </g>
        )
      })}

      {/* Area fill */}
      {areaD && <path d={areaD} fill="#22c55e" fillOpacity="0.08"/>}

      {/* Line */}
      {points.length > 1 && (
        <path d={pathD} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      )}

      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#22c55e" stroke="white" strokeWidth="2"/>
      ))}

      {/* X labels (last few) */}
      {points.slice(-5).map((p, i, arr) => {
        const label = p.date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
        const totalPts = arr.length
        return (
          <text key={i} x={p.x} y={pad.top + chartH + 18} fontSize="8" fill="#94a3b8" textAnchor="middle">
            {label}
          </text>
        )
      })}
    </svg>
  )
}

function weeklyStats(sessions) {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const week = sessions.filter(s => s.timestamp > oneWeekAgo)
  if (!week.length) return null
  const avg = Math.round(week.reduce((s, x) => s + x.score, 0) / week.length)
  const issueCounts = {}
  week.forEach(s => (s.issues || []).forEach(i => { issueCounts[i.label] = (issueCounts[i.label] || 0) + 1 }))
  const topIssue = Object.entries(issueCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  return { avg, count: week.length, topIssue }
}

export default function HistoryScreen() {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    setSessions(getSessions())
  }, [])

  const stats = weeklyStats(sessions)
  const reversedSessions = [...sessions].reverse()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20 screen-enter">
      {/* Header */}
      <div className="bg-white px-6 pt-14 pb-4 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">History</h1>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {sessions.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <p className="text-slate-500 font-medium">No sessions yet</p>
            <p className="text-sm text-slate-400 mt-1">Complete your first scan to see your history</p>
          </div>
        )}

        {sessions.length > 0 && (
          <>
            {/* Score chart */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Align Score over time</h2>
              <ScoreChart sessions={sessions} />
            </div>

            {/* Weekly summary */}
            {stats && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">This week</h2>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{stats.avg}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Avg score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{stats.count}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Sessions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900 leading-tight mt-1">{stats.topIssue || '—'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Top issue</p>
                  </div>
                </div>
              </div>
            )}

            {/* Session list */}
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-3">
                Sessions ({sessions.length})
              </h2>
              <div className="space-y-2">
                {reversedSessions.map(session => (
                  <div key={session.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                      style={{
                        backgroundColor: session.score >= 71 ? '#dcfce7' : session.score >= 41 ? '#fef9c3' : '#fee2e2',
                        color: session.score >= 71 ? '#16a34a' : session.score >= 41 ? '#a16207' : '#dc2626',
                      }}>
                      {session.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 capitalize">
                        {session.sessionType || 'Full'} session
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(session.timestamp).toLocaleDateString('en', {
                          weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                        })}
                      </p>
                      {session.issues?.length > 0 && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {session.issues.map(i => i.label).join(' · ')}
                        </p>
                      )}
                    </div>
                    {session.initialScore && session.score > session.initialScore && (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 rounded-full px-2 py-1 flex-shrink-0">
                        +{session.score - session.initialScore}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

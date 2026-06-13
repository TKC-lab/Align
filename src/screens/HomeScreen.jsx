import { useState, useEffect } from 'react'
import { getSessions } from '../utils/storage'
import AlignScore from '../components/AlignScore'

const sessionTypes = [
  {
    id: 'full',
    title: 'Full Correction',
    description: 'Front + side scan with guided coaching',
    duration: '5–10 min',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    accent: 'bg-slate-900 text-white',
    tag: 'Recommended',
  },
  {
    id: 'quick',
    title: 'Quick Align',
    description: 'Fast daily score, no coaching',
    duration: '~1 min',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    accent: 'bg-white text-slate-900 border border-gray-200',
    tag: null,
  },
  {
    id: 'checkin',
    title: 'Check In',
    description: 'Side scan targeting your top issue',
    duration: '~2 min',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    accent: 'bg-white text-slate-900 border border-gray-200',
    tag: null,
  },
]

export default function HomeScreen({ onStartSession }) {
  const [lastScore, setLastScore] = useState(null)
  const [sessionCount, setSessionCount] = useState(0)

  useEffect(() => {
    const sessions = getSessions()
    setSessionCount(sessions.length)
    if (sessions.length > 0) {
      setLastScore(sessions[sessions.length - 1].score)
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20 screen-enter">
      {/* Header */}
      <div className="bg-white px-6 pt-14 pb-6 shadow-sm">
        <p className="text-sm text-slate-500 font-medium">Good {greeting()}</p>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">Ready to align?</h1>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Score card */}
        {lastScore !== null ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-6">
            <AlignScore score={lastScore} size={100} label="" />
            <div>
              <p className="text-sm text-slate-500">Last session score</p>
              <p className="text-xl font-bold text-slate-900">{lastScore} / 100</p>
              <p className="text-xs text-slate-400 mt-1">{sessionCount} session{sessionCount !== 1 ? 's' : ''} completed</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
            </div>
            <p className="font-semibold text-slate-900">No sessions yet</p>
            <p className="text-sm text-slate-500 mt-1">Complete your first scan to get your Align Score</p>
          </div>
        )}

        {/* Session type cards */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-3">Start a session</h2>
          <div className="space-y-3">
            {sessionTypes.map(type => (
              <button
                key={type.id}
                onClick={() => onStartSession(type.id)}
                className={`w-full rounded-2xl p-4 flex items-center gap-4 text-left active:scale-98 transition-transform shadow-sm ${type.accent}`}
              >
                <div className="flex-shrink-0 opacity-80">{type.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{type.title}</span>
                    {type.tag && (
                      <span className="text-xs bg-green-500 text-white rounded-full px-2 py-0.5 font-medium">{type.tag}</span>
                    )}
                  </div>
                  <p className="text-xs opacity-60 mt-0.5">{type.description}</p>
                </div>
                <span className="text-xs opacity-50 flex-shrink-0">{type.duration}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy reminder */}
        <div className="bg-green-50 rounded-xl px-4 py-3 flex gap-3 items-start">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <p className="text-xs text-green-800">All pose detection runs on your device. Nothing is recorded or uploaded.</p>
        </div>
      </div>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

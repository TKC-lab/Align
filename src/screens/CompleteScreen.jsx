import { useState } from 'react'
import { saveSession, saveBaseline } from '../utils/storage'
import AlignScore from '../components/AlignScore'

export default function CompleteScreen({ initialScore, finalScore, issues, sessionType, onDone }) {
  const [saved, setSaved] = useState(false)
  const [savedBaseline, setSavedBaseline] = useState(false)
  const delta = finalScore - initialScore
  const improved = delta > 0

  const handleSave = () => {
    saveSession({
      timestamp: Date.now(),
      score: finalScore,
      initialScore,
      sessionType,
      issues: issues.map(i => ({ id: i.id, label: i.label, severity: i.severity })),
    })
    setSaved(true)
  }

  const handleSaveBaseline = () => {
    saveBaseline({ score: finalScore, timestamp: Date.now(), issues })
    setSavedBaseline(true)
  }

  return (
    <div className="flex flex-col min-h-screen bg-white screen-enter">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 px-6 pt-16 pb-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Session complete</h1>

        <div className="flex items-center gap-6">
          {delta !== 0 && (
            <div className="text-center">
              <p className="text-slate-400 text-xs">Before</p>
              <p className="text-xl font-bold text-slate-300">{initialScore}</p>
            </div>
          )}
          <AlignScore score={finalScore} size={120} label="Final score" />
          {delta !== 0 && (
            <div className="text-center">
              <p className="text-slate-400 text-xs">Change</p>
              <p className={`text-xl font-bold ${improved ? 'text-green-400' : 'text-slate-400'}`}>
                {improved ? '+' : ''}{delta}
              </p>
            </div>
          )}
        </div>

        {improved && delta > 0 && (
          <p className="text-green-400 text-sm font-medium">
            You improved by {delta} point{delta !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
        {/* Issues summary */}
        {issues.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Corrections worked on</h2>
            {issues.map(issue => (
              <div key={issue.id} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-sm text-slate-700">{issue.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Save baseline option */}
        {!savedBaseline && (
          <button
            onClick={handleSaveBaseline}
            className="w-full bg-slate-50 border border-gray-200 rounded-2xl p-4 text-left active:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Save as personal baseline</p>
                <p className="text-xs text-slate-500 mt-0.5">Stored locally on your device only</p>
              </div>
            </div>
          </button>
        )}
        {savedBaseline && (
          <div className="bg-blue-50 rounded-xl px-4 py-3 flex gap-2 items-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <p className="text-xs text-blue-700 font-medium">Baseline saved to your device</p>
          </div>
        )}

        {/* Share score */}
        <button
          onClick={() => {
            const text = `My Align posture score: ${finalScore}/100${improved ? ` (↑${delta} today)` : ''} — try Align to check your posture!`
            if (navigator.share) {
              navigator.share({ text }).catch(() => {})
            } else {
              navigator.clipboard?.writeText(text)
            }
          }}
          className="w-full bg-slate-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3 active:bg-gray-100"
        >
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900">Share your score</p>
            <p className="text-xs text-slate-500 mt-0.5">Text only — no photos</p>
          </div>
        </button>
      </div>

      {/* Done button */}
      <div className="px-4 pb-8 pt-2 space-y-3">
        {!saved ? (
          <button
            onClick={handleSave}
            className="w-full bg-slate-900 text-white rounded-2xl py-4 text-base font-semibold tracking-tight active:scale-95 transition-transform"
          >
            Save session & finish
          </button>
        ) : (
          <button
            onClick={onDone}
            className="w-full bg-green-500 text-white rounded-2xl py-4 text-base font-semibold tracking-tight active:scale-95 transition-transform"
          >
            Done
          </button>
        )}
      </div>
    </div>
  )
}

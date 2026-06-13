import { useEffect } from 'react'
import { speak } from '../utils/audio'

export default function TransitionScreen({ onContinue }) {
  useEffect(() => {
    speak('Front scan complete. Now turn to your right side and hold still.')
    const t = setTimeout(onContinue, 5000)
    return () => clearTimeout(t)
  }, [onContinue])

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center gap-6 screen-enter">
      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Front scan complete</h2>
        <p className="text-slate-400 text-base">Now turn to your right side</p>
      </div>

      {/* Rotation diagram */}
      <svg viewBox="0 0 140 90" width="180" fill="none">
        {/* Person front — faded */}
        <circle cx="28" cy="22" r="10" stroke="white" strokeWidth="2" opacity="0.4"/>
        <line x1="28" y1="32" x2="28" y2="46" stroke="white" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
        <line x1="14" y1="48" x2="42" y2="48" stroke="white" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
        <line x1="18" y1="46" x2="14" y2="68" stroke="white" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
        <line x1="38" y1="46" x2="42" y2="68" stroke="white" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
        <line x1="22" y1="48" x2="20" y2="72" stroke="white" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
        <line x1="34" y1="48" x2="36" y2="72" stroke="white" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
        {/* Arrow */}
        <path d="M 54 44 Q 70 24 86 44" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M 83 40 L 86 44 L 82 47" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Person side — bright */}
        <circle cx="112" cy="22" r="10" stroke="white" strokeWidth="2"/>
        <line x1="110" y1="32" x2="108" y2="46" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="96" y1="50" x2="118" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="100" y1="48" x2="96" y2="68" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="104" y1="50" x2="102" y2="72" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="116" y1="50" x2="118" y2="72" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        {/* Ear dot to show side profile */}
        <circle cx="120" cy="20" r="3" fill="#22c55e"/>
      </svg>

      <p className="text-slate-500 text-sm">Auto-continuing in a moment…</p>
      <button
        onClick={onContinue}
        className="bg-green-500 text-white rounded-2xl px-8 py-3 font-semibold text-sm active:scale-95 transition-transform"
      >
        I'm ready
      </button>
    </div>
  )
}

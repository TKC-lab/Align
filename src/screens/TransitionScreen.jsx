import { useEffect } from 'react'

/** Brief screen shown between front and side scan */
export default function TransitionScreen({ onContinue }) {
  useEffect(() => {
    const t = setTimeout(onContinue, 3000)
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
      <div className="flex gap-2 mt-2">
        {/* Rotation illustration */}
        <svg viewBox="0 0 120 80" width="160" fill="none">
          {/* Person front */}
          <circle cx="28" cy="22" r="10" stroke="white" strokeWidth="2" opacity="0.5"/>
          <line x1="28" y1="32" x2="28" y2="46" stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>
          <line x1="14" y1="48" x2="42" y2="48" stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>
          <line x1="18" y1="46" x2="14" y2="65" stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>
          <line x1="38" y1="46" x2="42" y2="65" stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>
          <line x1="22" y1="48" x2="20" y2="70" stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>
          <line x1="34" y1="48" x2="36" y2="70" stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>
          {/* Arrow */}
          <path d="M 52 40 Q 60 28 68 40" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M 66 36 L 68 40 L 64 42" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Person side */}
          <circle cx="92" cy="22" r="10" stroke="white" strokeWidth="2"/>
          <line x1="92" y1="32" x2="92" y2="46" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="80" y1="48" x2="100" y2="48" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="84" y1="46" x2="80" y2="65" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="86" y1="48" x2="84" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="98" y1="48" x2="100" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <button
        onClick={onContinue}
        className="mt-2 bg-green-500 text-white rounded-2xl px-8 py-3 font-semibold text-sm active:scale-95 transition-transform"
      >
        I'm ready
      </button>
    </div>
  )
}

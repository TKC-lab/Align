export default function OnboardingScreen({ onContinue }) {
  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-12 screen-enter">
      {/* Logo / wordmark */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2 L8 14 M4 6 L8 2 L12 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">Align</span>
      </div>

      {/* Hero illustration */}
      <div className="flex-1 flex flex-col justify-center items-center text-center gap-8">
        <div className="w-48 h-48 mx-auto">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Person standing */}
            <circle cx="100" cy="45" r="22" stroke="#1e293b" strokeWidth="3" fill="#f8fafc"/>
            <line x1="100" y1="67" x2="100" y2="90" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <line x1="65" y1="96" x2="135" y2="96" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <line x1="65" y1="96" x2="55" y2="145" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <line x1="55" y1="145" x2="52" y2="180" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <line x1="135" y1="96" x2="145" y2="145" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <line x1="145" y1="145" x2="148" y2="180" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <line x1="65" y1="96" x2="70" y2="155" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <line x1="70" y1="155" x2="68" y2="185" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <line x1="135" y1="96" x2="130" y2="155" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            <line x1="130" y1="155" x2="132" y2="185" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            {/* Green check marks on joints */}
            <circle cx="100" cy="96" r="7" fill="#22c55e"/>
            <path d="M97 96 L99 98 L103 94" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="100" cy="155" r="7" fill="#22c55e"/>
            <path d="M97 155 L99 157 L103 153" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="space-y-3 max-w-xs">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Posture that feels good</h1>
          <p className="text-slate-500 text-base leading-relaxed">
            Align uses your phone camera to scan your posture and coach you into better alignment — in under 10 minutes.
          </p>
        </div>

        {/* Feature list */}
        <div className="w-full max-w-xs space-y-3">
          {[
            { icon: '📷', text: 'Quick front + side scan' },
            { icon: '🎯', text: 'Real-time correction coaching' },
            { icon: '📈', text: 'Track your progress over time' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <span className="text-lg">{icon}</span>
              <span className="text-sm font-medium text-slate-700">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy note + CTA */}
      <div className="space-y-4 pt-8">
        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <p className="text-xs text-green-800 leading-relaxed">
            Your camera never leaves your device. All pose detection runs locally — nothing is recorded or uploaded.
          </p>
        </div>
        <button
          onClick={onContinue}
          className="w-full bg-slate-900 text-white rounded-2xl py-4 text-base font-semibold tracking-tight active:scale-95 transition-transform"
        >
          Get started
        </button>
      </div>
    </div>
  )
}

import { initAudio } from '../utils/audio'

export default function SetupScreen({ onStart, onBack }) {
  return (
    <div className="flex flex-col min-h-screen bg-white screen-enter">
      {/* Back button */}
      <div className="px-4 pt-12 pb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-500 text-sm font-medium py-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </button>
      </div>

      <div className="flex-1 px-6 flex flex-col justify-between pb-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Set up your space</h1>
            <p className="text-slate-500 mt-2 leading-relaxed">
              For the most accurate scan, prop your phone so the camera can see your full body.
            </p>
          </div>

          {/* Phone placement illustration */}
          <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center">
            <svg viewBox="0 0 280 200" className="w-full max-w-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Floor */}
              <line x1="20" y1="180" x2="260" y2="180" stroke="#e2e8f0" strokeWidth="2"/>

              {/* Phone propped up */}
              <rect x="30" y="90" width="42" height="70" rx="5" stroke="#1e293b" strokeWidth="2.5" fill="white"/>
              <rect x="34" y="95" width="34" height="56" rx="2" fill="#e0f2fe"/>
              {/* Camera icon on phone */}
              <circle cx="51" cy="97" r="3" fill="#64748b"/>
              {/* Phone stand */}
              <line x1="30" y1="160" x2="20" y2="180" stroke="#1e293b" strokeWidth="2"/>

              {/* Distance arrow */}
              <line x1="72" y1="170" x2="165" y2="170" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,4"/>
              <text x="118" y="165" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="system-ui">4–6 feet</text>
              <path d="M72 170 L78 167 L78 173 Z" fill="#94a3b8"/>
              <path d="M165 170 L159 167 L159 173 Z" fill="#94a3b8"/>

              {/* Person */}
              <circle cx="195" cy="68" r="16" stroke="#1e293b" strokeWidth="2.5" fill="#f8fafc"/>
              <line x1="195" y1="84" x2="195" y2="108" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="170" y1="112" x2="220" y2="112" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="170" y1="112" x2="160" y2="145" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="220" y1="112" x2="230" y2="145" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="180" y1="108" x2="177" y2="155" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="177" y1="155" x2="175" y2="180" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="210" y1="108" x2="213" y2="155" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="213" y1="155" x2="215" y2="180" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>

              {/* Height label */}
              <line x1="50" y1="90" x2="50" y2="135" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4,3"/>
              <text x="22" y="115" fontSize="8" fill="#22c55e" fontFamily="system-ui">Chest</text>
              <text x="22" y="124" fontSize="8" fill="#22c55e" fontFamily="system-ui">height</text>
            </svg>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            {[
              'Prop your phone at chest height, 4–6 feet away',
              'Make sure your full body fits in frame',
              'Stand or sit in a clear space with good light',
              'Wear fitted clothing so your posture is visible',
            ].map((tip, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy + Start */}
        <div className="space-y-4 pt-6">
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <p className="text-xs text-green-800 leading-relaxed">
              Your camera stays on your device. All pose detection is done locally — nothing is ever recorded or uploaded.
            </p>
          </div>
          <button
            onClick={() => { initAudio(); onStart() }}
            className="w-full bg-slate-900 text-white rounded-2xl py-4 text-base font-semibold tracking-tight active:scale-95 transition-transform"
          >
            Start session — allow camera
          </button>
        </div>
      </div>
    </div>
  )
}

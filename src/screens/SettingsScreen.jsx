import { useState } from 'react'
import { getPrefs, savePrefs, clearAll } from '../utils/storage'

export default function SettingsScreen() {
  const [prefs, setPrefs] = useState(getPrefs)
  const [cleared, setCleared] = useState(false)

  const toggle = (key) => {
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)
    savePrefs(updated)
  }

  const handleClear = () => {
    if (window.confirm('Clear all session history and preferences? This cannot be undone.')) {
      clearAll()
      setCleared(true)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20 screen-enter">
      {/* Header */}
      <div className="bg-white px-6 pt-14 pb-4 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {/* App info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <path d="M8 2 L8 14 M4 6 L8 2 L12 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-slate-900">Align</p>
            <p className="text-xs text-slate-500 mt-0.5">Posture Coach · v1.0</p>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-3">Preferences</h2>
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
            <ToggleRow
              label="Haptic feedback"
              description="Vibrate on session milestones"
              checked={prefs.haptics !== false}
              onChange={() => toggle('haptics')}
            />
            <ToggleRow
              label="Auto-advance scan"
              description="Automatically start countdown when body detected"
              checked={prefs.autoAdvance !== false}
              onChange={() => toggle('autoAdvance')}
            />
          </div>
        </div>

        {/* Privacy */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-3">Privacy</h2>
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <p><strong className="text-slate-900">Camera:</strong> All pose detection runs locally on your device using MediaPipe WebAssembly. No video is ever recorded, stored, or transmitted.</p>
                <p><strong className="text-slate-900">Data:</strong> Session history and baseline posture data are stored only in your browser's localStorage on this device.</p>
                <p><strong className="text-slate-900">Network:</strong> The only external request is loading the MediaPipe library from a CDN on first use. After that, it runs fully offline.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data management */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-3">Data</h2>
          <div className="bg-white rounded-2xl shadow-sm">
            <button
              onClick={handleClear}
              className="w-full px-4 py-4 flex items-center gap-3 text-left active:bg-red-50 rounded-2xl transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-600">Clear all data</p>
                <p className="text-xs text-slate-400 mt-0.5">Removes all session history and preferences</p>
              </div>
            </button>
          </div>
          {cleared && (
            <p className="text-xs text-green-600 font-medium px-1 mt-2">All data cleared.</p>
          )}
        </div>

        {/* About */}
        <p className="text-xs text-slate-400 text-center leading-relaxed px-4">
          Align is a privacy-first posture coaching tool. All processing happens on your device. Built with MediaPipe Pose and React.
        </p>
      </div>
    </div>
  )
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-slate-900' : 'bg-gray-200'}`}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  )
}

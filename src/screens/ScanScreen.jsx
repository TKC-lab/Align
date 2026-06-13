import { useEffect, useRef, useState, useCallback } from 'react'
import { useMediaPipe } from '../hooks/useMediaPipe'
import SilhouetteOverlay from '../components/SilhouetteOverlay'
import CountdownRing from '../components/CountdownRing'
import { bodyInFrame } from '../utils/posture'
import { speak, tickBeep, successBeeps } from '../utils/audio'

const FRONT_COUNTDOWN = 5
const SIDE_COUNTDOWN = 8   // longer — gives time to settle after turning
const SAMPLE_INTERVAL_MS = 200

export default function ScanScreen({ view = 'front', onScanComplete, onBack }) {
  const { landmarks, videoRef, isReady, error, startCamera, stopCamera, onResultsRef } = useMediaPipe()
  const [phase, setPhase] = useState('waiting')
  const [countdown, setCountdown] = useState(FRONT_COUNTDOWN)
  const [progress, setProgress] = useState(0)
  const landmarkSamplesRef = useRef([])
  const timerRef = useRef(null)
  const detectedRef = useRef(false)
  const spokenRef = useRef(false)

  const COUNTDOWN_SECS = view === 'side' ? SIDE_COUNTDOWN : FRONT_COUNTDOWN
  const facingMode = 'user'

  // Announce instructions when side scan mounts
  useEffect(() => {
    if (view === 'side' && !spokenRef.current) {
      spokenRef.current = true
      speak('Turn to your right side. Keep your full body in frame.')
    }
  }, [view])

  useEffect(() => {
    startCamera(facingMode)
    return () => stopCamera()
  }, [startCamera, stopCamera])

  const handleResults = useCallback((lm) => {
    if (phase !== 'waiting' && phase !== 'countdown') return
    const detected = bodyInFrame(lm, view)
    if (detected && !detectedRef.current) {
      detectedRef.current = true
      setPhase('countdown')
      speak('Hold still')
    } else if (!detected && detectedRef.current && phase === 'waiting') {
      detectedRef.current = false
    }
  }, [phase, view])

  useEffect(() => {
    onResultsRef.current = handleResults
  }, [handleResults, onResultsRef])

  // Countdown — speak each number and tick
  useEffect(() => {
    if (phase !== 'countdown') return
    setCountdown(COUNTDOWN_SECS)
    let secs = COUNTDOWN_SECS
    timerRef.current = setInterval(() => {
      secs -= 1
      setCountdown(secs)
      if (secs > 0) {
        tickBeep()
        if (secs <= 3) speak(String(secs))
      }
      if (secs <= 0) {
        clearInterval(timerRef.current)
        setPhase('scanning')
      }
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, COUNTDOWN_SECS])

  // Scanning — collect samples
  useEffect(() => {
    if (phase !== 'scanning') return
    speak('Scanning')
    landmarkSamplesRef.current = []
    let collected = 0
    const total = (COUNTDOWN_SECS * 1000) / SAMPLE_INTERVAL_MS

    const interval = setInterval(() => {
      if (landmarks) landmarkSamplesRef.current.push(landmarks)
      collected += 1
      setProgress(Math.min(100, (collected / total) * 100))
      if (collected >= total) {
        clearInterval(interval)
        setPhase('done')
        successBeeps()
        const averaged = averageLandmarks(landmarkSamplesRef.current)
        stopCamera()
        onScanComplete(averaged)
      }
    }, SAMPLE_INTERVAL_MS)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const label = view === 'front'
    ? 'Face the camera — make sure your full body is visible'
    : 'Turn to your right — show your side profile'

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      <SilhouetteOverlay view={view} bodyDetected={phase === 'countdown' || phase === 'scanning' || phase === 'done'} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-12 pb-4">
        <button
          onClick={() => { stopCamera(); onBack() }}
          className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div className="bg-black/40 backdrop-blur-sm rounded-full px-4 py-1.5">
          <span className="text-white text-xs font-medium">
            {view === 'front' ? '1 of 2 — Front' : '2 of 2 — Side'}
          </span>
        </div>
        <div className="w-9" />
      </div>

      {/* Side scan reminder — persistent banner at top */}
      {view === 'side' && phase === 'waiting' && (
        <div className="relative z-10 mx-4">
          <div className="bg-green-600/80 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-white text-xs font-semibold">Turn to your right side — audio will guide you</p>
          </div>
        </div>
      )}

      {/* Status area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-16 gap-4">
        {error && (
          <div className="bg-red-900/80 rounded-xl px-4 py-3 mx-6">
            <p className="text-white text-sm text-center">{error}</p>
            <p className="text-red-300 text-xs text-center mt-1">Check camera permissions in Settings</p>
          </div>
        )}

        {!error && phase === 'waiting' && (
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl px-6 py-4 mx-6 text-center">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mx-auto mb-2" />
            <p className="text-white text-sm font-medium">{label}</p>
          </div>
        )}

        {phase === 'countdown' && (
          <div className="flex flex-col items-center gap-3">
            <CountdownRing seconds={countdown} totalSeconds={COUNTDOWN_SECS} size={88} />
            <p className="text-white text-sm font-medium bg-black/50 rounded-xl px-4 py-2">Hold still…</p>
          </div>
        )}

        {phase === 'scanning' && (
          <div className="w-full px-8 space-y-3">
            <div className="flex justify-between text-white text-xs font-medium px-1">
              <span>Scanning…</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function averageLandmarks(samples) {
  if (!samples.length) return null
  const validSamples = samples.filter(s => s && s.length)
  if (!validSamples.length) return null
  const count = validSamples.length
  return validSamples[0].map((_, i) => ({
    x: validSamples.reduce((s, f) => s + (f[i]?.x ?? 0), 0) / count,
    y: validSamples.reduce((s, f) => s + (f[i]?.y ?? 0), 0) / count,
    z: validSamples.reduce((s, f) => s + (f[i]?.z ?? 0), 0) / count,
    visibility: validSamples.reduce((s, f) => s + (f[i]?.visibility ?? 1), 0) / count,
  }))
}

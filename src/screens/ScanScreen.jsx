import { useEffect, useRef, useState, useCallback } from 'react'
import { useMediaPipe } from '../hooks/useMediaPipe'
import SilhouetteOverlay from '../components/SilhouetteOverlay'
import CountdownRing from '../components/CountdownRing'
import { bodyInFrame } from '../utils/posture'

const COUNTDOWN_SECS = 5
const SAMPLE_INTERVAL_MS = 200

export default function ScanScreen({ view = 'front', onScanComplete, onBack }) {
  const { landmarks, videoRef, isReady, error, startCamera, stopCamera, onResultsRef } = useMediaPipe()
  const [phase, setPhase] = useState('waiting')   // waiting | countdown | scanning | done
  const [countdown, setCountdown] = useState(COUNTDOWN_SECS)
  const [progress, setProgress] = useState(0)
  const landmarkSamplesRef = useRef([])
  const timerRef = useRef(null)
  const detectedRef = useRef(false)

  const facingMode = 'environment'  // back camera for propped phone scanning

  useEffect(() => {
    startCamera(facingMode)
    return () => stopCamera()
  }, [startCamera, stopCamera, facingMode])

  // Watch landmarks for body detection
  const handleResults = useCallback((lm) => {
    if (phase !== 'waiting' && phase !== 'countdown') return
    const detected = bodyInFrame(lm, view)
    if (detected && !detectedRef.current) {
      detectedRef.current = true
      setPhase('countdown')
    } else if (!detected && detectedRef.current && phase === 'waiting') {
      detectedRef.current = false
    }
  }, [phase, view])

  useEffect(() => {
    onResultsRef.current = handleResults
  }, [handleResults, onResultsRef])

  // Countdown logic
  useEffect(() => {
    if (phase !== 'countdown') return
    setCountdown(COUNTDOWN_SECS)
    let secs = COUNTDOWN_SECS
    timerRef.current = setInterval(() => {
      secs -= 1
      setCountdown(secs)
      if (secs <= 0) {
        clearInterval(timerRef.current)
        setPhase('scanning')
      }
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  // Scanning — collect landmark samples
  useEffect(() => {
    if (phase !== 'scanning') return
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
        // Average the samples to get stable landmarks
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
      {/* Video feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}  // mirror for front-cam feel
      />

      {/* Darken edges */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Silhouette overlay */}
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
  const avg = validSamples[0].map((_, i) => {
    const xs = validSamples.map(s => s[i]?.x ?? 0)
    const ys = validSamples.map(s => s[i]?.y ?? 0)
    const zs = validSamples.map(s => s[i]?.z ?? 0)
    const vs = validSamples.map(s => s[i]?.visibility ?? 1)
    return {
      x: xs.reduce((a, b) => a + b, 0) / count,
      y: ys.reduce((a, b) => a + b, 0) / count,
      z: zs.reduce((a, b) => a + b, 0) / count,
      visibility: vs.reduce((a, b) => a + b, 0) / count,
    }
  })
  return avg
}

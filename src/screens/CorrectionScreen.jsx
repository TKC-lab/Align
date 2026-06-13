import { useEffect, useRef, useState, useCallback } from 'react'
import { useMediaPipe } from '../hooks/useMediaPipe'
import SkeletonCanvas from '../components/SkeletonCanvas'
import AlignScore from '../components/AlignScore'
import { issueCorrectness } from '../utils/posture'
import { speak, successBeeps } from '../utils/audio'

const HOLD_SECS = 3
const goodColor = '#22c55e'

export default function CorrectionScreen({ issues, initialScore, onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [correctness, setCorrectness] = useState(0)
  const [holdProgress, setHoldProgress] = useState(0)
  const [holdActive, setHoldActive] = useState(false)
  const [phase, setPhase] = useState('correcting')
  const [resolvedCount, setResolvedCount] = useState(0)
  const [liveScore, setLiveScore] = useState(initialScore)
  const holdTimerRef = useRef(null)
  const spokenCueRef = useRef(null)
  const videoSize = useRef({ w: 640, h: 480 })

  const { landmarks, videoRef, startCamera, stopCamera, onResultsRef } = useMediaPipe()
  const issue = issues[currentIdx]

  useEffect(() => {
    startCamera('user')
    return () => stopCamera()
  }, [startCamera, stopCamera])

  // Speak coaching cue when issue changes
  useEffect(() => {
    if (!issue) return
    if (spokenCueRef.current === issue.id) return
    spokenCueRef.current = issue.id
    const orientation = issue.view === 'side' ? 'Turn to your side.' : 'Face the camera.'
    const t = setTimeout(() => speak(`${orientation} ${issue.coachingCue}`), 600)
    return () => clearTimeout(t)
  }, [issue])

  const handleResults = useCallback((lm) => {
    if (!lm || !issue) return
    const c = issueCorrectness(issue, lm)
    setCorrectness(c)
    if (c >= 80 && phase === 'correcting') {
      setPhase('holding')
      setHoldActive(true)
      speak('Hold it')
    } else if (c < 70 && phase === 'holding') {
      setPhase('correcting')
      setHoldActive(false)
      setHoldProgress(0)
      clearInterval(holdTimerRef.current)
    }
  }, [issue, phase])

  useEffect(() => {
    onResultsRef.current = handleResults
  }, [handleResults, onResultsRef])

  useEffect(() => {
    if (!holdActive) return
    let elapsed = 0
    holdTimerRef.current = setInterval(() => {
      elapsed += 100
      setHoldProgress((elapsed / (HOLD_SECS * 1000)) * 100)
      if (elapsed >= HOLD_SECS * 1000) {
        clearInterval(holdTimerRef.current)
        setPhase('resolved')
        successBeeps()
        if (navigator.vibrate) navigator.vibrate([80, 40, 80])
      }
    }, 100)
    return () => clearInterval(holdTimerRef.current)
  }, [holdActive])

  useEffect(() => {
    if (phase !== 'resolved') return
    const newResolved = resolvedCount + 1
    setResolvedCount(newResolved)
    const scorePerIssue = Math.round((100 - initialScore) / issues.length)
    const newScore = Math.min(100, initialScore + newResolved * scorePerIssue)
    setLiveScore(newScore)

    const t = setTimeout(() => {
      if (currentIdx + 1 < issues.length) {
        setCurrentIdx(i => i + 1)
        setPhase('correcting')
        setCorrectness(0)
        setHoldProgress(0)
        setHoldActive(false)
      } else {
        stopCamera()
        onComplete(newScore)
      }
    }, 1400)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const indicatorColor = correctness >= 80 ? goodColor : correctness >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
        onLoadedMetadata={(e) => {
          videoSize.current = { w: e.target.videoWidth, h: e.target.videoHeight }
        }}
      />

      {/* Skeleton overlay */}
      <SkeletonCanvas
        landmarks={landmarks}
        issue={issue}
        correctness={correctness}
        width={videoSize.current.w}
        height={videoSize.current.h}
      />

      {/* Light darkening */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />

      {/* ── TOP THIRD: Large coaching cue ── */}
      <div className="relative z-20 pt-14 px-4">
        {phase === 'correcting' && (
          <div className="bg-black/75 backdrop-blur-md rounded-2xl px-5 py-4 text-center space-y-2">
            {/* Orientation badge */}
            <div className="flex items-center justify-center gap-2">
              {issue?.view === 'side' ? (
                <span className="flex items-center gap-1.5 bg-blue-500/30 border border-blue-400/50 text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                  Turn to your side
                </span>
              ) : (
                <span className="flex items-center gap-1.5 bg-green-500/25 border border-green-400/50 text-green-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                  </svg>
                  Face the camera
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{issue?.label}</p>
            <p className="text-white text-2xl font-bold leading-snug">{issue?.coachingCue}</p>
          </div>
        )}

        {phase === 'holding' && (
          <div className="bg-green-600/85 backdrop-blur-md rounded-2xl px-5 py-5 text-center">
            <p className="text-white text-3xl font-bold">Hold it!</p>
            <div className="mt-3 w-full h-2.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{ width: `${holdProgress}%` }}
              />
            </div>
          </div>
        )}

        {phase === 'resolved' && (
          <div className="bg-green-600/85 backdrop-blur-md rounded-2xl px-5 py-5 flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-white text-2xl font-bold">
              {currentIdx + 1 < issues.length ? 'Nice! Next one…' : 'All done!'}
            </p>
          </div>
        )}
      </div>

      {/* ── BOTTOM HUD ── */}
      <div className="relative z-20 mt-auto mx-3 mb-5">
        <div className="bg-black/65 backdrop-blur-md rounded-2xl px-4 py-3 space-y-2.5">
          {/* Score + progress */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlignScore score={liveScore} size={52} label="" animate />
              <div>
                <p className="text-xs text-slate-400">Score</p>
                <p className="text-xs text-slate-500">
                  Issue {currentIdx + 1} of {issues.length}
                </p>
              </div>
            </div>

            {/* Progress pills */}
            <div className="flex gap-1.5">
              {issues.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: i === currentIdx ? 20 : 7,
                    backgroundColor: i < currentIdx ? goodColor : i === currentIdx ? 'white' : 'rgba(255,255,255,0.25)',
                  }}
                />
              ))}
            </div>

            {/* Alignment % */}
            <div className="text-right">
              <p className="text-xs text-slate-400">Alignment</p>
              <p className="text-xl font-bold" style={{ color: indicatorColor }}>{correctness}%</p>
            </div>
          </div>

          {/* Alignment bar */}
          <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{ width: `${correctness}%`, backgroundColor: indicatorColor }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

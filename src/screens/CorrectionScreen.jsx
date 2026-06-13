import { useEffect, useRef, useState, useCallback } from 'react'
import { useMediaPipe } from '../hooks/useMediaPipe'
import SkeletonCanvas from '../components/SkeletonCanvas'
import AlignScore from '../components/AlignScore'
import { issueCorrectness } from '../utils/posture'

const HOLD_SECS = 3

export default function CorrectionScreen({ issues, initialScore, onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [correctness, setCorrectness] = useState(0)
  const [holdProgress, setHoldProgress] = useState(0)
  const [holdActive, setHoldActive] = useState(false)
  const [phase, setPhase] = useState('correcting')  // correcting | holding | resolved
  const [resolvedCount, setResolvedCount] = useState(0)
  const [liveScore, setLiveScore] = useState(initialScore)
  const holdTimerRef = useRef(null)
  const videoSize = useRef({ w: 640, h: 480 })

  const { landmarks, videoRef, isReady, startCamera, stopCamera, onResultsRef } = useMediaPipe()
  const issue = issues[currentIdx]

  const facingMode = 'environment'

  useEffect(() => {
    startCamera(facingMode)
    return () => stopCamera()
  }, [startCamera, stopCamera])

  const handleResults = useCallback((lm) => {
    if (!lm || !issue) return
    const c = issueCorrectness(issue, lm)
    setCorrectness(c)
    if (c >= 80 && phase === 'correcting') {
      setPhase('holding')
      setHoldActive(true)
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

  // Hold countdown
  useEffect(() => {
    if (!holdActive) return
    let elapsed = 0
    holdTimerRef.current = setInterval(() => {
      elapsed += 100
      setHoldProgress((elapsed / (HOLD_SECS * 1000)) * 100)
      if (elapsed >= HOLD_SECS * 1000) {
        clearInterval(holdTimerRef.current)
        setPhase('resolved')
        // Haptic
        if (navigator.vibrate) navigator.vibrate([80, 40, 80])
      }
    }, 100)
    return () => clearInterval(holdTimerRef.current)
  }, [holdActive])

  // After resolved, advance to next issue
  useEffect(() => {
    if (phase !== 'resolved') return
    const newResolved = resolvedCount + 1
    setResolvedCount(newResolved)
    const scorePerIssue = Math.round((100 - initialScore) / issues.length)
    setLiveScore(Math.min(100, initialScore + newResolved * scorePerIssue))

    const t = setTimeout(() => {
      if (currentIdx + 1 < issues.length) {
        setCurrentIdx(i => i + 1)
        setPhase('correcting')
        setCorrectness(0)
        setHoldProgress(0)
        setHoldActive(false)
      } else {
        stopCamera()
        onComplete(Math.min(100, initialScore + newResolved * scorePerIssue))
      }
    }, 1200)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const goodColor = '#22c55e'
  const badColor = '#ef4444'
  const indicatorColor = correctness >= 80 ? goodColor : correctness >= 50 ? '#f59e0b' : badColor

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
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

      {/* Darken */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* Top HUD */}
      <div className="relative z-10 flex items-start justify-between px-4 pt-12">
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-3 min-w-[80px] text-center">
          <AlignScore score={liveScore} size={70} label="" animate />
          <p className="text-white text-xs mt-1 font-medium">Score</p>
        </div>

        {/* Progress pills */}
        <div className="flex gap-1.5 pt-2">
          {issues.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i === currentIdx ? 24 : 8,
                backgroundColor: i < currentIdx ? goodColor : i === currentIdx ? 'white' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
        <div className="w-[80px]" />
      </div>

      {/* Bottom coaching panel */}
      <div className="relative z-10 mt-auto mx-3 mb-6 bg-black/70 backdrop-blur-md rounded-2xl p-4 space-y-3">
        {/* Issue label */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">{issue?.label}</p>
            <p className="text-slate-400 text-xs mt-0.5">Issue {currentIdx + 1} of {issues.length}</p>
          </div>
          {/* Correctness indicator */}
          <div className="text-right">
            <p className="text-xs text-slate-400">Alignment</p>
            <p className="text-lg font-bold" style={{ color: indicatorColor }}>
              {correctness}%
            </p>
          </div>
        </div>

        {/* Coaching cue */}
        <div className="bg-white/10 rounded-xl px-3 py-2.5">
          <p className="text-white text-sm leading-relaxed">{issue?.coachingCue}</p>
        </div>

        {/* Correctness bar */}
        <div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${correctness}%`,
                backgroundColor: indicatorColor,
              }}
            />
          </div>
        </div>

        {/* Hold prompt */}
        {phase === 'holding' && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all duration-100"
                style={{ width: `${holdProgress}%` }}
              />
            </div>
            <span className="text-green-400 text-xs font-semibold flex-shrink-0">Hold it!</span>
          </div>
        )}

        {phase === 'resolved' && (
          <div className="flex items-center justify-center gap-2 py-1">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-green-400 text-sm font-semibold">
              {currentIdx + 1 < issues.length ? 'Nice! Moving to next…' : 'All done!'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

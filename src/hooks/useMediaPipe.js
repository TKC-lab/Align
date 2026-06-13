import { useEffect, useRef, useState, useCallback } from 'react'

const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404'

let poseInstance = null
let poseLoadPromise = null

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.crossOrigin = 'anonymous'
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

async function initPose(onResults) {
  if (!poseLoadPromise) {
    poseLoadPromise = (async () => {
      await loadScript(`${MEDIAPIPE_CDN}/pose.js`)
      // eslint-disable-next-line no-undef
      const pose = new Pose({
        locateFile: (file) => `${MEDIAPIPE_CDN}/${file}`,
      })
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })
      poseInstance = pose
      return pose
    })()
  }
  await poseLoadPromise
  poseInstance.onResults(onResults)
  return poseInstance
}

/**
 * Hook that drives MediaPipe Pose on a video element.
 * Returns { landmarks, videoRef, canvasRef, isReady, startCamera, stopCamera }
 */
export function useMediaPipe() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const streamRef = useRef(null)
  const onResultsRef = useRef(null)
  const runningRef = useRef(false)

  const [landmarks, setLandmarks] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)

  const onResults = useCallback((results) => {
    const lm = results.poseLandmarks
    setLandmarks(lm || null)
    if (onResultsRef.current) onResultsRef.current(lm || null)
  }, [])

  const startCamera = useCallback(async (facingMode = 'user') => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play()

      const pose = await initPose(onResults)
      setIsReady(true)
      runningRef.current = true

      const sendFrame = async () => {
        if (!runningRef.current || !video || video.paused || video.ended) return
        if (video.readyState >= 2) {
          try { await pose.send({ image: video }) } catch { /* ignore */ }
        }
        animFrameRef.current = requestAnimationFrame(sendFrame)
      }
      animFrameRef.current = requestAnimationFrame(sendFrame)
    } catch (err) {
      setError(err.message || 'Camera access failed')
    }
  }, [onResults])

  const stopCamera = useCallback(() => {
    runningRef.current = false
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setLandmarks(null)
    setIsReady(false)
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  return { landmarks, videoRef, canvasRef, isReady, error, startCamera, stopCamera, onResultsRef }
}

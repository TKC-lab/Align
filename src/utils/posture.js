/**
 * MediaPipe Pose landmark indices
 * https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker
 */
export const LM = {
  NOSE: 0,
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
}

// Detection thresholds — tuned for typical standing posture
const SHOULDER_TILT_PX = 0.04   // normalized units (~4% of frame height)
const HIP_TILT_PX = 0.04
const HEAD_TILT_PX = 0.03
const FORWARD_HEAD_PX = 0.05    // ear-to-shoulder X offset
const ROUNDED_BACK_PX = 0.04    // shoulder-to-hip X offset
const PELVIC_TILT_ANGLE = 8     // degrees

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function angleDeg(a, b, c) {
  const ab = { x: b.x - a.x, y: b.y - a.y }
  const cb = { x: b.x - c.x, y: b.y - c.y }
  const dot = ab.x * cb.x + ab.y * cb.y
  const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2)
  const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2)
  if (magAB === 0 || magCB === 0) return 0
  return (Math.acos(Math.max(-1, Math.min(1, dot / (magAB * magCB)))) * 180) / Math.PI
}

function visibility(lm) {
  return (lm.visibility ?? lm.score ?? 1)
}

function isVisible(lm, threshold = 0.5) {
  return visibility(lm) > threshold
}

/**
 * Analyze front-view landmarks.
 * Returns array of issue objects: { id, label, explanation, severity, view, coachingCue, score }
 */
export function analyzeFront(landmarks) {
  const issues = []
  const lm = landmarks

  const ls = lm[LM.LEFT_SHOULDER]
  const rs = lm[LM.RIGHT_SHOULDER]
  const lh = lm[LM.LEFT_HIP]
  const rh = lm[LM.RIGHT_HIP]
  const nose = lm[LM.NOSE]

  if (isVisible(ls) && isVisible(rs)) {
    const shoulderDiff = Math.abs(ls.y - rs.y)
    if (shoulderDiff > SHOULDER_TILT_PX) {
      const side = ls.y > rs.y ? 'left' : 'right'
      const severity = shoulderDiff > SHOULDER_TILT_PX * 2.5 ? 'Significant' : shoulderDiff > SHOULDER_TILT_PX * 1.5 ? 'Moderate' : 'Mild'
      issues.push({
        id: 'shoulder_imbalance',
        label: 'Shoulder Imbalance',
        explanation: `Your ${side} shoulder is sitting higher than the other`,
        severity,
        view: 'front',
        coachingCue: `Relax your ${side} shoulder down`,
        rawValue: shoulderDiff,
        threshold: SHOULDER_TILT_PX,
      })
    }
  }

  if (isVisible(nose) && isVisible(ls) && isVisible(rs)) {
    const midX = (ls.x + rs.x) / 2
    const headOffset = nose.x - midX
    if (Math.abs(headOffset) > HEAD_TILT_PX) {
      const side = headOffset > 0 ? 'left' : 'right'
      const severity = Math.abs(headOffset) > HEAD_TILT_PX * 2.5 ? 'Significant' : Math.abs(headOffset) > HEAD_TILT_PX * 1.5 ? 'Moderate' : 'Mild'
      issues.push({
        id: 'head_tilt',
        label: 'Head Tilt',
        explanation: 'Your head is tilted to one side',
        severity,
        view: 'front',
        coachingCue: `Level your head — bring it toward your ${side}`,
        rawValue: Math.abs(headOffset),
        threshold: HEAD_TILT_PX,
      })
    }
  }

  if (isVisible(lh) && isVisible(rh)) {
    const hipDiff = Math.abs(lh.y - rh.y)
    if (hipDiff > HIP_TILT_PX) {
      const side = lh.y > rh.y ? 'left' : 'right'
      const severity = hipDiff > HIP_TILT_PX * 2.5 ? 'Significant' : hipDiff > HIP_TILT_PX * 1.5 ? 'Moderate' : 'Mild'
      issues.push({
        id: 'hip_hiking',
        label: 'Hip Imbalance',
        explanation: `Your ${side} hip is sitting higher than the other`,
        severity,
        view: 'front',
        coachingCue: 'Level your hips — shift weight evenly through both feet',
        rawValue: hipDiff,
        threshold: HIP_TILT_PX,
      })
    }
  }

  return issues
}

/**
 * Analyze side-view landmarks.
 * In side view, left/right depends on which side the user faces.
 * We detect based on which ear/shoulder/hip are most visible.
 */
export function analyzeSide(landmarks) {
  const issues = []
  const lm = landmarks

  // Determine which side is facing camera — use ear visibility
  const leftEar = lm[LM.LEFT_EAR]
  const rightEar = lm[LM.RIGHT_EAR]
  const leftShoulder = lm[LM.LEFT_SHOULDER]
  const rightShoulder = lm[LM.RIGHT_SHOULDER]
  const leftHip = lm[LM.LEFT_HIP]
  const rightHip = lm[LM.RIGHT_HIP]
  const leftKnee = lm[LM.LEFT_KNEE]
  const rightKnee = lm[LM.RIGHT_KNEE]

  // Use the more visible side
  const useLeft = visibility(leftEar) > visibility(rightEar)
  const ear = useLeft ? leftEar : rightEar
  const shoulder = useLeft ? leftShoulder : rightShoulder
  const hip = useLeft ? leftHip : rightHip
  const knee = useLeft ? leftKnee : rightKnee

  if (isVisible(ear) && isVisible(shoulder)) {
    const forwardHead = ear.x - shoulder.x
    // Positive = ear is in front of shoulder (forward head)
    const headForward = useLeft ? forwardHead > FORWARD_HEAD_PX : forwardHead < -FORWARD_HEAD_PX
    if (Math.abs(forwardHead) > FORWARD_HEAD_PX) {
      const severity = Math.abs(forwardHead) > FORWARD_HEAD_PX * 2.5 ? 'Significant' : Math.abs(forwardHead) > FORWARD_HEAD_PX * 1.5 ? 'Moderate' : 'Mild'
      issues.push({
        id: 'forward_head',
        label: 'Forward Head Posture',
        explanation: 'Your head is sitting in front of your shoulders',
        severity,
        view: 'side',
        coachingCue: 'Draw your chin back — imagine a string pulling the back of your head up',
        rawValue: Math.abs(forwardHead),
        threshold: FORWARD_HEAD_PX,
      })
    }
  }

  if (isVisible(shoulder) && isVisible(hip)) {
    const roundedBack = shoulder.x - hip.x
    const isRounded = useLeft ? roundedBack > ROUNDED_BACK_PX : roundedBack < -ROUNDED_BACK_PX
    if (Math.abs(roundedBack) > ROUNDED_BACK_PX) {
      const severity = Math.abs(roundedBack) > ROUNDED_BACK_PX * 2.5 ? 'Significant' : Math.abs(roundedBack) > ROUNDED_BACK_PX * 1.5 ? 'Moderate' : 'Mild'
      issues.push({
        id: 'rounded_back',
        label: 'Rounded Upper Back',
        explanation: 'Your shoulders are rolling forward',
        severity,
        view: 'side',
        coachingCue: 'Open your chest — roll your shoulders back and down',
        rawValue: Math.abs(roundedBack),
        threshold: ROUNDED_BACK_PX,
      })
    }
  }

  if (isVisible(shoulder) && isVisible(hip) && isVisible(knee)) {
    const angle = angleDeg(shoulder, hip, knee)
    // Neutral pelvis ~170-180 deg; anterior tilt <165
    if (angle < 165) {
      const deviation = 165 - angle
      const severity = deviation > 15 ? 'Significant' : deviation > 8 ? 'Moderate' : 'Mild'
      issues.push({
        id: 'pelvic_tilt',
        label: 'Anterior Pelvic Tilt',
        explanation: 'Your pelvis is tipping forward, arching your lower back',
        severity,
        view: 'side',
        coachingCue: 'Gently tuck your pelvis — engage your lower abs',
        rawValue: deviation,
        threshold: 15,
      })
    }
  }

  return issues
}

/** Merge front+side issues, sort by severity */
export function diagnose(frontIssues, sideIssues) {
  const severityRank = { Significant: 3, Moderate: 2, Mild: 1 }
  const all = [...frontIssues, ...sideIssues]
  all.sort((a, b) => severityRank[b.severity] - severityRank[a.severity])
  return all
}

/**
 * Compute a score 0-100 for a set of issues.
 * More issues + higher severity = lower score.
 */
export function computeScore(issues) {
  if (issues.length === 0) return 100
  const severityPenalty = { Significant: 18, Moderate: 10, Mild: 5 }
  const penalty = issues.reduce((sum, i) => sum + (severityPenalty[i.severity] ?? 5), 0)
  return Math.max(0, Math.min(100, 100 - penalty))
}

/**
 * For a single issue during correction phase, compute 0-100 correctness.
 * Returns 100 when the issue is within threshold.
 */
export function issueCorrectness(issue, landmarks) {
  if (!landmarks || !landmarks.length) return 0
  const lm = landmarks

  try {
    if (issue.id === 'shoulder_imbalance') {
      const ls = lm[LM.LEFT_SHOULDER], rs = lm[LM.RIGHT_SHOULDER]
      if (!isVisible(ls) || !isVisible(rs)) return 50
      const diff = Math.abs(ls.y - rs.y)
      return Math.min(100, Math.round(100 * Math.max(0, 1 - diff / SHOULDER_TILT_PX)))
    }
    if (issue.id === 'head_tilt') {
      const nose = lm[LM.NOSE], ls = lm[LM.LEFT_SHOULDER], rs = lm[LM.RIGHT_SHOULDER]
      if (!isVisible(nose) || !isVisible(ls) || !isVisible(rs)) return 50
      const mid = (ls.x + rs.x) / 2
      const off = Math.abs(nose.x - mid)
      return Math.min(100, Math.round(100 * Math.max(0, 1 - off / HEAD_TILT_PX)))
    }
    if (issue.id === 'hip_hiking') {
      const lh = lm[LM.LEFT_HIP], rh = lm[LM.RIGHT_HIP]
      if (!isVisible(lh) || !isVisible(rh)) return 50
      const diff = Math.abs(lh.y - rh.y)
      return Math.min(100, Math.round(100 * Math.max(0, 1 - diff / HIP_TILT_PX)))
    }
    if (issue.id === 'forward_head') {
      const leftEar = lm[LM.LEFT_EAR], rightEar = lm[LM.RIGHT_EAR]
      const leftShoulder = lm[LM.LEFT_SHOULDER], rightShoulder = lm[LM.RIGHT_SHOULDER]
      const useLeft = visibility(leftEar) > visibility(rightEar)
      const ear = useLeft ? leftEar : rightEar
      const shoulder = useLeft ? leftShoulder : rightShoulder
      if (!isVisible(ear) || !isVisible(shoulder)) return 50
      const off = Math.abs(ear.x - shoulder.x)
      return Math.min(100, Math.round(100 * Math.max(0, 1 - off / FORWARD_HEAD_PX)))
    }
    if (issue.id === 'rounded_back') {
      const leftEar = lm[LM.LEFT_EAR], rightEar = lm[LM.RIGHT_EAR]
      const leftShoulder = lm[LM.LEFT_SHOULDER], rightShoulder = lm[LM.RIGHT_SHOULDER]
      const leftHip = lm[LM.LEFT_HIP], rightHip = lm[LM.RIGHT_HIP]
      const useLeft = visibility(leftEar) > visibility(rightEar)
      const shoulder = useLeft ? leftShoulder : rightShoulder
      const hip = useLeft ? leftHip : rightHip
      if (!isVisible(shoulder) || !isVisible(hip)) return 50
      const off = Math.abs(shoulder.x - hip.x)
      return Math.min(100, Math.round(100 * Math.max(0, 1 - off / ROUNDED_BACK_PX)))
    }
    if (issue.id === 'pelvic_tilt') {
      const leftEar = lm[LM.LEFT_EAR], rightEar = lm[LM.RIGHT_EAR]
      const useLeft = visibility(leftEar) > visibility(rightEar)
      const shoulder = useLeft ? lm[LM.LEFT_SHOULDER] : lm[LM.RIGHT_SHOULDER]
      const hip = useLeft ? lm[LM.LEFT_HIP] : lm[LM.RIGHT_HIP]
      const knee = useLeft ? lm[LM.LEFT_KNEE] : lm[LM.RIGHT_KNEE]
      if (!isVisible(shoulder) || !isVisible(hip) || !isVisible(knee)) return 50
      const angle = angleDeg(shoulder, hip, knee)
      const deviation = Math.max(0, 165 - angle)
      return Math.min(100, Math.round(100 * Math.max(0, 1 - deviation / 15)))
    }
  } catch {
    return 50
  }
  return 50
}

/** Determine if enough landmarks are visible to count as "body detected" */
export function bodyInFrame(landmarks, view = 'front') {
  if (!landmarks || landmarks.length < 29) return false
  const required = view === 'front'
    ? [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_HIP, LM.RIGHT_HIP, LM.NOSE]
    : [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_HIP, LM.RIGHT_HIP, LM.LEFT_EAR, LM.RIGHT_EAR]
  return required.every(idx => isVisible(landmarks[idx], 0.5))
}

/** Build skeleton segments for canvas overlay */
export function buildSkeleton(landmarks, issue) {
  const segments = [
    // Torso
    [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
    [LM.LEFT_SHOULDER, LM.LEFT_HIP],
    [LM.RIGHT_SHOULDER, LM.RIGHT_HIP],
    [LM.LEFT_HIP, LM.RIGHT_HIP],
    // Arms
    [LM.LEFT_SHOULDER, LM.LEFT_ELBOW],
    [LM.LEFT_ELBOW, LM.LEFT_WRIST],
    [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW],
    [LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
    // Legs
    [LM.LEFT_HIP, LM.LEFT_KNEE],
    [LM.LEFT_KNEE, LM.LEFT_ANKLE],
    [LM.RIGHT_HIP, LM.RIGHT_KNEE],
    [LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
    // Head
    [LM.NOSE, LM.LEFT_SHOULDER],
    [LM.NOSE, LM.RIGHT_SHOULDER],
  ]

  const affected = {
    shoulder_imbalance: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
    head_tilt: [LM.NOSE, LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
    hip_hiking: [LM.LEFT_HIP, LM.RIGHT_HIP],
    forward_head: [LM.NOSE, LM.LEFT_EAR, LM.RIGHT_EAR, LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
    rounded_back: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_HIP, LM.RIGHT_HIP],
    pelvic_tilt: [LM.LEFT_HIP, LM.RIGHT_HIP, LM.LEFT_KNEE, LM.RIGHT_KNEE],
  }

  const affectedSet = new Set(issue ? (affected[issue.id] || []) : [])

  return segments.map(([a, b]) => ({
    from: a,
    to: b,
    highlighted: affectedSet.has(a) || affectedSet.has(b),
  }))
}

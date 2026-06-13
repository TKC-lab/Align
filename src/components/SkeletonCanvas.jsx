import { useEffect, useRef } from 'react'
import { buildSkeleton, LM } from '../utils/posture'

// Mirror x to match CSS scaleX(-1) on video
function mx(lm, w) { return (1 - lm.x) * w }
function my(lm, h) { return lm.y * h }

function isVis(lm, t = 0.3) { return lm && (lm.visibility ?? lm.score ?? 1) > t }

function drawArrow(ctx, x1, y1, x2, y2, color, label) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const headLen = 16

  ctx.save()
  ctx.globalAlpha = 0.95
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 3.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = 4

  // Shaft
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()

  // Arrowhead
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - headLen * Math.cos(angle - 0.42), y2 - headLen * Math.sin(angle - 0.42))
  ctx.lineTo(x2 - headLen * Math.cos(angle + 0.42), y2 - headLen * Math.sin(angle + 0.42))
  ctx.closePath()
  ctx.fill()

  // Label
  if (label) {
    ctx.shadowBlur = 6
    ctx.font = 'bold 13px system-ui, sans-serif'
    ctx.fillStyle = 'white'
    const tw = ctx.measureText(label).width
    const lx = x2 + (x2 > x1 ? 6 : -tw - 6)
    const ly = y2 + (y2 > y1 ? 18 : -6)
    ctx.fillText(label, lx, ly)
  }
  ctx.restore()
}

function getIssueArrows(issue, landmarks, w, h) {
  if (!issue || !landmarks) return []
  const lm = landmarks
  const arrows = []

  switch (issue.id) {
    case 'forward_head': {
      const lear = lm[LM.LEFT_EAR], rear = lm[LM.RIGHT_EAR]
      const ear = isVis(lear) && (!isVis(rear) || (lear.visibility ?? 1) >= (rear.visibility ?? 1)) ? lear : rear
      if (isVis(ear)) {
        const ex = mx(ear, w), ey = my(ear, h)
        arrows.push({ x1: ex - 36, y1: ey, x2: ex + 6, y2: ey, label: 'Pull back' })
      }
      break
    }
    case 'rounded_back': {
      const ls = lm[LM.LEFT_SHOULDER], rs = lm[LM.RIGHT_SHOULDER]
      if (isVis(ls) && isVis(rs)) {
        const cx = (mx(ls, w) + mx(rs, w)) / 2
        const cy = (my(ls, h) + my(rs, h)) / 2
        // Two arrows — shoulders back and down
        arrows.push({ x1: cx - 18, y1: cy, x2: cx - 18, y2: cy - 30, label: 'Open chest' })
        arrows.push({ x1: cx + 18, y1: cy, x2: cx + 18, y2: cy - 30, label: '' })
      }
      break
    }
    case 'pelvic_tilt': {
      const lh = lm[LM.LEFT_HIP], rh = lm[LM.RIGHT_HIP]
      if (isVis(lh) && isVis(rh)) {
        const cx = (mx(lh, w) + mx(rh, w)) / 2
        const cy = (my(lh, h) + my(rh, h)) / 2
        // Tuck = pelvis rotates backward (posterior)
        arrows.push({ x1: cx, y1: cy - 10, x2: cx, y2: cy + 34, label: 'Tuck pelvis' })
      }
      break
    }
    case 'shoulder_imbalance': {
      const ls = lm[LM.LEFT_SHOULDER], rs = lm[LM.RIGHT_SHOULDER]
      if (isVis(ls) && isVis(rs)) {
        // Higher shoulder has smaller y value
        const higher = ls.y < rs.y ? ls : rs
        arrows.push({ x1: mx(higher, w), y1: my(higher, h) - 6, x2: mx(higher, w), y2: my(higher, h) + 32, label: 'Lower shoulder' })
      }
      break
    }
    case 'head_tilt': {
      const nose = lm[LM.NOSE]
      const ls = lm[LM.LEFT_SHOULDER], rs = lm[LM.RIGHT_SHOULDER]
      if (isVis(nose) && isVis(ls) && isVis(rs)) {
        const midX = (mx(ls, w) + mx(rs, w)) / 2
        const nx = mx(nose, w), ny = my(nose, h)
        const goRight = midX > nx
        arrows.push({ x1: nx, y1: ny - 20, x2: nx + (goRight ? 34 : -34), y2: ny - 20, label: 'Level head' })
      }
      break
    }
    case 'hip_hiking': {
      const lh = lm[LM.LEFT_HIP], rh = lm[LM.RIGHT_HIP]
      if (isVis(lh) && isVis(rh)) {
        const higher = lh.y < rh.y ? lh : rh
        arrows.push({ x1: mx(higher, w), y1: my(higher, h) - 6, x2: mx(higher, w), y2: my(higher, h) + 32, label: 'Level hips' })
      }
      break
    }
  }
  return arrows
}

// Small reference inset showing target posture
function drawReferenceInset(ctx, issue, w, h) {
  if (!issue) return
  const iw = 90, ih = 110
  const ix = w - iw - 10
  const iy = h * 0.3

  ctx.save()
  // Card background
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(ix, iy, iw, ih, 10)
  else ctx.rect(ix, iy, iw, ih)
  ctx.fill()

  // Header
  ctx.fillStyle = '#22c55e'
  ctx.font = 'bold 9px system-ui, sans-serif'
  ctx.fillText('TARGET', ix + 8, iy + 14)

  // Draw a simple stick figure in correct alignment for this issue
  const cx = ix + iw / 2
  const top = iy + 22
  const green = '#22c55e'
  const white = 'rgba(255,255,255,0.7)'

  ctx.strokeStyle = white
  ctx.lineWidth = 2
  ctx.lineCap = 'round'

  // Head
  ctx.beginPath()
  ctx.arc(cx, top + 8, 7, 0, Math.PI * 2)
  ctx.stroke()

  // Neck + spine
  ctx.beginPath()
  ctx.moveTo(cx, top + 15)
  ctx.lineTo(cx, top + 30)
  ctx.stroke()

  // Shoulders
  ctx.beginPath()
  ctx.moveTo(cx - 18, top + 33)
  ctx.lineTo(cx + 18, top + 33)
  ctx.stroke()

  // Torso
  ctx.beginPath()
  ctx.moveTo(cx - 10, top + 33)
  ctx.lineTo(cx - 8, top + 60)
  ctx.moveTo(cx + 10, top + 33)
  ctx.lineTo(cx + 8, top + 60)
  ctx.stroke()

  // Hips
  ctx.beginPath()
  ctx.moveTo(cx - 8, top + 60)
  ctx.lineTo(cx + 8, top + 60)
  ctx.stroke()

  // Issue-specific highlight (green = what should be fixed)
  ctx.strokeStyle = green
  ctx.lineWidth = 2.5

  switch (issue.id) {
    case 'forward_head':
      // Vertical line from ear through shoulder — shows alignment
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(cx, top + 8)
      ctx.lineTo(cx, top + 33)
      ctx.stroke()
      ctx.setLineDash([])
      break
    case 'rounded_back':
      // Straight upper back (not rounded)
      ctx.beginPath()
      ctx.moveTo(cx, top + 15)
      ctx.lineTo(cx, top + 45)
      ctx.stroke()
      break
    case 'pelvic_tilt':
      // Level hip line
      ctx.beginPath()
      ctx.moveTo(cx - 12, top + 60)
      ctx.lineTo(cx + 12, top + 60)
      ctx.stroke()
      break
    case 'shoulder_imbalance':
      // Level shoulder line
      ctx.beginPath()
      ctx.moveTo(cx - 18, top + 33)
      ctx.lineTo(cx + 18, top + 33)
      ctx.stroke()
      break
    case 'head_tilt':
      // Vertical center line through head
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(cx, top)
      ctx.lineTo(cx, top + 40)
      ctx.stroke()
      ctx.setLineDash([])
      break
    case 'hip_hiking':
      // Level hip line
      ctx.beginPath()
      ctx.moveTo(cx - 12, top + 60)
      ctx.lineTo(cx + 12, top + 60)
      ctx.stroke()
      break
  }

  ctx.restore()
}

export default function SkeletonCanvas({ landmarks, issue, correctness = 0, width, height }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!landmarks || !landmarks.length) return

    const w = canvas.width
    const h = canvas.height
    const segments = buildSkeleton(landmarks, issue)
    const goodColor = '#22c55e'
    const badColor = '#ef4444'
    const neutralColor = 'rgba(255,255,255,0.55)'

    // Draw skeleton segments (mirrored x)
    segments.forEach(({ from, to, highlighted }) => {
      const a = landmarks[from], b = landmarks[to]
      if (!a || !b || !isVis(a) || !isVis(b)) return

      const color = highlighted ? (correctness >= 80 ? goodColor : badColor) : neutralColor
      ctx.beginPath()
      ctx.moveTo(mx(a, w), my(a, h))
      ctx.lineTo(mx(b, w), my(b, h))
      ctx.strokeStyle = color
      ctx.lineWidth = highlighted ? 4 : 2
      ctx.globalAlpha = highlighted ? 0.92 : 0.5
      ctx.stroke()
    })

    // Landmark dots (mirrored)
    ctx.globalAlpha = 0.7
    landmarks.forEach((lm) => {
      if (!isVis(lm)) return
      ctx.beginPath()
      ctx.arc(mx(lm, w), my(lm, h), 3.5, 0, Math.PI * 2)
      ctx.fillStyle = neutralColor
      ctx.fill()
    })
    ctx.globalAlpha = 1

    // Directional correction arrows (only when not yet correct)
    if (correctness < 80) {
      const arrowColor = '#facc15'  // yellow — distinct from red/green
      getIssueArrows(issue, landmarks, w, h).forEach(({ x1, y1, x2, y2, label }) => {
        drawArrow(ctx, x1, y1, x2, y2, arrowColor, label)
      })
    }

    // Reference inset
    drawReferenceInset(ctx, issue, w, h)
  }, [landmarks, issue, correctness, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width || 640}
      height={height || 480}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}

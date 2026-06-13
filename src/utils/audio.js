// Singleton AudioContext — browsers cap concurrent instances (~6 on iOS)
let _ctx = null

function getCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  // AudioContext starts suspended on iOS until resumed inside a gesture
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

/**
 * Must be called once from a user gesture (e.g. button tap) before any audio.
 * Unlocks both the Web Audio API and speechSynthesis on iOS Safari.
 */
export function initAudio() {
  try { getCtx() } catch {}
  if (!('speechSynthesis' in window)) return
  // A zero-volume utterance inside a gesture unlocks the speech engine for the session
  const u = new SpeechSynthesisUtterance(' ')
  u.volume = 0
  window.speechSynthesis.speak(u)
}

export function speak(text, rate = 0.92) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = rate
  u.volume = 1
  window.speechSynthesis.speak(u)
}

export function beep(freq = 880, dur = 0.12, delay = 0) {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = 'sine'
    const t = ctx.currentTime + delay
    gain.gain.setValueAtTime(0.25, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.start(t)
    osc.stop(t + dur + 0.05)
  } catch {}
}

export function successBeeps() {
  beep(660, 0.1, 0)
  beep(880, 0.1, 0.15)
  beep(1100, 0.18, 0.3)
}

export function tickBeep() {
  beep(440, 0.07, 0)
}

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
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
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

// Three ascending beeps — played when scan or issue is resolved
export function successBeeps() {
  beep(660, 0.1, 0)
  beep(880, 0.1, 0.15)
  beep(1100, 0.18, 0.3)
}

// Single soft tick for each countdown second
export function tickBeep() {
  beep(440, 0.07, 0)
}

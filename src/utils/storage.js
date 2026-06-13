const SESSIONS_KEY = 'align_sessions'
const PREFS_KEY = 'align_prefs'
const BASELINE_KEY = 'align_baseline'

export function saveSession(session) {
  const sessions = getSessions()
  sessions.push({ ...session, id: Date.now() })
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]')
  } catch {
    return []
  }
}

export function getPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}')
  } catch {
    return {}
  }
}

export function savePrefs(prefs) {
  const current = getPrefs()
  localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }))
}

export function getBaseline() {
  try {
    return JSON.parse(localStorage.getItem(BASELINE_KEY) || 'null')
  } catch {
    return null
  }
}

export function saveBaseline(data) {
  localStorage.setItem(BASELINE_KEY, JSON.stringify(data))
}

export function clearAll() {
  localStorage.removeItem(SESSIONS_KEY)
  localStorage.removeItem(PREFS_KEY)
  localStorage.removeItem(BASELINE_KEY)
}

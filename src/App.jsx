import { useState, useEffect } from 'react'
import OnboardingScreen from './screens/OnboardingScreen'
import HomeScreen from './screens/HomeScreen'
import SetupScreen from './screens/SetupScreen'
import ScanScreen from './screens/ScanScreen'
import TransitionScreen from './screens/TransitionScreen'
import DiagnosisScreen from './screens/DiagnosisScreen'
import CorrectionScreen from './screens/CorrectionScreen'
import CompleteScreen from './screens/CompleteScreen'
import HistoryScreen from './screens/HistoryScreen'
import SettingsScreen from './screens/SettingsScreen'
import BottomNav from './components/BottomNav'
import { analyzeFront, analyzeSide, diagnose, computeScore } from './utils/posture'
import { getPrefs, savePrefs } from './utils/storage'

const STEPS = {
  ONBOARDING: 'onboarding',
  HOME: 'home',
  SETUP: 'setup',
  SCAN_FRONT: 'scan_front',
  TRANSITION: 'transition',
  SCAN_SIDE: 'scan_side',
  DIAGNOSIS: 'diagnosis',
  CORRECTION: 'correction',
  COMPLETE: 'complete',
  HISTORY: 'history',
  SETTINGS: 'settings',
}

export default function App() {
  const [step, setStep] = useState(STEPS.ONBOARDING)
  const [activeTab, setActiveTab] = useState('home')
  const [sessionType, setSessionType] = useState('full')

  // Session state
  const [frontLandmarks, setFrontLandmarks] = useState(null)
  const [sideLandmarks, setSideLandmarks] = useState(null)
  const [issues, setIssues] = useState([])
  const [initialScore, setInitialScore] = useState(0)
  const [finalScore, setFinalScore] = useState(0)

  // Check if onboarded
  useEffect(() => {
    const prefs = getPrefs()
    if (prefs.onboarded) setStep(STEPS.HOME)
  }, [])

  const handleOnboardingDone = () => {
    savePrefs({ onboarded: true })
    setStep(STEPS.HOME)
  }

  const handleStartSession = (type) => {
    setSessionType(type)
    setFrontLandmarks(null)
    setSideLandmarks(null)
    setIssues([])
    setStep(STEPS.SETUP)
  }

  const handleSetupStart = () => {
    if (sessionType === 'checkin') {
      setStep(STEPS.SCAN_SIDE)
    } else {
      setStep(STEPS.SCAN_FRONT)
    }
  }

  const handleFrontScanComplete = (landmarks) => {
    setFrontLandmarks(landmarks)
    if (sessionType === 'quick') {
      // Quick: front only — go straight to diagnosis
      const frontIssues = landmarks ? analyzeFront(landmarks) : []
      const allIssues = diagnose(frontIssues, [])
      const score = computeScore(allIssues)
      setIssues(allIssues)
      setInitialScore(score)
      setFinalScore(score)
      setStep(STEPS.DIAGNOSIS)
    } else {
      setStep(STEPS.TRANSITION)
    }
  }

  const handleTransitionDone = () => {
    setStep(STEPS.SCAN_SIDE)
  }

  const handleSideScanComplete = (landmarks) => {
    setSideLandmarks(landmarks)
    const frontIssues = frontLandmarks ? analyzeFront(frontLandmarks) : []
    const sideIssues = landmarks ? analyzeSide(landmarks) : []
    const allIssues = diagnose(frontIssues, sideIssues)
    const score = computeScore(allIssues)
    setIssues(allIssues)
    setInitialScore(score)
    setFinalScore(score)
    setStep(STEPS.DIAGNOSIS)
  }

  const handleStartCorrection = () => {
    setStep(STEPS.CORRECTION)
  }

  const handleCorrectionComplete = (score) => {
    setFinalScore(score)
    setStep(STEPS.COMPLETE)
  }

  const handleSkipCorrection = () => {
    setFinalScore(initialScore)
    setStep(STEPS.COMPLETE)
  }

  const handleDone = () => {
    setActiveTab('home')
    setStep(STEPS.HOME)
  }

  const handleNavigate = (tab) => {
    setActiveTab(tab)
    if (tab === 'home') setStep(STEPS.HOME)
    if (tab === 'history') setStep(STEPS.HISTORY)
    if (tab === 'settings') setStep(STEPS.SETTINGS)
  }

  const showNav = [STEPS.HOME, STEPS.HISTORY, STEPS.SETTINGS].includes(step)
  const inSession = [STEPS.SETUP, STEPS.SCAN_FRONT, STEPS.TRANSITION, STEPS.SCAN_SIDE,
    STEPS.DIAGNOSIS, STEPS.CORRECTION, STEPS.COMPLETE].includes(step)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {step === STEPS.ONBOARDING && (
          <OnboardingScreen onContinue={handleOnboardingDone} />
        )}
        {step === STEPS.HOME && (
          <HomeScreen onStartSession={handleStartSession} />
        )}
        {step === STEPS.SETUP && (
          <SetupScreen
            onStart={handleSetupStart}
            onBack={() => setStep(STEPS.HOME)}
          />
        )}
        {step === STEPS.SCAN_FRONT && (
          <ScanScreen
            view="front"
            onScanComplete={handleFrontScanComplete}
            onBack={() => setStep(STEPS.SETUP)}
          />
        )}
        {step === STEPS.TRANSITION && (
          <TransitionScreen onContinue={handleTransitionDone} />
        )}
        {step === STEPS.SCAN_SIDE && (
          <ScanScreen
            view="side"
            onScanComplete={handleSideScanComplete}
            onBack={() => setStep(sessionType === 'checkin' ? STEPS.SETUP : STEPS.TRANSITION)}
          />
        )}
        {step === STEPS.DIAGNOSIS && (
          <DiagnosisScreen
            issues={issues}
            score={initialScore}
            sessionType={sessionType}
            onStartCorrection={handleStartCorrection}
            onSkip={handleSkipCorrection}
          />
        )}
        {step === STEPS.CORRECTION && (
          <CorrectionScreen
            issues={issues}
            initialScore={initialScore}
            onComplete={handleCorrectionComplete}
          />
        )}
        {step === STEPS.COMPLETE && (
          <CompleteScreen
            initialScore={initialScore}
            finalScore={finalScore}
            issues={issues}
            sessionType={sessionType}
            onDone={handleDone}
          />
        )}
        {step === STEPS.HISTORY && <HistoryScreen />}
        {step === STEPS.SETTINGS && <SettingsScreen />}
      </div>

      {showNav && (
        <BottomNav active={activeTab} onNavigate={handleNavigate} />
      )}
    </div>
  )
}

import AlignScore from '../components/AlignScore'

const severityColors = {
  Mild: 'bg-amber-50 text-amber-700 border-amber-200',
  Moderate: 'bg-orange-50 text-orange-700 border-orange-200',
  Significant: 'bg-red-50 text-red-700 border-red-200',
}

export default function DiagnosisScreen({ issues, score, sessionType, onStartCorrection, onSkip }) {
  const hasIssues = issues && issues.length > 0

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 screen-enter">
      {/* Header */}
      <div className="bg-white px-6 pt-14 pb-6 shadow-sm flex flex-col items-center gap-4">
        <AlignScore score={score} size={140} label="Align Score" />
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {score >= 80 ? 'Great posture!' : score >= 60 ? 'Room to improve' : 'Let\'s get you aligned'}
        </h1>
        {!hasIssues && (
          <p className="text-slate-500 text-sm text-center">No significant issues detected — keep it up!</p>
        )}
      </div>

      <div className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
        {hasIssues && (
          <>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              Issues found ({issues.length})
            </h2>
            <div className="space-y-3">
              {issues.map((issue, i) => (
                <div key={issue.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-sm text-slate-900">{issue.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed pl-7">{issue.explanation}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg border flex-shrink-0 ${severityColors[issue.severity]}`}>
                      {issue.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* View info */}
        <div className="bg-blue-50 rounded-xl px-4 py-3">
          <p className="text-xs text-blue-700 leading-relaxed">
            Issues are prioritized by impact. Guided correction works through them one at a time with real-time feedback.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-8 space-y-3">
        {hasIssues && sessionType !== 'quick' ? (
          <>
            <button
              onClick={onStartCorrection}
              className="w-full bg-slate-900 text-white rounded-2xl py-4 text-base font-semibold tracking-tight active:scale-95 transition-transform"
            >
              Start correction ({issues.length} issue{issues.length !== 1 ? 's' : ''})
            </button>
            <button
              onClick={onSkip}
              className="w-full text-slate-500 text-sm font-medium py-2"
            >
              Save score and skip correction
            </button>
          </>
        ) : (
          <button
            onClick={onSkip}
            className="w-full bg-slate-900 text-white rounded-2xl py-4 text-base font-semibold tracking-tight active:scale-95 transition-transform"
          >
            Save session
          </button>
        )}
      </div>
    </div>
  )
}

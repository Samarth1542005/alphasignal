export default function DecisionPanel({ summary }) {
    const { decision, confidence, risk, reasons } = summary
  
    const decisionConfig = {
      BUY:  { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', emoji: '🟢' },
      SELL: { color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/30',     emoji: '🔴' },
      HOLD: { color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  border: 'border-yellow-400/30',  emoji: '🟡' },
    }
  
    const riskConfig = {
      LOW:    'text-emerald-400',
      MEDIUM: 'text-yellow-400',
      HIGH:   'text-red-400',
    }
  
    const config = decisionConfig[decision]
  
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-full flex flex-col gap-5">
        <div className={`${config.bg} ${config.border} border rounded-xl p-5 text-center`}>
          <p className="text-gray-400 text-sm mb-2">AI Decision</p>
          <p className={`text-5xl font-black ${config.color}`}>{config.emoji} {decision}</p>
          <p className="text-gray-400 text-sm mt-2">Confidence: <span className="text-white font-semibold">{confidence}%</span></p>
        </div>
  
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm mb-1">Risk Level</p>
          <p className={`text-2xl font-bold ${riskConfig[risk]}`}>⚡ {risk}</p>
        </div>
  
        <div>
          <p className="text-gray-400 text-sm mb-3 font-semibold">Why this decision?</p>
          <div className="flex flex-col gap-2">
            {reasons.map((reason, i) => (
              <div key={i} className="bg-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300 leading-relaxed">
                {reason}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
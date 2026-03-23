export default function DecisionPanel({ summary }) {
  const { decision, confidence, risk, reasons } = summary

  const decisionConfig = {
    BUY:  { color: 'text-emerald-400', bg: 'bg-emerald-400/8', border: 'border-emerald-400/20', dot: 'bg-emerald-400' },
    SELL: { color: 'text-red-400',     bg: 'bg-red-400/8',     border: 'border-red-400/20',     dot: 'bg-red-400' },
    HOLD: { color: 'text-amber-400',   bg: 'bg-amber-400/8',   border: 'border-amber-400/20',   dot: 'bg-amber-400' },
  }

  const riskConfig = {
    LOW:    { color: 'text-emerald-400', bg: 'bg-emerald-400/8',  border: 'border-emerald-400/20' },
    MEDIUM: { color: 'text-amber-400',   bg: 'bg-amber-400/8',    border: 'border-amber-400/20' },
    HIGH:   { color: 'text-red-400',     bg: 'bg-red-400/8',      border: 'border-red-400/20' },
  }

  const config = decisionConfig[decision]
  const rConfig = riskConfig[risk]

  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 h-full flex flex-col gap-4">

      <div className={`${config.bg} ${config.border} border rounded-xl p-6 text-center`}>
        <p className="text-white/30 text-xs uppercase tracking-widest mb-3">AI Recommendation</p>
        <div className="flex items-center justify-center gap-3">
          <div className={`w-3 h-3 rounded-full ${config.dot}`}></div>
          <p className={`text-4xl font-black tracking-tight ${config.color}`}>{decision}</p>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/30 mb-1">
            <span>Confidence</span>
            <span>{confidence}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${config.dot}`}
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className={`${rConfig.bg} ${rConfig.border} border rounded-xl p-4 flex items-center justify-between`}>
        <p className="text-white/30 text-xs uppercase tracking-widest">Risk Level</p>
        <p className={`text-sm font-bold ${rConfig.color}`}>{risk}</p>
      </div>

      <div className="flex-1">
        <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Analysis</p>
        <div className="flex flex-col gap-2">
          {reasons.map((reason, i) => (
            <div key={i} className="flex gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3">
              <span className="text-white/20 text-xs mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <p className="text-sm text-white/60 leading-relaxed">{reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
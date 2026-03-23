export default function IndicatorsPanel({ indicators }) {
  const rsiInterpretation = (rsi) => {
    if (rsi < 30) return { text: 'Oversold — Stock has fallen sharply. Potential bounce back opportunity.', color: 'text-emerald-400', tag: 'Oversold', tagColor: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' }
    if (rsi > 70) return { text: 'Overbought — Stock has risen too fast. Possible pullback ahead.', color: 'text-red-400', tag: 'Overbought', tagColor: 'bg-red-400/10 text-red-400 border-red-400/20' }
    return { text: 'Neutral — Stock momentum is balanced. No extreme signal.', color: 'text-amber-400', tag: 'Neutral', tagColor: 'bg-amber-400/10 text-amber-400 border-amber-400/20' }
  }

  const macdInterpretation = (macd, signal, histogram) => {
    if (macd > signal && histogram > 0) return { text: 'Bullish crossover — MACD above signal line. Upward momentum building.', color: 'text-emerald-400', tag: 'Bullish', tagColor: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' }
    if (macd < signal && histogram < 0) return { text: 'Bearish crossover — MACD below signal line. Downward momentum building.', color: 'text-red-400', tag: 'Bearish', tagColor: 'bg-red-400/10 text-red-400 border-red-400/20' }
    return { text: 'Mixed signal — MACD and signal lines are close. Wait for clear crossover.', color: 'text-amber-400', tag: 'Mixed', tagColor: 'bg-amber-400/10 text-amber-400 border-amber-400/20' }
  }

  const smaInterpretation = (close, sma, label) => {
    if (close > sma) return { text: `Price is above ${label} — Short term trend is bullish.`, color: 'text-emerald-400', tag: 'Above', tagColor: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' }
    return { text: `Price is below ${label} — Short term trend is bearish.`, color: 'text-red-400', tag: 'Below', tagColor: 'bg-red-400/10 text-red-400 border-red-400/20' }
  }

  const bbInterpretation = (close, upper, lower, middle) => {
    const range = upper - lower
    const position = range > 0 ? (close - lower) / range : 0.5
    if (position < 0.2) return { text: 'Near lower band — Price at support level. Possible reversal upward.', color: 'text-emerald-400', tag: 'Near Support', tagColor: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' }
    if (position > 0.8) return { text: 'Near upper band — Price at resistance level. Possible reversal downward.', color: 'text-red-400', tag: 'Near Resistance', tagColor: 'bg-red-400/10 text-red-400 border-red-400/20' }
    return { text: 'Within bands — Price is in normal range. No extreme volatility signal.', color: 'text-amber-400', tag: 'Normal Range', tagColor: 'bg-amber-400/10 text-amber-400 border-amber-400/20' }
  }

  const rsi = rsiInterpretation(indicators.rsi)
  const macd = macdInterpretation(indicators.macd_line, indicators.signal_line, indicators.histogram)
  const sma20 = smaInterpretation(indicators.close, indicators.sma20, 'SMA 20')
  const sma50 = smaInterpretation(indicators.close, indicators.sma50, 'SMA 50')
  const bb = bbInterpretation(indicators.close, indicators.upper_band, indicators.lower_band, indicators.middle_band)

  const cards = [
    {
      label: 'RSI (14)',
      value: indicators.rsi?.toFixed(2),
      description: rsi.text,
      valueColor: rsi.color,
      tag: rsi.tag,
      tagColor: rsi.tagColor,
      info: 'Relative Strength Index measures momentum on a scale of 0–100'
    },
    {
      label: 'MACD',
      value: indicators.macd_line?.toFixed(2),
      description: macd.text,
      valueColor: macd.color,
      tag: macd.tag,
      tagColor: macd.tagColor,
      info: 'Moving Average Convergence Divergence tracks trend momentum'
    },
    {
      label: 'Signal Line',
      value: indicators.signal_line?.toFixed(2),
      description: `Histogram: ${indicators.histogram?.toFixed(2)} — ${indicators.histogram > 0 ? 'MACD above signal, bullish bias' : 'MACD below signal, bearish bias'}`,
      valueColor: 'text-blue-400',
      tag: indicators.histogram > 0 ? 'Positive' : 'Negative',
      tagColor: indicators.histogram > 0 ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-red-400/10 text-red-400 border-red-400/20',
      info: '9-day EMA of MACD line used to generate buy/sell signals'
    },
    {
      label: 'SMA 20',
      value: indicators.sma20?.toFixed(2),
      description: sma20.text,
      valueColor: sma20.color,
      tag: sma20.tag,
      tagColor: sma20.tagColor,
      info: '20-day Simple Moving Average tracks short-term price trend'
    },
    {
      label: 'SMA 50',
      value: indicators.sma50?.toFixed(2),
      description: sma50.text,
      valueColor: sma50.color,
      tag: sma50.tag,
      tagColor: sma50.tagColor,
      info: '50-day Simple Moving Average tracks medium-term price trend'
    },
    {
      label: 'Bollinger Bands',
      value: indicators.middle_band?.toFixed(2),
      description: bb.text,
      valueColor: bb.color,
      tag: bb.tag,
      tagColor: bb.tagColor,
      info: `Upper: ${indicators.upper_band?.toFixed(2)} | Lower: ${indicators.lower_band?.toFixed(2)}`
    },
  ]

  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-white">Technical Indicators</h2>
        <p className="text-white/30 text-xs mt-0.5">Detailed analysis of each indicator used in the AI decision</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((item, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white/30 text-xs uppercase tracking-wider mb-1">{item.label}</p>
                <p className={`text-2xl font-bold ${item.valueColor}`}>{item.value}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded border ${item.tagColor}`}>{item.tag}</span>
            </div>
            <p className="text-white/50 text-xs leading-relaxed mb-2">{item.description}</p>
            <p className="text-white/20 text-xs">{item.info}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
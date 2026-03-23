export default function IndicatorsPanel({ indicators }) {
    const items = [
      { label: 'RSI (14)', value: indicators.rsi, color: indicators.rsi < 30 ? 'text-emerald-400' : indicators.rsi > 70 ? 'text-red-400' : 'text-yellow-400' },
      { label: 'MACD Line', value: indicators.macd_line, color: indicators.macd_line > 0 ? 'text-emerald-400' : 'text-red-400' },
      { label: 'Signal Line', value: indicators.signal_line, color: 'text-blue-400' },
      { label: 'SMA 20', value: indicators.sma20, color: 'text-purple-400' },
      { label: 'SMA 50', value: indicators.sma50, color: 'text-orange-400' },
      { label: 'Upper Band', value: indicators.upper_band, color: 'text-red-400' },
      { label: 'Middle Band', value: indicators.middle_band, color: 'text-gray-300' },
      { label: 'Lower Band', value: indicators.lower_band, color: 'text-emerald-400' },
    ]
  
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Technical Indicators</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">{item.label}</p>
              <p className={`text-lg font-bold ${item.color}`}>{item.value?.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
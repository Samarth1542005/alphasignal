export default function StockInfo({ info }) {
  const formatMarketCap = (cap) => {
    if (cap >= 1e12) return `${(cap / 1e12).toFixed(2)}T`
    if (cap >= 1e9) return `${(cap / 1e9).toFixed(2)}B`
    if (cap >= 1e6) return `${(cap / 1e6).toFixed(2)}M`
    return cap
  }

  const symbol = info.currency === 'INR' ? '₹' : '$'

  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 mb-0">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{info.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-white/40 text-sm font-mono">{info.ticker}</span>
            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
            <span className="text-xs bg-white/5 border border-white/10 text-white/50 px-2 py-0.5 rounded-md">{info.sector}</span>
            <span className="text-xs bg-white/5 border border-white/10 text-white/50 px-2 py-0.5 rounded-md">{info.currency}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-white tracking-tight">{symbol}{info.current_price?.toLocaleString()}</p>
          <p className="text-white/30 text-sm mt-1">Current Price</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {[
          { label: 'Market Cap', value: `${symbol}${formatMarketCap(info.market_cap)}`, color: 'text-white' },
          { label: 'P/E Ratio', value: info.pe_ratio?.toFixed(2) || 'N/A', color: 'text-white' },
          { label: '52W High', value: `${symbol}${info['52_week_high']?.toLocaleString()}`, color: 'text-emerald-400' },
          { label: '52W Low', value: `${symbol}${info['52_week_low']?.toLocaleString()}`, color: 'text-red-400' },
        ].map((item, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
            <p className="text-white/30 text-xs mb-1 uppercase tracking-wider">{item.label}</p>
            <p className={`text-lg font-semibold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
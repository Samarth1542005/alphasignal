export default function StockInfo({ info }) {
    const formatMarketCap = (cap) => {
      if (cap >= 1e12) return `${(cap / 1e12).toFixed(2)}T`
      if (cap >= 1e9) return `${(cap / 1e9).toFixed(2)}B`
      if (cap >= 1e6) return `${(cap / 1e6).toFixed(2)}M`
      return cap
    }
  
    const symbol = info.currency === 'INR' ? '₹' : '$'
  
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{info.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-gray-400 text-sm">{info.ticker}</span>
              <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">{info.sector}</span>
              <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">{info.currency}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-white">{symbol}{info.current_price?.toLocaleString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Market Cap</p>
            <p className="text-white font-semibold">{symbol}{formatMarketCap(info.market_cap)}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">P/E Ratio</p>
            <p className="text-white font-semibold">{info.pe_ratio?.toFixed(2) || 'N/A'}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">52W High</p>
            <p className="text-emerald-400 font-semibold">{symbol}{info['52_week_high']?.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">52W Low</p>
            <p className="text-red-400 font-semibold">{symbol}{info['52_week_low']?.toLocaleString()}</p>
          </div>
        </div>
      </div>
    )
  }
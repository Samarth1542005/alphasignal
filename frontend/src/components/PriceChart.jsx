import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getStockHistory } from '../api/stockApi'

const PERIODS = [
  { label: '1D', value: '1d' },
  { label: '5D', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
  { label: '2Y', value: '2y' },
]

export default function PriceChart({ ticker, currency }) {
  const [selectedPeriod, setSelectedPeriod] = useState('1y')
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(false)

  const symbol = currency === 'INR' ? '₹' : '$'

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const data = await getStockHistory(ticker, selectedPeriod)
        setHistory(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [ticker, selectedPeriod])

  const data = history?.data?.map(d => ({
    date: d.Date,
    price: d.Close,
  })) || []

  const minPrice = data.length ? Math.min(...data.map(d => d.price)) * 0.995 : 0
  const maxPrice = data.length ? Math.max(...data.map(d => d.price)) * 1.005 : 100

  const firstPrice = data.length > 1 ? data[0].price : 0
  const lastPrice = data.length > 1 ? data[data.length - 1].price : 0
  const absoluteChange = (lastPrice - firstPrice).toFixed(2)
  const percentChange = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2) : 0
  const isPositive = lastPrice >= firstPrice

  const strokeColor = isPositive ? '#34d399' : '#f87171'

  const getIntervalLabel = () => {
    if (selectedPeriod === '1d') return 'Today · 5-min intervals'
    if (selectedPeriod === '5d') return 'Last 5 Days · Hourly'
    if (selectedPeriod === '1mo') return 'Last Month · Hourly'
    if (selectedPeriod === '3mo') return 'Last 3 Months · Daily'
    if (selectedPeriod === '6mo') return 'Last 6 Months · Daily'
    if (selectedPeriod === '1y') return 'Last 1 Year · Daily'
    if (selectedPeriod === '2y') return 'Last 2 Years · Daily'
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0f] border border-white/10 rounded-lg p-3 text-sm shadow-xl">
          <p className="text-white/40 mb-1 text-xs">{label}</p>
          <p className="text-white font-semibold">{symbol}{payload[0].value?.toFixed(2)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 h-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-white">Price History</h2>
          <p className="text-white/30 text-xs mt-0.5">{getIntervalLabel()}</p>
          {data.length > 1 && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-lg font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{symbol}{absoluteChange}
              </span>
              <span className={`text-sm px-2 py-0.5 rounded border ${isPositive ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-red-400/10 text-red-400 border-red-400/20'}`}>
                {isPositive ? '+' : ''}{percentChange}%
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-1 bg-white/5 border border-white/8 rounded-lg p-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setSelectedPeriod(p.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                selectedPeriod === p.value
                  ? 'bg-emerald-400 text-black'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-white/20 text-sm">No data available for this period</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.15} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#ffffff25', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fill: '#ffffff25', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${symbol}${v.toFixed(0)}`}
              width={65}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={1.5}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{ r: 4, fill: strokeColor, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
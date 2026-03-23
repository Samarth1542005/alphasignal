import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function PriceChart({ history }) {
  const data = history?.data?.map(d => ({
    date: d.Date,
    price: d.Close,
  })) || []

  const minPrice = Math.min(...data.map(d => d.price)) * 0.995
  const maxPrice = Math.max(...data.map(d => d.price)) * 1.005

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm">
          <p className="text-gray-400 mb-1">{label}</p>
          <p className="text-white font-semibold">{payload[0].value?.toFixed(2)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-6">Price History</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
          <YAxis domain={[minPrice, maxPrice]} tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} tickFormatter={(v) => v.toFixed(0)} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} fill="url(#priceGradient)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
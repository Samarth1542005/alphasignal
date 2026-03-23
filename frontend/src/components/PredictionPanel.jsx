import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getPrediction } from "../api/stockApi";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#13131a] border border-[#2a2a3a] rounded-lg px-3 py-2">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-emerald-400 font-semibold text-sm">
          ₹{payload[0].value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const PredictionPanel = ({ ticker }) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) return;
    const fetchPredictions = async () => {
      setLoading(true);
      setError(null);
      setPredictions([]);
      try {
        const data = await getPrediction(ticker);
        setPredictions(data.predictions);
      } catch (err) {
        setError("Failed to load predictions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, [ticker]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const chartData = predictions.map((p) => ({
    date: formatDate(p.date),
    price: p.predicted_price,
  }));

  const minPrice = predictions.length
    ? Math.min(...predictions.map((p) => p.predicted_price)) * 0.999
    : 0;
  const maxPrice = predictions.length
    ? Math.max(...predictions.map((p) => p.predicted_price)) * 1.001
    : 0;

  return (
    <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-semibold text-lg">7-Day Price Prediction</h2>
          <p className="text-gray-500 text-sm mt-0.5">LSTM model forecast</p>
        </div>
        <span className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full">
          AI Powered
        </span>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Training model for {ticker}...</p>
          <p className="text-gray-600 text-xs">This may take 2-3 minutes on first load</p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-16">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && predictions.length > 0 && (
        <>
          <div className="h-48 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[minPrice, maxPrice]}
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v.toFixed(0)}`}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#predGradient)"
                  dot={{ fill: "#10b981", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#10b981" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="border border-[#1e1e2e] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e2e]">
                  <th className="text-left text-gray-500 font-medium px-4 py-3">Date</th>
                  <th className="text-right text-gray-500 font-medium px-4 py-3">Predicted Price</th>
                  <th className="text-right text-gray-500 font-medium px-4 py-3">Change</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p, i) => {
                  const prev = i === 0 ? p.predicted_price : predictions[i - 1].predicted_price;
                  const change = p.predicted_price - prev;
                  const changePct = ((change / prev) * 100).toFixed(2);
                  const isPositive = change >= 0;
                  return (
                    <tr
                      key={p.date}
                      className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#13131a] transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-300">
                        {new Date(p.date).toLocaleDateString("en-IN", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right text-white font-medium">
                        ₹{p.predicted_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                        {i === 0 ? "—" : `${isPositive ? "+" : ""}${changePct}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default PredictionPanel;
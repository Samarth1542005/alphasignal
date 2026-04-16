import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getBacktest } from "../api/stockApi";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#13131a] border border-[#2a2a3a] rounded-lg px-3 py-2">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-xs font-medium">
            {p.name}: ₹{p.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const verdictConfig = {
  good: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", label: "Good Accuracy" },
  moderate: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", label: "Moderate Accuracy" },
  poor: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", label: "Poor Accuracy" },
};

const BacktestPanel = ({ ticker }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const result = await getBacktest(ticker);
        setData(result);
      } catch {
        setError("Failed to run backtest.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ticker]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const chartData = data?.data_points.map((p) => ({
    date: formatDate(p.date),
    Actual: p.actual,
    Predicted: p.predicted,
  }));

  const allPrices = data?.data_points.flatMap((p) => [p.actual, p.predicted]) || [];
  const minPrice = allPrices.length ? Math.min(...allPrices) * 0.999 : 0;
  const maxPrice = allPrices.length ? Math.max(...allPrices) * 1.001 : 0;

  const verdict = data ? verdictConfig[data.verdict] : null;

  return (
    <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-semibold text-lg">Model Backtest</h2>
          <p className="text-gray-500 text-sm mt-0.5">Predicted vs actual — last 90 days</p>
        </div>
        {data && verdict && (
          <span className={`text-xs px-3 py-1 rounded-full border ${verdict.color} ${verdict.bg} ${verdict.border}`}>
            {verdict.label}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Running backtest for {ticker}...</p>
          <p className="text-gray-600 text-xs">Comparing predicted vs actual prices</p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-16">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && data && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "RMSE", value: `₹${data.rmse}`, desc: "Avg price error", color: "text-blue-400" },
              { label: "MAPE", value: `${data.mape}%`, desc: "% error from actual", color: "text-amber-400" },
              { label: "Within 2%", value: `${data.within_2pct}%`, desc: "Predictions within 2% of actual", color: "text-purple-400" },
              { label: "Directional", value: `${data.directional_accuracy}%`, desc: "Up/down accuracy", color: "text-emerald-400" },
            ].map((m, i) => (
              <div key={i} className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{m.label}</p>
                <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                <p className="text-gray-600 text-xs mt-1">{m.desc}</p>
              </div>
            ))}
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={12}
                />
                <YAxis
                  domain={[minPrice, maxPrice]}
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v.toFixed(0)}`}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "12px", color: "#6b7280" }}
                />
                <Line
                  type="monotone"
                  dataKey="Actual"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Predicted"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center gap-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-blue-400" />
              <span className="text-gray-500 text-xs">Actual Price</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-emerald-400 border-dashed" style={{ borderTop: "2px dashed #10b981", background: "none" }} />
              <span className="text-gray-500 text-xs">Predicted Price</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BacktestPanel;
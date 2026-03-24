import { useState, useEffect } from "react";
import { getSentiment } from "../api/stockApi";

const SentimentBadge = ({ sentiment }) => {
  const config = {
    positive: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    negative: "bg-red-400/10 text-red-400 border-red-400/20",
    neutral: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  };
  
  return (
    <span className={`text-xs px-2 py-0.5 rounded border capitalize ${config[sentiment] || config.neutral}`}>
      {sentiment}
    </span>
  );
};

const SentimentPanel = ({ ticker }) => {
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
        const result = await getSentiment(ticker);
        setData(result);
      } catch {
        setError("Failed to load news sentiment.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [ticker]);

  const overallConfig = {
    positive: { color: "text-emerald-400", label: "Bullish Sentiment" },
    negative: { color: "text-red-400", label: "Bearish Sentiment" },
    neutral: { color: "text-amber-400", label: "Neutral Sentiment" },
  };

  return (
    <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-semibold text-lg">News Sentiment</h2>
          <p className="text-gray-500 text-sm mt-0.5">Powered by FinBERT AI</p>
        </div>
        <span className="text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Live News
        </span>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Analyzing news for {ticker}...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center py-16">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Data Render */}
      {!loading && !error && data && (
        <div>
          {data.headline_count === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-gray-500 text-sm">{data.message || "No relevant news found."}</p>
            </div>
          ) : (
            <div>
              {/* Summary Card */}
              <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Overall Sentiment</p>
                    <p className={`text-2xl font-bold ${overallConfig[data.overall_sentiment]?.color}`}>
                      {overallConfig[data.overall_sentiment]?.label}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">Based on {data.headline_count} headlines</p>
                  </div>
                  <SentimentBadge sentiment={data.overall_sentiment} />
                </div>
                
                {/* Progress Bar */}
                <div className="flex gap-1 mb-2 h-2 overflow-hidden rounded-full">
                  <div className="h-full bg-emerald-400" style={{ width: `${data.positive_pct}%` }} />
                  <div className="h-full bg-amber-400" style={{ width: `${data.neutral_pct}%` }} />
                  <div className="h-full bg-red-400" style={{ width: `${data.negative_pct}%` }} />
                </div>

                <div className="flex gap-6 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-gray-400 text-xs">Pos {data.positive_pct}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-gray-400 text-xs">Neu {data.neutral_pct}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-gray-400 text-xs">Neg {data.negative_pct}%</span>
                  </div>
                </div>
              </div>

              {/* Headlines List */}
              <div className="flex flex-col gap-3">
                {data.headlines.map((h, i) => (
                  <a
                    key={h.url || i}
                    href={h.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-4 hover:border-white/10 transition-all duration-200 block"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-gray-300 text-sm leading-relaxed flex-1 font-medium">{h.title}</p>
                      <SentimentBadge sentiment={h.sentiment} />
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-gray-600 text-xs">{h.source}</span>
                      <span className="text-gray-800 text-xs">•</span>
                      <span className="text-gray-600 text-xs">
                        {new Date(h.published_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="text-gray-800 text-xs">•</span>
                      <span className="text-gray-500 text-xs bg-white/5 px-1.5 py-0.5 rounded">
                        {(h.score * 100).toFixed(0)}% Conf.
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SentimentPanel;
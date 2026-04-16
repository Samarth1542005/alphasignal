import { useEffect, useState } from 'react'
import { getStockSummary } from '../api/stockApi'
import StockInfo from './StockInfo'
import DecisionPanel from './DecisionPanel'
import PriceChart from './PriceChart'
import IndicatorsPanel from './IndicatorsPanel'
import PredictionPanel from "./PredictionPanel";
import SentimentPanel from "./SentimentPanel";
import BacktestPanel from "./BacktestPanel";

export default function Dashboard({ ticker }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      setSummary(null)
      try {
        const summaryData = await getStockSummary(ticker)
        if (!summaryData?.info) {
          throw new Error('incomplete_data')
        }
        setSummary(summaryData)
      } catch (err) {
        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          setError(`Request timed out for "${ticker}". The server may be starting up — please try again in 30 seconds.`)
        } else if (err.response?.status === 404) {
          setError(`"${ticker}" not found. Please check the ticker symbol (e.g. AAPL, RELIANCE.NS, TCS.NS).`)
        } else if (err.message === 'incomplete_data') {
          setError(`Could not fetch complete data for "${ticker}". The ticker may be invalid or delisted.`)
        } else {
          setError(`Could not load data for "${ticker}". Please try again.`)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [ticker])

  if (loading) return (
    <div className="flex flex-col items-center justify-center mt-32 gap-4">
      <div className="w-10 h-10 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>
      <p className="text-white/30 text-sm">Analyzing {ticker}...</p>
      <p className="text-white/20 text-xs max-w-xs text-center">
        First request may take up to 45 seconds while the server wakes up.
      </p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center mt-32">
      <div className="bg-red-400/5 border border-red-400/20 rounded-xl px-6 py-4">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <StockInfo info={summary.info} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PriceChart ticker={ticker} currency={summary.info.currency} />
        </div>
        <div>
          <DecisionPanel summary={summary} />
        </div>
      </div>
      <IndicatorsPanel indicators={summary.indicators} />
      <PredictionPanel ticker={ticker} />
      <SentimentPanel ticker={ticker} />
      <BacktestPanel ticker={ticker} />
    </div>
  )
}
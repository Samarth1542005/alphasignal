import { useEffect, useState } from 'react'
import { getStockSummary, getStockHistory } from '../api/stockApi'
import StockInfo from './StockInfo'
import DecisionPanel from './DecisionPanel'
import PriceChart from './PriceChart'
import IndicatorsPanel from './IndicatorsPanel'

export default function Dashboard({ ticker }) {
  const [summary, setSummary] = useState(null)
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      setSummary(null)
      setHistory(null)
      try {
        const [summaryData, historyData] = await Promise.all([
          getStockSummary(ticker),
          getStockHistory(ticker)
        ])
        setSummary(summaryData)
        setHistory(historyData)
      } catch (err) {
        setError(`Could not find stock "${ticker}". Please check the ticker symbol.`)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [ticker])

  if (loading) return (
    <div className="flex flex-col items-center justify-center mt-32 gap-4">
      <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400 text-lg">Analyzing {ticker}...</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center mt-32">
      <p className="text-red-400 text-lg">{error}</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <StockInfo info={summary.info} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart history={history} />
        </div>
        <div>
          <DecisionPanel summary={summary} />
        </div>
      </div>
      <IndicatorsPanel indicators={summary.indicators} />
    </div>
  )
}
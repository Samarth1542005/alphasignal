import { useState } from 'react'
import SearchBar from './components/SearchBar'
import Dashboard from './components/Dashboard'

export default function App() {
  const [ticker, setTicker] = useState(null)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-emerald-400">Alpha</span>
          <span className="text-2xl font-bold text-white">Signal</span>
          <span className="ml-2 text-xs bg-emerald-400 text-black px-2 py-0.5 rounded-full font-semibold">AI</span>
        </div>
        <span className="text-gray-400 text-sm">Stock Prediction & Decision Support</span>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <SearchBar onSearch={setTicker} />
        {ticker && <Dashboard ticker={ticker} />}
        {!ticker && (
          <div className="flex flex-col items-center justify-center mt-32 gap-4">
            <p className="text-6xl">📈</p>
            <h2 className="text-2xl font-semibold text-gray-300">Search any stock to get started</h2>
            <p className="text-gray-500">Try TCS.NS, RELIANCE.NS, AAPL, TSLA</p>
            <div className="flex gap-3 mt-4">
              {['TCS.NS', 'RELIANCE.NS', 'AAPL', 'NVDA'].map(s => (
                <button
                  key={s}
                  onClick={() => setTicker(s)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
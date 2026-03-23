import { useState } from 'react'
import { Search } from 'lucide-react'

export default function SearchBar({ onSearch }) {
  const [input, setInput] = useState('')

  const handleSearch = () => {
    if (input.trim()) {
      onSearch(input.trim().toUpperCase())
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="flex gap-3 mb-10">
      <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-xl px-5 gap-3 focus-within:border-emerald-400/50 transition-all duration-200">
        <Search className="text-white/30 w-4 h-4 flex-shrink-0" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter ticker symbol — TCS.NS, AAPL, RELIANCE.NS..."
          className="flex-1 bg-transparent py-4 text-white placeholder-white/25 outline-none text-base"
        />
        {input && (
          <button onClick={() => setInput('')} className="text-white/30 hover:text-white/60 transition text-xl leading-none">
            ×
          </button>
        )}
      </div>
      <button
        onClick={handleSearch}
        className="px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-black font-semibold rounded-xl transition-all duration-200 text-sm tracking-wide"
      >
        Analyze
      </button>
    </div>
  )
}
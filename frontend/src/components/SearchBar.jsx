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
    <div className="flex gap-3 mb-8">
      <div className="flex-1 flex items-center bg-gray-900 border border-gray-700 rounded-xl px-4 gap-3">
        <Search className="text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search stock... e.g. TCS.NS, AAPL, RELIANCE.NS"
          className="flex-1 bg-transparent py-4 text-white placeholder-gray-500 outline-none text-lg"
        />
      </div>
      <button
        onClick={handleSearch}
        className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition text-lg"
      >
        Analyze
      </button>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import LandingPage from './components/LandingPage'
import AuthPage from './components/AuthPage'
import SearchBar from './components/SearchBar'
import Dashboard from './components/Dashboard'

export default function App() {
  const [view, setView] = useState('landing')
  const [user, setUser] = useState(null)
  const [ticker, setTicker] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setView('app')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setView('app')
      } else {
        setUser(null)
        setView('landing')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (_) {
      // Ignore 403s from expired tokens — local session is cleared regardless
    }
    setTicker(null)
    setView('landing')
  }

  if (view === 'landing') return <LandingPage onGetStarted={() => setView('auth')} />
  if (view === 'auth') return <AuthPage onAuth={(user) => { setUser(user); setView('app') }} />

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/5 px-8 py-4 flex items-center justify-between backdrop-blur-sm sticky top-0 z-50 bg-[#0a0a0f]/90">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-sm">A</span>
          </div>
          <span className="text-xl font-bold tracking-tight">
            Alpha<span className="text-emerald-400">Signal</span>
          </span>
          <span className="text-xs bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full font-medium">
            AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/30 text-sm hidden md:block">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-lg text-sm transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <SearchBar onSearch={setTicker} />
        {ticker && <Dashboard ticker={ticker} />}
        {!ticker && (
          <div className="flex flex-col items-center justify-center mt-28 gap-6">
            <div className="w-16 h-16 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">📈</span>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Analyze any stock instantly</h2>
              <p className="text-white/40">Powered by LSTM predictions and real-time technical analysis</p>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap justify-center">
              {['TCS.NS', 'RELIANCE.NS', 'INFY.NS', 'AAPL', 'NVDA', 'TSLA'].map(s => (
                <button
                  key={s}
                  onClick={() => setTicker(s)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/60 hover:text-white transition-all duration-200"
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
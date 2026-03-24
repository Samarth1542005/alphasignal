import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        onAuth(data.user)
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Account created! Please check your email to confirm, then log in.')
        setMode('login')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">A</span>
            </div>
            <span className="text-white font-bold text-xl">AlphaSignal</span>
          </div>
          <p className="text-gray-500 text-sm">Stock Prediction & Decision Support</p>
        </div>

        <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-8">
          <div className="flex gap-2 mb-6 bg-[#13131a] rounded-xl p-1">
            <button
              onClick={() => { setMode('login'); setError(null); setMessage(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-emerald-400 text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); setMessage(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'signup' ? 'bg-emerald-400 text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="you@example.com"
                className="w-full bg-[#13131a] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-400/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••"
                className="w-full bg-[#13131a] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-400/50 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-xl px-4 py-3">
                <p className="text-emerald-400 text-sm">{message}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              className="w-full bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
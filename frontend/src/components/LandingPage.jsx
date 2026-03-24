export default function LandingPage({ onGetStarted }) {
    const features = [
      {
        accent: "text-emerald-400",
        border: "border-emerald-400/20",
        bg: "bg-emerald-400/10",
        tag: "ML Model",
        tagColor: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
        title: "LSTM Price Prediction",
        desc: "A two-layer Long Short-Term Memory neural network trained on 2 years of historical OHLCV data. Predicts the next 7 trading days with on-demand training and intelligent caching — works for any of the 1600+ NSE listed stocks.",
        points: ["60-day sequence window", "On-demand training per ticker", "Cached for instant re-access"],
      },
      {
        accent: "text-blue-400",
        border: "border-blue-400/20",
        bg: "bg-blue-400/10",
        tag: "Decision Engine",
        tagColor: "bg-blue-400/10 text-blue-400 border-blue-400/20",
        title: "AI BUY / SELL / HOLD",
        desc: "A weighted scoring engine that combines RSI, MACD, Bollinger Bands, and SMA signals to generate a confident BUY, SELL, or HOLD recommendation with a percentage confidence score and plain-English reasoning.",
        points: ["5 technical indicators combined", "Confidence % score", "Plain English reasons"],
      },
      {
        accent: "text-purple-400",
        border: "border-purple-400/20",
        bg: "bg-purple-400/10",
        tag: "NLP / FinBERT",
        tagColor: "bg-purple-400/10 text-purple-400 border-purple-400/20",
        title: "News Sentiment Analysis",
        desc: "Fetches the latest financial headlines via NewsAPI and runs each through ProsusAI's FinBERT — a BERT model fine-tuned specifically on financial text. Returns per-headline sentiment with confidence scores and an overall market mood.",
        points: ["FinBERT (finance-specific BERT)", "Live headlines via NewsAPI", "Per-headline confidence score"],
      },
      {
        accent: "text-amber-400",
        border: "border-amber-400/20",
        bg: "bg-amber-400/10",
        tag: "Technical Analysis",
        tagColor: "bg-amber-400/10 text-amber-400 border-amber-400/20",
        title: "Technical Indicators",
        desc: "Computes RSI, MACD, Signal Line, Histogram, SMA 20, SMA 50, and Bollinger Bands from raw price data using pandas. Each indicator is displayed with its value, interpretation tag, and a plain-English description.",
        points: ["RSI, MACD, Bollinger Bands", "SMA 20 & SMA 50", "Human-readable interpretations"],
      },
      {
        accent: "text-pink-400",
        border: "border-pink-400/20",
        bg: "bg-pink-400/10",
        tag: "Portfolio",
        tagColor: "bg-pink-400/10 text-pink-400 border-pink-400/20",
        title: "Portfolio Tracker",
        desc: "A per-user portfolio system backed by Supabase PostgreSQL with Row Level Security. Users can add holdings with quantity and buy price, and track real-time profit/loss calculated against live yfinance prices.",
        points: ["Supabase RLS per user", "Live P&L calculation", "Add & remove holdings"],
      },
      {
        accent: "text-cyan-400",
        border: "border-cyan-400/20",
        bg: "bg-cyan-400/10",
        tag: "Auth",
        tagColor: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
        title: "Supabase Auth",
        desc: "Email + password authentication powered by Supabase Auth with bcrypt password hashing and JWT session management. Each user's portfolio data is isolated at the database level using PostgreSQL Row Level Security policies.",
        points: ["bcrypt password hashing", "JWT session tokens", "Row Level Security"],
      },
    ]
  
    const steps = [
      { step: "01", color: "text-emerald-400", border: "border-emerald-400/30", title: "Search any stock", desc: "Enter any NSE ticker (e.g. RELIANCE.NS) or US stock (e.g. AAPL). AlphaSignal fetches live data via yfinance instantly." },
      { step: "02", color: "text-blue-400", border: "border-blue-400/30", title: "AI analyzes it", desc: "The decision engine scores RSI, MACD, Bollinger Bands, and SMAs. FinBERT scans the latest headlines. LSTM trains on 2 years of data." },
      { step: "03", color: "text-purple-400", border: "border-purple-400/30", title: "Get a full report", desc: "See a BUY/SELL/HOLD decision, 7-day price forecast chart, news sentiment breakdown, and all technical indicators in one dashboard." },
      { step: "04", color: "text-amber-400", border: "border-amber-400/30", title: "Track your portfolio", desc: "Add stocks to your personal portfolio. AlphaSignal tracks your holdings and shows live profit/loss — all tied to your account." },
    ]
  
    const stats = [
      { value: "1,600+", label: "NSE Stocks Supported", color: "text-emerald-400" },
      { value: "7-Day", label: "Price Forecast Horizon", color: "text-blue-400" },
      { value: "5", label: "Technical Indicators", color: "text-purple-400" },
      { value: "Real-Time", label: "Live Price Data", color: "text-amber-400" },
    ]
  
    const stack = [
      { name: "React + Vite", color: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20" },
      { name: "Tailwind CSS", color: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
      { name: "FastAPI", color: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" },
      { name: "TensorFlow LSTM", color: "bg-orange-400/10 text-orange-400 border-orange-400/20" },
      { name: "HuggingFace FinBERT", color: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" },
      { name: "Supabase PostgreSQL", color: "bg-green-400/10 text-green-400 border-green-400/20" },
      { name: "yfinance", color: "bg-purple-400/10 text-purple-400 border-purple-400/20" },
      { name: "NewsAPI", color: "bg-pink-400/10 text-pink-400 border-pink-400/20" },
      { name: "Recharts", color: "bg-red-400/10 text-red-400 border-red-400/20" },
    ]
  
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <nav className="border-b border-white/5 px-8 py-4 flex items-center justify-between sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-sm">
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
          <button
            onClick={onGetStarted}
            className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black font-semibold rounded-lg text-sm transition-colors"
          >
            Get Started
          </button>
        </nav>
  
        <section className="flex flex-col items-center justify-center text-center px-6 py-28 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">LSTM + FinBERT + FastAPI + Supabase</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            AI-powered stock analysis
            <br />
            <span className="text-emerald-400">built for the real world</span>
          </h1>
          <p className="text-white/40 text-lg mb-10 max-w-2xl leading-relaxed">
            AlphaSignal combines deep learning price predictions, NLP news sentiment, and technical analysis into a single full-stack platform — built from scratch using Python, React, and PostgreSQL.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={onGetStarted}
              className="px-8 py-3 bg-emerald-400 hover:bg-emerald-300 text-black font-semibold rounded-xl transition-colors text-sm"
            >
              Launch App
            </button>
            <a
              href="https://github.com/Samarth1542005/alphasignal"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-colors text-sm"
            >
              View on GitHub
            </a>
          </div>
        </section>
  
        <section className="border-y border-white/5 py-12 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className={`text-3xl font-bold mb-1 ${s.color}`}>{s.value}</p>
                <p className="text-white/40 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
  
        <section className="py-24 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-400 text-sm font-medium uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything in one platform</h2>
            <p className="text-white/40 max-w-xl mx-auto">Six production-grade features built from scratch — each one a standalone module wired together into a unified dashboard.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className={`bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-200`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 ${f.bg} border ${f.border} rounded-xl`} />
                  <span className={`text-xs px-2 py-0.5 rounded border ${f.tagColor}`}>{f.tag}</span>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${f.accent}`}>{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-4">{f.desc}</p>
                <div className="flex flex-col gap-1.5">
                  {f.points.map((p, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className={`w-1 h-1 rounded-full ${f.bg.replace('/10', '')}`} />
                      <span className="text-white/30 text-xs">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
  
        <section className="py-24 px-6 bg-white/[0.01] border-y border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-blue-400 text-sm font-medium uppercase tracking-wider mb-3">How it works</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">From search to insight in seconds</h2>
              <p className="text-white/40 max-w-xl mx-auto">AlphaSignal orchestrates multiple AI models and data sources behind a single search bar.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps.map((s, i) => (
                <div key={i} className={`bg-white/[0.02] border ${s.border} rounded-2xl p-6`}>
                  <p className={`text-4xl font-black mb-4 ${s.color} opacity-40`}>{s.step}</p>
                  <h3 className={`text-lg font-semibold mb-2 ${s.color}`}>{s.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        <section className="py-24 px-6 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-purple-400 text-sm font-medium uppercase tracking-wider mb-3">Tech Stack</p>
            <h2 className="text-3xl font-bold mb-4">Built with production tools</h2>
            <p className="text-white/40 max-w-xl mx-auto">Every library and framework was chosen for real-world relevance — the same tools used in production fintech apps.</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {stack.map((t, i) => (
              <span key={i} className={`px-4 py-2 rounded-full border text-sm font-medium ${t.color}`}>
                {t.name}
              </span>
            ))}
          </div>
        </section>
  
        <section className="py-24 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to explore?</h2>
            <p className="text-white/40 mb-8">Sign up for free and analyze any stock on NSE or NYSE instantly.</p>
            <button
              onClick={onGetStarted}
              className="px-10 py-4 bg-emerald-400 hover:bg-emerald-300 text-black font-semibold rounded-xl transition-colors"
            >
              Get Started Free
            </button>
          </div>
        </section>
  
        <footer className="border-t border-white/5 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-400 rounded-md flex items-center justify-center">
              <span className="text-black font-black text-xs">A</span>
            </div>
            <span className="text-white/30 text-sm">AlphaSignal — Built by Samarth Raut, PICT Pune</span>
          </div>
          <a
            href="https://github.com/Samarth1542005/alphasignal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 hover:text-white text-sm transition-colors"
          >
            GitHub
          </a>
        </footer>
      </div>
    )
  }
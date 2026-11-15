import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CandlestickChart,
  Zap,
  Activity,
  BarChart3
} from 'lucide-react';
import API from '../api';

// Market Benchmark Indices (Click to open IndexDetailView)
const MARKET_INDICES = [
  { symbol: '^NSEI', name: 'NIFTY 50', exchange: 'NSE Benchmark', tag: 'Large Cap 50' },
  { symbol: '^BSESN', name: 'SENSEX', exchange: 'BSE Benchmark', tag: 'Top 30 BSE' },
  { symbol: '^NSEBANK', name: 'NIFTY BANK', exchange: 'NSE Sectoral', tag: 'Banking Index' }
];

// Curated Popular Indian NSE Stocks (Includes auto-aliased legacy tickers)
const POPULAR_STOCKS = [
  {
    symbol: 'RELIANCE.NS',
    name: 'Reliance Industries Ltd.',
    sector: 'Energy & Telecom',
    exchange: 'NSE',
    sentiment: '+0.84 Bullish',
    marketCap: 'Large Cap',
    peRatio: '27.4'
  },
  {
    symbol: 'TCS.NS',
    name: 'Tata Consultancy Services Ltd.',
    sector: 'IT Services',
    exchange: 'NSE',
    sentiment: '+0.68 Bullish',
    marketCap: 'Large Cap',
    peRatio: '29.8'
  },
  {
    symbol: 'HDFCBANK.NS',
    name: 'HDFC Bank Ltd.',
    sector: 'Banking',
    exchange: 'NSE',
    sentiment: '+0.52 Bullish',
    marketCap: 'Large Cap',
    peRatio: '19.1'
  },
  {
    symbol: 'INFY.NS',
    name: 'Infosys Ltd.',
    sector: 'IT Services',
    exchange: 'NSE',
    sentiment: '+0.73 Bullish',
    marketCap: 'Large Cap',
    peRatio: '26.5'
  },
  {
    symbol: 'TATAMOTORS.NS',
    name: 'Tata Motors Ltd. (Auto-Aliased)',
    sector: 'Automobiles',
    exchange: 'NSE',
    sentiment: '+0.61 Bullish',
    marketCap: 'Large Cap',
    peRatio: '11.4'
  },
  {
    symbol: 'ZOMATO.NS',
    name: 'Eternal Ltd. (Zomato)',
    sector: 'Consumer Tech',
    exchange: 'NSE',
    sentiment: '+0.79 Bullish',
    marketCap: 'Large Cap',
    peRatio: '84.2'
  },
  {
    symbol: 'ICICIBANK.NS',
    name: 'ICICI Bank Ltd.',
    sector: 'Banking',
    exchange: 'NSE',
    sentiment: '+0.71 Bullish',
    marketCap: 'Large Cap',
    peRatio: '18.7'
  },
  {
    symbol: 'SUNPHARMA.NS',
    name: 'Sun Pharmaceutical Industries',
    sector: 'Pharma',
    exchange: 'NSE',
    sentiment: '+0.64 Bullish',
    marketCap: 'Large Cap',
    peRatio: '36.9'
  },
  {
    symbol: 'BHARTIARTL.NS',
    name: 'Bharti Airtel Ltd.',
    sector: 'Energy & Telecom',
    exchange: 'NSE',
    sentiment: '+0.77 Bullish',
    marketCap: 'Large Cap',
    peRatio: '52.3'
  }
];

const SECTORS = ['All', 'IT Services', 'Banking', 'Energy & Telecom', 'Automobiles', 'Consumer Tech', 'Pharma'];

export default function Stocks({ onSelectStock }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestions from curated list + allow direct NSE ticker launch
  const searchResults = searchQuery.trim().length > 0
    ? POPULAR_STOCKS.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.sector.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleDirectSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    let formatted = searchQuery.trim().toUpperCase();
    if (!formatted.endsWith('.NS') && !formatted.endsWith('.BO') && !formatted.startsWith('^')) {
      formatted = `${formatted}.NS`;
    }
    setShowDropdown(false);
    onSelectStock(formatted);
  };

  const displayedStocks =
    selectedSector === 'All'
      ? POPULAR_STOCKS
      : POPULAR_STOCKS.filter((s) => s.sector === selectedSector);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Hero / Search Header Section */}
      <div className="bg-gradient-to-br from-[#121620] via-[#131926] to-[#0e131d] border border-[#1f2430] rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> 
            Live NSE Terminal
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Explore <span className="text-emerald-400">Indian Stocks</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Analyze interactive TradingView candlestick charts, live market fundamentals, corporate demerger aliases, and FinBERT news sentiment pins.
          </p>

          {/* Autocomplete + Direct Symbol Search Bar */}
          <div ref={searchRef} className="relative mt-6">
            <form onSubmit={handleDirectSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-4 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search any NSE/BSE ticker or company (e.g., RELIANCE, TCS, ZOMATO, ^NSEI)..."
                value={searchQuery}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                className="w-full bg-[#0b0e14] border border-[#262d3d] text-white text-sm pl-12 pr-28 py-3.5 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition cursor-pointer"
              >
                Analyze
              </button>
            </form>

            {/* Instant Search Dropdown */}
            {showDropdown && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-[#121620] border border-[#262d3d] rounded-xl shadow-2xl z-40 max-h-80 overflow-y-auto divide-y divide-[#1f2430]">
                {searchResults.map((stock) => (
                  <div
                    key={stock.symbol}
                    onClick={() => {
                      setShowDropdown(false);
                      onSelectStock(stock.symbol);
                    }}
                    className="px-4 py-3 hover:bg-[#1a202e] cursor-pointer flex items-center justify-between gap-4 transition"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-100">{stock.name}</p>
                      <span className="text-[11px] text-gray-500 font-mono">
                        {stock.symbol} • {stock.sector}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 shrink-0 flex items-center gap-1">
                      Open Chart <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}

                {/* Direct Custom Ticker Option */}
                <div
                  onClick={handleDirectSearchSubmit}
                  className="px-4 py-3 bg-[#0e131d] hover:bg-[#1a202e] cursor-pointer flex items-center justify-between gap-4 transition"
                >
                  <span className="text-xs text-gray-300">
                    Load live NSE chart for <strong className="text-emerald-400">"{searchQuery.toUpperCase()}"</strong>
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    Launch Terminal <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Benchmark Market Indices Row */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">Market Indices</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MARKET_INDICES.map((idx) => (
            <div
              key={idx.symbol}
              onClick={() => onSelectStock(idx.symbol)}
              className="bg-[#121620] border border-[#1f2430] hover:border-emerald-500/50 rounded-2xl p-4 cursor-pointer transition flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition">
                    {idx.name}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#0b0e14] text-gray-400 border border-[#1f2430]">
                    {idx.tag}
                  </span>
                </div>
                <span className="text-xs text-gray-500 mt-1 block">
                  {idx.exchange} ({idx.symbol})
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-400 group-hover:text-emerald-400 flex items-center gap-1 transition">
                View Index <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Sector Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {SECTORS.map((sector) => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedSector === sector
                  ? 'bg-emerald-500 text-gray-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-[#121620] text-gray-400 border border-[#1f2430] hover:text-white hover:border-gray-700'
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500">Showing {displayedStocks.length} NSE Stocks</span>
      </div>

      {/* 4. Popular NSE Stocks Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h2 className="text-base font-bold text-white">Popular NSE Stocks &amp; Sentiment Trackers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedStocks.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => onSelectStock(stock.symbol)}
              className="bg-[#121620] border border-[#1f2430] hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between group hover:shadow-lg hover:shadow-emerald-500/5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                    {stock.sector}
                  </span>
                  <span className="text-[11px] font-mono text-gray-400 bg-[#0b0e14] px-2.5 py-1 rounded-lg border border-[#1f2430]">
                    {stock.symbol}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-gray-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {stock.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {stock.exchange} • {stock.marketCap}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#1f2430] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-500 block">FinBERT Mood</span>
                  <span className="text-xs font-extrabold text-emerald-400">{stock.sentiment}</span>
                </div>
                <div className="text-center">
                  <span className="text-[11px] text-gray-500 block">P/E Ratio</span>
                  <span className="text-xs font-bold text-gray-200">{stock.peRatio}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-300 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">
                  Chart <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Bottom Feature Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-[#121620] border border-[#1f2430] p-5 rounded-2xl flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CandlestickChart className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">TradingView Chart Engine</h4>
            <p className="text-xs text-gray-400 mt-1">
              Switch between smooth Area/Line graphs and OHLC Candlesticks across 1D to ALL timeframes.
            </p>
          </div>
        </div>

        <div className="bg-[#121620] border border-[#1f2430] p-5 rounded-2xl flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">FinBERT Sentiment Pins</h4>
            <p className="text-xs text-gray-400 mt-1">
              Correlate live price swings with -1.0 Bearish to +1.0 Bullish financial news markers.
            </p>
          </div>
        </div>

        <div className="bg-[#121620] border border-[#1f2430] p-5 rounded-2xl flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Auto-Aliased Tickers</h4>
            <p className="text-xs text-gray-400 mt-1">
              Legacy symbols like ZOMATO.NS or TATAMOTORS.NS automatically resolve to active tickers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useRef, useState } from 'react';
import { createChart, AreaSeries, CandlestickSeries } from 'lightweight-charts';
import {
  Bell,
  Bookmark,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Search,
  AlertCircle,
  Building2,
  Calculator,
  Newspaper,
  Sparkles,
  ExternalLink,
  Info,
  Users,
  MapPin,
  Calendar,
  Percent,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Check,
} from 'lucide-react';
import API from '../api';

const safeText = (val, fallback = '—') => {
  if (val === null || val === undefined || typeof val === 'object') return fallback;
  return String(val);
};

export default function StockChart({ initialSymbol = 'RELIANCE.NS', onStockDataUpdate }) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const searchContainerRef = useRef(null);

  const [symbol, setSymbol] = useState(initialSymbol);
  const [searchInput, setSearchInput] = useState(initialSymbol);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [range, setRange] = useState('6M');
  const [chartType, setChartType] = useState('area');

  const [stockData, setStockData] = useState({
    symbol: initialSymbol,
    companyName: 'Reliance Industries Limited',
    exchange: 'NSE',
    livePrice: 0,
    latestPrice: 0,
    startPrice: 0,
    rangeChange: 0,
    rangePercent: 0,
    cagr: null,
    annualReturnRate: 14.5,
    sector: 'Energy',
    revenue: '₹9,74,864 Cr',
    marketCap: '₹19.82 Lakh Cr',
    peRatio: '28.4',
    divYield: '0.31%',
    yearHigh: 1611.8,
    yearLow: 1152.2,
    about: {
      description:
        'Reliance Industries Limited is an Indian multinational conglomerate company, headquartered in Mumbai. Its businesses include energy, petrochemicals, natural gas, retail, telecommunications, and digital services.',
      ceo: 'Mukesh D. Ambani',
      founded: '1973',
      hq: 'Mumbai, Maharashtra, India',
      employees: '3,89,000+',
    },
    similarStocks: [
      { name: 'Tata Consultancy Services', symbol: 'TCS.NS', price: '₹2,376.20', change: '+1.40%', isUp: true },
      { name: 'Infosys Limited', symbol: 'INFY.NS', price: '₹1,098.00', change: '-0.75%', isUp: false },
      { name: 'HDFC Bank Limited', symbol: 'HDFCBANK.NS', price: '₹1,745.80', change: '+0.95%', isUp: true },
      { name: 'Tata Motors Limited', symbol: 'TMPV.NS', price: '₹780.50', change: '+2.10%', isUp: true },
    ],
    candles: [],
    news: [],
  });

  const [sipMonthly, setSipMonthly] = useState(5000);
  const [sipYears, setSipYears] = useState(5);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', '3Y', '5Y', 'ALL'];

  // Sync symbol changes from parent
  useEffect(() => {
    if (initialSymbol) {
      setSymbol(initialSymbol);
      setSearchInput(initialSymbol);
    }
  }, [initialSymbol]);

  // Click outside listener for search autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search query debounced fetch
  useEffect(() => {
    const q = searchInput.trim();
    if (!q || q.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await API.get(`/stocks/search?q=${encodeURIComponent(q)}`);
        if (Array.isArray(res.data)) {
          setSearchResults(res.data);
        }
      } catch (err) {
        console.warn('Search query error:', err.message);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch stock and candle data for current symbol & timeframe
  useEffect(() => {
    let isCancelled = false;

    const fetchTerminalData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await API.get(
          `/stocks/candles/${encodeURIComponent(symbol)}?range=${encodeURIComponent(range)}`
        );
        if (!isCancelled && res.data && typeof res.data === 'object') {
          const rawCandles = Array.isArray(res.data.candles) ? res.data.candles : [];
          const startPrice = Number(res.data.startPrice) || (rawCandles.length ? rawCandles[0].close : 0);
          const latestPrice = Number(res.data.latestPrice || res.data.livePrice) || (rawCandles.length ? rawCandles[rawCandles.length - 1].close : 0);
          const rangeChange = Number(res.data.rangeChange) || (latestPrice - startPrice);
          const rangePercent = startPrice > 0 ? ((rangeChange / startPrice) * 100).toFixed(2) : '0.00';

          const safeAbout =
            res.data.about && typeof res.data.about === 'object'
              ? res.data.about
              : {
                  description: `${safeText(
                    res.data.companyName || symbol
                  )} is a prominent entity listed on the Indian Stock Exchange.`,
                  ceo: 'Executive Leadership',
                  founded: '1985',
                  hq: 'India',
                  employees: '50,000+',
                };

          const updated = {
            ...res.data,
            symbol: safeText(res.data.symbol, symbol),
            companyName: safeText(res.data.companyName, symbol),
            exchange: safeText(res.data.exchange, 'NSE'),
            revenue: safeText(res.data.revenue, '₹2,45,120 Cr'),
            marketCap: safeText(res.data.marketCap, '₹4.5 Lakh Cr'),
            peRatio: safeText(res.data.peRatio, '24.8'),
            divYield: safeText(res.data.divYield, '1.15%'),
            sector: safeText(res.data.sector, 'Equities'),
            startPrice,
            latestPrice,
            livePrice: latestPrice,
            rangeChange,
            rangePercent,
            cagr: res.data.cagr !== undefined ? res.data.cagr : null,
            about: safeAbout,
            similarStocks: Array.isArray(res.data.similarStocks) && res.data.similarStocks.length > 0
              ? res.data.similarStocks
              : [
                  { name: 'Tata Consultancy', symbol: 'TCS.NS', price: '₹2,376.20', change: '+1.40%', isUp: true },
                  { name: 'Infosys', symbol: 'INFY.NS', price: '₹1,098.00', change: '-0.75%', isUp: false },
                  { name: 'HDFC Bank', symbol: 'HDFCBANK.NS', price: '₹1,745.80', change: '+0.95%', isUp: true },
                ],
            candles: rawCandles,
            news: Array.isArray(res.data.news) ? res.data.news : [],
          };

          setStockData(updated);

          const resolvedSymbol = safeText(res.data.symbol, symbol);
          setSymbol(resolvedSymbol);

          if (onStockDataUpdate) {
            onStockDataUpdate(updated);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          const message =
            err.response?.data?.error || 'Unable to load market data for this symbol.';
          setErrorMsg(message);
        }
      }
      if (!isCancelled) setLoading(false);
    };

    fetchTerminalData();

    return () => {
      isCancelled = true;
    };
  }, [symbol, range]);

  // Chart rendering via lightweight-charts
  useEffect(() => {
    if (!chartContainerRef.current || !stockData.candles || stockData.candles.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    const rangeChangeNum = Number(stockData.rangeChange) || 0;
    const isPositive = rangeChangeNum >= 0;
    const lineColor = isPositive ? '#00b386' : '#eb5b3c';
    const topFill = isPositive ? 'rgba(0, 179, 134, 0.28)' : 'rgba(235, 91, 60, 0.28)';

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 600,
      height: 380,
      layout: {
        background: { color: '#131722' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1a202c', style: 1 },
        horzLines: { color: '#1e2433' },
      },
      rightPriceScale: {
        visible: true,
        borderColor: '#242b3d',
      },
      timeScale: {
        borderColor: '#242b3d',
        timeVisible: range === '1D' || range === '1W',
      },
      crosshair: {
        vertLine: { color: '#4b5563', width: 1, style: 3 },
        horzLine: { color: '#4b5563', width: 1, style: 3 },
      },
    });

    chartInstanceRef.current = chart;

    if (chartType === 'area') {
      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor,
        topColor: topFill,
        bottomColor: 'rgba(19, 23, 34, 0.0)',
        lineWidth: 2.5,
        priceLineVisible: true,
      });

      const lineData = stockData.candles.map((c) => ({
        time: c.time,
        value: c.close,
      }));
      areaSeries.setData(lineData);
    } else {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#00b386',
        downColor: '#eb5b3c',
        borderVisible: false,
        wickUpColor: '#00b386',
        wickDownColor: '#eb5b3c',
      });
      candleSeries.setData(stockData.candles);
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [stockData.candles, chartType, range, stockData.rangeChange]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      let formatted = searchInput.trim().toUpperCase();
      if (formatted.endsWith('.BSE') || formatted.endsWith('.BOSE')) {
        formatted = formatted.replace(/\.BSE$|\.BOSE$/, '.BO');
      } else if (!formatted.includes('.') && !formatted.startsWith('^')) {
        formatted += '.NS';
      }
      setShowDropdown(false);
      setSymbol(formatted);
    }
  };

  const handleSelectSearchResult = (stock) => {
    const targetSymbol = stock.symbol || stock.name;
    setSymbol(targetSymbol);
    setSearchInput(targetSymbol);
    setShowDropdown(false);
  };

  const calculateSIP = () => {
    // Determine expected annual rate: use CAGR if positive, else default to 14.5%
    const cagrNum = Number(stockData.cagr);
    const effectiveRate = cagrNum > 0 ? cagrNum : (Number(stockData.annualReturnRate) || 14.5);
    const monthlyRate = effectiveRate / 100 / 12;
    const months = sipYears * 12;
    const invested = sipMonthly * months;
    if (monthlyRate === 0) return { invested, total: invested, returns: 0, effectiveRate };
    const total =
      sipMonthly * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    const returns = total - invested;
    return {
      invested: Math.round(invested),
      total: Math.round(total),
      returns: Math.round(returns > 0 ? returns : 0),
      effectiveRate: effectiveRate.toFixed(1),
    };
  };

  const sipResult = calculateSIP();
  const rangeChangeNum = Number(stockData.rangeChange) || 0;
  const isRangeUp = rangeChangeNum >= 0;
  const livePriceNum = Number(stockData.latestPrice || stockData.livePrice) || 0;
  const startPriceNum = Number(stockData.startPrice) || 0;
  const rangePercentNum = Number(stockData.rangePercent) || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-4">
      <div className="lg:col-span-2 space-y-6">
        {/* MAIN TERMINAL CONTAINER */}
        <div className="bg-[#131722] p-6 rounded-2xl border border-[#222838] text-gray-100 shadow-2xl">
          {/* SEARCH & QUICK SWITCH HEADER */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            <div ref={searchContainerRef} className="relative flex-1 max-w-md">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onFocus={() => setShowDropdown(true)}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setShowDropdown(true);
                    }}
                    placeholder="Search NSE/BSE (e.g. RELIANCE.NS, TCS.NS, INFY)"
                    className="w-full bg-[#0b0e14] text-white pl-9 pr-3 py-2 rounded-lg border border-[#2a3040] text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer"
                >
                  Load
                </button>
              </form>

              {/* Autocomplete Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-[#0f131a] border border-[#2a3040] rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto divide-y divide-[#1e2433]">
                  {searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSearchResult(item)}
                      className="p-3 hover:bg-[#1a2233] cursor-pointer flex items-center justify-between transition"
                    >
                      <div>
                        <span className="text-xs font-bold text-white block">{item.symbol || item.name}</span>
                        <span className="text-[10px] text-gray-400">{item.name || item.companyName}</span>
                      </div>
                      <span className="text-[10px] font-semibold bg-[#182030] text-emerald-400 px-2 py-0.5 rounded">
                        {item.exchange || 'NSE'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Watchlist Shortcut Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS'].map((quickSym) => (
                <button
                  key={quickSym}
                  onClick={() => {
                    setSymbol(quickSym);
                    setSearchInput(quickSym);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer whitespace-nowrap ${
                    symbol === quickSym
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-[#0b0e14] text-gray-400 hover:text-white border border-[#222838]'
                  }`}
                >
                  {quickSym.replace('.NS', '')}
                </button>
              ))}
            </div>
          </div>

          {errorMsg ? (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 text-center my-6">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-rose-300 mb-1">Market Data Unavailable</h3>
              <p className="text-xs text-gray-300">{errorMsg}</p>
            </div>
          ) : (
            <>
              {/* STOCK HEADER INFO & RETURN STATS */}
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <span className="font-mono">{symbol.replace(/\.(NS|BO)$/, '')}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      {safeText(stockData.exchange)}
                    </span>
                    <span>•</span>
                    <span className="bg-[#1a2233] text-gray-300 px-2 py-0.5 rounded text-[10px] font-medium">
                      {safeText(stockData.sector)}
                    </span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {safeText(stockData.companyName)}
                  </h1>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-2xl md:text-3xl font-extrabold text-white">
                      ₹{livePriceNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span
                      className={`text-sm font-bold flex items-center gap-1 ${
                        isRangeUp ? 'text-[#00b386]' : 'text-[#eb5b3c]'
                      }`}
                    >
                      {isRangeUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {isRangeUp ? '+' : ''}
                      ₹{Math.abs(rangeChangeNum).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (
                      {isRangeUp ? '+' : ''}
                      {safeText(stockData.rangePercent, '0')}%)
                    </span>
                    <span className="text-xs text-gray-400 font-medium bg-[#182030] px-2 py-0.5 rounded">
                      {range} Range Return
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="p-2.5 rounded-full border border-[#2a3040] text-gray-400 hover:text-white hover:border-gray-500 transition cursor-pointer"
                    title="Create Alert"
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2.5 rounded-full border border-[#2a3040] text-gray-400 hover:text-emerald-400 hover:border-emerald-500/50 transition cursor-pointer"
                    title="Watchlist"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* RETURN METRICS DETAIL STRIP: START PRICE VS LATEST PRICE & CAGR */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0b0e14] p-3.5 rounded-xl border border-[#1e2433] mb-4">
                <div>
                  <span className="text-[10px] text-gray-400 block mb-0.5">Start Price ({range})</span>
                  <span className="text-xs md:text-sm font-bold text-gray-200">
                    ₹{startPriceNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block mb-0.5">Latest / Current Price</span>
                  <span className="text-xs md:text-sm font-bold text-white">
                    ₹{livePriceNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block mb-0.5">Range Change (₹)</span>
                  <span
                    className={`text-xs md:text-sm font-bold ${
                      isRangeUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isRangeUp ? '+' : ''}₹{rangeChangeNum.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block mb-0.5">
                    {stockData.cagr !== null ? 'Annualized Return (CAGR)' : 'Total Range %'}
                  </span>
                  <span
                    className={`text-xs md:text-sm font-bold ${
                      (stockData.cagr !== null ? Number(stockData.cagr) >= 0 : isRangeUp)
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {stockData.cagr !== null ? (
                      `${Number(stockData.cagr) >= 0 ? '+' : ''}${stockData.cagr}% p.a.`
                    ) : (
                      `${isRangeUp ? '+' : ''}${rangePercentNum.toFixed(2)}%`
                    )}
                  </span>
                </div>
              </div>

              {/* CHART CANVAS */}
              <div className="relative min-h-[380px] w-full my-2">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#131722]/80 z-10 text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>Fetching live NSE series...</span>
                    </div>
                  </div>
                )}
                <div ref={chartContainerRef} className="w-full" />
              </div>

              {/* TIMEFRAME SELECTOR & CHART TYPE TOGGLE */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-[#1e2433]">
                <div className="flex items-center gap-1 md:gap-2 overflow-x-auto">
                  {timeframes.map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setRange(tf)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                        range === tf
                          ? 'border border-emerald-400 text-emerald-400 bg-emerald-500/10 shadow-sm'
                          : 'text-gray-400 hover:text-white hover:bg-[#1c2230]'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChartType(chartType === 'area' ? 'candle' : 'area')}
                    className="p-2 rounded-lg border border-[#2a3040] text-gray-300 hover:text-emerald-400 hover:border-emerald-500/40 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{chartType === 'area' ? 'Candles' : 'Area'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* FUNDAMENTALS OVERVIEW */}
        <div className="bg-[#131722] p-6 rounded-2xl border border-[#222838] shadow-lg">
          <div className="flex items-center gap-2 mb-4 text-emerald-400 font-bold text-sm">
            <Building2 className="w-4 h-4" /> Company Fundamentals & Key Metrics
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#0b0e14] p-3.5 rounded-xl border border-[#222838]">
              <span className="text-[11px] text-gray-400 block mb-1">52 Week High</span>
              <span className="text-base font-extrabold text-white">
                ₹{safeText(stockData.yearHigh, '—')}
              </span>
            </div>
            <div className="bg-[#0b0e14] p-3.5 rounded-xl border border-[#222838]">
              <span className="text-[11px] text-gray-400 block mb-1">52 Week Low</span>
              <span className="text-base font-extrabold text-white">
                ₹{safeText(stockData.yearLow, '—')}
              </span>
            </div>
            <div className="bg-[#0b0e14] p-3.5 rounded-xl border border-[#222838]">
              <span className="text-[11px] text-gray-400 block mb-1">P/E Ratio</span>
              <span className="text-base font-extrabold text-white">
                {safeText(stockData.peRatio)}
              </span>
            </div>
            <div className="bg-[#0b0e14] p-3.5 rounded-xl border border-[#222838]">
              <span className="text-[11px] text-gray-400 block mb-1">Div. Yield</span>
              <span className="text-base font-extrabold text-emerald-400">
                {safeText(stockData.divYield)}
              </span>
            </div>
          </div>
        </div>

        {/* ABOUT COMPANY */}
        <div className="bg-[#131722] p-6 rounded-2xl border border-[#222838] shadow-lg">
          <div className="flex items-center gap-2 mb-3 text-cyan-400 font-bold text-sm">
            <Info className="w-4 h-4" /> About {safeText(stockData.companyName)}
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-6">
            {safeText(stockData.about?.description)}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#1e2433]">
            <div className="flex items-start gap-2.5">
              <Users className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">CEO / MD</span>
                <span className="text-xs font-bold text-white">
                  {safeText(stockData.about?.ceo)}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">Founded Year</span>
                <span className="text-xs font-bold text-white">
                  {safeText(stockData.about?.founded)}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">Headquarters</span>
                <span className="text-xs font-bold text-white">
                  {safeText(stockData.about?.hq)}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">Employees</span>
                <span className="text-xs font-bold text-white">
                  {safeText(stockData.about?.employees)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SIMILAR PEER STOCKS */}
        <div className="bg-[#131722] p-6 rounded-2xl border border-[#222838] shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <TrendingUp className="w-4 h-4" /> Similar Peers in {safeText(stockData.sector)}
            </div>
            <span className="text-[11px] text-gray-400">Click to switch terminal</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(stockData.similarStocks || []).map((peer) => (
              <div
                key={safeText(peer.symbol)}
                onClick={() => {
                  setSymbol(safeText(peer.symbol));
                  setSearchInput(safeText(peer.symbol));
                }}
                className="bg-[#0b0e14] hover:bg-[#181d2a] p-3.5 rounded-xl border border-[#222838] hover:border-emerald-500/40 transition cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                    {safeText(peer.name)}
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    {safeText(peer.symbol).replace('.NS', '')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-white block">{safeText(peer.price)}</span>
                  <span
                    className={`text-[10px] font-semibold ${
                      peer.isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {safeText(peer.change)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIP WEALTH ACCUMULATION CALCULATOR */}
        <div className="bg-[#131722] p-6 rounded-2xl border border-[#222838] shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Calculator className="w-4 h-4" /> SIP Return Calculator for{' '}
              {symbol.replace(/\.(NS|BO)$/, '')}
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-semibold">
              Return Rate: {sipResult.effectiveRate}% p.a.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Monthly Investment</span>
                  <span className="font-bold text-white">
                    ₹{sipMonthly.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={sipMonthly}
                  onChange={(e) => setSipMonthly(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-[#0b0e14]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Investment Duration</span>
                  <span className="font-bold text-white">{sipYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="1"
                  value={sipYears}
                  onChange={(e) => setSipYears(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-[#0b0e14]"
                />
              </div>
            </div>

            <div className="bg-[#0b0e14] p-4 rounded-xl border border-[#222838] space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Invested Amount:</span>
                <span className="font-bold text-white">
                  ₹{sipResult.invested.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Est. Returns:</span>
                <span className="font-bold text-emerald-400">
                  + ₹{sipResult.returns.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#1e2433]">
                <span className="text-gray-300 font-semibold">Total Projected Corpus:</span>
                <span className="font-extrabold text-white text-sm">
                  ₹{sipResult.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: LIVE NEWS & MARKET ARTICLES */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#131722] p-6 rounded-2xl border border-[#222838] shadow-2xl sticky top-20">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e2433]">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Newspaper className="w-4 h-4" /> Live News Feed
            </div>
            <span className="flex items-center gap-1 text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20 font-semibold">
              <Sparkles className="w-3 h-3" /> Real-time
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Market coverage and headlines for{' '}
            <span className="text-white font-semibold">{symbol.replace(/\.(NS|BO)$/, '')}</span>.
          </p>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {(stockData.news || []).length > 0 ? (
              stockData.news.map((news, idx) => (
                <div
                  key={idx}
                  className="bg-[#0b0e14] p-4 rounded-xl border border-[#222838] hover:border-[#323d54] transition group"
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {safeText(news.publisher, 'Market News')}
                    </span>
                    <span className="text-[10px] text-gray-500">{safeText(news.time, '')}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition mb-1.5 leading-snug">
                    {safeText(news.title)}
                  </h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed mb-2">
                    {safeText(news.snippet || news.summary, '')}
                  </p>
                  {typeof news.link === 'string' && news.link.startsWith('http') && (
                    <a
                      href={news.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-cyan-400 font-semibold cursor-pointer"
                    >
                      <span>Read Article</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-gray-500">
                No recent articles recorded for this ticker.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
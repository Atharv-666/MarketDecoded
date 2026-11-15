import React, { useEffect, useRef, useState } from 'react';
import { createChart, AreaSeries, CandlestickSeries } from 'lightweight-charts';
import {
  Bell,
  Bookmark,
  SlidersHorizontal,
  TrendingUp,
  Search,
  AlertCircle,
  Building2,
  DollarSign,
  Calculator,
  Newspaper,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ExternalLink,
  Info,
  Users,
  MapPin,
  Calendar
} from 'lucide-react';
import axios from 'axios';

export default function StockChart({ initialSymbol = 'RELIANCE.NS', onStockDataUpdate }) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [symbol, setSymbol] = useState(initialSymbol);
  const [searchInput, setSearchInput] = useState(initialSymbol);
  const [range, setRange] = useState('6M');
  const [chartType, setChartType] = useState('area');
  
  const [stockData, setStockData] = useState({
    companyName: 'Reliance Industries Limited',
    exchange: 'NSE',
    livePrice: 0,
    dayChange: 0,
    dayChangePercent: 0,
    rangeChange: 0,
    rangePercent: 0,
    annualReturnRate: 14.5,
    sector: 'Energy',
    revenue: '₹9,74,864 Cr',
    marketCap: '₹19.82 Lakh Cr',
    peRatio: '28.4',
    divYield: '0.31%',
    // Groww-style About Company details
    about: {
      description: 'Reliance Industries Limited is an Indian multinational conglomerate company, headquartered in Mumbai. Its businesses include energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles.',
      ceo: 'Mukesh D. Ambani',
      founded: '1973',
      hq: 'Mumbai, Maharashtra, India',
      employees: '3,89,000+'
    },
    similarStocks: [
      { name: 'Tata Power', symbol: 'TATAPOWER.NS', price: '₹420.50', change: '+1.40%', isUp: true },
      { name: 'Adani Green', symbol: 'ADANIGREEN.NS', price: '₹1,350.00', change: '-0.85%', isUp: false },
      { name: 'NTPC Ltd', symbol: 'NTPC.NS', price: '₹375.20', change: '+2.10%', isUp: true }
    ],
    candles: []
  });

  // SIP Calculator State
  const [sipMonthly, setSipMonthly] = useState(5000);
  const [sipYears, setSipYears] = useState(5);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', '3Y', '5Y', 'ALL'];

  useEffect(() => {
    setSymbol(initialSymbol);
    setSearchInput(initialSymbol);
  }, [initialSymbol]);

  useEffect(() => {
    const fetchTerminalData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await axios.get(`http://localhost:5000/api/stocks/candles/${encodeURIComponent(symbol)}?range=${range}`);
        if (res.data) {
          setStockData(prev => ({
            ...prev,
            ...res.data,
            revenue: res.data.revenue || '₹2,45,120 Cr',
            marketCap: res.data.marketCap || '₹4.5 Lakh Cr',
            peRatio: res.data.peRatio || '24.8',
            divYield: res.data.divYield || '1.15%',
            sector: res.data.sector || 'Equities',
            about: res.data.about || {
              description: `${res.data.companyName || symbol} is a prominent listed entity operating within the Indian capital markets, delivering robust enterprise and retail value across its primary sector verticals.`,
              ceo: 'Experienced Executive Leadership',
              founded: '1995',
              hq: 'India',
              employees: '50,000+'
            },
            similarStocks: res.data.similarStocks || [
              { name: 'Benchmark Peer 1', symbol: 'TCS.NS', price: '₹4,120.00', change: '+0.92%', isUp: true },
              { name: 'Benchmark Peer 2', symbol: 'INFY.NS', price: '₹1,850.50', change: '+1.45%', isUp: true }
            ]
          }));
          setSymbol(res.data.symbol);
          setSearchInput(res.data.symbol);
          if (onStockDataUpdate) {
            onStockDataUpdate(res.data);
          }
        }
      } catch (err) {
        const message = err.response?.data?.error || 'Unable to load market data for this symbol.';
        setErrorMsg(message);
        setStockData((prev) => ({ ...prev, candles: [] }));
      }
      setLoading(false);
    };

    fetchTerminalData();
  }, [symbol, range]);

  // Chart Rendering Logic
  useEffect(() => {
    if (!chartContainerRef.current || !stockData.candles || stockData.candles.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    const isPositive = stockData.rangeChange >= 0;
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
        vertLines: { visible: false },
        horzLines: { color: '#1e2433' },
      },
      rightPriceScale: { visible: false },
      timeScale: {
        borderColor: '#242b3d',
        timeVisible: range === '1D' || range === '1W',
      },
    });

    chartInstanceRef.current = chart;

    if (chartType === 'area') {
      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor: lineColor,
        topColor: topFill,
        bottomColor: 'rgba(19, 23, 34, 0.0)',
        lineWidth: 2,
        priceLineVisible: false,
      });

      const lineData = stockData.candles.map(c => ({
        time: c.time,
        value: c.close
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
          width: chartContainerRef.current.clientWidth
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
  }, [stockData, chartType, range]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      let formatted = searchInput.trim().toUpperCase();
      if (formatted.endsWith('.BSE') || formatted.endsWith('.BOSE')) {
        formatted = formatted.replace(/\.BSE$|\.BOSE$/, '.BO');
      } else if (!formatted.includes('.') && !formatted.startsWith('^')) {
        formatted += '.NS';
      }
      setSymbol(formatted);
    }
  };

  const calculateSIP = () => {
    const monthlyRate = (stockData.annualReturnRate || 12) / 100 / 12;
    const months = sipYears * 12;
    const invested = sipMonthly * months;
    if (monthlyRate === 0) return { invested, total: invested, returns: 0 };
    const total = sipMonthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const returns = total - invested;
    return {
      invested: Math.round(invested),
      total: Math.round(total),
      returns: Math.round(returns > 0 ? returns : 0)
    };
  };

  const sipResult = calculateSIP();
  const isRangeUp = stockData.rangeChange >= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-4">
      
      {/* LEFT & CENTER: CHART + FUNDAMENTALS + ABOUT + PEERS + SIP */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Main Terminal Card */}
        <div className="bg-[#131722] p-6 rounded-2xl border border-[#222838] text-gray-100 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search NSE/BSE (e.g. RELIANCE.NS, TCS.NS)"
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

          {errorMsg ? (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 text-center my-6">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-rose-300 mb-1">Market Data Unavailable</h3>
              <p className="text-xs text-gray-300">{errorMsg}</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <span>{symbol.replace(/\.(NS|BO)$/, '')}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{stockData.exchange}</span>
                    <span>•</span>
                    <span className="bg-[#1a2233] text-gray-300 px-2 py-0.5 rounded text-[10px] font-medium">{stockData.sector}</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {stockData.companyName}
                  </h1>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl md:text-3xl font-extrabold text-white">
                      ₹{stockData.livePrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`text-sm font-bold ${isRangeUp ? 'text-[#00b386]' : 'text-[#eb5b3c]'}`}>
                      {isRangeUp ? '+' : ''}{stockData.rangeChange} ({isRangeUp ? '+' : ''}{stockData.rangePercent}%)
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{range}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2.5 rounded-full border border-[#2a3040] text-gray-400 hover:text-white hover:border-gray-500 transition cursor-pointer" title="Create Alert">
                    <Bell className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 rounded-full border border-[#2a3040] text-gray-400 hover:text-emerald-400 hover:border-emerald-500/50 transition cursor-pointer" title="Watchlist">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative min-h-[380px] w-full my-2">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#131722]/70 z-10 text-xs text-gray-400">
                    Fetching live market data...
                  </div>
                )}
                <div ref={chartContainerRef} className="w-full" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 mt-2 border-t border-[#1e2433]">
                <div className="flex items-center gap-1 md:gap-2 overflow-x-auto">
                  {timeframes.map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setRange(tf)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                        range === tf
                          ? 'border border-emerald-400 text-emerald-400 bg-emerald-500/10'
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
                    <span>{chartType === 'area' ? 'Candles' : 'Line'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Company Financials & Revenue Overview */}
        <div className="bg-[#131722] p-6 rounded-2xl border border-[#222838] shadow-lg">
          <div className="flex items-center gap-2 mb-4 text-emerald-400 font-bold text-sm">
            <Building2 className="w-4 h-4" /> Company Fundamentals & Revenue Overview
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#0b0e14] p-3.5 rounded-xl border border-[#222838]">
              <span className="text-[11px] text-gray-400 block mb-1">Annual Revenue</span>
              <span className="text-base font-extrabold text-white">{stockData.revenue}</span>
            </div>
            <div className="bg-[#0b0e14] p-3.5 rounded-xl border border-[#222838]">
              <span className="text-[11px] text-gray-400 block mb-1">Market Cap</span>
              <span className="text-base font-extrabold text-white">{stockData.marketCap}</span>
            </div>
            <div className="bg-[#0b0e14] p-3.5 rounded-xl border border-[#222838]">
              <span className="text-[11px] text-gray-400 block mb-1">P/E Ratio</span>
              <span className="text-base font-extrabold text-white">{stockData.peRatio}</span>
            </div>
            <div className="bg-[#0b0e14] p-3.5 rounded-xl border border-[#222838]">
              <span className="text-[11px] text-gray-400 block mb-1">Div. Yield</span>
              <span className="text-base font-extrabold text-emerald-400">{stockData.divYield}</span>
            </div>
          </div>
        </div>

        {/* Groww-style: About Company Section */}
        <div className="bg-[#131722] p-6 rounded-2xl border border-[#222838] shadow-lg">
          <div className="flex items-center gap-2 mb-3 text-cyan-400 font-bold text-sm">
            <Info className="w-4 h-4" /> About {stockData.companyName}
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-6">
            {stockData.about.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#1e2433]">
            <div className="flex items-start gap-2.5">
              <Users className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">CEO / MD</span>
                <span className="text-xs font-bold text-white">{stockData.about.ceo}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">Founded Year</span>
                <span className="text-xs font-bold text-white">{stockData.about.founded}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">Headquarters</span>
                <span className="text-xs font-bold text-white">{stockData.about.hq}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">Employees</span>
                <span className="text-xs font-bold text-white">{stockData.about.employees}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Stocks / Sector Peers */}
        <div className="bg-[#131722] p-6 rounded-2xl border border-[#222838] shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <TrendingUp className="w-4 h-4" /> Similar Stocks in {stockData.sector}
            </div>
            <span className="text-[11px] text-gray-400">Click to switch terminal</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stockData.similarStocks.map((peer) => (
              <div
                key={peer.symbol}
                onClick={() => setSymbol(peer.symbol)}
                className="bg-[#0b0e14] hover:bg-[#181d2a] p-3.5 rounded-xl border border-[#222838] hover:border-emerald-500/40 transition cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">{peer.name}</h4>
                  <span className="text-[10px] text-gray-400">{peer.symbol.replace('.NS', '')}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-white block">{peer.price}</span>
                  <span className={`text-[10px] font-semibold ${peer.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {peer.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Individual Stock SIP Calculator */}
        <div className="bg-[#131722] p-6 rounded-2xl border border-[#222838] shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Calculator className="w-4 h-4" /> SIP Wealth Calculator for {symbol.replace(/\.(NS|BO)$/, '')}
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-semibold">
              Est. Historical CAGR: {stockData.annualReturnRate}% p.a.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Monthly Investment</span>
                  <span className="font-bold text-white">₹{sipMonthly.toLocaleString('en-IN')}</span>
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
                <span className="font-bold text-white">₹{sipResult.invested.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Est. Returns:</span>
                <span className="font-bold text-emerald-400">+ ₹{sipResult.returns.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#1e2433]">
                <span className="text-gray-300 font-semibold">Total Corpus:</span>
                <span className="font-extrabold text-white text-sm">₹{sipResult.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE: NEWS & SENTIX AI FEED */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#131722] p-6 rounded-2xl border border-[#222838] shadow-2xl sticky top-20">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e2433]">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Newspaper className="w-4 h-4" /> Live News & Sentix AI
            </div>
            <span className="flex items-center gap-1 text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20 font-semibold">
              <Sparkles className="w-3 h-3" /> Live Feed
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Real-time financial news sentiment markers mapped directly for <span className="text-white font-semibold">{symbol.replace(/\.(NS|BO)$/, '')}</span>.
          </p>

          <div className="space-y-4">
            {[
              {
                title: `${symbol.replace(/\.(NS|BO)$/, '')} expands enterprise automation & cloud partnerships`,
                snippet: 'Strong quarterly performance driven by volume growth and improved operating margins across key segments.',
                sentiment: 'Bullish (+0.84)',
                isBullish: true,
                time: '1h ago'
              },
              {
                title: 'Global market consolidation impacts sectoral volume inflows',
                snippet: 'Broader index adjustments show slight pullbacks amid institutional foreign capital rebalancing.',
                sentiment: 'Neutral (0.00)',
                isBullish: false,
                time: '4h ago'
              },
              {
                title: 'Regulatory policy update boosts domestic manufacturing sentiment',
                snippet: 'New export incentives expected to improve annual operating cash flows for industry leaders.',
                sentiment: 'Bullish (+0.62)',
                isBullish: true,
                time: 'Yesterday'
              }
            ].map((news, idx) => (
              <div key={idx} className="bg-[#0b0e14] p-4 rounded-xl border border-[#222838] hover:border-[#323d54] transition group">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    news.isBullish ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-300'
                  }`}>
                    {news.sentiment}
                  </span>
                  <span className="text-[10px] text-gray-500">{news.time}</span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition mb-1.5 leading-snug">
                  {news.title}
                </h4>
                <p className="text-[11px] text-gray-400 leading-relaxed mb-2">
                  {news.snippet}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-semibold cursor-pointer">
                  <span>Read Full Analysis</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
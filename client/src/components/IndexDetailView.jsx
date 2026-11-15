import React, { useEffect, useRef, useState } from 'react';
import { createChart, LineSeries } from 'lightweight-charts';
import { Bell, Bookmark, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import axios from 'axios';

export default function IndexDetailView({ indexSymbol = '^NSEI', onSelectStock }) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [indexData, setIndexData] = useState({
    name: 'NIFTY 50',
    livePrice: 0,
    dayChange: 0,
    dayChangePercent: 0,
    candles: [],
    sidebarItems: []
  });
  const [timeframe, setTimeframe] = useState('6M');
  const [loading, setLoading] = useState(false);

  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', '3Y', '5Y', 'ALL'];

  const indicesList = [
    { name: 'Nifty 50', symbol: '^NSEI' },
    { name: 'Sensex', symbol: '^BSESN' },
    { name: 'Bank Nifty', symbol: '^NSEBANK' },
    { name: 'Nifty IT', symbol: '^CNXIT' },
  ];

  useEffect(() => {
    const fetchIndexDetails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/stocks/index/${encodeURIComponent(indexSymbol)}`);
        if (res.data) {
          setIndexData(res.data);
        }
      } catch (err) {
        console.error('Error loading index overview:', err);
      }
      setLoading(false);
    };

    fetchIndexDetails();
  }, [indexSymbol, timeframe]);

  useEffect(() => {
    if (!chartContainerRef.current || !indexData.candles || indexData.candles.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    const isPositive = indexData.dayChange >= 0;
    const lineColor = isPositive ? '#00b386' : '#eb5b3c';

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 650,
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
      timeScale: { borderColor: '#242b3d' },
    });

    chartInstanceRef.current = chart;

    const lineSeries = chart.addSeries(LineSeries, {
      color: lineColor,
      lineWidth: 2.5,
      priceLineVisible: false,
    });

    lineSeries.setData(indexData.candles);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
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
  }, [indexData, timeframe]);

  const isPositive = indexData.dayChange >= 0;

  return (
    <div className="space-y-6">
      {/* Index Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {indicesList.map((idx) => (
          <button
            key={idx.symbol}
            onClick={() => {
              if (onSelectStock) onSelectStock(idx.symbol);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              indexSymbol === idx.symbol
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-[#131722] text-gray-300 hover:bg-[#1a2233] border border-[#2a3040]'
            }`}
          >
            {idx.name}
          </button>
        ))}
      </div>

      {/* Main 2-Column Groww Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (8 Cols): Index Header & Technical Chart */}
        <div className="lg:col-span-8 bg-[#131722] p-6 rounded-2xl border border-[#222838]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                {indexData.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-white">
                  ₹{indexData.livePrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className={`text-sm font-bold flex items-center gap-1 ${isPositive ? 'text-[#00b386]' : 'text-[#eb5b3c]'}`}>
                  {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {isPositive ? '+' : ''}{indexData.dayChange} ({isPositive ? '+' : ''}{indexData.dayChangePercent}%) 1D
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-full border border-[#2a3040] text-gray-400 hover:text-white transition cursor-pointer" title="Create Alert">
                <Bell className="w-4 h-4" />
              </button>
              <button className="p-2.5 rounded-full border border-[#2a3040] text-gray-400 hover:text-emerald-400 transition cursor-pointer" title="Watchlist">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="relative min-h-[380px] w-full my-2">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#131722]/70 z-10 text-sm text-gray-400">
                Loading index data...
              </div>
            )}
            <div ref={chartContainerRef} className="w-full" />
          </div>

          {/* Timeframe Selector Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-4 mt-2 border-t border-[#1e2433]">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  timeframe === tf
                    ? 'border border-emerald-400 text-emerald-400 bg-emerald-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-[#1c2230]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN (4 Cols): Top Index Options / Constituents Sidebar */}
        <div className="lg:col-span-4 bg-[#131722] rounded-2xl border border-[#222838] overflow-hidden">
          <div className="p-4 border-b border-[#222838] bg-[#181d28]">
            <h2 className="font-bold text-white text-sm">Top {indexData.name} Options & Constituents</h2>
          </div>
          <div className="divide-y divide-[#1e2433]">
            {indexData.sidebarItems && indexData.sidebarItems.length > 0 ? (
              indexData.sidebarItems.map((item, index) => (
                <div key={index} className="p-4 flex items-center justify-between hover:bg-[#1a2233] transition cursor-pointer">
                  <div>
                    <h3 className="text-xs font-bold text-white">{item.title}</h3>
                    <span className="text-[10px] text-gray-400">Active derivative contract</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{item.price}</div>
                    <div className={`text-xs font-semibold ${item.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.change}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-gray-400">No options data available for this index.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
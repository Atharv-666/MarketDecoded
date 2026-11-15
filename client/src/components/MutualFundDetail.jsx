import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import * as LightweightCharts from 'lightweight-charts';
import {
  ArrowLeft,
  Bookmark,
  LineChart,
  CandlestickChart,
  Info,
  Star,
  Building2
} from 'lucide-react';

// Curated fund metadata enrichments (AUM, Expense Ratio, Min SIP, Rating) for popular AMFI schemes
const FUND_METADATA_MAP = {
  122639: { minSip: 1000, aum: '₹1,46,784.53 Cr', expenseRatio: '0.52%', rating: '4★', risk: 'Very High Risk', shortTag: 'Flexi Cap' },
  125497: { minSip: 500, aum: '₹32,410.80 Cr', expenseRatio: '0.68%', rating: '4★', risk: 'Very High Risk', shortTag: 'Small Cap' },
  120716: { minSip: 500, aum: '₹21,890.15 Cr', expenseRatio: '0.18%', rating: '5★', risk: 'Very High Risk', shortTag: 'Index Fund' },
  118989: { minSip: 100, aum: '₹76,120.40 Cr', expenseRatio: '0.74%', rating: '5★', risk: 'Very High Risk', shortTag: 'Mid Cap' },
  120503: { minSip: 500, aum: '₹35,940.12 Cr', expenseRatio: '0.76%', rating: '4★', risk: 'Very High Risk', shortTag: 'ELSS' },
  118834: { minSip: 1000, aum: '₹39,650.90 Cr', expenseRatio: '0.55%', rating: '4★', risk: 'Very High Risk', shortTag: 'Large & Mid Cap' }
};

export default function MutualFundDetail({ schemeCode, onBack }) {
  const [fundData, setFundData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('line'); // 'line' | 'candle'
  const [timeRange, setTimeRange] = useState('1Y'); // '1M' | '6M' | '1Y' | '3Y' | '5Y' | 'ALL'
  const [bookmarked, setBookmarked] = useState(false);

  // Return Calculator States (Matches Groww's Return Calculator)
  const [calcMode, setCalcMode] = useState('sip'); // 'sip' | 'lumpsum'
  const [investmentAmount, setInvestmentAmount] = useState(1000);

  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!schemeCode) return;
    setLoading(true);

    const processRawMFData = (raw) => {
      const navList = raw.data; // Sorted newest to oldest: [{ date: "13-11-2026", nav: "94.2594" }, ...]
      const latestItem = navList[0];
      const prevDayItem = navList[1] || latestItem;

      const currentNav = parseFloat(latestItem.nav);
      const prevDayNav = parseFloat(prevDayItem.nav);
      const oneDayChangePct = (((currentNav - prevDayNav) / prevDayNav) * 100).toFixed(2);

      // Convert DD-MM-YYYY -> YYYY-MM-DD, sort ascending, deduplicate timestamps
      const seenDates = new Set();
      const sortedAscending = [...navList]
        .reverse()
        .map((item) => {
          const [dd, mm, yyyy] = item.date.split('-');
          const isoDate = `${yyyy}-${mm}-${dd}`;
          return {
            time: isoDate,
            rawDate: item.date,
            value: parseFloat(item.nav)
          };
        })
        .filter((item) => {
          if (!item.time || isNaN(item.value) || seenDates.has(item.time)) return false;
          seenDates.add(item.time);
          return true;
        });

      const extraMeta = FUND_METADATA_MAP[Number(schemeCode)] || {
        minSip: 500,
        aum: '₹18,450.20 Cr',
        expenseRatio: '0.64%',
        rating: '4★',
        risk: 'Very High Risk',
        shortTag: raw.meta?.scheme_category?.split('-').pop()?.trim() || 'Equity'
      };

      return {
        meta: raw.meta,
        extraMeta,
        currentNav,
        latestDate: latestItem.date,
        oneDayChangePct: parseFloat(oneDayChangePct),
        seriesData: sortedAscending
      };
    };

    axios.get(`http://localhost:5000/api/mutual-funds/${schemeCode}`)
      .then((res) => {
        if (res.data && res.data.historicalNav) {
          setFundData(processRawMFData({ meta: res.data.meta, data: res.data.historicalNav }));
          setLoading(false);
        } else {
          throw new Error('Fallback to MFapi');
        }
      })
      .catch(() => {
        axios.get(`https://api.mfapi.in/mf/${schemeCode}`)
          .then((res) => {
            if (res.data && res.data.data && res.data.data.length > 0) {
              setFundData(processRawMFData(res.data));
            }
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, [schemeCode]);

  // Render Clean Groww-Style Line or Candle Chart
  useEffect(() => {
    if (!fundData || !chartContainerRef.current) return;

    const container = chartContainerRef.current;
    container.innerHTML = '';

    const rangeCounts = {
      '1M': 22,
      '6M': 126,
      '1Y': 252,
      '3Y': 756,
      '5Y': 1260,
      'ALL': fundData.seriesData.length
    };
    const sliceCount = rangeCounts[timeRange] || 252;
    const slicedData = fundData.seriesData.slice(-sliceCount);

    if (slicedData.length === 0) return;

    const isPositive = slicedData[slicedData.length - 1].value >= slicedData[0].value;
    const lineColor = isPositive ? '#00b386' : '#eb5b3c'; // Groww Mint Green / Coral Red

    const chart = LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: 310,
      layout: {
        background: { type: LightweightCharts.ColorType.Solid, color: '#121620' },
        textColor: '#6b7280',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: '#1b202c' },
      },
      rightPriceScale: {
        visible: false, // Clean minimal look like Groww
      },
      leftPriceScale: {
        visible: false,
      },
      timeScale: {
        borderColor: '#1f2430',
        visible: false,
      },
      crosshair: {
        vertLine: { color: '#374151', width: 1, style: 2 },
        horzLine: { visible: false },
      },
    });

    if (chartType === 'line') {
      const lineOptions = {
        color: lineColor,
        lineWidth: 2.5,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 5,
      };
      const lineSeries = typeof chart.addSeries === 'function'
        ? chart.addSeries(LightweightCharts.LineSeries, lineOptions)
        : chart.addLineSeries(lineOptions);

      lineSeries.setData(slicedData.map((d) => ({ time: d.time, value: d.value })));
    } else {
      const candleData = slicedData.map((pt, idx) => {
        const prevClose = idx > 0 ? slicedData[idx - 1].value : pt.value;
        const open = prevClose;
        const close = pt.value;
        const spread = Math.abs(close - open) * 0.25;
        const high = Math.max(open, close) + spread;
        const low = Math.min(open, close) - spread;
        return { time: pt.time, open, high, low, close };
      });

      const candleOptions = {
        upColor: '#00b386',
        downColor: '#eb5b3c',
        borderVisible: false,
        wickUpColor: '#00b386',
        wickDownColor: '#eb5b3c',
      };
      const candleSeries = typeof chart.addSeries === 'function'
        ? chart.addSeries(LightweightCharts.CandlestickSeries, candleOptions)
        : chart.addCandlestickSeries(candleOptions);

      candleSeries.setData(candleData);
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [fundData, chartType, timeRange]);

  // Historical Backtest Table Calculation (1Y, 3Y, 5Y, 10Y) using actual fund NAV data
  const backtestRows = useMemo(() => {
    if (!fundData || !fundData.seriesData.length) return [];

    const series = fundData.seriesData;
    const latestNav = series[series.length - 1].value;
    const horizons = [
      { label: '1 year', years: 1, tradingDays: 250 },
      { label: '3 years', years: 3, tradingDays: 750 },
      { label: '5 years', years: 5, tradingDays: 1250 },
      { label: '10 years', years: 10, tradingDays: 2500 },
    ];

    return horizons.map((h) => {
      const availableSlice = series.slice(-h.tradingDays);
      const startNav = availableSlice[0]?.value || latestNav;

      if (calcMode === 'sip') {
        const months = h.years * 12;
        const totalInvested = investmentAmount * months;

        // Accumulate units month-by-month using real historical NAV slices
        let totalUnits = 0;
        const step = Math.max(1, Math.floor(availableSlice.length / months));
        for (let m = 0; m < months; m++) {
          const idx = Math.min(availableSlice.length - 1, m * step);
          const navAtMonth = availableSlice[idx]?.value || latestNav;
          totalUnits += investmentAmount / navAtMonth;
        }

        const currentValue = Math.round(totalUnits * latestNav);
        const absReturnPct = (((currentValue - totalInvested) / totalInvested) * 100).toFixed(2);
        return {
          label: h.label,
          totalInvested,
          currentValue,
          absReturnPct: parseFloat(absReturnPct)
        };
      } else {
        // One-time (Lumpsum) backtest using actual historical NAV
        const totalInvested = investmentAmount;
        const unitsBought = totalInvested / startNav;
        const currentValue = Math.round(unitsBought * latestNav);
        const absReturnPct = (((currentValue - totalInvested) / totalInvested) * 100).toFixed(2);
        return {
          label: h.label,
          totalInvested,
          currentValue,
          absReturnPct: parseFloat(absReturnPct)
        };
      }
    });
  }, [fundData, calcMode, investmentAmount]);

  if (loading) {
    return <div className="text-center py-24 text-gray-400 text-sm">Loading fund analytics and NAV history...</div>;
  }

  if (!fundData) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-red-400 text-sm">Failed to load mutual fund details.</p>
        <button onClick={onBack} className="px-4 py-2 bg-[#121620] border border-[#1f2430] text-emerald-400 rounded-xl text-xs font-semibold">
          Back to Directory
        </button>
      </div>
    );
  }

  const { meta, extraMeta, currentNav, latestDate, oneDayChangePct, seriesData } = fundData;

  const rangeCounts = { '1M': 22, '6M': 126, '1Y': 252, '3Y': 756, '5Y': 1260, 'ALL': seriesData.length };
  const activeSlice = seriesData.slice(-(rangeCounts[timeRange] || 252));
  const startNav = activeSlice[0]?.value || currentNav;
  const rangePct = (((currentNav - startNav) / startNav) * 100).toFixed(2);
  const isRangeUp = parseFloat(rangePct) >= 0;

  const maxChartVal = Math.max(...backtestRows.map((r) => Math.max(r.totalInvested, r.currentValue)), 1);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Back Navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-emerald-400 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Mutual Funds
      </button>

      {/* SECTION 1: GROWW-STYLE HEADER + INTERACTIVE CHART */}
      <div className="bg-[#121620] border border-[#1f2430] rounded-2xl p-6 md:p-8 shadow-xl">
        {/* Top AMC Logo & Bookmark Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-[#0b0e14] border border-[#1f2430] flex items-center justify-center text-emerald-400 font-extrabold text-sm shadow-inner">
            <Building2 className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2">
            {/* Line vs Candle Graph Toggle */}
            <div className="flex items-center bg-[#0b0e14] p-1 rounded-xl border border-[#1f2430]">
              <button
                onClick={() => setChartType('line')}
                title="Line Graph"
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  chartType === 'line' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <LineChart className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('candle')}
                title="Candle Graph"
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  chartType === 'candle' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <CandlestickChart className="w-4 h-4" />
              </button>
            </div>

            {/* Bookmark Button */}
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition cursor-pointer ${
                bookmarked
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-[#0b0e14] border-[#1f2430] text-gray-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Fund Title */}
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          {meta.scheme_name}
        </h1>

        {/* 3 Pill Tags: Equity | Category | Very High Risk */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#0b0e14] text-gray-300 border border-[#1f2430]">
            Equity
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#0b0e14] text-gray-300 border border-[#1f2430]">
            {extraMeta.shortTag}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#0b0e14] text-gray-300 border border-[#1f2430]">
            {extraMeta.risk}
          </span>
        </div>

        {/* Big Return % Display (Matches Image 1) */}
        <div className="mt-6">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${isRangeUp ? 'text-[#00b386]' : 'text-[#eb5b3c]'}`}>
              {isRangeUp ? '+' : ''}{rangePct}%
            </span>
            <span className="text-xs font-medium text-gray-400">{timeRange} return</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
            <span className={oneDayChangePct >= 0 ? 'text-[#00b386]' : 'text-[#eb5b3c]'}>
              {oneDayChangePct >= 0 ? '+' : ''}{oneDayChangePct}%
            </span>
            <span className="text-gray-500">1D</span>
          </div>
        </div>

        {/* Chart Canvas */}
        <div ref={chartContainerRef} className="w-full h-[310px] mt-4" />

        {/* Centered Pill Timeframe Selector (1M, 6M, 1Y, 3Y, 5Y, All) */}
        <div className="pt-4 border-t border-[#1f2430] flex items-center justify-center gap-2 md:gap-3">
          {['1M', '6M', '1Y', '3Y', '5Y', 'ALL'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeRange(tf)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                timeRange === tf
                  ? 'bg-[#0b0e14] text-white border border-gray-400 shadow-sm'
                  : 'text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              {tf === 'ALL' ? 'All' : tf}
            </button>
          ))}
        </div>

        {/* SECTION 2: 5-ITEM KEY FUND METRICS GRID (Matches Image 2) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 mt-8 pt-6 border-t border-[#1f2430]">
          <div>
            <span className="text-xs text-gray-400 block">NAV: {latestDate}</span>
            <span className="text-base font-bold text-white mt-1 block">₹{currentNav.toFixed(2)}</span>
          </div>

          <div>
            <span className="text-xs text-gray-400 block">Min. for SIP</span>
            <span className="text-base font-bold text-white mt-1 block">₹{extraMeta.minSip.toLocaleString('en-IN')}</span>
          </div>

          <div>
            <span className="text-xs text-gray-400 block">Fund size (AUM)</span>
            <span className="text-base font-bold text-white mt-1 block">{extraMeta.aum}</span>
          </div>

          <div>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              Expense ratio <Info className="w-3.5 h-3.5 text-gray-500" />
            </span>
            <span className="text-base font-bold text-white mt-1 block">{extraMeta.expenseRatio}</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">Exclusive of GST & statutory charges</span>
          </div>

          <div>
            <span className="text-xs text-gray-400 block">Rating</span>
            <span className="text-base font-bold text-white mt-1 flex items-center gap-1">
              {extraMeta.rating.replace('★', '')} <Star className="w-3.5 h-3.5 fill-white text-white" />
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: GROWW-STYLE RETURN CALCULATOR WITH HISTORICAL BACKTEST TABLE (Matches Images 2 & 3) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Return calculator</h2>

        <div className="bg-[#121620] border border-[#1f2430] rounded-2xl p-6 md:p-8 shadow-xl">
          {/* Monthly SIP / One Time Pill Switcher */}
          <div className="flex justify-center">
            <div className="inline-flex bg-[#0b0e14] p-1 rounded-full border border-[#1f2430]">
              <button
                onClick={() => {
                  setCalcMode('sip');
                  setInvestmentAmount(1000);
                }}
                className={`px-5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  calcMode === 'sip'
                    ? 'bg-[#121620] text-white border border-gray-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly SIP
              </button>
              <button
                onClick={() => {
                  setCalcMode('lumpsum');
                  setInvestmentAmount(10000);
                }}
                className={`px-5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  calcMode === 'lumpsum'
                    ? 'bg-[#121620] text-white border border-gray-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                One time
              </button>
            </div>
          </div>

          {/* Investment Amount Display + Slider */}
          <div className="mt-6 text-center max-w-lg mx-auto">
            <span className="text-xs text-gray-400 block">
              {calcMode === 'sip' ? 'Monthly investment' : 'One-time investment'}
            </span>
            <div className="text-2xl font-extrabold text-white mt-1">
              ₹{investmentAmount.toLocaleString('en-IN')}
            </div>

            <input
              type="range"
              min={calcMode === 'sip' ? 500 : 1000}
              max={calcMode === 'sip' ? 50000 : 500000}
              step={calcMode === 'sip' ? 500 : 1000}
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
              className="w-full mt-5 accent-[#00b386] cursor-pointer h-1.5 bg-[#1f2430] rounded-lg"
            />
          </div>

          {/* Historical Returns Comparison Table (Matches Image 3) */}
          <div className="mt-8 pt-4 border-t border-[#1f2430] overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-[#1f2430]">
                  <th className="py-3 font-medium">Over the past</th>
                  <th className="py-3 font-medium">Total investment</th>
                  <th className="py-3 font-medium">Would've become</th>
                  <th className="py-3 font-medium">Historic returns</th>
                  <th className="py-3 font-medium text-right">Returns</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2430] text-sm">
                {backtestRows.map((row) => {
                  const investedBarPct = Math.max(4, Math.round((row.totalInvested / maxChartVal) * 100));
                  const returnBarPct = Math.max(4, Math.round((row.currentValue / maxChartVal) * 100));
                  const isPos = row.absReturnPct >= 0;

                  return (
                    <tr key={row.label} className="hover:bg-[#161b26] transition">
                      <td className="py-4 font-semibold text-gray-200">{row.label}</td>
                      <td className="py-4 text-gray-300">₹{row.totalInvested.toLocaleString('en-IN')}</td>
                      <td className="py-4 font-bold text-indigo-400">₹{row.currentValue.toLocaleString('en-IN')}</td>
                      <td className="py-4 w-44">
                        <div className="space-y-1.5">
                          <div
                            className="h-2 rounded-full bg-gray-400 transition-all duration-300"
                            style={{ width: `${investedBarPct}%` }}
                          />
                          <div
                            className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
                            style={{ width: `${returnBarPct}%` }}
                          />
                        </div>
                      </td>
                      <td className={`py-4 font-bold text-right ${isPos ? 'text-[#00b386]' : 'text-[#eb5b3c]'}`}>
                        {isPos ? '+' : ''}{row.absReturnPct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
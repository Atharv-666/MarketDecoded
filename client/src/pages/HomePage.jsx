import React from 'react';
import {
  ArrowRight,
  TrendingUp,
  Layers,
  Calculator,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function HomePage({ onNavigate, onSelectStock }) {
  const popularTickers = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: '₹1,377.50', change: '+1.44%' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', price: '₹2,376.20', change: '+0.80%' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', price: '₹1,745.80', change: '+1.08%' },
    { symbol: 'INFY.NS', name: 'Infosys', price: '₹1,098.00', change: '-0.75%' },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Stock Charts',
      description: 'See how stock prices move over days, months, or years on easy-to-read charts.',
      points: [
        'Check start price vs. latest price',
        'View simple gains and % returns',
        'Spot basic company numbers like P/E and market size',
      ],
      buttonText: 'View Stocks',
      tab: 'stocks',
    },
    {
      icon: Layers,
      title: 'Mutual Funds',
      description: 'Browse Indian mutual funds and check past growth without complicated terms.',
      points: [
        'Search thousands of funds easily',
        'See daily NAV and past returns',
        'Filter by categories like Small Cap or Index',
      ],
      buttonText: 'Browse Funds',
      tab: 'mutual-funds',
    },
    {
      icon: Calculator,
      title: 'SIP Calculator',
      description: 'See how a small monthly investment can grow over time.',
      points: [
        'Pick your monthly amount and years',
        'Compare total money put in vs. growth',
        'Great for planning long-term goals',
      ],
      buttonText: 'Open SIP Calculator',
      tab: 'sip',
    },
  ];

  const faqs = [
    {
      q: 'Do I need a Demat account or KYC to use this site?',
      a: 'No. You can explore charts, mutual funds, and the SIP calculator right away without sharing personal or bank details.',
    },
    {
      q: 'Can I buy or sell stocks directly here?',
      a: 'No. This page is only for learning and checking market data—not for placing real trades.',
    },
    {
      q: 'What does a timeframe like 6M or 1Y return show?',
      a: 'It compares the price at the start of that period with the latest price so you can see how much it went up or down.',
    },
  ];

  const handleTickerClick = (symbol) => {
    if (onSelectStock) {
      onSelectStock(symbol);
    } else if (onNavigate) {
      onNavigate('stocks');
    }
  };

  return (
    <div className="space-y-20 py-10 md:py-14">
      {/* 1. HERO SECTION */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Simple Market Learning Space
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
          Learn how stocks and funds move,{' '}
          <span className="text-emerald-400">step by step.</span>
        </h1>

        <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Market Decoded helps beginners check stock charts, explore mutual funds, and try SIP calculations in one clean place.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('stocks')}
            className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm flex items-center gap-2 transition cursor-pointer"
          >
            Explore Stocks <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('mutual-funds')}
            className="px-6 py-3.5 rounded-xl bg-[#121620] hover:bg-[#181f2c] text-white border border-[#262d3d] font-semibold text-sm transition cursor-pointer"
          >
            Browse Mutual Funds
          </button>
          <button
            onClick={() => onNavigate('sip')}
            className="px-6 py-3.5 rounded-xl bg-[#121620] hover:bg-[#181f2c] text-emerald-400 border border-emerald-500/30 font-semibold text-sm transition cursor-pointer"
          >
            Try SIP Calculator
          </button>
        </div>

        {/* POPULAR STOCKS */}
        <div className="pt-6">
          <p className="text-xs text-gray-500 mb-3">
            Tap a familiar company to start:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {popularTickers.map((item) => {
              const isNegative = item.change.startsWith('-');
              return (
                <button
                  key={item.symbol}
                  onClick={() => handleTickerClick(item.symbol)}
                  className="bg-[#121620] hover:bg-[#181f2c] border border-[#1f2430] hover:border-emerald-500/40 px-4 py-2.5 rounded-xl flex items-center gap-3 transition cursor-pointer text-left"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {item.symbol.replace('.NS', '')}
                    </span>
                    <span className="text-[11px] text-gray-400">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">{item.price}</span>
                    <span
                      className={`text-[11px] font-semibold ${
                        isNegative ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {item.change}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. THREE MAIN TOOLS */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Three Simple Tools</h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Start with whichever topic you want to understand first.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-[#121620] border border-[#1f2430] rounded-2xl p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                  <ul className="space-y-2 pt-2 text-xs text-gray-300">
                    {item.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onNavigate(item.tab)}
                  className="w-full py-2.5 rounded-xl bg-[#0b0e14] hover:bg-emerald-500 text-gray-200 hover:text-gray-950 font-semibold text-xs border border-[#222838] hover:border-emerald-500 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {item.buttonText} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. QUICK QUESTIONS */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-white">Quick Questions</h2>
          <p className="text-xs text-gray-400">Straight answers for first-time visitors</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="bg-[#121620] border border-[#1f2430] rounded-2xl p-5 space-y-1.5"
            >
              <h3 className="text-sm font-bold text-white">{faq.q}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BOTTOM CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="bg-[#121620] border border-[#1f2430] rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Ready to look around?
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
            Pick a stock chart or test a monthly SIP plan in seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              onClick={() => onNavigate('stocks')}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition cursor-pointer"
            >
              Open Stock Charts
            </button>
            <button
              onClick={() => onNavigate('sip')}
              className="px-6 py-3 rounded-xl bg-[#0b0e14] hover:bg-[#181f2c] text-white border border-[#262d3d] font-semibold text-xs transition cursor-pointer"
            >
              Try SIP Calculator
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
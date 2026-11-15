import React from 'react';
import { ArrowRight, TrendingUp, Layers, Calculator } from 'lucide-react';

export default function HomePage({ onNavigate }) {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24 space-y-24">
      
      {/* 1. HERO SECTION */}
      <section className="flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          🌱 Beginner-Friendly Financial Research Lab
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
          Track markets, decode news, <br />
          <span className="text-emerald-400">without the confusion.</span>
        </h1>

        <p className="text-gray-400 text-base sm:text-lg max-w-2xl leading-relaxed">
          Welcome to <strong className="text-white">Market Decoded</strong>. Explore live NSE/BSE stock charts, zero-commission mutual funds, and smart wealth calculators in one clean, zero-KYC platform.
        </p>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigate('stocks')}
            className="px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            Explore Stocks <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('mutual-funds')}
            className="px-7 py-3.5 rounded-xl bg-[#121620] hover:bg-[#1a202e] text-white border border-[#262d3d] font-semibold text-sm transition cursor-pointer"
          >
            Browse Mutual Funds
          </button>
          <button
            onClick={() => onNavigate('sip')}
            className="px-7 py-3.5 rounded-xl bg-[#121620] hover:bg-[#1a202e] text-white border border-[#262d3d] font-semibold text-sm transition cursor-pointer"
          >
            SIP Calculator
          </button>
        </div>
      </section>

      {/* 2. WHAT CAN YOU DO HERE? (3 SIMPLE PILLARS) */}
      <section className="space-y-10 pt-10 border-t border-[#1a1f2c]">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">What Can You Do Here?</h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Everything you need to learn smart investing, simplified into three tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div
            onClick={() => onNavigate('stocks')}
            className="bg-[#121620] border border-[#1f2430] hover:border-emerald-500/50 rounded-2xl p-6 cursor-pointer transition space-y-4 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
              Live Stock Terminal
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Analyze interactive candlestick charts, P/E ratios, and company fundamentals for major NSE and BSE equities instantly.
            </p>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 pt-2">
              Open Stocks <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onNavigate('mutual-funds')}
            className="bg-[#121620] border border-[#1f2430] hover:border-emerald-500/50 rounded-2xl p-6 cursor-pointer transition space-y-4 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
              Mutual Fund Directory
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Explore 14,000+ official AMFI schemes, compare zero-commission direct plans, and inspect historical NAV growth charts.
            </p>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 pt-2">
              Browse Funds <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => onNavigate('sip')}
            className="bg-[#121620] border border-[#1f2430] hover:border-emerald-500/50 rounded-2xl p-6 cursor-pointer transition space-y-4 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
              SIP Wealth Calculator
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Simulate monthly savings growth over 1 to 10 years using automatic historical CAGR return rates or custom percentages.
            </p>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 pt-2">
              Try Calculator <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
import React, { useState } from 'react';
import { Calculator, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

export default function SIPCalculator({ onNavigate }) {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturnRate, setExpectedReturnRate] = useState(14.0);
  const [timePeriodYears, setTimePeriodYears] = useState(5);

  const calculateSIP = () => {
    const monthlyRate = expectedReturnRate / 100 / 12;
    const months = timePeriodYears * 12;
    const investedAmount = monthlyInvestment * months;
    
    if (monthlyRate === 0) {
      return { invested: investedAmount, totalValue: investedAmount, estimatedReturns: 0 };
    }

    const totalValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const estimatedReturns = totalValue - investedAmount;

    return {
      invested: Math.round(investedAmount),
      totalValue: Math.round(totalValue),
      estimatedReturns: Math.round(estimatedReturns > 0 ? estimatedReturns : 0),
    };
  };

  const result = calculateSIP();

  return (
    <div className="min-h-screen bg-[#0b0e14] text-gray-100 font-sans py-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Wealth Planning</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2">
            SIP Wealth Calculator
          </h1>
          <p className="text-gray-400 text-xs md:text-sm">
            Calculate how small, regular monthly investments can grow into a massive corpus over time.
          </p>
        </div>

        <div className="bg-[#131722] border border-[#222838] rounded-2xl p-6 md:p-8 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-gray-300">Monthly Investment</label>
                <span className="text-sm font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                  ₹{monthlyInvestment.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="100000"
                step="500"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-[#0b0e14] cursor-pointer h-2 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>₹500</span>
                <span>₹1,00,000</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-gray-300">Expected Annual Return (CAGR)</label>
                <span className="text-sm font-extrabold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-lg border border-teal-500/20">
                  {expectedReturnRate}% p.a.
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={expectedReturnRate}
                onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
                className="w-full accent-teal-500 bg-[#0b0e14] cursor-pointer h-2 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>1%</span>
                <span>30%</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-gray-300">Time Period</label>
                <span className="text-sm font-extrabold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">
                  {timePeriodYears} {timePeriodYears === 1 ? 'Year' : 'Years'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={timePeriodYears}
                onChange={(e) => setTimePeriodYears(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-[#0b0e14] cursor-pointer h-2 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>1 Year</span>
                <span>30 Years</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0e14] border border-[#2a3040] rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider pb-3 border-b border-[#1e2433]">
              <TrendingUp className="w-4 h-4" /> Investment Summary
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Invested Amount:</span>
                <span className="text-sm font-bold text-white">₹{result.invested.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Est. Wealth Returns:</span>
                <span className="text-sm font-bold text-emerald-400">+ ₹{result.estimatedReturns.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#1e2433]">
                <span className="text-gray-300 font-bold text-sm">Total Value Corpus:</span>
                <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  ₹{result.totalValue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                Analyze Stocks & Test Returns
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
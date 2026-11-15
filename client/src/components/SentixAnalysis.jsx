import React from 'react';
import { Newspaper, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

export default function SentixAnalysis({ selectedStock = 'RELIANCE.NS' }) {
  const mockNews = [
    {
      id: 1,
      title: `${selectedStock.replace('.NS', '')} expands technology and retail investments`,
      summary: 'Strong quarter performance driven by volume growth and improved operating margins across key enterprise segments.',
      sentiment: 'Bullish',
      score: '+0.84',
      time: '2 hours ago',
      isPositive: true,
    },
    {
      id: 2,
      title: 'Global market consolidation impacts IT & Financial sectors',
      summary: 'Broader sector indexes show slight pullbacks amid foreign institutional investor (FII) rebalancing.',
      sentiment: 'Neutral',
      score: '0.00',
      time: '5 hours ago',
      isPositive: null,
    },
    {
      id: 3,
      title: 'Supply chain friction creates short-term pressure',
      summary: 'Analysts highlight minor margin compression due to raw material price variations over the last month.',
      sentiment: 'Bearish',
      score: '-0.42',
      time: '1 day ago',
      isPositive: false,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto bg-[#131722] p-6 md:p-8 rounded-2xl border border-[#2a3040] shadow-2xl">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#2a3040]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Sentix AI Sentiment Analysis</h2>
            <p className="text-xs text-gray-400">Real-time Gemini AI sentiment markers for <strong className="text-white">{selectedStock}</strong></p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          Live Model
        </div>
      </div>

      <div className="space-y-4">
        {mockNews.map((news) => (
          <div key={news.id} className="bg-[#181d28] p-4 rounded-xl border border-[#2a3040] hover:border-cyan-500/40 transition">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-white text-base">{news.title}</h3>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 ${
                news.isPositive === true
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : news.isPositive === false
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
              }`}>
                {news.isPositive === true && <ArrowUpRight className="w-3.5 h-3.5" />}
                {news.isPositive === false && <ArrowDownRight className="w-3.5 h-3.5" />}
                {news.sentiment} ({news.score})
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3">{news.summary}</p>
            <span className="text-[11px] text-gray-500">{news.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
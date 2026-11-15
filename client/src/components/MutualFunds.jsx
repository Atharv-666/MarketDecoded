import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, TrendingUp, ShieldCheck, ArrowRight, Sparkles, Layers, Calculator } from 'lucide-react';

// Curated Popular Indian Direct Mutual Funds (Real AMFI Scheme Codes - prevents blank screen!)
const POPULAR_FUNDS = [
  {
    schemeCode: 122639,
    schemeName: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',
    amc: 'PPFAS Mutual Fund',
    category: 'Flexi Cap',
    risk: 'Very High',
    return3Y: '21.4%',
    minSip: '₹1,000'
  },
  {
    schemeCode: 125497,
    schemeName: 'SBI Small Cap Fund - Direct Plan - Growth',
    amc: 'SBI Mutual Fund',
    category: 'Small Cap',
    risk: 'Very High',
    return3Y: '24.8%',
    minSip: '₹500'
  },
  {
    schemeCode: 120716,
    schemeName: 'UTI Nifty 50 Index Fund - Direct Plan - Growth',
    amc: 'UTI Mutual Fund',
    category: 'Index Fund',
    risk: 'Very High',
    return3Y: '15.2%',
    minSip: '₹500'
  },
  {
    schemeCode: 118989,
    schemeName: 'HDFC Mid-Cap Opportunities Fund - Direct Plan - Growth',
    amc: 'HDFC Mutual Fund',
    category: 'Mid Cap',
    risk: 'Very High',
    return3Y: '26.1%',
    minSip: '₹100'
  },
  {
    schemeCode: 120503,
    schemeName: 'Axis ELSS Tax Saver Fund - Direct Plan - Growth',
    amc: 'Axis Mutual Fund',
    category: 'Tax Saving (ELSS)',
    risk: 'Very High',
    return3Y: '16.5%',
    minSip: '₹500'
  },
  {
    schemeCode: 118834,
    schemeName: 'Mirae Asset Large & Midcap Fund - Direct Plan - Growth',
    amc: 'Mirae Asset',
    category: 'Large & Mid Cap',
    risk: 'Very High',
    return3Y: '19.8%',
    minSip: '₹1,000'
  }
];

const CATEGORIES = ['All', 'Flexi Cap', 'Small Cap', 'Mid Cap', 'Index Fund', 'Tax Saving (ELSS)'];

export default function MutualFunds({ onSelectFund }) {
  const [allFunds, setAllFunds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const searchRef = useRef(null);

  // Fetch full AMFI directory in background (with direct MFapi fallback if backend route isn't mounted yet)
  useEffect(() => {
    setLoadingDirectory(true);
    axios.get('http://localhost:5000/api/mutual-funds')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAllFunds(res.data);
        }
        setLoadingDirectory(false);
      })
      .catch(() => {
        // Fallback directly to MFapi.in if local backend route isn't running
        axios.get('https://api.mfapi.in/mf')
          .then(res => {
            setAllFunds(res.data || []);
            setLoadingDirectory(false);
          })
          .catch(() => setLoadingDirectory(false));
      });
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search across ALL 14,000+ AMFI funds, prioritizing "Direct" & "Growth" plans
  const searchResults = searchQuery.trim().length > 1
    ? allFunds
        .filter(f => f.schemeName && f.schemeName.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
          const aDirect = a.schemeName.toLowerCase().includes('direct') ? 1 : 0;
          const bDirect = b.schemeName.toLowerCase().includes('direct') ? 1 : 0;
          return bDirect - aDirect;
        })
        .slice(0, 10)
    : [];

  // Filter curated cards by category
  const displayedCards = selectedCategory === 'All'
    ? POPULAR_FUNDS
    : POPULAR_FUNDS.filter(f => f.category === selectedCategory);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero / Search Header Section (Matches HomePage Style) */}
      <div className="bg-gradient-to-br from-[#121620] via-[#131926] to-[#0e131d] border border-[#1f2430] rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> 
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Explore <span className="text-emerald-400">Mutual Funds</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Analyze live Net Asset Value (NAV), historical CAGR performance, and project long-term SIP wealth across top Indian AMCs.
          </p>

          {/* Sticky-style Autocomplete Search Bar */}
          <div ref={searchRef} className="relative mt-6">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search 14,000+ mutual funds (e.g., Parag Parikh, SBI Small Cap, Nifty 50)..."
                value={searchQuery}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                className="w-full bg-[#0b0e14] border border-[#262d3d] text-white text-sm pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Instant Search Dropdown */}
            {showDropdown && searchQuery.trim().length > 1 && (
              <div className="absolute left-0 right-0 mt-2 bg-[#121620] border border-[#262d3d] rounded-xl shadow-2xl z-40 max-h-80 overflow-y-auto divide-y divide-[#1f2430]">
                {loadingDirectory ? (
                  <div className="p-4 text-xs text-gray-400">Searching AMFI directory...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((fund) => (
                    <div
                      key={fund.schemeCode}
                      onClick={() => {
                        setShowDropdown(false);
                        onSelectFund(fund.schemeCode);
                      }}
                      className="px-4 py-3 hover:bg-[#1a202e] cursor-pointer flex items-center justify-between gap-4 transition"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-100">{fund.schemeName}</p>
                        <span className="text-[11px] text-gray-500">AMFI Code: {fund.schemeCode}</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 shrink-0 flex items-center gap-1">
                        Analyze <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-xs text-gray-400">No matching mutual fund found for "{searchQuery}".</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-gray-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-[#121620] text-gray-400 border border-[#1f2430] hover:text-white hover:border-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500">Showing {displayedCards.length} Popular Funds</span>
      </div>

      {/* Popular Mutual Funds Grid (Groww-Inspired Cards) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h2 className="text-base font-bold text-white">Popular Direct Mutual Funds</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedCards.map((fund) => (
            <div
              key={fund.schemeCode}
              onClick={() => onSelectFund(fund.schemeCode)}
              className="bg-[#121620] border border-[#1f2430] hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between group hover:shadow-lg hover:shadow-emerald-500/5"
            >
              <div>
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                    {fund.category}
                  </span>
                  <span className="text-[11px] text-gray-400 bg-[#0b0e14] px-2.5 py-1 rounded-lg border border-[#1f2430]">
                    {fund.risk} Risk
                  </span>
                </div>

                {/* Fund Title & AMC */}
                <h3 className="text-sm font-bold text-gray-100 group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {fund.schemeName}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{fund.amc}</p>
              </div>

              {/* Bottom Metrics Row */}
              <div className="mt-5 pt-4 border-t border-[#1f2430] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-500 block">3Y Annualized</span>
                  <span className="text-base font-extrabold text-emerald-400">{fund.return3Y}</span>
                </div>
                <div className="text-center">
                  <span className="text-[11px] text-gray-500 block">Min. SIP</span>
                  <span className="text-xs font-bold text-gray-200">{fund.minSip}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-300 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">
                  Details <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Info Cards (Matches Home Page Feature Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-[#121620] border border-[#1f2430] p-5 rounded-2xl flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Direct Plans Only</h4>
            <p className="text-xs text-gray-400 mt-1">Track Direct-Growth NAVs with zero distributor commissions for higher long-term compounding.</p>
          </div>
        </div>

        <div className="bg-[#121620] border border-[#1f2430] p-5 rounded-2xl flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Live AMFI Data Pipeline</h4>
            <p className="text-xs text-gray-400 mt-1">Real-time scheme codes, daily Net Asset Values, and historical performance synced via AMFI.</p>
          </div>
        </div>

        <div className="bg-[#121620] border border-[#1f2430] p-5 rounded-2xl flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Built-in SIP Modeling</h4>
            <p className="text-xs text-gray-400 mt-1">Click any fund card to inspect its historical NAV and simulate monthly SIP wealth growth.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
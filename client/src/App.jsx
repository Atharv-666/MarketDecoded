import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import Stocks from './components/Stocks';
import StockChart from './components/StockChart';
import IndexDetailView from './components/IndexDetailView';
import SIPCalculator from './components/SIPCalculator';
import MutualFunds from './components/MutualFunds';
import MutualFundDetail from './components/MutualFundDetail';
import { LogOut, UserCheck, ArrowLeft } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'stocks' | 'stock-detail' | 'mutual-funds' | 'mf-detail' | 'sip'
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE.NS');
  const [selectedSchemeCode, setSelectedSchemeCode] = useState(null);

  // Auth Modal & User State (JWT Ready)
  const [authModalMode, setAuthModalMode] = useState(null); // null | 'login' | 'signup'
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('md_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('md_user');
      }
    }
  }, []);

  const handleSelectStock = (symbol) => {
    setSelectedSymbol(symbol);
    setActiveTab('stock-detail');
  };

  const handleSelectFund = (schemeCode) => {
    setSelectedSchemeCode(schemeCode);
    setActiveTab('mf-detail');
  };

  const handleLogout = () => {
    localStorage.removeItem('md_token');
    localStorage.removeItem('md_user');
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-gray-100 flex flex-col">
      {/* Top Navbar: Brand | Stocks, Mutual Funds, SIP Calculator | Login & Sign Up */}
      <header className="border-b border-[#1f2430] bg-[#121620]/95 backdrop-blur-md px-4 md:px-8 py-3.5 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-50">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => setActiveTab('home')}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-sm">
            MD
          </div>
          <span className="font-extrabold text-lg text-white tracking-wider">
            MARKET<span className="text-emerald-400">DECODED</span>
          </span>
        </div>

        {/* Center Navigation Links: Stocks, Mutual Funds, SIP Calculator */}
        <nav className="flex items-center gap-6 md:gap-8 text-xs md:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('stocks')}
            className={`transition cursor-pointer ${
              activeTab === 'stocks' || activeTab === 'stock-detail'
                ? 'text-emerald-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Stocks
          </button>
          <button
            onClick={() => setActiveTab('mutual-funds')}
            className={`transition cursor-pointer ${
              activeTab === 'mutual-funds' || activeTab === 'mf-detail'
                ? 'text-emerald-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Mutual Funds
          </button>
          <button
            onClick={() => setActiveTab('sip')}
            className={`transition cursor-pointer ${
              activeTab === 'sip'
                ? 'text-emerald-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            SIP Calculator
          </button>
        </nav>

        {/* Right Side: Login & Sign Up Buttons (or Active User Badge) */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 bg-[#0b0e14] border border-[#1f2430] px-3 py-1.5 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <UserCheck className="w-4 h-4" />
                <span>{currentUser.name}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="text-gray-400 hover:text-red-400 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setAuthModalMode('login')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-200 hover:text-white bg-[#0b0e14] border border-[#262d3d] hover:border-gray-600 transition cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => setAuthModalMode('signup')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-950 bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && (
          <HomePage
            onSelectStock={handleSelectStock}
            onNavigate={setActiveTab}
            onOpenAuth={(mode) => setAuthModalMode(mode)}
            currentUser={currentUser}
            onAuthSuccess={(user) => {
              setCurrentUser(user);
              setAuthModalMode(null);
            }}
            authModalMode={authModalMode}
            onCloseAuth={() => setAuthModalMode(null)}
          />
        )}

        {activeTab === 'stocks' && (
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <Stocks onSelectStock={handleSelectStock} />
          </div>
        )}

        {activeTab === 'stock-detail' && (
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
            <button
              onClick={() => setActiveTab('stocks')}
              className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-emerald-400 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Stocks Directory
            </button>

            {selectedSymbol.startsWith('^') ? (
              <IndexDetailView
                indexSymbol={selectedSymbol}
                onSelectStock={setSelectedSymbol}
              />
            ) : (
              <StockChart initialSymbol={selectedSymbol} />
            )}
          </div>
        )}

        {activeTab === 'mutual-funds' && (
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <MutualFunds onSelectFund={handleSelectFund} />
          </div>
        )}

        {activeTab === 'mf-detail' && (
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <MutualFundDetail
              schemeCode={selectedSchemeCode}
              onBack={() => setActiveTab('mutual-funds')}
            />
          </div>
        )}

        {activeTab === 'sip' && (
          <div className="max-w-3xl mx-auto p-4 md:p-6 py-8">
            <SIPCalculator
              stockName="General Portfolio"
              symbol="PORTFOLIO"
              livePrice={0}
              defaultReturnRate={12}
            />
          </div>
        )}
      </main>
    </div>
  );
}
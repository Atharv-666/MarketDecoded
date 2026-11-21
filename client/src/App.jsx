import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import Stocks from './components/Stocks';
import StockChart from './components/StockChart';
import IndexDetailView from './components/IndexDetailView';
import SIPCalculator from './components/SIPCalculator';
import MutualFunds from './components/MutualFunds';
import MutualFundDetail from './components/MutualFundDetail';
import API from './api';
import { LogOut, UserCheck, ArrowLeft, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE.NS');
  const [selectedSchemeCode, setSelectedSchemeCode] = useState(null);

  const [authModalMode, setAuthModalMode] = useState(null); // null | 'login' | 'signup'
  const [currentUser, setCurrentUser] = useState(null);

  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

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

  const openAuthModal = (mode) => {
    setAuthError('');
    setAuthModalMode(mode);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);

    try {
      const endpoint = authModalMode === 'signup' ? '/auth/register' : '/auth/login';
      const payload =
        authModalMode === 'signup'
          ? { name: authName, email: authEmail, password: authPassword }
          : { email: authEmail, password: authPassword };

      const res = await API.post(endpoint, payload);
      if (res.data?.token) {
        localStorage.setItem('md_token', res.data.token);
      }
      if (res.data?.user) {
        localStorage.setItem('md_user', JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
      }
      setAuthName('');
      setAuthEmail('');
      setAuthPassword('');
      setAuthModalMode(null);
    } catch (err) {
      setAuthError(err.response?.data?.message || err.response?.data?.error || 'Authentication failed.');
    }

    setAuthSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-gray-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* TOP NOTIFICATION / LIVE MARKET TICKER BANNER */}
      <div className="bg-[#0e121a] border-b border-[#1b212d] py-1.5 px-4 text-[11px] text-gray-400 hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live NSE Data
          </span>
          <span className="text-gray-500">•</span>
          <span>Zero-Brokerage Research</span>
          <span className="text-gray-500">•</span>
          <span>14,000+ AMFI Mutual Funds</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-gray-300">NIFTY 50: <strong className="text-emerald-400">23,518.50 (+0.42%)</strong></span>
          <span className="text-gray-300">SENSEX: <strong className="text-emerald-400">77,580.30 (+0.38%)</strong></span>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <header className="border-b border-[#1f2430] bg-[#121620]/90 backdrop-blur-xl px-4 md:px-8 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* BRAND LOGO */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0b0e14] rounded-[11px] flex items-center justify-center font-black text-emerald-400 text-sm">
                MD
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-wider block leading-tight">
                MARKET<span className="text-emerald-400">DECODED</span>
              </span>
              <span className="text-[10px] text-gray-400 block tracking-normal">Financial Intelligence</span>
            </div>
          </div>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0b0e14]/70 p-1 rounded-xl border border-[#1f2430]">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#181f2c] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('stocks')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'stocks' || activeTab === 'stock-detail'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Stocks Terminal
            </button>
            <button
              onClick={() => setActiveTab('mutual-funds')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'mutual-funds' || activeTab === 'mf-detail'
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mutual Funds
            </button>
            <button
              onClick={() => setActiveTab('sip')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'sip'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              SIP Calculator
            </button>
          </nav>

          {/* RIGHT ACTION BUTTONS & USER PROFILE */}
          <div className="flex items-center gap-2.5">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-[#0b0e14] border border-[#1f2430] px-3.5 py-1.5 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">{currentUser.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="text-gray-400 hover:text-rose-400 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-[#0b0e14] border border-[#262d3d] hover:border-gray-500 transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-gray-950 bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <div className="md:hidden flex items-center justify-around pt-3 mt-2 border-t border-[#1f2430] text-[11px] font-semibold">
          <button
            onClick={() => setActiveTab('home')}
            className={`py-1 ${activeTab === 'home' ? 'text-emerald-400 font-bold' : 'text-gray-400'}`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('stocks')}
            className={`py-1 ${activeTab === 'stocks' || activeTab === 'stock-detail' ? 'text-emerald-400 font-bold' : 'text-gray-400'}`}
          >
            Stocks
          </button>
          <button
            onClick={() => setActiveTab('mutual-funds')}
            className={`py-1 ${activeTab === 'mutual-funds' || activeTab === 'mf-detail' ? 'text-purple-400 font-bold' : 'text-gray-400'}`}
          >
            Funds
          </button>
          <button
            onClick={() => setActiveTab('sip')}
            className={`py-1 ${activeTab === 'sip' ? 'text-amber-400 font-bold' : 'text-gray-400'}`}
          >
            Calculator
          </button>
        </div>
      </header>

      <main className="flex-1 w-full">
        {activeTab === 'home' && <HomePage onNavigate={setActiveTab} />}

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

            <StockChart initialSymbol={selectedSymbol} />
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
            <SIPCalculator onNavigate={setActiveTab} />
          </div>
        )}
      </main>

      {authModalMode && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-[#262d3d] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1f2430] pb-3">
              <h2 className="text-lg font-bold text-white">
                {authModalMode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </h2>
              <button
                onClick={() => setAuthModalMode(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authModalMode === 'signup' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#0b0e14] border border-[#262d3d] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#0b0e14] border border-[#262d3d] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0b0e14] border border-[#262d3d] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-gray-950 font-bold py-2.5 rounded-xl text-sm transition cursor-pointer"
              >
                {authSubmitting
                  ? 'Please wait...'
                  : authModalMode === 'signup'
                  ? 'Sign Up'
                  : 'Login'}
              </button>
            </form>

            <div className="text-center text-xs text-gray-400 pt-2 border-t border-[#1f2430]">
              {authModalMode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => openAuthModal('login')}
                    className="text-emerald-400 font-semibold hover:underline cursor-pointer"
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="text-emerald-400 font-semibold hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
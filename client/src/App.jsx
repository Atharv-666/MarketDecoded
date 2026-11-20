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
    <div className="min-h-screen bg-[#0b0e14] text-gray-100 flex flex-col">
      <header className="border-b border-[#1f2430] bg-[#121620]/95 backdrop-blur-md px-4 md:px-8 py-3.5 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-50">
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
              activeTab === 'sip' ? 'text-emerald-400' : 'text-gray-300 hover:text-white'
            }`}
          >
            SIP Calculator
          </button>
        </nav>

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
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-200 hover:text-white bg-[#0b0e14] border border-[#262d3d] hover:border-gray-600 transition cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-950 bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                Sign Up
              </button>
            </>
          )}
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
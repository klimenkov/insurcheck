import React, { useState } from 'react';
import { ShieldAlert, PlusCircle, Menu, X } from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, onOpenContribute, totalSaved }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formattedSaved = totalSaved
    ? `$${Math.round(totalSaved).toLocaleString()}`
    : '$32,450,800';

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('checker')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <ShieldAlert className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                InsurCheck
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                Ontario Beta
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => handleNavClick('checker')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'checker'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Sanity Check
            </button>
            <button
              onClick={() => handleNavClick('quotes')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'quotes'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Community Rates
            </button>
            <button
              onClick={() => handleNavClick('heatmap')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'heatmap'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>Territory Heat Map</span>
              <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                142 FSAs
              </span>
            </button>
            <button
              onClick={() => handleNavClick('insurers')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'insurers'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Insurance Reviews
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'contact'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Contact Us
            </button>
          </nav>

          {/* Action & Live Savings Pill + Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs font-medium text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Saved for Ontario drivers:</span>
              <strong className="text-white font-bold">{formattedSaved}</strong>
            </div>

            <button
              onClick={onOpenContribute}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Submit Your Rate</span>
              <span className="sm:hidden">Share</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 px-4 pt-3 pb-5 space-y-1.5 backdrop-blur-xl">
          <button
            onClick={() => handleNavClick('checker')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'checker'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            🚗 Sanity Check
          </button>
          <button
            onClick={() => handleNavClick('quotes')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'quotes'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            📊 Community Rates
          </button>
          <button
            onClick={() => handleNavClick('heatmap')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
              activeTab === 'heatmap'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <span>🗺️ Territory Heat Map</span>
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              142 FSAs
            </span>
          </button>
          <button
            onClick={() => handleNavClick('insurers')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'insurers'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            ⭐ Insurance Reviews
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'contact'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            📬 Contact Us
          </button>
        </div>
      )}
    </header>
  );
}

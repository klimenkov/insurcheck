import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { HeroBanner } from './components/HeroBanner.jsx';
import { SanityChecker } from './components/SanityChecker.jsx';
import { ResultCard } from './components/ResultCard.jsx';
import { CommunityQuotes } from './components/CommunityQuotes.jsx';
import { InsurerReviews } from './components/InsurerReviews.jsx';
import { TerritoryHeatMap } from './components/TerritoryHeatMap.jsx';
import { LeadModal } from './components/LeadModal.jsx';
import { trackEvent } from './analytics.js';
import { ContributeModal } from './components/ContributeModal.jsx';
import { FsraExplainerModal } from './components/FsraExplainerModal.jsx';
import { ContactUs } from './components/ContactUs.jsx';
import { AdminDashboard } from './components/AdminDashboard.jsx';
import { TermsOfUse } from './components/TermsOfUse.jsx';
import { PrivacyPolicy } from './components/PrivacyPolicy.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) return 'admin';
      if (path.startsWith('/terms')) return 'terms';
      if (path.startsWith('/privacy')) return 'privacy';
    }
    return 'checker';
  });
  const [stats, setStats] = useState(null);
  const [checkResult, setCheckResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [fsraModalOpen, setFsraModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let ignore = false;
    fetch('/api/stats')
      .then(res => res.json())
      .then(json => {
        if (!ignore && json.success) setStats(json.data);
      })
      .catch(console.error);

    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) setActiveTab('admin');
      else if (path.startsWith('/terms')) setActiveTab('terms');
      else if (path.startsWith('/privacy')) setActiveTab('privacy');
      else if (path.startsWith('/quotes')) setActiveTab('quotes');
      else if (path.startsWith('/heatmap')) setActiveTab('heatmap');
      else if (path.startsWith('/insurers')) setActiveTab('insurers');
      else if (path.startsWith('/contact')) setActiveTab('contact');
      else setActiveTab('checker');
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      ignore = true;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateTab = (tab, path) => {
    setActiveTab(tab);
    trackEvent('tab_viewed', { tab });
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path || (tab === 'checker' ? '/' : `/${tab}`));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCalculate = async (formData) => {
    setLoading(true);
    trackEvent('sanity_check_submitted', {
      vehicle_make: formData.vehicleMake,
      vehicle_model: formData.vehicleModel,
      is_estimating: Boolean(formData.isEstimating || formData.noCurrentInsurance)
    });
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        setCheckResult(json.data);
        trackEvent('sanity_check_completed', {
          city: json.data?.locationInfo?.city,
          verdict: json.data?.verdict,
          target_rate: json.data?.targetRate,
          monthly_difference: json.data?.monthlyDifference
        });
        fetchStats(); // update live counter
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('insurcheck:submission-created'));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenContribute={() => setContributeModalOpen(true)}
          totalSaved={stats?.total_money_saved}
        />

        {activeTab === 'checker' && (
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
            <HeroBanner stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <SanityChecker onCalculate={handleCalculate} loading={loading} />

              <div>
                {checkResult ? (
                  <ResultCard
                    result={checkResult}
                    onConnectBroker={() => {
                      trackEvent('broker_cta_clicked', { verdict: checkResult?.verdict });
                      setLeadModalOpen(true);
                    }}
                    onOpenFsraExplainer={() => setFsraModalOpen(true)}
                  />
                ) : (
                  <div className="border border-dashed border-slate-800 rounded-3xl p-8 text-center text-slate-500 bg-slate-900/30">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                      🚗
                    </div>
                    <h3 className="text-base font-bold text-slate-300">Your Sanity Check Results Will Appear Here</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Fill out the 5 basic inputs on the left to see if your Ontario insurer is charging a fair market price.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        {activeTab === 'quotes' && (
          <CommunityQuotes
            onOpenContribute={() => setContributeModalOpen(true)}
            onOpenFsraExplainer={() => setFsraModalOpen(true)}
          />
        )}

        {activeTab === 'heatmap' && (
          <TerritoryHeatMap onOpenContribute={() => setContributeModalOpen(true)} />
        )}

        {activeTab === 'insurers' && (
          <InsurerReviews />
        )}

        {activeTab === 'contact' && (
          <ContactUs />
        )}

        {activeTab === 'terms' && (
          <TermsOfUse onBack={() => navigateTab('checker', '/')} />
        )}

        {activeTab === 'privacy' && (
          <PrivacyPolicy onBack={() => navigateTab('checker', '/')} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            onExit={() => navigateTab('checker', '/')}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>InsurCheck Ontario • Open benchmark project designed for driver rate transparency.</p>
        <p className="mt-1">Not affiliated with FSRA or insurance providers. Estimates are for informational sanity-checks.</p>
        <p className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => navigateTab('terms', '/terms')}
            className="hover:text-slate-300 transition cursor-pointer"
          >
            Terms of Use
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => navigateTab('privacy', '/privacy')}
            className="hover:text-slate-300 transition cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => navigateTab('privacy', '/privacy')}
            className="hover:text-slate-300 transition cursor-pointer"
          >
            Cookie Preferences
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => navigateTab('admin', '/admin')}
            className="hover:text-slate-300 transition cursor-pointer"
          >
            Admin Portal
          </button>
        </p>
      </footer>

      {/* Modals */}
      <LeadModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        checkResult={checkResult}
      />
      <ContributeModal
        isOpen={contributeModalOpen}
        onClose={() => setContributeModalOpen(false)}
      />
      <FsraExplainerModal
        isOpen={fsraModalOpen}
        onClose={() => setFsraModalOpen(false)}
      />
    </div>
  );
}

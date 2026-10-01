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
import { AlertCircle } from 'lucide-react';

const pathToTab = (pathname) => {
  if (!pathname) return 'checker';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/terms')) return 'terms';
  if (pathname.startsWith('/privacy')) return 'privacy';
  if (pathname.startsWith('/rates') || pathname.startsWith('/quotes')) return 'quotes';
  if (pathname.startsWith('/map') || pathname.startsWith('/heatmap')) return 'heatmap';
  if (pathname.startsWith('/reviews') || pathname.startsWith('/insurers')) return 'insurers';
  if (pathname.startsWith('/contact')) return 'contact';
  return 'checker';
};

const tabToPath = (tab) => {
  switch (tab) {
    case 'quotes': return '/rates';
    case 'heatmap': return '/map';
    case 'insurers': return '/reviews';
    case 'contact': return '/contact';
    case 'terms': return '/terms';
    case 'privacy': return '/privacy';
    case 'admin': return '/admin';
    default: return '/';
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return pathToTab(window.location.pathname);
    }
    return 'checker';
  });

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [fsraModalOpen, setFsraModalOpen] = useState(false);

  // Lifted Calculator State (INS-61 Item 1)
  const [calculatorFormData, setCalculatorFormData] = useState({
    coverageLevel: '',
    postalCode: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    isEstimating: false,
    currentPremium: '',
    insuranceCompany: '',
    customInsuranceCompany: '',
    driverAge: '',
    yearsLicensed: '',
    cleanRecord: true,
    numberOfDrivers: 1,
    numberOfVehicles: 1,
    shareAnonymously: false
  });
  const [calculatorSnapshot, setCalculatorSnapshot] = useState(null);
  const [checkResult, setCheckResult] = useState(null);

  // Stale result detection (INS-61 Item 1)
  const isResultStale = Boolean(
    checkResult &&
    calculatorSnapshot &&
    (
      calculatorFormData.isEstimating !== calculatorSnapshot.isEstimating ||
      calculatorFormData.coverageLevel !== calculatorSnapshot.coverageLevel ||
      calculatorFormData.postalCode !== calculatorSnapshot.postalCode ||
      calculatorFormData.vehicleMake !== calculatorSnapshot.vehicleMake ||
      calculatorFormData.vehicleModel !== calculatorSnapshot.vehicleModel ||
      calculatorFormData.vehicleYear !== calculatorSnapshot.vehicleYear ||
      calculatorFormData.driverAge !== calculatorSnapshot.driverAge ||
      calculatorFormData.yearsLicensed !== calculatorSnapshot.yearsLicensed ||
      calculatorFormData.cleanRecord !== calculatorSnapshot.cleanRecord ||
      (!calculatorFormData.isEstimating && (
        calculatorFormData.currentPremium !== calculatorSnapshot.currentPremium ||
        calculatorFormData.insuranceCompany !== calculatorSnapshot.insuranceCompany ||
        calculatorFormData.customInsuranceCompany !== calculatorSnapshot.customInsuranceCompany
      ))
    )
  );

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
      setActiveTab(pathToTab(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      ignore = true;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateTab = (tab, explicitPath) => {
    setActiveTab(tab);
    trackEvent('tab_viewed', { tab });
    const targetPath = explicitPath || tabToPath(tab);
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCalculate = async (formData) => {
    setLoading(true);
    trackEvent('sanity_check_submitted', {
      vehicle_make: formData.vehicleMake,
      vehicle_model: formData.vehicleModel,
      is_estimating: Boolean(formData.isEstimating)
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
        setCalculatorSnapshot({ ...calculatorFormData });
        trackEvent('sanity_check_completed', {
          city: json.data?.locationInfo?.city,
          verdict: json.data?.verdict,
          target_rate: json.data?.targetRate,
          monthly_difference: json.data?.monthlyDifference
        });
        fetchStats(); // update live counter
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('insurcheck:submission-created'));

          // Mobile auto-scroll to result (INS-61 Item 11)
          if (window.innerWidth < 1024) {
            setTimeout(() => {
              const resultEl = document.getElementById('sanity-check-result');
              if (resultEl) {
                resultEl.scrollIntoView({ behavior: 'smooth' });
              }
            }, 150);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDetails = () => {
    if (typeof window !== 'undefined') {
      const formEl = document.getElementById('sanity-checker-form');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          navigateTab={navigateTab}
          onOpenContribute={() => setContributeModalOpen(true)}
          totalSaved={stats?.total_money_saved}
        />

        {activeTab === 'checker' && (
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
            <HeroBanner stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <SanityChecker
                formData={calculatorFormData}
                setFormData={setCalculatorFormData}
                onCalculate={handleCalculate}
                loading={loading}
              />

              <div>
                {isResultStale ? (
                  <div className="bg-amber-950/20 border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl backdrop-blur-xl">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-amber-200">
                      Your details have changed. Recalculate to update your result.
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                      You modified vehicle, location, coverage, or driver details since this estimate was generated. Recalculate to view your updated Ontario benchmark.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const form = document.getElementById('sanity-checker-form');
                        if (form) form.requestSubmit();
                      }}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      Recalculate Benchmark
                    </button>
                  </div>
                ) : checkResult ? (
                  <ResultCard
                    result={checkResult}
                    onConnectBroker={() => {
                      trackEvent('broker_cta_clicked', { verdict: checkResult?.verdict });
                      setLeadModalOpen(true);
                    }}
                    onOpenFsraExplainer={() => setFsraModalOpen(true)}
                    onEditDetails={handleEditDetails}
                  />
                ) : (
                  <div className="border border-dashed border-slate-800 rounded-3xl p-8 text-center text-slate-500 bg-slate-900/30">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                      🚗
                    </div>
                    <h3 className="text-base font-bold text-slate-300">Your Sanity Check Results Will Appear Here</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Fill out a few details on the left to see if your Ontario insurer is charging a fair market price.
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
        <p className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setFsraModalOpen(true)}
            className="hover:text-emerald-400 text-slate-400 transition cursor-pointer font-medium"
          >
            Actuarial Model ℹ️
          </button>
          <span>·</span>
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

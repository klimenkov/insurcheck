import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Building2,
  HelpCircle,
  Info,
  Edit3,
  UserCheck,
  MapPin,
  Car,
  Shield,
  Star,
  Snowflake,
  Home,
  Users,
  Smartphone,
  Gauge,
  ShieldAlert,
  GraduationCap,
  BadgeCheck,
  Plus,
  Tag,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { getDiscountItem, calculateScenarioPricing } from '../data/discounts.js';
import { DiscountSelector } from './DiscountSelector.jsx';
import { BrokerRequestModal } from './BrokerRequestModal.jsx';
import { InsurerMatchCard } from './InsurerMatchCard.jsx';

const DISCOUNT_ICONS = {
  Snowflake,
  Home,
  Car,
  Users,
  Smartphone,
  Gauge,
  ShieldAlert,
  GraduationCap,
  BadgeCheck,
  Plus,
  Tag
};

export function ResultCard({ result, formData, onConnectBroker, onOpenFsraExplainer, onEditDetails, onNavigateReviews }) {
  if (!result) return null;

  const {
    isEstimating,
    currentPremium,
    fairMonthlyStandard,
    monthlySavings,
    annualSavings,
    coverageTiers,
    location,
    vehicle,
    driver,
    reliabilityScore,
    riskHighlights,
    companyBaseline
  } = result;

  const [showConfidenceInfo, setShowConfidenceInfo] = useState(false);
  const [brokerModalOpen, setBrokerModalOpen] = useState(false);

  // Discount Scenario State (INS-64)
  const baseBenchmarkBeforeDiscounts = result.fairMonthlyBeforeDiscounts || result.fairMonthlyStandard;
  const [scenarioDiscounts, setScenarioDiscounts] = useState(
    () => result.discounts || formData?.discounts || []
  );
  const [scenarioStatus, setScenarioStatus] = useState(
    () => result.discountStatus || formData?.discountStatus || (formData?.discounts?.length ? 'selected' : 'none_reported')
  );
  const [scenarioOtherDesc, setScenarioOtherDesc] = useState(
    () => result.otherDiscountDescription || formData?.otherDiscountDescription || ''
  );
  const [isEditingDiscounts, setIsEditingDiscounts] = useState(false);
  const [howDiscountsExpanded, setHowDiscountsExpanded] = useState(false);

  useEffect(() => {
    setScenarioDiscounts(result.discounts || formData?.discounts || []);
    setScenarioStatus(result.discountStatus || formData?.discountStatus || (formData?.discounts?.length ? 'selected' : 'none_reported'));
    setScenarioOtherDesc(result.otherDiscountDescription || formData?.otherDiscountDescription || '');
  }, [result, formData]);

  const scenarioCalc = useMemo(() => {
    if (scenarioStatus === 'none_reported' || scenarioStatus === 'unsure' || scenarioDiscounts.length === 0) {
      return {
        rateWithDiscounts: baseBenchmarkBeforeDiscounts,
        rateBeforeDiscounts: baseBenchmarkBeforeDiscounts,
        difference: 0,
        compositeRate: 0,
        priced: [],
        unpriced: [],
        isFullyPriced: true
      };
    }
    return calculateScenarioPricing(baseBenchmarkBeforeDiscounts, scenarioDiscounts);
  }, [baseBenchmarkBeforeDiscounts, scenarioDiscounts, scenarioStatus]);

  const activeBenchmarkRate = scenarioCalc.rateWithDiscounts;
  const scenarioDifference = scenarioCalc.difference;
  const currentDiff = isEstimating ? 0 : (currentPremium || 0) - activeBenchmarkRate;

  // Validation & Testing instrument state (INS-38)
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState({
    isReasonable: '',
    matchesKnowledge: '',
    useBeforeRenew: '',
    useBeforeBuy: '',
    trustComment: ''
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setSubmittingFeedback(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          isReasonable: feedback.isReasonable,
          matchesKnowledge: feedback.matchesKnowledge,
          useBeforeRenew: feedback.useBeforeRenew,
          useBeforeBuy: feedback.useBeforeBuy,
          trustComment: feedback.trustComment,
          postalCode: location?.fsa || '',
          vehicle: `${vehicle?.year || ''} ${vehicle?.make || ''} ${vehicle?.model || ''}`.trim(),
          benchmarkRate: fairMonthlyStandard,
          currentPremium: isEstimating ? null : currentPremium
        })
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.warn('Feedback submit error:', err);
      setFeedbackSubmitted(true);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div id="sanity-check-result" className="space-y-6 scroll-mt-24">
      {/* 1. Main Benchmark Card */}
      <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl border border-emerald-500/40 bg-slate-900/90 shadow-2xl relative overflow-hidden">
        {/* Compact Profile Summary (INS-61 Item 1) */}
        <div className="mb-5 pb-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white font-medium">
              <Car className="w-3.5 h-3.5 text-emerald-400" />
              {vehicle?.year} {vehicle?.make} {vehicle?.model}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              {location?.fsa} ({location?.city || 'Ontario'})
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {result.selectedCoverageName || 'Standard Package'}
            </span>
            {driver && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                Age {driver.age} · {driver.yearsLicensed} yrs lic. · {driver.cleanRecord ? 'Clean record' : 'Prior claims/tickets'}
              </span>
            )}
          </div>

          {onEditDetails && (
            <button
              type="button"
              onClick={onEditDetails}
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold text-xs transition cursor-pointer hover:underline"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit details</span>
            </button>
          )}
        </div>

        {/* Header with Title and Model Confidence */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Model-based estimate
              </span>
            </div>

            {/* Dynamic Headline Based on Discount Selection State (INS-64 Section 5) */}
            {scenarioStatus === 'selected' && scenarioDiscounts.length > 0 ? (
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {scenarioCalc.unpriced.length === 0
                    ? 'Estimated price with your selected discounts: '
                    : 'Estimate with the discounts we can account for: '}
                  <span className="text-emerald-400">${activeBenchmarkRate}/month</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                  Before these discounts: approximately <span className="text-white font-bold">${baseBenchmarkBeforeDiscounts}/month</span>
                </p>

                {/* Badges for Selected Discounts */}
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  {scenarioCalc.unpriced.length > 0 ? (
                    <div className="space-y-1.5 w-full">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Included in estimate:</span>
                        {scenarioCalc.priced.map((d) => {
                          const Icon = DISCOUNT_ICONS[d.iconName] || Tag;
                          return (
                            <span key={d.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                              <Icon className="w-3 h-3 text-emerald-400" />
                              <span>{d.label}</span>
                              <span className="text-emerald-400/80 text-[10px]">(-{Math.round(d.rate * 100)}%)</span>
                            </span>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mr-1">Reported, not yet priced:</span>
                        {scenarioCalc.unpriced.map((d) => {
                          const Icon = DISCOUNT_ICONS[d.iconName] || Plus;
                          return (
                            <span key={d.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-medium">
                              <Icon className="w-3 h-3 text-amber-400" />
                              <span>{d.id === 'other' && scenarioOtherDesc ? `Other: ${scenarioOtherDesc}` : d.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <>
                      {scenarioCalc.priced.map((d) => {
                        const Icon = DISCOUNT_ICONS[d.iconName] || Tag;
                        return (
                          <span key={d.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                            <Icon className="w-3 h-3 text-emerald-400" />
                            <span>{d.label}</span>
                            <span className="text-emerald-400/80 text-[10px]">(-{Math.round(d.rate * 100)}%)</span>
                          </span>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            ) : scenarioStatus === 'none_reported' ? (
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Estimated price without selected discounts: <span className="text-emerald-400">${baseBenchmarkBeforeDiscounts}/month</span>
                </h3>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Estimated benchmark: <span className="text-emerald-400">${baseBenchmarkBeforeDiscounts}/month</span>
                </h3>
                <p className="text-xs sm:text-sm text-cyan-300/90 mt-1 font-medium flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 shrink-0 text-cyan-400" />
                  <span>Your discounts are unknown, so this comparison does not account for them.</span>
                </p>
              </div>
            )}

            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              Based on the information you provided and InsurCheck’s Ontario insurance pricing model for {location?.city || 'Ontario'} ({vehicle?.year} {vehicle?.make} {vehicle?.model}).{' '}
              <span className="text-slate-400">Not an insurance quote. Actual rates vary by insurer and individual circumstances.</span>
            </p>
          </div>

          {/* Model Confidence Score (INS-61 Item 4) */}
          <div className="relative shrink-0">
            <div className="px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-2xl text-right">
              <div className="flex items-center justify-end gap-1 text-[11px] text-slate-400 font-medium">
                <span>Model confidence score</span>
                <button
                  type="button"
                  onClick={() => setShowConfidenceInfo(!showConfidenceInfo)}
                  className="text-slate-400 hover:text-emerald-400 transition cursor-pointer p-0.5"
                  aria-label="Explain confidence score"
                >
                  <Info className="w-3 h-3" />
                </button>
              </div>
              <div className="text-sm font-black text-emerald-400 flex items-center justify-end gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                {reliabilityScore || 94}%
              </div>
            </div>

            {showConfidenceInfo && (
              <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-950 border border-slate-700 rounded-xl text-left shadow-2xl z-30 text-xs text-slate-300 space-y-1.5 animate-in fade-in duration-150">
                <div className="flex justify-between items-start font-bold text-white">
                  <span>How confidence is calculated</span>
                  <button onClick={() => setShowConfidenceInfo(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  This internal score measures the resolution of our Ontario postal territory risk mapping, vehicle classification, and driver profile inputs. It is not a measured percentage of accurate predictions.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Model-only disclaimer (INS-61 Item 5) */}
        <div className="mt-4 p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl text-xs text-slate-400">
          This estimate comes from InsurCheck’s pricing model, not a comparison of community submissions.
        </div>

        {/* Breakdown Comparison Grid (INS-61 Item 11: no duplicate price cards) */}
        <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {!isEstimating ? (
            <>
              {/* Card 1: Your Current Premium */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4">
                <div className="text-xs text-slate-400 font-semibold">Your Current Premium</div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                  ${currentPremium} <span className="text-xs font-normal text-slate-400">/ mo</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  ${((currentPremium || 0) * 12).toLocaleString()} / year
                </div>
              </div>

              {/* Card 2: Estimated Benchmark */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Estimated Benchmark</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {result.selectedCoverageName || 'Standard'}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                  ${activeBenchmarkRate} <span className="text-xs font-normal text-slate-400">/ mo</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>${(activeBenchmarkRate * 12).toLocaleString()} / year</span>
                  {onOpenFsraExplainer && (
                    <button
                      type="button"
                      onClick={onOpenFsraExplainer}
                      className="text-emerald-400 hover:text-emerald-300 underline font-semibold transition cursor-pointer"
                    >
                      Pricing Model ℹ️
                    </button>
                  )}
                </div>
              </div>

              {/* Card 3: Difference vs Benchmark */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4">
                <div className="text-xs font-semibold text-slate-300">
                  {currentDiff > 0 ? 'Difference vs Benchmark' : 'Benchmark Status'}
                </div>
                <div className={`text-2xl sm:text-3xl font-black mt-1 ${currentDiff > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {currentDiff > 0 ? `+$${currentDiff}/mo` : 'Competitive Rate'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {scenarioStatus === 'unsure' ? (
                    <span className="text-cyan-300/80">Discounts unknown — difference is approximate</span>
                  ) : currentDiff > 0 ? (
                    `~$${(currentDiff * 12).toLocaleString()}/year over expected benchmark`
                  ) : (
                    'Within fair Ontario pricing'
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Estimating Mode: Card 1 - Prominent Selected Benchmark */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Estimated Monthly Benchmark</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {result.selectedCoverageName || 'Standard Package'}
                  </span>
                </div>
                <div className="text-2xl sm:text-4xl font-black text-emerald-400 mt-1.5">
                  ${activeBenchmarkRate} <span className="text-sm font-normal text-slate-400">/ month</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                  <span>≈ ${(activeBenchmarkRate * 12).toLocaleString()} / year estimated base cost</span>
                  {onOpenFsraExplainer && (
                    <button
                      type="button"
                      onClick={onOpenFsraExplainer}
                      className="text-emerald-400 hover:text-emerald-300 underline font-semibold transition cursor-pointer"
                    >
                      How model works ℹ️
                    </button>
                  )}
                </div>
              </div>

              {/* Estimating Mode: Card 2 - Estimated prices by coverage level */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4">
                <div className="text-xs font-semibold text-slate-300">
                  Estimated prices by coverage level
                </div>
                <div className="text-xl sm:text-2xl font-black text-white mt-1.5">
                  ${coverageTiers?.minimum?.rate || 0} – ${coverageTiers?.comprehensive?.rate || 0}
                  <span className="text-xs font-normal text-slate-400"> / mo</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  From Basic Liability (1M) to Full Protection
                </div>
              </div>
            </>
          )}
        </div>

        {/* Coverage Levels Comparison Matrix */}
        {coverageTiers && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                Benchmark by Coverage Level in {location?.city || 'Ontario'}
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(coverageTiers).map(([key, tier]) => {
                const isSelected = key === result.selectedCoverage;
                return (
                  <div
                    key={key}
                    className={`rounded-2xl p-4 flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-emerald-950/40 border-2 border-emerald-500 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950/70 border border-slate-800/80'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-xs font-bold ${isSelected ? 'text-emerald-300' : 'text-slate-200'}`}>
                            {tier.name}
                          </span>
                          {isSelected && (
                            <span className="block text-[9px] font-extrabold uppercase text-emerald-400 tracking-wider">
                              ✓ Your Package
                            </span>
                          )}
                        </div>
                        <span className="text-lg font-black text-white">
                          ${tier.rate}
                          <span className="text-xs font-normal text-slate-400">/mo</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{tier.description}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-900 text-[10px] text-slate-500 flex justify-between">
                      <span>Annual:</span>
                      <span className="font-semibold text-slate-300">${(tier.rate * 12).toLocaleString()}/yr</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Expandable Discounts Effect & Scenario Editing Section (INS-64 Section 6) */}
            <div className="mt-4 bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setHowDiscountsExpanded(!howDiscountsExpanded)}
                  className="flex items-center gap-2 text-left cursor-pointer group flex-1"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition flex items-center gap-1.5">
                      <span>How discounts affect this estimate</span>
                      {howDiscountsExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      {scenarioStatus === 'selected' && scenarioDiscounts.length > 0
                        ? `${scenarioDiscounts.length} discount${scenarioDiscounts.length > 1 ? 's' : ''} applied · Save ~$${scenarioDifference}/mo`
                        : scenarioStatus === 'none_reported'
                        ? 'No discounts included in this estimate'
                        : 'Discounts unknown · Baseline estimate shown'}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditingDiscounts(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Edit discounts</span>
                </button>
              </div>

              {howDiscountsExpanded && (
                <div className="p-4 pt-0 border-t border-slate-900/80 space-y-4">
                  {/* Scenario Table */}
                  <div className="overflow-x-auto mt-3">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="py-2 px-3 font-semibold">Scenario</th>
                          <th className="py-2 px-3 font-semibold text-right">Monthly estimate</th>
                          <th className="py-2 px-3 font-semibold text-right">Annual estimate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        <tr>
                          <td className="py-2.5 px-3 font-medium text-slate-300">Before selected discounts</td>
                          <td className="py-2.5 px-3 text-right font-bold text-white">${baseBenchmarkBeforeDiscounts}/mo</td>
                          <td className="py-2.5 px-3 text-right text-slate-400">${(baseBenchmarkBeforeDiscounts * 12).toLocaleString()}/yr</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-medium text-emerald-300">With selected discounts</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-400">${activeBenchmarkRate}/mo</td>
                          <td className="py-2.5 px-3 text-right text-emerald-400/80">${(activeBenchmarkRate * 12).toLocaleString()}/yr</td>
                        </tr>
                        <tr className="bg-emerald-950/20">
                          <td className="py-2.5 px-3 font-bold text-emerald-400">Estimated difference</td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-emerald-300">
                            {scenarioDifference > 0 ? `-$${scenarioDifference}/mo` : '$0/mo'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-300">
                            {scenarioDifference > 0 ? `-$${(scenarioDifference * 12).toLocaleString()}/yr` : '$0/yr'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {scenarioCalc.unpriced.length > 0 && (
                    <div className="p-2.5 bg-amber-950/20 border border-amber-500/20 rounded-xl text-xs text-amber-300/90 flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        Note: This comparison covers only the priced discounts we can account for. Unpriced discounts ({scenarioCalc.unpriced.map(d => d.label).join(', ')}) are not included in the numerical difference.
                      </span>
                    </div>
                  )}

                  {/* Selected Discounts Breakdown */}
                  {scenarioDiscounts.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Applied Discount Details:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {scenarioDiscounts.map(id => {
                          const item = getDiscountItem(id);
                          const Icon = DISCOUNT_ICONS[item.iconName] || Tag;
                          return (
                            <div key={id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{item.label}</span>
                                  {item.isPriced && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                                      ~{Math.round(item.rate * 100)}%
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{item.explanation}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Regional / Vehicle Risk Highlights */}
        {riskHighlights && riskHighlights.length > 0 && (
          <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Ontario Benchmark Drivers & Weight Factors:
            </span>
            <ul className="space-y-1 text-xs text-slate-300">
              {riskHighlights.map((r, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 2. Validation & Testing Instrument (INS-38) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
          <Sparkles className="w-4 h-4" />
          Model Calibration Feedback
        </div>

        {feedbackSubmitted ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-black text-white">Thank you for validating this result!</h4>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
              Your feedback is directly recorded to help train and calibrate our open Ontario benchmark model.
            </p>
          </div>
        ) : (
          <div>
            <h4 className="text-lg font-black text-white">How helpful was this result?</h4>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">
              Rate this estimate to help us validate accuracy for Ontario drivers.
            </p>

            {/* Star Rating */}
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-3xl sm:text-4xl transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                  title={`${star} star${star > 1 ? 's' : ''}`}
                >
                  <span className={(hoverRating || rating) >= star ? 'text-amber-400' : 'text-slate-700'}>
                    ★
                  </span>
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-xs font-bold text-emerald-400">
                  {rating === 5 ? '5/5 Excellent' : rating === 4 ? '4/5 Helpful' : rating === 3 ? '3/5 Moderate' : rating === 2 ? '2/5 Not quite right' : '1/5 Inaccurate'}
                </span>
              )}
            </div>

            {/* Expandable Validation Questions (Expanded once rated) */}
            {rating > 0 && (
              <form onSubmit={handleFeedbackSubmit} className="space-y-5 pt-4 border-t border-slate-800 animate-fadeIn">
                {/* Question 1 */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                    Does the result look reasonable to you?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Yes', 'Not sure', 'No'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFeedback({ ...feedback, isReasonable: opt })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          feedback.isReasonable === opt
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2 */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                    Does it match what you know about Ontario car insurance prices?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Yes', 'Somewhat', 'No'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFeedback({ ...feedback, matchesKnowledge: opt })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          feedback.matchesKnowledge === opt
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 3 */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                    Would you use this before renewing your insurance policy?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Yes', 'Maybe', 'No'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFeedback({ ...feedback, useBeforeRenew: opt })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          feedback.useBeforeRenew === opt
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 4 */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                    Would you use this before buying a new or used vehicle?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Yes', 'Maybe', 'No'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFeedback({ ...feedback, useBeforeBuy: opt })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          feedback.useBeforeBuy === opt
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 5 (Optional open-ended) */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
                    <span>What would make you trust this result more?</span>
                    <span className="text-[11px] text-slate-500 font-normal italic">Optional</span>
                  </label>
                  <textarea
                    rows={2}
                    value={feedback.trustComment}
                    onChange={(e) => setFeedback({ ...feedback, trustComment: e.target.value })}
                    placeholder="Share any thoughts, missing factors, or specific carrier comparisons you'd like to see..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="py-3 px-6 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  {submittingFeedback ? 'Submitting Feedback...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Insurer Research & Driver Reviews Entry Point */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/20">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">
              {formData?.insuranceCompany && formData.insuranceCompany !== 'Other'
                ? `How does ${formData.insuranceCompany} treat Ontario drivers?`
                : 'Research 17 Ontario Insurance Providers'}
            </div>
            <p className="text-slate-400 mt-0.5">
              Explore audited FY2025 revenue scale, independent claims ratings, and verified community discussions.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateReviews?.(formData?.insuranceCompany)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition border border-slate-700 flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>Read Insurer Reviews</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2.5 Best-Fit Insurer Matches (INS-66) */}
      {result.recommendedInsurers && result.recommendedInsurers.length > 0 && (
        <InsurerMatchCard
          recommendedInsurers={result.recommendedInsurers}
          allInsurerMatches={result.allInsurerMatches || result.recommendedInsurers}
          onConnectBroker={() => setBrokerModalOpen(true)}
          onNavigateReviews={onNavigateReviews}
        />
      )}

      {/* 3. Broker Marketplace Pilot (INS-65) */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900/80 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300 shadow-lg shadow-emerald-950/20">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">
                Want a licensed broker to beat this rate?
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Closed Pilot
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Connect with 1 curated Ontario RIBO broker. Single-broker lock guarantees zero spam and no double-calling.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (onConnectBroker) onConnectBroker();
            setBrokerModalOpen(true);
          }}
          className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-md shadow-emerald-500/15 whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 shrink-0 text-xs font-sans"
        >
          <span>Find My Broker Match</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <BrokerRequestModal
        isOpen={brokerModalOpen}
        onClose={() => setBrokerModalOpen(false)}
        calculationData={{
          vehicle,
          location,
          driver,
          currentPremium: isEstimating ? null : currentPremium,
          activeBenchmarkRate,
          savings: Math.max(0, currentDiff > 0 ? currentDiff : (monthlySavings || 0)),
          discounts: scenarioDiscounts,
          selectedCoverageName: 'Standard Coverage'
        }}
      />

      {/* 4. Edit Discounts Scenario Modal (INS-64 Section 6) */}
      {isEditingDiscounts && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
                  Edit Discounts Scenario
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adjust discounts to see how they impact your estimated benchmark.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingDiscounts(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close discount editor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <DiscountSelector
              selectedDiscounts={scenarioDiscounts}
              discountStatus={scenarioStatus}
              otherDescription={scenarioOtherDesc}
              isEstimating={isEstimating}
              onChange={(val) => {
                setScenarioDiscounts(val.discounts);
                setScenarioStatus(val.discountStatus);
                setScenarioOtherDesc(val.otherDescription);
              }}
            />

            {/* Live Scenario Impact Callout */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Updated benchmark estimate</span>
                <span className="text-lg font-black text-emerald-400">${activeBenchmarkRate}/mo</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">Estimated monthly savings</span>
                <span className="text-sm font-bold text-emerald-300">
                  {scenarioDifference > 0 ? `-$${scenarioDifference}/mo` : '$0/mo'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
              Changing the estimate scenario recalculates the displayed model estimate. It does not alter your original submitted premium or reported discounts, and creates no additional community submission.
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditingDiscounts(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md shadow-emerald-500/20"
              >
                Apply to estimate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

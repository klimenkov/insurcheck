import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Building2, HelpCircle, Info, Edit3, UserCheck, MapPin, Car, Shield } from 'lucide-react';

export function ResultCard({ result, onConnectBroker, onOpenFsraExplainer, onEditDetails }) {
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
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Model-based estimate
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Estimated benchmark: <span className="text-emerald-400">${fairMonthlyStandard}/month</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
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
                  ${fairMonthlyStandard} <span className="text-xs font-normal text-slate-400">/ mo</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>${(fairMonthlyStandard * 12).toLocaleString()} / year</span>
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
                  {monthlySavings > 0 ? 'Difference vs Benchmark' : 'Benchmark Status'}
                </div>
                <div className={`text-2xl sm:text-3xl font-black mt-1 ${monthlySavings > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {monthlySavings > 0 ? `+$${monthlySavings}/mo` : 'Competitive Rate'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {monthlySavings > 0
                    ? `~$${annualSavings?.toLocaleString()}/year over expected benchmark`
                    : 'Within fair Ontario pricing'}
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
                  ${fairMonthlyStandard} <span className="text-sm font-normal text-slate-400">/ month</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                  <span>≈ ${(fairMonthlyStandard * 12).toLocaleString()} / year estimated base cost</span>
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

            {/* Discounts Note (INS-40 / INS-61) */}
            <div className="mt-4 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Discounts included
                </h5>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li className="flex items-baseline gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                    <span><strong className="text-white">Winter tires</strong> · 2%–5% discount for using approved winter tires</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2.5 border-t border-slate-900">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  Discounts not included
                </h5>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-300">
                  <li className="flex items-baseline gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0"></span>
                    <span><strong className="text-slate-200">Home + auto bundle</strong> · Up to 10% for combining home and auto insurance</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0"></span>
                    <span><strong className="text-slate-200">Multi-vehicle / multi-driver</strong> · Discount for insuring multiple vehicles or drivers</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0"></span>
                    <span><strong className="text-slate-200">Usage-based insurance</strong> · Discount for using an insurer's driving-tracking app</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0"></span>
                    <span><strong className="text-slate-200">Low mileage</strong> · Discount for driving fewer kilometres</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0"></span>
                    <span><strong className="text-slate-200">Anti-theft devices</strong> · Discount for eligible anti-theft or security systems</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0"></span>
                    <span><strong className="text-slate-200">Driver training</strong> · Discount for completing an approved driver-training course</span>
                  </li>
                </ul>
              </div>
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

      {/* 3. Launch Notification Flow (INS-61 Item 7) */}
      <div className="p-4 sm:p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          <span className="text-white font-semibold block sm:inline mr-1.5">
            Interested in help finding insurance?
          </span>
          <span>Broker matching is coming soon. Get notified when it becomes available.</span>
        </div>
        <button
          type="button"
          onClick={onConnectBroker}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-md shadow-emerald-500/10 whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <span>Notify me at launch</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

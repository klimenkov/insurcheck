import React from 'react';
import { AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export function ResultCard({ result, onConnectBroker, onOpenFsraExplainer }) {
  if (!result) return null;

  const {
    verdict,
    verdictTitle,
    verdictMessage,
    verdictColor,
    currentPremium,
    fairMonthlyStandard,
    monthlySavings,
    annualSavings,
    coverageTiers,
    location,
    vehicle,
    reliabilityScore,
    riskHighlights
  } = result;

  const isOverpaying = verdict === 'SEVERE_OVERPAY' || verdict === 'OVERPAYING';

  return (
    <div className={`rounded-3xl p-6 sm:p-8 backdrop-blur-xl border transition-all duration-300 shadow-2xl relative overflow-hidden ${
      verdictColor === 'red'
        ? 'bg-red-950/20 border-red-500/40 glow-red'
        : verdictColor === 'amber'
        ? 'bg-amber-950/20 border-amber-500/40'
        : verdictColor === 'blue'
        ? 'bg-blue-950/20 border-blue-500/40 glow-blue'
        : 'bg-emerald-950/20 border-emerald-500/40 glow-emerald'
    }`}>
      {/* Verdict Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isOverpaying ? (
              <AlertCircle className={`w-6 h-6 ${verdictColor === 'red' ? 'text-red-400' : 'text-amber-400'}`} />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            )}
            <h3 className="text-2xl font-black text-white">{verdictTitle}</h3>
          </div>
          <p className="text-sm text-slate-300 max-w-lg">{verdictMessage}</p>
        </div>

        {/* Confidence Score Pill */}
        <div className="px-3.5 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-right">
          <div className="text-[11px] text-slate-400 font-medium">Confidence Score</div>
          <div className="text-sm font-black text-emerald-400 flex items-center justify-end gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            {reliabilityScore}% (High Data Density)
          </div>
        </div>
      </div>

      {/* Main Savings Comparison Banner */}
      <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-semibold">Your Current Rate</div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            ${currentPremium} <span className="text-xs font-normal text-slate-400">/ mo</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">${(currentPremium * 12).toLocaleString()} / year</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-semibold">Fair Ontario Standard</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            ${fairMonthlyStandard} <span className="text-xs font-normal text-slate-400">/ mo</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>${(fairMonthlyStandard * 12).toLocaleString()} / year</span>
            {onOpenFsraExplainer && (
              <button
                type="button"
                onClick={onOpenFsraExplainer}
                className="text-emerald-400 hover:text-emerald-300 underline font-semibold transition"
              >
                Actuarial Model ℹ️
              </button>
            )}
          </div>
        </div>

        <div className={`rounded-2xl p-4 border ${
          isOverpaying
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-emerald-500/10 border-emerald-500/30'
        }`}>
          <div className="text-xs font-semibold text-slate-300">
            {isOverpaying ? 'Potential Annual Savings' : 'Status'}
          </div>
          <div className={`text-2xl sm:text-3xl font-black mt-1 ${isOverpaying ? 'text-red-400' : 'text-emerald-400'}`}>
            {isOverpaying ? `-$${annualSavings.toLocaleString()}` : 'Protected Rate'}
          </div>
          <div className="text-[11px] text-slate-300 mt-1">
            {isOverpaying ? `Save ~$${monthlySavings}/month` : 'No action required'}
          </div>
        </div>
      </div>

      {/* Coverage Tiers Matrix */}
      <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Ontario Price Ranges for Your Profile ({location.city} • {vehicle.year} {vehicle.make} {vehicle.model})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(coverageTiers).map(([key, tier]) => (
            <div key={key} className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-200">{tier.name}</span>
                  <span className="text-lg font-black text-white">${tier.rate}<span className="text-xs font-normal text-slate-400">/mo</span></span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{tier.description}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-900 text-[10px] text-slate-500 flex justify-between">
                <span>Annual:</span>
                <span className="font-semibold text-slate-300">${(tier.rate * 12).toLocaleString()}/yr</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional / Vehicle Risk Flags */}
      {riskHighlights && riskHighlights.length > 0 && (
        <div className="mb-6 p-4 bg-slate-950/60 border border-slate-800/60 rounded-2xl">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-2">
            Why this price? Ontario Risk Factors:
          </span>
          <ul className="space-y-1 text-xs text-slate-300">
            {riskHighlights.map((r, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Broker CTA */}
      {isOverpaying ? (
        <div className="p-5 bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Stop Overpaying ${monthlySavings}/month
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Connect with a licensed Ontario independent broker who searches 30+ insurers to match this standard rate.
            </p>
          </div>
          <button
            onClick={onConnectBroker}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/20 whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Lock In Lower Rate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
          🎉 Congratulations! Your current policy is among the best 15% of rates in {location.city}.
        </div>
      )}
    </div>
  );
}

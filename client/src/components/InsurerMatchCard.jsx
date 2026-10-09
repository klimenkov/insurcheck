import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  ShieldCheck,
  Building2,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  TrendingDown,
  Info
} from 'lucide-react';

export function InsurerMatchCard({
  recommendedInsurers = [],
  allInsurerMatches = [],
  onConnectBroker,
  onNavigateReviews
}) {
  const [showAll, setShowAll] = useState(false);

  if (!recommendedInsurers || recommendedInsurers.length === 0) {
    return null;
  }

  const displayedInsurers = showAll ? allInsurerMatches : recommendedInsurers;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              Best-Fit Insurers for Your Profile
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Algorithmic Match
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Calibrated against Ontario underwriting appetites, vehicle CLEAR theft risk, driver age, and discount synergy.
          </p>
        </div>

        {allInsurerMatches.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-slate-400 hover:text-emerald-400 font-semibold flex items-center gap-1 transition cursor-pointer self-start sm:self-center"
          >
            <span>{showAll ? 'Show Top 3 Only' : `View All ${allInsurerMatches.length} Insurers`}</span>
            {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Match Cards List */}
      <div className="space-y-4">
        {displayedInsurers.map((insurer, idx) => {
          const isTop = idx === 0;
          const isBroker = insurer.channelType === 'broker';

          return (
            <div
              key={insurer.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isTop
                  ? 'bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/20'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Top Row: Name, Match %, Channel */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs shrink-0 shadow-sm border border-slate-700/50"
                    style={{ backgroundColor: insurer.logoColor || '#334155' }}
                  >
                    {insurer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm sm:text-base">
                        {insurer.name}
                      </span>
                      {isTop && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                          <Award className="w-3 h-3" />
                          #1 BEST MATCH
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500">
                        Rank #{insurer.marketShareRank} in Ontario
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {insurer.primaryStrength}
                    </div>
                  </div>
                </div>

                {/* Match Score Badge */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium">Fit Score:</span>
                    <span className={`text-sm font-black ${
                      insurer.matchScore >= 90
                        ? 'text-emerald-400'
                        : insurer.matchScore >= 80
                          ? 'text-blue-400'
                          : 'text-amber-400'
                    }`}>
                      {insurer.matchScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Match Reasons Bullet List */}
              {insurer.matchReasons && insurer.matchReasons.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-800/60 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Why this insurer fits your profile:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
                    {insurer.matchReasons.map((reason, rIdx) => (
                      <div key={rIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-medium text-[11px]">
                    {insurer.channel}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {insurer.annualRevenue}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigateReviews?.(insurer.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Reviews & Rating</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  {isBroker ? (
                    <button
                      type="button"
                      onClick={onConnectBroker}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-md shadow-emerald-500/10 flex items-center gap-1 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Quote via Broker</span>
                    </button>
                  ) : (
                    <a
                      href={insurer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-md shadow-blue-600/10 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Direct Quote</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

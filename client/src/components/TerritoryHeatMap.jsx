import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Flame,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Info,
  X,
  Building2,
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';

export function TerritoryHeatMap({ onOpenContribute }) {
  const [territories, setTerritories] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [cityRankings, setCityRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'leaderboard'
  const [activeFsaModal, setActiveFsaModal] = useState(null);

  useEffect(() => {
    let ignore = false;
    fetch('/api/territories')
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.success) {
          setTerritories(json.data);
          setMetrics(json.metrics);
          setCityRankings(json.city_rankings);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Filtered territories based on search and tier
  const filteredTerritories = useMemo(() => {
    return territories.filter((item) => {
      const matchesTier = selectedTier === 'All' || item.tier === selectedTier;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.fsa.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q);
      return matchesTier && matchesSearch;
    });
  }, [territories, selectedTier, searchQuery]);

  // Group territories by Macro Region
  const macroRegions = useMemo(() => {
    const groups = {
      'Peel Region (Brampton, Mississauga, Caledon)': [],
      'City of Toronto (Downtown, Scarborough, North York, Etobicoke)': [],
      'York Region (Vaughan, Markham, Richmond Hill, Newmarket)': [],
      'Halton Region (Oakville, Burlington, Milton)': [],
      'Durham Region (Pickering, Ajax, Whitby, Oshawa)': [],
      'Waterloo Region & Central Ontario (Kitchener, Waterloo, Guelph, Barrie)': [],
      'Eastern Ontario & Capital (Ottawa, Kingston)': [],
      'Hamilton, Niagara & Southwestern (Hamilton, London, Windsor, North)': []
    };

    filteredTerritories.forEach((t) => {
      const c = t.city.toLowerCase();
      if (c.includes('brampton') || c.includes('mississauga') || c.includes('caledon')) {
        groups['Peel Region (Brampton, Mississauga, Caledon)'].push(t);
      } else if (c.includes('toronto')) {
        groups['City of Toronto (Downtown, Scarborough, North York, Etobicoke)'].push(t);
      } else if (c.includes('vaughan') || c.includes('markham') || c.includes('richmond hill') || c.includes('newmarket') || c.includes('aurora')) {
        groups['York Region (Vaughan, Markham, Richmond Hill, Newmarket)'].push(t);
      } else if (c.includes('oakville') || c.includes('burlington') || c.includes('milton')) {
        groups['Halton Region (Oakville, Burlington, Milton)'].push(t);
      } else if (c.includes('pickering') || c.includes('ajax') || c.includes('whitby') || c.includes('oshawa')) {
        groups['Durham Region (Pickering, Ajax, Whitby, Oshawa)'].push(t);
      } else if (c.includes('waterloo') || c.includes('kitchener') || c.includes('guelph') || c.includes('cambridge') || c.includes('barrie')) {
        groups['Waterloo Region & Central Ontario (Kitchener, Waterloo, Guelph, Barrie)'].push(t);
      } else if (c.includes('ottawa') || c.includes('kingston')) {
        groups['Eastern Ontario & Capital (Ottawa, Kingston)'].push(t);
      } else {
        groups['Hamilton, Niagara & Southwestern (Hamilton, London, Windsor, North)'].push(t);
      }
    });

    return Object.entries(groups).filter(([, items]) => items.length > 0);
  }, [filteredTerritories]);

  // Color styles per risk tier
  const getTierBadgeStyle = (tier) => {
    switch (tier) {
      case 'Extreme':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'High':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Moderate':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'Low':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getCardBorderColor = (tier) => {
    switch (tier) {
      case 'Extreme':
        return 'border-rose-500/40 hover:border-rose-400 bg-rose-950/10 hover:shadow-rose-500/10';
      case 'High':
        return 'border-amber-500/35 hover:border-amber-400 bg-amber-950/10 hover:shadow-amber-500/10';
      case 'Moderate':
        return 'border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/10 hover:shadow-cyan-500/10';
      case 'Low':
        return 'border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/10 hover:shadow-emerald-500/10';
      default:
        return 'border-slate-800 hover:border-slate-700 bg-slate-900/50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                FSRA Territorial Actuarial Matrix
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                142 Postal Regions
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ontario Auto Insurance Territorial Heat Map
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              In Ontario, your postal code (FSA) is one of the single biggest pricing drivers. 
              Drivers living just 10 kilometers apart can face a <strong className="text-rose-400">+48% territorial surcharge</strong> (Brampton) versus a <strong className="text-emerald-400">-27% discount</strong> (Ottawa) based on regulatory collision frequency, theft claims, and litigation loss curves.
            </p>
          </div>

          {/* Quick Provincial Reference */}
          <div className="shrink-0 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 min-w-[200px] text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ontario Reference Baseline
            </span>
            <div className="text-2xl font-black text-white mt-0.5">
              ${metrics?.ontario_base_monthly || 175}
              <span className="text-xs text-slate-400 font-normal"> / mo</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              Standard Full G Neutral Zone
            </span>
          </div>
        </div>

        {/* Macro Metrics Strip */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-rose-500/20">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Extreme Risk (&gt;1.30x)</span>
                <Flame className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-xl font-black text-rose-400 mt-1">{metrics.extreme} Zones</div>
              <span className="text-[10px] text-slate-400">Brampton, Scarborough, Rexdale</span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-amber-500/20">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>High Risk (1.11 - 1.30x)</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-black text-amber-400 mt-1">{metrics.high} Zones</div>
              <span className="text-[10px] text-slate-400">Mississauga, Toronto, Vaughan</span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-cyan-500/20">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Moderate (0.90 - 1.10x)</span>
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl font-black text-cyan-400 mt-1">{metrics.moderate} Zones</div>
              <span className="text-[10px] text-slate-400">Oakville, Burlington, Hamilton</span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-emerald-500/20">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Low Risk (&lt;0.90x)</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-emerald-400 mt-1">{metrics.low} Zones</div>
              <span className="text-[10px] text-slate-400">Ottawa, Kingston, Guelph, Waterloo</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search postal prefix (e.g. L6P, M5V) or city..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-9 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tier Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tier:</span>
          </div>
          {['All', 'Extreme', 'High', 'Moderate', 'Low'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedTier === tier
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Regional Grid
          </button>
          <button
            onClick={() => setViewMode('leaderboard')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            City Rankings ({cityRankings.length})
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="text-center py-24 text-slate-400 text-sm">
          Loading Ontario territorial risk matrix...
        </div>
      ) : filteredTerritories.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
          <MapPin className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No territories match "{searchQuery}"</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for a 3-character FSA like <strong>L6P</strong>, <strong>M5V</strong>, <strong>K1P</strong>, or a city like <strong>Brampton</strong> or <strong>Ottawa</strong>.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTier('All');
            }}
            className="mt-2 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ========================================================================= */
        /* VIEW 1: REGIONAL GRID WITH MACRO GROUPS                                  */
        /* ========================================================================= */
        <div className="space-y-10">
          {macroRegions.map(([regionName, items]) => (
            <div key={regionName} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                  <span>{regionName}</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {items.length} postal zone(s)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {items.map((t) => (
                  <div
                    key={t.fsa}
                    onClick={() => setActiveFsaModal(t)}
                    className={`border rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer shadow-sm hover:scale-[1.02] ${getCardBorderColor(
                      t.tier
                    )}`}
                  >
                    <div>
                      {/* Top FSA & Tier */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-black text-white tracking-wider">
                            {t.fsa}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${getTierBadgeStyle(
                              t.tier
                            )}`}
                          >
                            {t.tier}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-white">
                            ${t.estimated_monthly}
                          </span>
                          <span className="text-[10px] text-slate-400 block">/mo base</span>
                        </div>
                      </div>

                      {/* City and Neighborhood Label */}
                      <div className="mt-2 text-xs text-slate-300 font-semibold line-clamp-1">
                        {t.city}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {t.label}
                      </div>
                    </div>

                    {/* Bottom Risk Ratio & Delta */}
                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-slate-400">
                        Risk: <strong className="text-white">{t.risk}x</strong>
                      </span>
                      <span
                        className={`text-[11px] font-bold flex items-center gap-0.5 ${
                          t.variance_percent > 0
                            ? 'text-rose-400'
                            : t.variance_percent < 0
                            ? 'text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {t.variance_percent > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : t.variance_percent < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : null}
                        {t.variance_percent > 0 ? `+${t.variance_percent}%` : `${t.variance_percent}%`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 2: CITY RANKING LEADERBOARD (MOST EXPENSIVE TO CHEAPEST)            */
        /* ========================================================================= */
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <span>Ontario City Insurance Rate Rankings</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Ranked from highest average territorial risk multiplier down to lowest across all aggregated FSA postal clusters.
            </p>

            <div className="space-y-3">
              {cityRankings.map((c, index) => {
                const rankNum = index + 1;
                const percentOfMax = Math.round((c.avg_risk / 1.50) * 100);

                return (
                  <div
                    key={c.city}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-[240px]">
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                          rankNum <= 3
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : rankNum >= cityRankings.length - 3
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        #{rankNum}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{c.city}</h4>
                        <span className="text-[11px] text-slate-400">
                          {c.fsa_count} analyzed FSA zone(s)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Meter */}
                    <div className="flex-1 max-w-md hidden sm:block">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Territorial Multiplier: <strong className="text-white">{c.avg_risk}x</strong></span>
                        <span className={c.delta_percent > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {c.delta_percent > 0 ? `+${c.delta_percent}%` : `${c.delta_percent}%`} vs baseline
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            c.avg_risk > 1.30
                              ? 'bg-rose-500'
                              : c.avg_risk >= 1.11
                              ? 'bg-amber-500'
                              : c.avg_risk >= 0.90
                              ? 'bg-cyan-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentOfMax}%` }}
                        />
                      </div>
                    </div>

                    {/* Rates & Tier */}
                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getTierBadgeStyle(
                          c.tier
                        )}`}
                      >
                        {c.tier} Risk
                      </span>
                      <div className="text-right min-w-[90px]">
                        <span className="text-base font-black text-white">
                          ${c.estimated_avg_monthly}
                        </span>
                        <span className="text-[10px] text-slate-400 block">/mo avg base</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TERRITORY DETAILS INSPECTOR MODAL                                         */}
      {/* ========================================================================= */}
      {activeFsaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5">
            {/* Close Button */}
            <button
              onClick={() => setActiveFsaModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-white tracking-wide">
                  {activeFsaModal.fsa}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${getTierBadgeStyle(
                    activeFsaModal.tier
                  )}`}
                >
                  {activeFsaModal.tier} Risk
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-200 mt-1">
                {activeFsaModal.city} &bull; {activeFsaModal.label}
              </h3>
            </div>

            {/* Main Stats Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Estimated Baseline</span>
                <div className="text-2xl font-black text-white mt-1">
                  ${activeFsaModal.estimated_monthly}
                  <span className="text-xs text-slate-400 font-normal"> / mo</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Provincial Avg: ${activeFsaModal.ontario_base_monthly}/mo
                </span>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Territory Surcharge</span>
                <div
                  className={`text-2xl font-black mt-1 ${
                    activeFsaModal.variance_percent > 0
                      ? 'text-rose-400'
                      : activeFsaModal.variance_percent < 0
                      ? 'text-emerald-400'
                      : 'text-slate-300'
                  }`}
                >
                  {activeFsaModal.variance_percent > 0
                    ? `+${activeFsaModal.variance_percent}%`
                    : `${activeFsaModal.variance_percent}%`}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Actuarial multiplier: {activeFsaModal.risk}x
                </span>
              </div>
            </div>

            {/* Actuarial Context Note */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                <Info className="w-4 h-4" />
                <span>Actuarial Territory Analysis</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeFsaModal.tier_description}
              </p>
              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800/60 flex items-center justify-between">
                <span>Regulatory Code: ON-FSA-{activeFsaModal.fsa}</span>
                <span>Source: FSRA Territorial Matrix</span>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  setActiveFsaModal(null);
                  if (onOpenContribute) onOpenContribute();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit Your Rate for {activeFsaModal.fsa}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

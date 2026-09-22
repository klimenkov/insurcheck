import React, { useState, useEffect } from 'react';
import {
  Users,
  Filter,
  MapPin,
  PlusCircle,
  Bot,
  Sparkles,
  Building2,
  ShieldCheck,
  Cpu,
  TrendingDown,
  TrendingUp,
  Scale,
  ChevronDown,
  ChevronUp,
  Clock,
  History
} from 'lucide-react';

export function CommunityQuotes({ onOpenContribute, onOpenFsraExplainer }) {
  // Mode: 'crowdsourced' vs 'scraped'
  const [activeMode, setActiveMode] = useState('crowdsourced');

  // Crowdsourced state
  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [filterCity, setFilterCity] = useState('All');
  const [filterMake, setFilterMake] = useState('All');

  // Scraped quotes state
  const [scrapedQuotes, setScrapedQuotes] = useState([]);
  const [scrapedSummary, setScrapedSummary] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [selectedPersonaTrend, setSelectedPersonaTrend] = useState('all');
  const [loadingScraped, setLoadingScraped] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [filterScrapedCity, setFilterScrapedCity] = useState('All');
  const [expandedQuoteId, setExpandedQuoteId] = useState(null);

  // Load crowdsourced submissions
  useEffect(() => {
    let isCancelled = false;
    const loadQuotes = async () => {
      setLoadingQuotes(true);
      try {
        let url = '/api/submissions?';
        if (filterCity !== 'All') url += `city=${encodeURIComponent(filterCity)}&`;
        if (filterMake !== 'All') url += `make=${encodeURIComponent(filterMake)}&`;
        const res = await fetch(url);
        const json = await res.json();
        if (!isCancelled && json.success) setQuotes(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!isCancelled) setLoadingQuotes(false);
      }
    };

    if (activeMode === 'crowdsourced') {
      loadQuotes();
    }

    const handleSubmissionCreated = () => {
      if (activeMode === 'crowdsourced') {
        loadQuotes();
      }
    };

    window.addEventListener('insurcheck:submission-created', handleSubmissionCreated);

    return () => {
      isCancelled = true;
      window.removeEventListener('insurcheck:submission-created', handleSubmissionCreated);
    };
  }, [activeMode, filterCity, filterMake]);

  // Load scraped quotes, summary & trends
  useEffect(() => {
    let isCancelled = false;
    const loadScrapedData = async () => {
      setLoadingScraped(true);
      try {
        let url = '/api/scraped-quotes?';
        if (filterPlatform !== 'All') url += `platform=${encodeURIComponent(filterPlatform)}&`;
        if (filterScrapedCity !== 'All') url += `city=${encodeURIComponent(filterScrapedCity)}&`;

        const [quotesRes, summaryRes, trendsRes] = await Promise.all([
          fetch(url),
          fetch('/api/scraped-quotes/summary'),
          fetch('/api/scraped-quotes/trends')
        ]);

        const quotesJson = await quotesRes.json();
        const summaryJson = await summaryRes.json();
        const trendsJson = await trendsRes.json();

        if (!isCancelled) {
          if (quotesJson.success) setScrapedQuotes(quotesJson.data);
          if (summaryJson.success) setScrapedSummary(summaryJson.data);
          if (trendsJson.success) setTrendsData(trendsJson.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!isCancelled) setLoadingScraped(false);
      }
    };

    if (activeMode === 'scraped') {
      loadScrapedData();
    }
    return () => {
      isCancelled = true;
    };
  }, [activeMode, filterPlatform, filterScrapedCity]);

  const cities = ['All', 'Brampton', 'Mississauga', 'Toronto', 'Markham', 'Ottawa', 'Waterloo'];
  const makes = ['All', 'Honda', 'Toyota', 'Lexus', 'Ford', 'Tesla', 'Hyundai', 'Mazda', 'Subaru'];
  const platforms = ['All', 'Squareone', 'Rates.ca', 'Td'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            {activeMode === 'crowdsourced' ? (
              <Users className="w-6 h-6 text-emerald-400" />
            ) : (
              <Bot className="w-6 h-6 text-cyan-400" />
            )}
            Ontario Insurance Rate Database
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {activeMode === 'crowdsourced'
              ? 'Real auto insurance costs submitted anonymously by Ontario drivers from their renewal bills.'
              : 'Automated rate intelligence harvested directly from insurer web engines for standardized driver personas.'}
          </p>
        </div>

        {/* Source Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveMode('crowdsourced')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'crowdsourced'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Driver Submissions</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeMode === 'crowdsourced' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}>
              {quotes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMode('scraped')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'scraped'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Live Market Watch (Scraped)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeMode === 'scraped' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-cyan-400'
            }`}>
              {scrapedSummary?.total_scraped_quotes ?? scrapedQuotes.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: CROWDSOURCED REAL DRIVERS                                          */}
      {/* ========================================================================= */}
      {activeMode === 'crowdsourced' && (
        <div>
          {/* Action Callout & Filter Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Filter className="w-4 h-4 text-emerald-400" />
                <span>Filters:</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">City:</span>
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Make:</span>
                <select
                  value={filterMake}
                  onChange={(e) => setFilterMake(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {makes.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={onOpenContribute}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Submit Your Renewal Rate
            </button>
          </div>

          {/* Submissions List */}
          {loadingQuotes ? (
            <div className="text-center py-16 text-slate-500 text-sm">Loading community submissions...</div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
              <p className="text-slate-400 text-sm">No submissions match these filters yet.</p>
              <button
                onClick={onOpenContribute}
                className="mt-3 text-xs text-emerald-400 underline font-semibold"
              >
                Be the first to submit for this category!
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quotes.map((q) => (
                <div
                  key={q.id}
                  className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {q.vehicle_year} {q.vehicle_make} {q.vehicle_model}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{q.city} ({q.fsa})</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-emerald-400">${q.monthly_premium}</span>
                        <span className="text-[10px] text-slate-400 block font-medium">/ month</span>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 text-[11px] font-medium border border-slate-800">
                        Insurer: {q.provider_name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 text-[11px] font-medium border border-slate-800">
                        {q.driver_age} yrs old ({q.years_licensed} yrs G)
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                        q.clean_record
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      }`}>
                        {q.clean_record ? 'Clean Record' : 'Has Tickets'}
                      </span>
                    </div>

                    {/* Comment */}
                    {q.comment && (
                      <p className="mt-3 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 italic leading-relaxed">
                        "{q.comment}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 flex justify-between">
                    <span>Coverage: {q.coverage_type}</span>
                    <span>{q.created_at}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: AUTOMATED MARKET WATCH (SCRAPED QUOTES)                            */}
      {/* ========================================================================= */}
      {activeMode === 'scraped' && (
        <div className="space-y-6">
          {/* Telemetry & Isolation Info Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/30 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Automated Carrier Quote Telemetry</span>
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] rounded-full uppercase font-bold tracking-wider">
                    Separate Table: scraped_quotes
                  </span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  These records are systematically queried and harvested by our Playwright stealth bot from carrier quote funnels using standardized Ontario driver archetypes. They are stored in an isolated database to ensure real crowdsourced data remains untainted.
                </p>
              </div>
            </div>
          </div>

          {/* Quote Freshness & Regulatory Harvest Cadence Banner */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">Live Benchmark Freshness:</span>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {trendsData?.metrics?.harvest_age_hours !== undefined
                      ? `${trendsData.metrics.harvest_age_hours} hours ago`
                      : 'Recent Live Harvest'}
                  </span>
                  <span className="text-xs text-slate-400">• Q3 2026 Regulatory Period</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Harvested on a monthly batch cadence. Next carrier run: <strong className="text-slate-200">October 1, 2026</strong> (FSRA filing alignment).
                </p>
              </div>
            </div>

            {onOpenFsraExplainer && (
              <button
                type="button"
                onClick={onOpenFsraExplainer}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 rounded-xl text-xs font-semibold border border-slate-700 transition shrink-0 shadow-sm"
              >
                <Scale className="w-4 h-4" />
                <span>What is FSRA Fair Rate?</span>
              </button>
            )}
          </div>

          {/* Historical Rate Dynamics & Price Inflation Visualizer */}
          {trendsData && trendsData.timeline?.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Historical Price Dynamics & Rate Inflation</span>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        6-Month Timeline
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tracking consecutive monthly snapshots across standardized driver archetypes from April to September 2026.
                    </p>
                  </div>
                </div>

                {/* Macro inflation metric */}
                <div className="px-3.5 py-2 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ontario Market Inflation</div>
                    <div className="text-sm font-black text-amber-400">+{trendsData.metrics?.avg_market_inflation_pct || '5.1'}% Shift</div>
                  </div>
                </div>
              </div>

              {/* Persona Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setSelectedPersonaTrend('all')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    selectedPersonaTrend === 'all'
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  All Personas
                </button>
                {trendsData.personas?.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersonaTrend(p.id)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      selectedPersonaTrend === p.id
                        ? 'bg-cyan-500 text-slate-950 shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>{p.city}: {p.label.split(' - ')[0]}</span>
                    <span className="text-[10px] opacity-75 font-mono">
                      {p.overall_change_pct > 0 ? `+${p.overall_change_pct}%` : `${p.overall_change_pct}%`}
                    </span>
                  </button>
                ))}
              </div>

              {/* Responsive Visual SVG Timeline Graph */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 shadow-inner">
                <div className="relative w-full overflow-x-auto">
                  <svg viewBox="0 0 700 180" className="w-full h-44 select-none">
                    <defs>
                      <linearGradient id="trendGradientCyan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="trendGradientRose" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="50" y1="30" x2="660" y2="30" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
                    <line x1="50" y1="80" x2="660" y2="80" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
                    <line x1="50" y1="130" x2="660" y2="130" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />

                    {/* Timeline Data Rendering */}
                    {(() => {
                      const displayPersonas = selectedPersonaTrend === 'all'
                        ? trendsData.personas
                        : trendsData.personas.filter(p => p.id === selectedPersonaTrend);

                      const months = trendsData.timeline;
                      const getX = (idx) => 60 + idx * 115;

                      const colorPalette = {
                        young_brampton: '#f43f5e', // Rose
                        experienced_toronto: '#10b981', // Emerald
                        prime_suburban: '#f59e0b', // Amber
                        senior_ottawa: '#06b6d4', // Cyan
                        suburban_mississauga_theft: '#a855f7' // Purple
                      };

                      return (
                        <>
                          {/* Month Labels on X Axis */}
                          {months.map((m, idx) => (
                            <text
                              key={m.key}
                              x={getX(idx)}
                              y="165"
                              fill="#94a3b8"
                              fontSize="11"
                              fontWeight="600"
                              textAnchor="middle"
                            >
                              {m.label.split(' ')[0]}
                            </text>
                          ))}

                          {/* Persona Trend Lines */}
                          {displayPersonas.map((p) => {
                            const lineColor = colorPalette[p.id] || '#06b6d4';
                            const minVal = Math.min(...p.history.map(h => h.premium));
                            const maxVal = Math.max(...p.history.map(h => h.premium));
                            const range = Math.max(1, maxVal - minVal);

                            // Normalize Y coordinates between 40 and 125
                            const points = p.history.map((h, idx) => {
                              const y = 125 - ((h.premium - minVal) / range) * 80;
                              return `${getX(idx)},${y}`;
                            });

                            return (
                              <g key={p.id}>
                                <polyline
                                  fill="none"
                                  stroke={lineColor}
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  points={points.join(' ')}
                                />
                                {p.history.map((h, idx) => {
                                  const y = 125 - ((h.premium - minVal) / range) * 80;
                                  return (
                                    <g key={idx}>
                                      <circle
                                        cx={getX(idx)}
                                        cy={y}
                                        r="4"
                                        fill={lineColor}
                                        stroke="#0f172a"
                                        strokeWidth="2"
                                      />
                                      {/* Price tag above dot */}
                                      <text
                                        x={getX(idx)}
                                        y={y - 8}
                                        fill="#e2e8f0"
                                        fontSize="9.5"
                                        fontWeight="700"
                                        textAnchor="middle"
                                      >
                                        ${h.premium}
                                      </text>
                                    </g>
                                  );
                                })}
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>

                {/* Legend & Actuarial Notes Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                  {trendsData.personas?.map((p) => (
                    <div
                      key={p.id}
                      className={`p-2.5 rounded-xl border transition-all ${
                        selectedPersonaTrend === p.id || selectedPersonaTrend === 'all'
                          ? 'bg-slate-900/90 border-slate-700'
                          : 'opacity-40 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{p.city}</span>
                        <span className={`text-[11px] font-bold ${
                          p.overall_change_pct > 6 ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          +{p.overall_change_pct}% (6 mos)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                        <span>Start: ${p.starting_premium}/mo</span>
                        <span className="text-white font-bold">Now: ${p.current_premium}/mo</span>
                      </div>
                      {p.history[p.history.length - 1]?.notes && (
                        <div className="text-[10px] text-slate-500 mt-1 italic line-clamp-1">
                          "{p.history[p.history.length - 1].notes}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Filter className="w-4 h-4 text-cyan-400" />
                <span>Filters:</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Platform:</span>
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {platforms.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">City:</span>
                <select
                  value={filterScrapedCity}
                  onChange={(e) => setFilterScrapedCity(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Showing <strong className="text-white">{scrapedQuotes.length}</strong> scraped benchmark quotes
            </div>
          </div>

          {/* Scraped Quotes Cards */}
          {loadingScraped ? (
            <div className="text-center py-16 text-slate-500 text-sm">Querying automated rate database...</div>
          ) : scrapedQuotes.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
              <p className="text-slate-400 text-sm">No scraped quotes found for these filters.</p>
              <p className="text-xs text-slate-500 mt-1">Run <code>python scrapers/quote_harvester.py</code> to execute fresh persona runs.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scrapedQuotes.map((sq) => (
                <div
                  key={sq.id}
                  className="bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all"
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 text-[10px] font-bold border border-cyan-500/20 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {sq.source_platform}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 text-[10px] font-semibold border border-slate-800">
                            Bot Scrape #{sq.id}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1.5">
                          {sq.vehicle_year} {sq.vehicle_make} {sq.vehicle_model}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{sq.city} ({sq.fsa})</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-black text-cyan-400">${sq.monthly_premium}</span>
                        <span className="text-[10px] text-slate-400 block font-medium">/ month (base)</span>
                      </div>
                    </div>

                    {/* Persona Archetype Badge */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Persona: {sq.persona_label}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        <span>Driver Age: <strong>{sq.driver_age}</strong></span>
                        <span>License: <strong>{sq.license_class}</strong></span>
                        <span>Record: <strong>{sq.clean_record ? 'Clean' : 'Claims/Tickets'}</strong></span>
                      </div>
                    </div>

                    {/* Actuarial Benchmark Delta Box */}
                    {sq.benchmark_premium && (
                      <div className={`mt-3 p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                        sq.delta_percent <= -15
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : sq.delta_percent > 15
                          ? 'bg-rose-500/10 border-rose-500/30'
                          : 'bg-cyan-500/10 border-cyan-500/30'
                      }`}>
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                            <Scale className="w-3 h-3 text-cyan-400" />
                            <span>FSRA Actuarial Fair Rate</span>
                          </div>
                          <div className="font-bold text-white mt-0.5">
                            ${sq.benchmark_premium}/mo
                            <span className="text-[10px] text-slate-400 font-normal ml-1.5">
                              ({sq.verdict_title || 'Fair Value'})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-md font-black text-[11px] inline-flex items-center gap-1 ${
                            sq.delta_percent < 0
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {sq.delta_percent < 0 ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : (
                              <TrendingUp className="w-3 h-3" />
                            )}
                            {sq.delta_percent > 0 ? `+${sq.delta_percent}%` : `${sq.delta_percent}%`}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">
                            {sq.delta_percent < 0 ? 'Under Benchmark' : 'Above Benchmark'}
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Itemized Coverage Breakdown Accordion */}
                    {(() => {
                      let parsed = {};
                      try {
                        parsed = typeof sq.raw_payload === 'string' ? JSON.parse(sq.raw_payload) : (sq.raw_payload || {});
                      } catch {
                        parsed = {};
                      }
                      const items = parsed.coverage_breakdown || [];
                      if (!items || items.length === 0) return null;

                      const isExpanded = expandedQuoteId === sq.id;

                      return (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => setExpandedQuoteId(isExpanded ? null : sq.id)}
                            className="w-full py-2 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 text-[11px] font-semibold text-cyan-400 flex items-center justify-between transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Actuarial Line Items ({items.length} coverages)</span>
                            </span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2 text-xs animate-in fade-in duration-200">
                              <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-wider border-b border-slate-800/80 pb-1.5">
                                <span>Ontario Coverage Component</span>
                                <span>Annual / Monthly</span>
                              </div>
                              {items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-start text-[11px] gap-2 py-0.5">
                                  <span className="text-slate-300 font-medium">{item.heading}</span>
                                  <span className="text-right shrink-0">
                                    <span className="font-bold text-white">${item.annual}/yr</span>
                                    <span className="text-slate-400 block text-[10px]">${item.monthly}/mo</span>
                                  </span>
                                </div>
                              ))}
                              {parsed.quote_source && (
                                <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 flex flex-wrap justify-between gap-1">
                                  <span className="text-slate-500">Source: <strong className="text-slate-300">{parsed.quote_source}</strong></span>
                                  {parsed.policy_id && <span className="text-slate-500">Quote Ref: <strong className="text-cyan-400">{parsed.policy_id}</strong></span>}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Footer telemetry */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 flex justify-between items-center">
                    <span>Coverage: {sq.coverage_type}</span>
                    <span title={sq.created_at}>Captured: {sq.created_at?.split('T')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

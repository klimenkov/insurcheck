import React, { useState, useEffect } from 'react';
import { Users, Filter, Car, MapPin, Search, Calendar, MessageSquare, PlusCircle } from 'lucide-react';

export function CommunityQuotes({ onOpenContribute }) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCity, setFilterCity] = useState('All');
  const [filterMake, setFilterMake] = useState('All');

  useEffect(() => {
    fetchQuotes();
  }, [filterCity, filterMake]);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      let url = '/api/submissions?';
      if (filterCity !== 'All') url += `city=${encodeURIComponent(filterCity)}&`;
      if (filterMake !== 'All') url += `make=${encodeURIComponent(filterMake)}&`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setQuotes(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cities = ['All', 'Brampton', 'Mississauga', 'Toronto', 'Markham', 'Ottawa', 'Waterloo'];
  const makes = ['All', 'Honda', 'Toyota', 'Lexus', 'Ford', 'Tesla', 'Hyundai', 'Mazda', 'Subaru'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            Crowdsourced Ontario Rates
          </h2>
          <p className="text-sm text-slate-400">
            Real auto insurance costs submitted anonymously by drivers across Ontario.
          </p>
        </div>

        <button
          onClick={onOpenContribute}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          Add What You Pay
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-center">
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

        <div className="ml-auto text-xs text-slate-400 font-medium">
          Showing <strong className="text-white">{quotes.length}</strong> real submissions
        </div>
      </div>

      {/* Submissions List / Cards */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">Loading community quotes...</div>
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
  );
}

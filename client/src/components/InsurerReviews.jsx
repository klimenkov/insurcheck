import React, { useState, useEffect } from 'react';
import { Star, ShieldAlert, PhoneCall, Check, X, ExternalLink, ThumbsUp } from 'lucide-react';

export function InsurerReviews() {
  const [insurers, setInsurers] = useState([]);
  const [selectedInsurer, setSelectedInsurer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    fetch('/api/insurers')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setInsurers(json.data);
          if (json.data.length > 0) {
            handleSelectInsurer(json.data[0]);
          }
        }
      });
  }, []);

  const handleSelectInsurer = async (insurer) => {
    setSelectedInsurer(insurer);
    setLoadingReviews(true);
    try {
      const res = await fetch(`/api/insurers/${insurer.id}/reviews`);
      const json = await res.json();
      if (json.success) setReviews(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
          Ontario Insurer Reviews & Claims Reputation
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Honest feedback on claims payouts (ДТП / аварии), customer support responsiveness, and renewal hikes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Insurers List */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
            Major Ontario Insurers
          </span>
          {insurers.map((ins) => (
            <div
              key={ins.id}
              onClick={() => handleSelectInsurer(ins)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedInsurer?.id === ins.id
                  ? 'bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-sm"
                    style={{ backgroundColor: ins.logo_color }}
                  >
                    {ins.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{ins.name}</h4>
                    <span className="text-[11px] text-slate-400">
                      {ins.direct_online ? 'Direct Online Quote' : 'Available via Brokers'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-amber-400 flex items-center gap-1 justify-end">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{ins.claims_rating}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{ins.total_reviews} reviews</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Detailed Card & Reviews */}
        <div className="lg:col-span-2">
          {selectedInsurer && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-md"
                    style={{ backgroundColor: selectedInsurer.logo_color }}
                  >
                    {selectedInsurer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{selectedInsurer.name}</h3>
                    <a
                      href={selectedInsurer.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>Official Ontario Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Scorecards */}
                <div className="flex items-center gap-3">
                  <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold">Claims Payout</div>
                    <div className="text-base font-black text-emerald-400">{selectedInsurer.claims_rating} / 5.0</div>
                  </div>
                  <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold">Support Speed</div>
                    <div className="text-base font-black text-cyan-400">{selectedInsurer.support_rating} / 5.0</div>
                  </div>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mb-1.5">
                    <Check className="w-4 h-4" /> Pros
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedInsurer.pros}</p>
                </div>
                <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-4">
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1 mb-1.5">
                    <X className="w-4 h-4" /> Watch Out For
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedInsurer.cons}</p>
                </div>
              </div>

              {/* Claims & User Reviews */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
                  Real Driver Experiences & Claims Reports
                </h4>

                {loadingReviews ? (
                  <div className="text-center py-8 text-xs text-slate-500">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/40 rounded-xl">
                    No individual reviews added yet for {selectedInsurer.name}.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-white">{rev.title}</span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span>{rev.vehicle}</span>
                              <span>•</span>
                              <span>{rev.author_city}</span>
                              <span>•</span>
                              <span className="text-emerald-400">${rev.monthly_premium}/mo</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{rev.rating}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">{rev.body}</p>

                        {rev.had_accident === 1 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-900 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                            <span className="text-cyan-400 font-semibold">🚨 Accident Claimed:</span>
                            <span>{rev.claims_experience}</span>
                            {rev.payout_speed && rev.payout_speed !== 'N/A' && (
                              <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded text-[10px]">
                                Resolution: {rev.payout_speed}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

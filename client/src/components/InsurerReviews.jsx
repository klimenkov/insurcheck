import React, { useState, useEffect } from 'react';
import { Star, Check, X, ExternalLink, PlusCircle, Search, ShieldCheck, ThumbsUp } from 'lucide-react';
import { ReviewModal } from './ReviewModal.jsx';

const PARAMETERS_INFO = [
  { key: 'rating_value', title: 'Value for Money', desc: 'Was the price worth the coverage?' },
  { key: 'rating_claims', title: 'Claims Experience', desc: 'How was the claim handled and paid?' },
  { key: 'rating_support', title: 'Customer Support', desc: 'How easy and responsive were they?' },
  { key: 'rating_renewal', title: 'Renewal Experience', desc: 'Did the price change significantly at renewal?' },
  { key: 'rating_ease', title: 'Ease of Service', desc: 'Changing coverage, adding/removing a vehicle, getting documents' }
];

export function InsurerReviews() {
  const [insurers, setInsurers] = useState([]);
  const [selectedInsurer, setSelectedInsurer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const fetchInsurers = async (keepSelectedId) => {
    try {
      const res = await fetch('/api/insurers');
      const json = await res.json();
      if (json.success) {
        setInsurers(json.data);
        const target = keepSelectedId
          ? json.data.find((i) => i.id === keepSelectedId) || json.data[0]
          : json.data[0];
        if (target) {
          handleSelectInsurer(target);
        }
      }
    } catch (err) {
      console.error('Error fetching insurers:', err);
    }
  };

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

  useEffect(() => {
    fetchInsurers();
  }, []);

  const handleReviewSubmitted = (result) => {
    if (result.insurer) {
      setSelectedInsurer(result.insurer);
    }
    if (result.reviews) {
      setReviews(result.reviews);
    }
    fetchInsurers(selectedInsurer?.id);
  };

  const filteredInsurers = insurers.filter((ins) =>
    ins.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
            Ontario Insurer Reviews & Ratings
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Community-driven ratings across 5 key dimensions: Value for Money, Claims Experience, Support Speed, Renewal Hikes, and Ease of Service.
          </p>
        </div>

        <button
          onClick={() => setReviewModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 text-slate-950 font-black text-sm hover:opacity-95 transition shadow-lg shadow-emerald-500/20 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Rate an Insurer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Insurers List with Search */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ontario Carriers ({filteredInsurers.length})
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 15 Ontario insurers..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {filteredInsurers.map((ins) => {
              const overall = ins.overall_rating || ins.claims_rating || 4.0;
              const isSelected = selectedInsurer?.id === ins.id;

              return (
                <div
                  key={ins.id}
                  onClick={() => handleSelectInsurer(ins)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0"
                        style={{ backgroundColor: ins.logo_color }}
                      >
                        {ins.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">{ins.name}</h4>
                        <span className="text-[10px] text-slate-400">
                          {ins.direct_online ? 'Direct Online' : 'Via Brokers'} • ~${ins.avg_monthly}/mo
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-amber-400 flex items-center gap-1 justify-end">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{overall.toFixed(1)}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{ins.total_reviews} reviews</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Card & 5-Dimension Scorecard */}
        <div className="lg:col-span-2">
          {selectedInsurer && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              {/* Insurer Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-md shrink-0"
                    style={{ backgroundColor: selectedInsurer.logo_color }}
                  >
                    {selectedInsurer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">{selectedInsurer.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <a
                        href={selectedInsurer.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Official Ontario Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-slate-600">•</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                        {selectedInsurer.direct_online ? 'Direct Consumer Carrier' : 'Broker Intermediary'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Overall Score</div>
                    <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                      <Star className="w-5 h-5 fill-amber-400" />
                      <span>{(selectedInsurer.overall_rating || selectedInsurer.claims_rating || 4.0).toFixed(1)}</span>
                      <span className="text-xs text-slate-500 font-normal">/ 5.0</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{selectedInsurer.total_reviews} ratings</div>
                  </div>
                </div>
              </div>

              {/* 5-Dimension Evaluation Scorecard */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    5-Parameter Performance Breakdown
                  </h4>
                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Add Your Rating</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PARAMETERS_INFO.map((param) => {
                    const score = selectedInsurer[param.key] || selectedInsurer.claims_rating || 4.0;
                    const percent = Math.min(100, Math.max(0, (score / 5) * 100));

                    return (
                      <div key={param.key} className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-3.5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-white">{param.title}</span>
                          <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {Number(score).toFixed(1)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mb-2">{param.desc}</p>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                    <Check className="w-4 h-4" /> Strongest Advantages
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedInsurer.pros}</p>
                </div>
                <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-4">
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 mb-1.5">
                    <X className="w-4 h-4" /> Watch Out For
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedInsurer.cons}</p>
                </div>
              </div>

              {/* Individual Driver Reviews & Claims */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Driver Ratings & Experience Reports ({reviews.length})
                  </h4>
                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold transition border border-slate-700 cursor-pointer"
                  >
                    + Leave Feedback
                  </button>
                </div>

                {loadingReviews ? (
                  <div className="text-center py-8 text-xs text-slate-500">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/60 p-6">
                    <p className="font-semibold text-slate-400">No driver reviews yet for {selectedInsurer.name}.</p>
                    <p className="mt-1">Be the first Ontario driver to rate their service!</p>
                    <button
                      onClick={() => setReviewModalOpen(true)}
                      className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
                    >
                      Rate {selectedInsurer.name}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-white">
                              {rev.title || 'Ontario Driver Rating'}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span>{rev.vehicle || 'Passenger Vehicle'}</span>
                              <span>•</span>
                              <span>{rev.author_city || 'Ontario'}</span>
                              {rev.monthly_premium > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-400 font-semibold">${rev.monthly_premium}/mo</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{(rev.rating || 4.0).toFixed(1)}</span>
                          </div>
                        </div>

                        {rev.body ? (
                          <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">{rev.body}</p>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic mt-2">Driver submitted rating only (no written review).</p>
                        )}

                        {/* 5-parameter mini badges if available */}
                        {(rev.rating_value || rev.rating_claims || rev.rating_renewal) && (
                          <div className="mt-3 pt-2.5 border-t border-slate-900/80 flex flex-wrap gap-2 text-[10px] text-slate-400">
                            {rev.rating_value && (
                              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                Value: <strong className="text-slate-200">{rev.rating_value}/5</strong>
                              </span>
                            )}
                            {rev.rating_claims && (
                              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                Claims: <strong className="text-slate-200">{rev.rating_claims}/5</strong>
                              </span>
                            )}
                            {rev.rating_support && (
                              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                Support: <strong className="text-slate-200">{rev.rating_support}/5</strong>
                              </span>
                            )}
                            {rev.rating_renewal && (
                              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                Renewal: <strong className="text-slate-200">{rev.rating_renewal}/5</strong>
                              </span>
                            )}
                            {rev.rating_ease && (
                              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                Ease: <strong className="text-slate-200">{rev.rating_ease}/5</strong>
                              </span>
                            )}
                          </div>
                        )}

                        {rev.had_accident === 1 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-900 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                            <span className="text-cyan-400 font-semibold">🚨 Claim Filed:</span>
                            <span>{rev.claims_experience || 'Reported collision'}</span>
                            {rev.payout_speed && rev.payout_speed !== 'N/A' && (
                              <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded text-[10px]">
                                {rev.payout_speed}
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

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        insurers={insurers}
        defaultInsurerId={selectedInsurer?.id}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}

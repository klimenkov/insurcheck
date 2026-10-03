import React, { useState, useEffect } from 'react';
import { X, Star, CheckCircle2, Loader2, MessageSquare, AlertCircle, ShieldAlert, Sparkles, Mail, User, MapPin, Car, DollarSign } from 'lucide-react';

const VOLUNTARY_CRITERIA = [
  {
    id: 'rating_value',
    title: 'Value for Money',
    description: 'Was the monthly premium fair for the coverage and deductible terms?'
  },
  {
    id: 'rating_support',
    title: 'Customer Service & Responsiveness',
    description: 'How helpful, available, and clear was phone, chat, or broker support?'
  },
  {
    id: 'rating_renewal',
    title: 'Renewal Price Fairness',
    description: 'Did renewal rates remain stable, or did they impose unexpected surcharges?'
  },
  {
    id: 'rating_ease',
    title: 'Ease of Digital & Policy Service',
    description: 'Making policy changes, adding drivers/cars, downloading pink slips.'
  }
];

function InteractiveStars({ value, onChange, size = 'md' }) {
  const [hovered, setHovered] = useState(0);
  const starSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hovered || value || 0);
        return (
          <button
            type="button"
            key={star}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label={`${star} out of 5 stars`}
          >
            <Star
              className={`${starSizes[size]} transition-transform ${
                isFilled
                  ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-sm'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export function ReviewModal({ isOpen, onClose, insurers = [], defaultInsurerId, onReviewSubmitted }) {
  const [insurerId, setInsurerId] = useState(defaultInsurerId || (insurers[0]?.id || 'intact'));
  
  // Mandatory overall rating: default is null (zeroed out, no prefilled stars)
  const [overallRating, setOverallRating] = useState(null);

  // Voluntary subcategories: default null
  const [voluntaryRatings, setVoluntaryRatings] = useState({
    rating_value: null,
    rating_support: null,
    rating_renewal: null,
    rating_ease: null,
    rating_claims: null
  });

  const [hadAccident, setHadAccident] = useState(false);
  const [accidentDetails, setAccidentDetails] = useState({
    claims_experience: '',
    payout_speed: ''
  });

  const [reviewer, setReviewer] = useState({
    author_name: '',
    author_email: '',
    author_city: 'Ontario',
    vehicle: '',
    monthly_premium: '',
    title: '',
    body: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (defaultInsurerId) {
      setInsurerId(defaultInsurerId);
    } else if (insurers.length > 0) {
      setInsurerId(insurers[0].id);
    }
  }, [defaultInsurerId, insurers]);

  if (!isOpen) return null;

  const currentInsurer = insurers.find(i => i.id === insurerId) || insurers[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!overallRating) {
      setError('Please provide an Overall Rating (1 to 5 stars).');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        rating: overallRating,
        overall_rating: overallRating,
        rating_value: voluntaryRatings.rating_value,
        rating_support: voluntaryRatings.rating_support,
        rating_renewal: voluntaryRatings.rating_renewal,
        rating_ease: voluntaryRatings.rating_ease,
        had_accident: hadAccident,
        rating_claims: hadAccident ? voluntaryRatings.rating_claims : null,
        claims_experience: hadAccident ? accidentDetails.claims_experience : null,
        payout_speed: hadAccident ? accidentDetails.payout_speed : null,
        author_name: reviewer.author_name.trim() || 'Ontario Driver',
        author_display_name: reviewer.author_name.trim() || 'Ontario Driver',
        author_email: reviewer.author_email.trim() || null,
        author_city: reviewer.author_city.trim() || 'Ontario',
        vehicle: reviewer.vehicle.trim() || 'Passenger Vehicle',
        monthly_premium: reviewer.monthly_premium ? parseInt(reviewer.monthly_premium, 10) : 0,
        title: reviewer.title.trim(),
        body: reviewer.body.trim()
      };

      const res = await fetch(`/api/insurers/${insurerId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        if (onReviewSubmitted) {
          onReviewSubmitted(json.data);
        }
      } else {
        setError(json.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error(err);
      setError('Network error submitting review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setError(null);
    setOverallRating(null);
    setVoluntaryRatings({
      rating_value: null,
      rating_support: null,
      rating_renewal: null,
      rating_ease: null,
      rating_claims: null
    });
    setHadAccident(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-black text-white">Review Published</h3>
            <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
              Your feedback has been verified and added to the Ontario Driver Community Rating for <strong className="text-white">{currentInsurer?.name}</strong>.
            </p>
            <p className="text-xs text-slate-500 mt-3">
              Review counts and dimensional averages update immediately.
            </p>
            <button
              onClick={handleResetAndClose}
              className="mt-6 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition cursor-pointer"
            >
              Back to Insurers
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3.5 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">Share Your Insurer Experience</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ontario Community Driver Ratings • No pre-filled defaults, honest feedback only
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              {/* Select Insurer */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Insurance Provider <span className="text-rose-400 font-bold">*</span>
                </label>
                <select
                  value={insurerId}
                  onChange={(e) => setInsurerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
                >
                  {insurers.map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.name} {ins.is_residual_market ? '(Residual Market)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mandatory Overall Rating */}
              <div className="p-4 bg-slate-950/80 border border-amber-500/30 rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <label className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>Overall Experience Rating</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Required. Click stars to rate (no default pre-selection).
                    </span>
                  </div>
                  <div className="text-sm font-black text-amber-400">
                    {overallRating ? `${overallRating} / 5 Stars` : <span className="text-slate-500 font-normal text-xs italic">Select rating</span>}
                  </div>
                </div>

                <InteractiveStars
                  value={overallRating}
                  onChange={(val) => setOverallRating(val)}
                  size="lg"
                />
              </div>

              {/* Voluntary Subcategory Ratings */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Detailed Ratings (Voluntary)
                  </label>
                  <span className="text-[11px] text-slate-500">Optional • rate only what applies</span>
                </div>

                <div className="space-y-2.5">
                  {VOLUNTARY_CRITERIA.map((criterion) => (
                    <div
                      key={criterion.id}
                      className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{criterion.title}</span>
                          {voluntaryRatings[criterion.id] && (
                            <span className="text-[10px] text-amber-400 font-extrabold bg-amber-500/10 px-1.5 py-0.5 rounded">
                              {voluntaryRatings[criterion.id]}/5
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{criterion.description}</p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <InteractiveStars
                          value={voluntaryRatings[criterion.id]}
                          onChange={(val) => setVoluntaryRatings(prev => ({ ...prev, [criterion.id]: val }))}
                          size="sm"
                        />
                        {voluntaryRatings[criterion.id] && (
                          <button
                            type="button"
                            onClick={() => setVoluntaryRatings(prev => ({ ...prev, [criterion.id]: null }))}
                            className="text-[10px] text-slate-500 hover:text-slate-300 underline"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accident / Claims Experience (Conditioned) */}
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
                <label className="flex items-start sm:items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hadAccident}
                    onChange={(e) => setHadAccident(e.target.checked)}
                    className="w-4 h-4 mt-0.5 sm:mt-0 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs text-white font-bold block">
                      I filed an accident or comprehensive claim with this insurer
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Claims score is strictly calculated only for drivers who went through the claims process.
                    </span>
                  </div>
                </label>

                {hadAccident && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-150">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-xs font-bold text-white">Claims Handling Rating</span>
                        <span className="text-[11px] text-slate-400 block">Payout speed, repair quality, adjuster communication</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <InteractiveStars
                          value={voluntaryRatings.rating_claims}
                          onChange={(val) => setVoluntaryRatings(prev => ({ ...prev, rating_claims: val }))}
                          size="sm"
                        />
                        {voluntaryRatings.rating_claims && (
                          <span className="text-xs font-bold text-amber-400">
                            {voluntaryRatings.rating_claims}/5
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Claim Incident / Description</label>
                        <input
                          type="text"
                          value={accidentDetails.claims_experience}
                          onChange={(e) => setAccidentDetails(prev => ({ ...prev, claims_experience: e.target.value }))}
                          placeholder="e.g. Winter fender bender, rear-ended at red light"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Resolution Timeframe</label>
                        <input
                          type="text"
                          value={accidentDetails.payout_speed}
                          onChange={(e) => setAccidentDetails(prev => ({ ...prev, payout_speed: e.target.value }))}
                          placeholder="e.g. Approved in 3 days, repaired in 10 days"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Written Review (Optional) */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Review Summary & Details
                  </label>
                  <span className="text-[11px] text-slate-500">Optional</span>
                </div>

                <input
                  type="text"
                  value={reviewer.title}
                  onChange={(e) => setReviewer(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Headline (e.g. Competitive initial rate, but renewal jumped $30/mo)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />

                <textarea
                  rows={3}
                  value={reviewer.body}
                  onChange={(e) => setReviewer(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Tell Ontario drivers about your experience, claims handling, phone support, or annual rate changes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Reviewer Details (Name & Email for Verification) */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={reviewer.author_name}
                      onChange={(e) => setReviewer(prev => ({ ...prev, author_name: e.target.value }))}
                      placeholder="e.g. Alex M. or Anonymous Driver"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      Email (Private verification)
                    </label>
                    <input
                      type="email"
                      value={reviewer.author_email}
                      onChange={(e) => setReviewer(prev => ({ ...prev, author_email: e.target.value }))}
                      placeholder="your.email@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Never displayed publicly. Verifies your review authenticity.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      City / Region
                    </label>
                    <input
                      type="text"
                      value={reviewer.author_city}
                      onChange={(e) => setReviewer(prev => ({ ...prev, author_city: e.target.value }))}
                      placeholder="e.g. Toronto, London"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                      <Car className="w-3 h-3 text-slate-500" />
                      Vehicle Insured
                    </label>
                    <input
                      type="text"
                      value={reviewer.vehicle}
                      onChange={(e) => setReviewer(prev => ({ ...prev, vehicle: e.target.value }))}
                      placeholder="e.g. 2021 Toyota RAV4"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-slate-500" />
                      Monthly Cost ($ CAD)
                    </label>
                    <input
                      type="number"
                      value={reviewer.monthly_premium}
                      onChange={(e) => setReviewer(prev => ({ ...prev, monthly_premium: e.target.value }))}
                      placeholder="e.g. 225"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 hover:opacity-95 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Star className="w-4 h-4 fill-slate-950" />
                    <span>Publish Driver Review</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

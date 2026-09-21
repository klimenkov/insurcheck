import React, { useState, useEffect } from 'react';
import { X, Star, CheckCircle2, Loader2, MessageSquare, AlertCircle } from 'lucide-react';

const RATING_CRITERIA = [
  {
    id: 'rating_value',
    title: 'Value for Money',
    description: 'Was the monthly price worth the protection and coverage received?'
  },
  {
    id: 'rating_claims',
    title: 'Claims Experience',
    description: 'How was the claim handled, payout speed, and adjuster communication?'
  },
  {
    id: 'rating_support',
    title: 'Customer Support',
    description: 'How responsive, knowledgeable, and polite was phone/chat support?'
  },
  {
    id: 'rating_renewal',
    title: 'Renewal Experience',
    description: 'Did the rate stay fair at renewal, or did they impose unexpected price hikes?'
  },
  {
    id: 'rating_ease',
    title: 'Ease of Service',
    description: 'Changing coverage, adding/removing vehicles, getting pink slips and documents.'
  }
];

function StarRating({ value, onChange, label, description }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 sm:p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-white">{label}</span>
        <span className="text-xs font-black text-amber-400">
          {(hovered || value)} / 5
        </span>
      </div>
      <p className="text-[11px] text-slate-400 mb-2.5 leading-snug">{description}</p>
      
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hovered || value);
          return (
            <button
              type="button"
              key={star}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <Star
                className={`w-6 h-6 transition-transform ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 scale-110'
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ReviewModal({ isOpen, onClose, insurers = [], defaultInsurerId, onReviewSubmitted }) {
  const [insurerId, setInsurerId] = useState(defaultInsurerId || (insurers[0]?.id || 'intact'));
  const [ratings, setRatings] = useState({
    rating_value: 4,
    rating_claims: 4,
    rating_support: 4,
    rating_renewal: 4,
    rating_ease: 4
  });
  const [details, setDetails] = useState({
    title: '',
    body: '',
    author_city: 'Toronto',
    vehicle: '2022 Honda Civic',
    monthly_premium: '',
    had_accident: false,
    claims_experience: '',
    payout_speed: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...ratings,
        ...details,
        monthly_premium: details.monthly_premium ? parseInt(details.monthly_premium, 10) : 0
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
          onReviewSubmitted(json);
        }
      } else {
        setError(json.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error(err);
      setError('Network error submitting review');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white">Review Submitted!</h3>
            <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
              Thank you for contributing. Your rating directly updates the community benchmark and helps Ontario drivers hold insurance carriers accountable.
            </p>
            <button
              onClick={handleResetAndClose}
              className="mt-6 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">Rate Your Ontario Insurer</h2>
                <span className="text-xs text-slate-400">
                  Rate across 5 key dimensions. Written comments are optional!
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              {/* Select Insurer */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Insurance Provider
                </label>
                <select
                  value={insurerId}
                  onChange={(e) => setInsurerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {insurers.map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5 Rating Criteria */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  5 Key Experience Ratings (1 to 5 Stars)
                </label>
                <div className="space-y-2.5">
                  {RATING_CRITERIA.map((criterion) => (
                    <StarRating
                      key={criterion.id}
                      label={criterion.title}
                      description={criterion.description}
                      value={ratings[criterion.id]}
                      onChange={(newVal) => setRatings({ ...ratings, [criterion.id]: newVal })}
                    />
                  ))}
                </div>
              </div>

              {/* Written Review (Optional) */}
              <div className="pt-2 border-t border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Written Comments (Optional)
                  </label>
                  <span className="text-[11px] text-slate-500">Leave blank to submit stars only</span>
                </div>

                <input
                  type="text"
                  value={details.title}
                  onChange={(e) => setDetails({ ...details, title: e.target.value })}
                  placeholder="Short summary (e.g. Great roadside service, but renewal was high)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />

                <textarea
                  rows={3}
                  value={details.body}
                  onChange={(e) => setDetails({ ...details, body: e.target.value })}
                  placeholder="Share details about your experience, claims process, or premium changes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Optional Policy & Driver Context */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">City / Region (optional)</label>
                  <input
                    type="text"
                    value={details.author_city}
                    onChange={(e) => setDetails({ ...details, author_city: e.target.value })}
                    placeholder="e.g. Toronto, Ottawa"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Vehicle (optional)</label>
                  <input
                    type="text"
                    value={details.vehicle}
                    onChange={(e) => setDetails({ ...details, vehicle: e.target.value })}
                    placeholder="e.g. 2021 Toyota RAV4"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Monthly Cost $ (optional)</label>
                  <input
                    type="number"
                    value={details.monthly_premium}
                    onChange={(e) => setDetails({ ...details, monthly_premium: e.target.value })}
                    placeholder="e.g. 210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Accident Claim toggle */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={details.had_accident}
                    onChange={(e) => setDetails({ ...details, had_accident: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
                  />
                  <span className="text-xs text-slate-300 font-medium">
                    I filed an accident or comprehensive claim with this insurer
                  </span>
                </label>

                {details.had_accident && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Claim Type</span>
                      <input
                        type="text"
                        value={details.claims_experience}
                        onChange={(e) => setDetails({ ...details, claims_experience: e.target.value })}
                        placeholder="e.g. Winter fender bender / Not at fault"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Resolution Speed</span>
                      <input
                        type="text"
                        value={details.payout_speed}
                        onChange={(e) => setDetails({ ...details, payout_speed: e.target.value })}
                        placeholder="e.g. Repaired in 5 days"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 hover:opacity-95 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Star className="w-4 h-4 fill-slate-950" />
                    <span>Submit Rating & Review</span>
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

import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export function LeadModal({ isOpen, onClose, checkResult }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vehicle: `${checkResult?.vehicle?.year || ''} ${checkResult?.vehicle?.make || ''} ${checkResult?.vehicle?.model || ''}`,
          postalCode: checkResult?.location?.label || '',
          currentPremium: checkResult?.currentPremium || 0,
          estimatedSavings: checkResult?.annualSavings || 0
        })
      });
      const json = await res.json();
      if (json.success) setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isEstimating = Boolean(checkResult?.isEstimating);
  const annualSavings = isEstimating ? 0 : (checkResult?.annualSavings || 0);

  let modalTitle = "Lock In Your Best Insurance Price";
  let modalSubtitle = "Independent brokers compare 30+ Ontario carriers (Intact, Aviva, Travelers, etc.) with zero obligation.";

  if (!isEstimating) {
    if (annualSavings > 0) {
      modalTitle = `Save Up to $${annualSavings.toLocaleString()}/year`;
      modalSubtitle = "Independent brokers compare 30+ Ontario carriers (Intact, Aviva, Travelers, etc.) with zero obligation.";
    } else {
      modalTitle = "See If You Can Find a Better Rate";
      modalSubtitle = "Even with a competitive rate, brokers often find unlisted discounts across 30+ insurers with zero obligation.";
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white">Broker Match Requested!</h3>
            <p className="text-sm text-slate-300 mt-2">
              {isEstimating
                ? "A certified independent Ontario insurance broker will compare 30+ insurers to find your lowest available rate."
                : annualSavings > 0
                ? `A certified independent Ontario insurance broker will review your quote to unlock your potential $${annualSavings.toLocaleString()}/year savings.`
                : "A certified independent Ontario insurance broker will search 30+ insurers to see if unlisted discounts can beat your current rate."}
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              Verified Ontario Broker Match
            </div>
            <h3 className="text-2xl font-black text-white leading-tight">
              {modalTitle}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {modalSubtitle}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Alex Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="(416) 555-0199"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Get Official Quotes</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, CheckCircle2, Loader2, AlertCircle, User, Shield, Sparkles } from 'lucide-react';
import { VEHICLE_OPTIONS } from '../data/vehicles.js';

export function ContributeModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    postalCode: 'M5V',
    vehicleMake: 'Toyota',
    vehicleModel: 'RAV4',
    vehicleYear: 2022,
    driverAge: 32,
    yearsLicensed: 10,
    cleanRecord: true,
    providerName: '',
    monthlyPremium: 210,
    coverageType: 'Standard',
    comment: '',
    shareAnonymously: true
  });

  if (!isOpen) return null;

  const premiumVal = parseFloat(formData.monthlyPremium);
  const isTooLow = !isNaN(premiumVal) && premiumVal < 50;
  const isTooHigh = !isNaN(premiumVal) && premiumVal > 1200;
  const isPremiumInvalid = isNaN(premiumVal) || isTooLow || isTooHigh;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isPremiumInvalid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('insurcheck:submission-created'));
        }
      } else {
        setError(json.error || 'Failed to submit rate');
      }
    } catch (err) {
      console.error(err);
      setError('Network error submitting rate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
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
            <h3 className="text-xl font-black text-white">Thank you for contributing!</h3>
            <p className="text-sm text-slate-300 mt-2">
              Your rate is now part of the open community benchmark, helping other Ontario drivers avoid overpaying.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-black text-white">Anonymously Share What You Pay</h3>
            <p className="text-xs text-slate-400 mt-1">
              Help fight Ontario's broken insurance market. No personal info or VIN required.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Make</label>
                  <select
                    value={formData.vehicleMake}
                    onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {VEHICLE_OPTIONS.map((v) => <option key={v.make} value={v.make}>{v.make}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Model</label>
                  <input
                    type="text"
                    required
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.vehicleYear}
                    onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Postal Code (First 3 chars)</label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="L6P"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono uppercase text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Current Insurance Company</label>
                  <select
                    value={formData.providerName}
                    onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  >
                    <option value="">Select insurer</option>
                    <option value="Intact">Intact</option>
                    <option value="TD Insurance">TD Insurance</option>
                    <option value="Aviva">Aviva</option>
                    <option value="Belairdirect">Belairdirect</option>
                    <option value="CAA Insurance">CAA Insurance</option>
                    <option value="Economical">Economical</option>
                    <option value="Desjardins">Desjardins</option>
                    <option value="Co-operators">Co-operators</option>
                    <option value="Sonnet">Sonnet</option>
                    <option value="Square One">Square One Insurance</option>
                    <option value="Wawanesa">Wawanesa</option>
                    <option value="Travelers">Travelers</option>
                    <option value="Allstate">Allstate</option>
                    <option value="Gore Mutual">Gore Mutual</option>
                    <option value="Northbridge">Northbridge</option>
                    <option value="Facility">Facility (High Risk)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Monthly Premium ($)</label>
                  <input
                    type="number"
                    min="50"
                    max="1200"
                    value={formData.monthlyPremium}
                    onChange={(e) => setFormData({ ...formData, monthlyPremium: e.target.value })}
                    className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none transition ${
                      isPremiumInvalid ? 'border-amber-500' : 'border-slate-800'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Coverage Level */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Coverage Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Liability', label: 'Liability Only' },
                    { id: 'Standard', label: 'Standard' },
                    { id: 'Full', label: 'Comprehensive / Full' }
                  ].map((cov) => (
                    <button
                      key={cov.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, coverageType: cov.id })}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                        formData.coverageType === cov.id
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {cov.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Driver Age & License Experience */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  Driver Age & License Experience
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block mb-1">
                      Driver Age: <strong className="text-white">{formData.driverAge} yrs</strong>
                    </span>
                    <input
                      type="range"
                      min="16"
                      max="80"
                      value={formData.driverAge}
                      onChange={(e) => setFormData({ ...formData, driverAge: parseInt(e.target.value, 10) })}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>16</span>
                      <span>35</span>
                      <span>70+</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block mb-1">
                      Years with Full G: <strong className="text-white">{formData.yearsLicensed} yrs</strong>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={formData.yearsLicensed}
                      onChange={(e) => setFormData({ ...formData, yearsLicensed: parseInt(e.target.value, 10) })}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>0 (New)</span>
                      <span>10 yrs</span>
                      <span>30+</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Claims & Tickets History */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Claims or tickets in past 3 years?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, cleanRecord: true })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition cursor-pointer ${
                      formData.cleanRecord
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    ✅ Clean (0 tickets / claims)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, cleanRecord: false })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition cursor-pointer ${
                      !formData.cleanRecord
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    ⚠️ Has Tickets / Claims
                  </button>
                </div>
              </div>

              {isTooLow && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Ontario auto policies start at $50/mo. Please check your monthly amount.</span>
                </div>
              )}

              {isTooHigh && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Maximum supported monthly rate is $1,200/mo. If this is annual, divide by 12.</span>
                </div>
              )}

              {error && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Optional Comment / Tips</label>
                <textarea
                  rows={2}
                  placeholder="e.g., switched from TD, got winter tire discount, renewal price jumped..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer group py-1">
                <input
                  type="checkbox"
                  checked={formData.shareAnonymously}
                  onChange={(e) => setFormData({ ...formData, shareAnonymously: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs text-slate-300 group-hover:text-emerald-300 transition leading-relaxed">
                  Share my rate anonymously to help improve the InsurCheck benchmark
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || isPremiumInvalid}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Submit Rate Anonymously'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { VEHICLE_OPTIONS } from '../data/vehicles.js';

export function ContributeModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) setSubmitted(true);
    } catch (err) {
      console.error(err);
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
                    <option value="Wawanesa">Wawanesa</option>
                    <option value="Travelers">Travelers</option>
                    <option value="Allstate">Allstate</option>
                    <option value="Gore Mutual">Gore Mutual</option>
                    <option value="Northbridge">Northbridge</option>
                    <option value="Facility">Facility</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Monthly Premium ($)</label>
                  <input
                    type="number"
                    value={formData.monthlyPremium}
                    onChange={(e) => setFormData({ ...formData, monthlyPremium: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400"
                    required
                  />
                </div>
              </div>

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
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition cursor-pointer"
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

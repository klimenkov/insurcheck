import React, { useState } from 'react';
import { Car, MapPin, User, Shield, DollarSign, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { VEHICLE_OPTIONS, POPULAR_FSAS } from '../data/vehicles.js';

export function SanityChecker({ onCalculate, loading }) {
  const [formData, setFormData] = useState({
    vehicleMake: 'Honda',
    vehicleModel: 'CR-V',
    vehicleYear: 2022,
    postalCode: 'L6P',
    driverAge: 28,
    yearsLicensed: 8,
    cleanRecord: true,
    coverageLevel: 'comprehensive',
    currentPremium: 280
  });

  const currentModels = (VEHICLE_OPTIONS.find(v => v.make === formData.vehicleMake)?.models) || ['Standard Model'];

  const handleMakeChange = (make) => {
    const models = VEHICLE_OPTIONS.find(v => v.make === make)?.models || ['Standard'];
    setFormData({
      ...formData,
      vehicleMake: make,
      vehicleModel: models[0]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculate(formData);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="flex items-center justify-between pb-6 border-b border-slate-800/80 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            60-Second Sanity Check
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Just 5 quick inputs to check if your rate makes sense.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
          Zero Personal Info
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Vehicle */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Car className="w-4 h-4 text-emerald-400" />
            1. Your Vehicle
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block mb-1">Make</span>
              <select
                value={formData.vehicleMake}
                onChange={(e) => handleMakeChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {VEHICLE_OPTIONS.map((v) => (
                  <option key={v.make} value={v.make}>{v.make}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block mb-1">Model</span>
              <select
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {currentModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block mb-1">Model Year</span>
              <input
                type="number"
                min="2000"
                max="2026"
                value={formData.vehicleYear}
                onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Location (Postal Code FSA) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            2. Location (First 3 characters of Ontario Postal Code)
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="w-full sm:w-48">
              <input
                type="text"
                maxLength={3}
                placeholder="e.g. L6P, M5V"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-base font-mono uppercase text-white tracking-widest text-center focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs text-slate-400">
              <span className="text-slate-500 self-center">Popular:</span>
              {POPULAR_FSAS.slice(0, 5).map((item) => (
                <button
                  type="button"
                  key={item.fsa}
                  onClick={() => setFormData({ ...formData, postalCode: item.fsa })}
                  className={`px-2 py-1 rounded-lg border text-xs font-medium transition ${
                    formData.postalCode === item.fsa
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {item.fsa} ({item.city.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Driver Age & Experience */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <User className="w-4 h-4 text-emerald-400" />
            3. Driver Age & Experience
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block mb-1">Driver Age: <strong className="text-white">{formData.driverAge} yrs</strong></span>
              <input
                type="range"
                min="16"
                max="80"
                value={formData.driverAge}
                onChange={(e) => setFormData({ ...formData, driverAge: parseInt(e.target.value, 10) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>16 (G2 New)</span>
                <span>35 (Prime)</span>
                <span>70+ (Senior)</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-medium block mb-1">Years with Full G License: <strong className="text-white">{formData.yearsLicensed} yrs</strong></span>
              <input
                type="range"
                min="0"
                max="40"
                value={formData.yearsLicensed}
                onChange={(e) => setFormData({ ...formData, yearsLicensed: parseInt(e.target.value, 10) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0 (Novice)</span>
                <span>10 yrs</span>
                <span>30+ yrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Driving History */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            4. Record in last 3 years
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, cleanRecord: true })}
              className={`p-3 rounded-xl border text-sm font-semibold text-center transition ${
                formData.cleanRecord
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              ✅ Clean (0 tickets, 0 at-fault)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, cleanRecord: false })}
              className={`p-3 rounded-xl border text-sm font-semibold text-center transition ${
                !formData.cleanRecord
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              ⚠️ Tickets or At-Fault Claim
            </button>
          </div>
        </div>

        {/* Step 5: Coverage Package (Клацалка по пакету защиты) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              5. Coverage Package Level
            </label>
            <span className="text-[11px] text-slate-500 font-medium">Matches your current policy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, coverageLevel: 'comprehensive' })}
              className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                formData.coverageLevel === 'comprehensive'
                  ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${formData.coverageLevel === 'comprehensive' ? 'text-emerald-300' : 'text-slate-200'}`}>
                    Full Protection
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Most Popular
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  $2M Liability, Collision + Comp ($500 ded), Rental & Roadside.
                </p>
              </div>
              <div className="mt-2.5 text-[10px] font-semibold text-emerald-400">
                1.30x Pure Risk Baseline
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, coverageLevel: 'standard' })}
              className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                formData.coverageLevel === 'standard'
                  ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${formData.coverageLevel === 'standard' ? 'text-emerald-300' : 'text-slate-200'}`}>
                    Standard Package
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  $1M Liability, Collision + Comp ($1,000 ded), DCPD.
                </p>
              </div>
              <div className="mt-2.5 text-[10px] font-semibold text-slate-400">
                1.00x Pure Risk Baseline
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, coverageLevel: 'minimum' })}
              className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                formData.coverageLevel === 'minimum'
                  ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${formData.coverageLevel === 'minimum' ? 'text-emerald-300' : 'text-slate-200'}`}>
                    Basic Liability Only
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  $1M Liability + DCPD only (no collision or theft coverage).
                </p>
              </div>
              <div className="mt-2.5 text-[10px] font-semibold text-cyan-400">
                0.70x Pure Risk Baseline
              </div>
            </button>
          </div>
        </div>

        {/* Step 6: Current Monthly Premium */}
        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" />
            6. What do you pay per month right now?
          </label>
          <div className="flex items-center gap-4 mt-2">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                min="40"
                max="1200"
                value={formData.currentPremium}
                onChange={(e) => setFormData({ ...formData, currentPremium: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-xl font-extrabold text-white focus:outline-none focus:border-emerald-500"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold">/ month</span>
            </div>
            <div className="text-xs text-slate-400">
              ≈ ${(formData.currentPremium * 12).toLocaleString()} / year
            </div>
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl font-extrabold text-base text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:opacity-95 transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing Ontario Benchmarks...</span>
            </>
          ) : (
            <>
              <span>Run 60-Second Sanity Check</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

import React, { useState } from 'react';
import { Car, MapPin, User, Shield, DollarSign, ArrowRight, Loader2, Sparkles, ShieldCheck, CheckCircle2, Building2, Users, ChevronDown, Minus, Plus, AlertCircle } from 'lucide-react';
import { VEHICLE_OPTIONS, POPULAR_FSAS } from '../data/vehicles.js';

export function SanityChecker({ onCalculate, loading }) {
  const [formData, setFormData] = useState({
    coverageLevel: 'standard',
    postalCode: 'L6P',
    vehicleMake: 'Honda',
    vehicleModel: 'CR-V',
    vehicleYear: 2022,
    isEstimating: false,
    currentPremium: 280,
    insuranceCompany: '',
    driverAge: 28,
    yearsLicensed: 8,
    cleanRecord: true,
    numberOfDrivers: 1,
    numberOfVehicles: 1,
    shareAnonymously: true
  });

  const [householdOpen, setHouseholdOpen] = useState(false);

  const premiumNum = parseFloat(formData.currentPremium);
  const isPremiumTooLow = !formData.isEstimating && formData.currentPremium !== '' && !isNaN(premiumNum) && premiumNum < 50;
  const isPremiumTooHigh = !formData.isEstimating && formData.currentPremium !== '' && !isNaN(premiumNum) && premiumNum > 1200;
  const isPremiumInvalid = isPremiumTooLow || isPremiumTooHigh;

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
            Tell us about your insurance
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            We'll use this to compare your rate with similar Ontario drivers. Nothing is shared publicly.
          </p>
        </div>
        <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
          Zero Personal Info
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Household / Multi-driver Toggle */}
        <div className="bg-slate-950/70 rounded-2xl border border-slate-800 overflow-hidden">
          <button
            type="button"
            onClick={() => setHouseholdOpen(!householdOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-300 hover:text-emerald-300 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              🏠 Multiple drivers or vehicles?
              {(formData.numberOfDrivers > 1 || formData.numberOfVehicles > 1) && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full">
                  {formData.numberOfDrivers}D / {formData.numberOfVehicles}V
                </span>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${householdOpen ? 'rotate-180' : ''}`} />
          </button>

          {householdOpen && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-800/50 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-slate-500 font-medium block mb-2">Number of drivers</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, numberOfDrivers: Math.max(1, formData.numberOfDrivers - 1) })}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:border-emerald-500 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-lg font-extrabold text-white w-6 text-center">{formData.numberOfDrivers}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, numberOfDrivers: Math.min(4, formData.numberOfDrivers + 1) })}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:border-emerald-500 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block mb-2">Number of vehicles</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, numberOfVehicles: Math.max(1, formData.numberOfVehicles - 1) })}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:border-emerald-500 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-lg font-extrabold text-white w-6 text-center">{formData.numberOfVehicles}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, numberOfVehicles: Math.min(4, formData.numberOfVehicles + 1) })}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:border-emerald-500 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 1: Choose Coverage Level (Top category selector) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Choose coverage level
            </label>
            <span className="text-[11px] text-slate-500 font-medium">Click to select</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Basic */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, coverageLevel: 'minimum' })}
              className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-between cursor-pointer ${
                formData.coverageLevel === 'minimum'
                  ? 'bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  formData.coverageLevel === 'minimum' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Shield className="w-4 h-4" />
                </div>
                <div className={`text-sm font-bold ${formData.coverageLevel === 'minimum' ? 'text-white' : 'text-slate-300'}`}>
                  Basic
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Lowest price, minimal coverage
                </p>
              </div>
              <div className="mt-3 text-[10px] font-semibold text-slate-500">
                0.70x Baseline • DCPD
              </div>
            </button>

            {/* Standard */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, coverageLevel: 'standard' })}
              className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-between cursor-pointer ${
                formData.coverageLevel === 'standard'
                  ? 'bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  formData.coverageLevel === 'standard' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className={`text-sm font-bold ${formData.coverageLevel === 'standard' ? 'text-emerald-300' : 'text-slate-200'}`}>
                  Standard
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Most common choice
                </p>
              </div>
              <div className="mt-3 text-[10px] font-semibold text-emerald-400">
                1.00x Pure Risk Baseline
              </div>
            </button>

            {/* Full */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, coverageLevel: 'comprehensive' })}
              className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-between cursor-pointer ${
                formData.coverageLevel === 'comprehensive'
                  ? 'bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  formData.coverageLevel === 'comprehensive' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className={`text-sm font-bold ${formData.coverageLevel === 'comprehensive' ? 'text-white' : 'text-slate-300'}`}>
                  Full
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Maximum protection (includes comprehensive)
                </p>
              </div>
              <div className="mt-3 text-[10px] font-semibold text-emerald-400">
                1.30x Baseline • $500 ded
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Location (Postal code prefix FSA) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            Postal code prefix (FSA)
          </label>
          <span className="text-[11px] text-slate-500 block mb-2">
            The first 3 characters of your postal code (e.g. M4N, L6P)
          </span>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="w-full sm:w-48">
              <input
                type="text"
                maxLength={3}
                placeholder="e.g. M4N"
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
                  className={`px-2 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
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

        {/* Step 3: Vehicle Information */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Car className="w-4 h-4 text-emerald-400" />
            Vehicle Details
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block mb-1">Car make</span>
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
              <span className="text-[11px] text-slate-500 font-medium block mb-1">Car model</span>
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
              <span className="text-[11px] text-slate-500 font-medium block mb-1">Car year</span>
              <input
                type="number"
                min="2000"
                max="2026"
                value={formData.vehicleYear}
                onChange={(e) => setFormData({ ...formData, vehicleYear: parseInt(e.target.value, 10) || 2022 })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Monthly Premium & Estimating Checkbox */}
        <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
          {/* Checkmark: I'm estimating insurance */}
          <div className="mb-3">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isEstimating}
                onChange={(e) => setFormData({ ...formData, isEstimating: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 accent-emerald-500 cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-semibold text-slate-300 group-hover:text-emerald-300 transition">
                I'm estimating insurance (I don't have a current premium)
              </span>
            </label>
          </div>

          {formData.isEstimating ? (
            <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300 leading-relaxed">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Estimating Mode Active:</strong> We'll compute the official Ontario actuarial benchmark for this vehicle and postal code, so you know exactly what quotes to target from insurers without getting overcharged.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  What do you pay per month? (CAD)
                </label>
                <div className="flex items-center gap-4 mt-1.5">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      min="50"
                      max="1200"
                      value={formData.currentPremium}
                      onChange={(e) => setFormData({ ...formData, currentPremium: e.target.value })}
                      className={`w-full bg-slate-900 border rounded-xl pl-8 pr-4 py-2.5 text-lg font-extrabold text-white focus:outline-none transition ${
                        isPremiumInvalid ? 'border-amber-500/80 focus:border-amber-400' : 'border-slate-700 focus:border-emerald-500'
                      }`}
                      placeholder="e.g. 250"
                      required={!formData.isEstimating}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold">/ month</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    ≈ ${((parseFloat(formData.currentPremium) || 0) * 12).toLocaleString()} / year
                  </div>
                </div>

                {isPremiumTooLow && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>In Ontario, mandatory auto insurance begins at $50/mo. Please check your monthly figure.</span>
                  </div>
                )}

                {isPremiumTooHigh && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Monthly rate exceeds expected limits ($1,200/mo). If this is an annual payment, divide by 12.</span>
                  </div>
                )}

                <span className="text-[11px] text-slate-500 mt-1 block">
                  Your current monthly car insurance cost before tax ($50 – $1,200/mo)
                </span>
              </div>

              {/* Standardized 15 Ontario Insurers Dropdown */}
              <div className="pt-2 border-t border-slate-900">
                <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Insurance company (optional)
                </label>
                <select
                  value={formData.insuranceCompany}
                  onChange={(e) => setFormData({ ...formData, insuranceCompany: e.target.value })}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">Select your insurer (optional)</option>
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
                  <option value="Other">Other / Not Listed</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Enables benchmark comparison against specific carrier rate filings approved by FSRA
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Step 5: Driver Age & Experience */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <User className="w-4 h-4 text-emerald-400" />
            Driver Age & License Experience
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

        {/* Step 6: Driving History */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            Claims or tickets in past 3 years?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, cleanRecord: true })}
              className={`p-3 rounded-xl border text-sm font-semibold text-center transition cursor-pointer ${
                formData.cleanRecord
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              ✅ Clean (0 tickets, 0 claims)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, cleanRecord: false })}
              className={`p-3 rounded-xl border text-sm font-semibold text-center transition cursor-pointer ${
                !formData.cleanRecord
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              ⚠️ Tickets or At-Fault Claim
            </button>
          </div>
        </div>

        {/* Anonymous Contribution Opt-in */}
        <label className="flex items-start gap-2.5 cursor-pointer group py-1">
          <input
            type="checkbox"
            checked={formData.shareAnonymously}
            onChange={(e) => setFormData({ ...formData, shareAnonymously: e.target.checked })}
            className="w-4 h-4 mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 accent-emerald-500 cursor-pointer"
          />
          <span className="text-xs text-slate-400 group-hover:text-emerald-300 transition leading-relaxed">
            Share my anonymous rate parameters to help build Ontario's open driver benchmark (zero personal data saved)
          </span>
        </label>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={loading || isPremiumInvalid}
          className="w-full py-4 px-6 rounded-2xl font-extrabold text-base text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:opacity-95 transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing Ontario Benchmarks...</span>
            </>
          ) : (
            <>
              <span>{formData.isEstimating ? 'Calculate Fair Market Quote' : 'See how I compare'}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

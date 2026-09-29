import React, { useState } from 'react';
import { Car, MapPin, User, Shield, DollarSign, ArrowRight, Loader2, Sparkles, ShieldCheck, CheckCircle2, Building2, Users, ChevronDown, Minus, Plus, AlertCircle, Info, X } from 'lucide-react';
import { VEHICLE_OPTIONS, POPULAR_FSAS } from '../data/vehicles.js';
import { SearchableSelect } from './SearchableSelect.jsx';
import { parseAndValidatePostalCode } from '../utils/postalCode.js';

const YEAR_OPTIONS = Array.from({ length: 27 }, (_, i) => 2026 - i);

export function SanityChecker({ onCalculate, loading }) {
  const [formData, setFormData] = useState({
    coverageLevel: '',
    postalCode: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    isEstimating: false,
    currentPremium: '',
    insuranceCompany: '',
    customInsuranceCompany: '',
    driverAge: '',
    yearsLicensed: '',
    cleanRecord: true,
    numberOfDrivers: 1,
    numberOfVehicles: 1,
    shareAnonymously: false
  });

  const [householdOpen, setHouseholdOpen] = useState(false);
  const [coverageInfoOpen, setCoverageInfoOpen] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [postalTouched, setPostalTouched] = useState(false);

  // Postal code validation & FSA extraction
  const postalValidation = parseAndValidatePostalCode(formData.postalCode);
  const showPostalError = (postalTouched || attemptedSubmit) && !postalValidation.isValid;

  // Premium validation
  const premiumNum = parseFloat(formData.currentPremium);
  const isPremiumEmpty = !formData.isEstimating && (formData.currentPremium === '' || isNaN(premiumNum));
  const isPremiumTooLow = !formData.isEstimating && formData.currentPremium !== '' && !isNaN(premiumNum) && premiumNum < 50;
  const isPremiumTooHigh = !formData.isEstimating && formData.currentPremium !== '' && !isNaN(premiumNum) && premiumNum > 2500;
  const isPremiumInvalid = isPremiumEmpty || isPremiumTooLow || isPremiumTooHigh;

  // Driver age & experience validation
  const ageNum = parseInt(formData.driverAge, 10);
  const isAgeInvalid = formData.driverAge === '' || isNaN(ageNum) || ageNum < 16 || ageNum > 99;

  const yearsNum = parseInt(formData.yearsLicensed, 10);
  const isYearsInvalid = formData.yearsLicensed === '' || isNaN(yearsNum) || yearsNum < 0 || yearsNum > 70;

  // Coverage level validation
  const isCoverageMissing = !formData.coverageLevel;

  // Vehicle details validation
  const currentModels = formData.vehicleMake
    ? (VEHICLE_OPTIONS.find(v => v.make.toLowerCase() === formData.vehicleMake.toLowerCase())?.models || ['Standard Model'])
    : [];

  const isVehicleIncomplete = !formData.vehicleMake || !formData.vehicleModel || !formData.vehicleYear;

  // Insurance company validation (including custom name if Other)
  const isCustomCompanyMissing =
    !formData.isEstimating &&
    formData.insuranceCompany === 'Other' &&
    (!formData.customInsuranceCompany || !formData.customInsuranceCompany.trim());
  const isCompanyMissing = !formData.isEstimating && (!formData.insuranceCompany || isCustomCompanyMissing);

  // Consent validation
  const isConsentMissing = !formData.isEstimating && !formData.shareAnonymously;

  // Overall validity
  const isFormValid =
    !isCoverageMissing &&
    postalValidation.isValid &&
    !isVehicleIncomplete &&
    (!formData.isEstimating ? (!isPremiumInvalid && !isCompanyMissing && !isConsentMissing) : true) &&
    !isAgeInvalid &&
    !isYearsInvalid;

  const handleMakeChange = (make) => {
    setFormData(prev => ({
      ...prev,
      vehicleMake: make,
      vehicleModel: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (!formData.coverageLevel) return;
    if (!postalValidation.isValid) return;
    if (isVehicleIncomplete) return;
    if (!formData.isEstimating) {
      if (isPremiumInvalid || isCompanyMissing) return;
      if (!formData.shareAnonymously) return;
    }
    if (isAgeInvalid || isYearsInvalid) return;

    const resolvedCompany = formData.insuranceCompany === 'Other'
      ? (formData.customInsuranceCompany || '').trim()
      : formData.insuranceCompany;

    onCalculate({
      ...formData,
      insuranceCompany: resolvedCompany,
      // Provide clean extracted 3-character FSA to backend
      postalCode: postalValidation.fsa || formData.postalCode,
      rawPostalCode: formData.postalCode
    });
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
              <span className="text-rose-400 font-bold">*</span>
            </label>
            <button
              type="button"
              onClick={() => setCoverageInfoOpen(true)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Coverage details ⓘ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Basic */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, coverageLevel: 'minimum' })}
              className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
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
                  Lowest price · Minimum coverage
                </p>
              </div>
            </button>

            {/* Standard */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, coverageLevel: 'standard' })}
              className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
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
                  Typical coverage · Balanced protection
                </p>
              </div>
            </button>

            {/* Full */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, coverageLevel: 'comprehensive' })}
              className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
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
                  More protection · Lower out-of-pocket costs
                </p>
              </div>
            </button>
          </div>
          {attemptedSubmit && isCoverageMissing && (
            <p className="text-xs text-rose-400 mt-2.5 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Please select a coverage level to continue.</span>
            </p>
          )}
        </div>

        {/* Coverage Details Modal */}
        {coverageInfoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setCoverageInfoOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Ontario Auto Insurance Tiers
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Coverage Level Breakdown</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                Understand what is covered under each package as mandated and regulated by FSRA in Ontario.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Basic */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="font-extrabold text-sm text-white mb-1">Basic</div>
                    <div className="text-[11px] text-emerald-400 font-semibold mb-3">Lowest price · Minimum coverage</div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      <li className="flex items-start gap-1.5"><span>•</span><span>Mandatory Ontario coverage</span></li>
                      <li className="flex items-start gap-1.5"><span>•</span><span>$200,000 liability</span></li>
                      <li className="flex items-start gap-1.5"><span>•</span><span>DCPD</span></li>
                      <li className="flex items-start gap-1.5 text-slate-400"><span>•</span><span>No collision</span></li>
                      <li className="flex items-start gap-1.5 text-slate-400"><span>•</span><span>No comprehensive</span></li>
                      <li className="flex items-start gap-1.5 text-amber-400/90 font-medium"><span>•</span><span>Higher out-of-pocket risk</span></li>
                    </ul>
                  </div>
                </div>

                {/* Standard */}
                <div className="bg-slate-950/70 border border-emerald-500/40 rounded-2xl p-4 ring-1 ring-emerald-500/20 flex flex-col justify-between">
                  <div>
                    <div className="font-extrabold text-sm text-emerald-300 mb-1">Standard</div>
                    <div className="text-[11px] text-emerald-400 font-semibold mb-3">Typical coverage · Balanced protection</div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      <li className="flex items-start gap-1.5"><span>•</span><span>$1M liability</span></li>
                      <li className="flex items-start gap-1.5"><span>•</span><span>DCPD</span></li>
                      <li className="flex items-start gap-1.5"><span>•</span><span>Comprehensive</span></li>
                      <li className="flex items-start gap-1.5 text-slate-400"><span>•</span><span>$500 deductible</span></li>
                      <li className="flex items-start gap-1.5"><span>•</span><span>Collision</span></li>
                      <li className="flex items-start gap-1.5 text-slate-400"><span>•</span><span>$500 deductible</span></li>
                    </ul>
                  </div>
                </div>

                {/* Full */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="font-extrabold text-sm text-white mb-1">Full</div>
                    <div className="text-[11px] text-emerald-400 font-semibold mb-3">More protection · Lower out-of-pocket costs</div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      <li className="flex items-start gap-1.5"><span>•</span><span>$2M liability</span></li>
                      <li className="flex items-start gap-1.5"><span>•</span><span>DCPD</span></li>
                      <li className="flex items-start gap-1.5"><span>•</span><span>Comprehensive</span></li>
                      <li className="flex items-start gap-1.5 text-slate-400"><span>•</span><span>Lower deductibles</span></li>
                      <li className="flex items-start gap-1.5"><span>•</span><span>Collision</span></li>
                      <li className="flex items-start gap-1.5 text-emerald-400 font-medium"><span>•</span><span>Higher protection overall</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCoverageInfoOpen(false)}
                className="mt-6 w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Location (Postal code or prefix FSA) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            Postal code or prefix (FSA)
            <span className="text-rose-400 font-bold">*</span>
          </label>
          <span className="text-[11px] text-slate-500 block mb-2">
            Enter the first 3 characters (e.g. M4G) or your full postal code (e.g. M4N 0A5)
          </span>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="w-full sm:w-56">
              <input
                type="text"
                maxLength={7}
                placeholder="e.g. M4N or M4N 0A5"
                value={formData.postalCode}
                onBlur={() => setPostalTouched(true)}
                onChange={(e) => {
                  setFormData({ ...formData, postalCode: e.target.value.toUpperCase() });
                  setPostalTouched(true);
                }}
                className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm font-mono uppercase text-white tracking-wider text-center focus:outline-none transition ${
                  showPostalError
                    ? 'border-rose-500/80 focus:border-rose-400 text-rose-200'
                    : 'border-slate-700/80 focus:border-emerald-500'
                }`}
                required
              />
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs text-slate-400">
              <span className="text-slate-500 self-center">Popular:</span>
              {POPULAR_FSAS.slice(0, 5).map((item) => (
                <button
                  type="button"
                  key={item.fsa}
                  onClick={() => {
                    setFormData({ ...formData, postalCode: item.fsa });
                    setPostalTouched(true);
                  }}
                  className={`px-2 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
                    postalValidation.fsa === item.fsa
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {item.fsa} ({item.city.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>
          {showPostalError && (
            <p className="text-xs text-rose-400 mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{postalValidation.error}</span>
            </p>
          )}
          {postalValidation.isValid && postalValidation.fsa && (
            <p className="text-[11px] text-emerald-400/90 mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Resolved to Ontario FSA: <strong>{postalValidation.fsa}</strong></span>
            </p>
          )}
        </div>

        {/* Step 3: Vehicle Information */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Car className="w-4 h-4 text-emerald-400" />
            Vehicle Details
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Make */}
            <div>
              <span className="text-[11px] text-slate-500 font-medium block mb-1">Car make</span>
              <SearchableSelect
                value={formData.vehicleMake}
                onChange={handleMakeChange}
                options={VEHICLE_OPTIONS.map((v) => v.make)}
                placeholder="Select or type a make"
              />
            </div>

            {/* Model */}
            <div>
              <span className="text-[11px] text-slate-500 font-medium block mb-1">Car model</span>
              <SearchableSelect
                value={formData.vehicleModel}
                onChange={(model) => setFormData((prev) => ({ ...prev, vehicleModel: model }))}
                options={currentModels}
                placeholder="Select or type a model"
                disabled={!formData.vehicleMake}
              />
            </div>

            {/* Year */}
            <div>
              <span className="text-[11px] text-slate-500 font-medium block mb-1">Car year</span>
              <div className="relative">
                <select
                  value={formData.vehicleYear}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vehicleYear: e.target.value ? parseInt(e.target.value, 10) : ''
                    }))
                  }
                  className={`w-full bg-slate-950 border rounded-xl pl-3.5 pr-8 py-2.5 text-sm transition appearance-none cursor-pointer focus:outline-none focus:border-emerald-500 ${
                    formData.vehicleYear
                      ? 'text-white border-slate-700/80 hover:border-slate-600'
                      : 'text-slate-500 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <option value="" disabled className="text-slate-500 bg-slate-950">
                    Select year
                  </option>
                  {YEAR_OPTIONS.map((yr) => (
                    <option key={yr} value={yr} className="text-white bg-slate-900">
                      {yr}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
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
                  <span className="text-rose-400 font-bold">*</span>
                </label>
                <div className="flex items-center gap-4 mt-1.5">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
                    <input
                      type="number"
                      min="50"
                      max="2500"
                      value={formData.currentPremium}
                      onChange={(e) => setFormData({ ...formData, currentPremium: e.target.value })}
                      className={`w-full bg-slate-900 border rounded-xl pl-8 pr-16 py-2.5 text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none transition ${
                        attemptedSubmit && isPremiumInvalid
                          ? 'border-rose-500/80 focus:border-rose-400'
                          : isPremiumInvalid && formData.currentPremium !== ''
                          ? 'border-amber-500/80 focus:border-amber-400'
                          : 'border-slate-700 focus:border-emerald-500'
                      }`}
                      placeholder="e.g. 250"
                      required={!formData.isEstimating}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold">/ month</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    ≈ ${((parseFloat(formData.currentPremium) || 0) * 12).toLocaleString()} / year
                  </div>
                </div>

                {attemptedSubmit && isPremiumEmpty && (
                  <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Please enter your current monthly premium.</span>
                  </p>
                )}

                {isPremiumTooLow && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>In Ontario, mandatory auto insurance begins at $50/mo. Please check your monthly figure.</span>
                  </div>
                )}

                {isPremiumTooHigh && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Monthly rate exceeds expected limits. If this is an annual payment, divide by 12.</span>
                  </div>
                )}

                <span className="text-[11px] text-slate-500 mt-1 block">
                  Your current monthly car insurance cost before tax
                </span>
              </div>

              {/* Standardized Ontario Insurers Dropdown - Sorted Z–A */}
              <div className="pt-2 border-t border-slate-900">
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  Insurance company <span className="text-rose-400 font-bold">*</span>
                </label>
                <select
                  required={!formData.isEstimating}
                  value={formData.insuranceCompany}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      insuranceCompany: val,
                      customInsuranceCompany: val === 'Other' ? prev.customInsuranceCompany : ''
                    }));
                  }}
                  className={`w-full bg-slate-900/80 border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition cursor-pointer ${
                    attemptedSubmit && !formData.insuranceCompany
                      ? 'border-rose-500/80 focus:border-rose-400'
                      : 'border-slate-800 focus:border-emerald-500'
                  }`}
                >
                  <option value="">Select your insurance company</option>
                  <option value="Wawanesa">Wawanesa</option>
                  <option value="Travelers">Travelers</option>
                  <option value="TD Insurance">TD Insurance</option>
                  <option value="Square One">Square One Insurance</option>
                  <option value="Sonnet">Sonnet</option>
                  <option value="Northbridge">Northbridge</option>
                  <option value="Intact">Intact</option>
                  <option value="Gore Mutual">Gore Mutual</option>
                  <option value="Facility">Facility (High Risk)</option>
                  <option value="Economical">Economical</option>
                  <option value="Desjardins">Desjardins</option>
                  <option value="Co-operators">Co-operators</option>
                  <option value="CAA Insurance">CAA Insurance</option>
                  <option value="Belairdirect">Belairdirect</option>
                  <option value="Aviva">Aviva</option>
                  <option value="Allstate">Allstate</option>
                  <option value="Other">Other / Not Listed</option>
                </select>

                {attemptedSubmit && !formData.insuranceCompany && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Please select your insurance company.</span>
                  </p>
                )}

                {/* Custom Insurer Name Input when 'Other / Not Listed' is selected (INS-53) */}
                {formData.insuranceCompany === 'Other' && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      Insurance company name <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      required={!formData.isEstimating}
                      placeholder="Enter your insurance company name"
                      value={formData.customInsuranceCompany || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customInsuranceCompany: e.target.value
                        }))
                      }
                      className={`w-full bg-slate-900 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition ${
                        attemptedSubmit && (!formData.customInsuranceCompany || !formData.customInsuranceCompany.trim())
                          ? 'border-rose-500/80 focus:border-rose-400'
                          : 'border-slate-700 focus:border-emerald-500'
                      }`}
                    />
                    {attemptedSubmit && (!formData.customInsuranceCompany || !formData.customInsuranceCompany.trim()) && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Please enter your insurance company name.</span>
                      </p>
                    )}
                  </div>
                )}

                <span className="text-[10px] text-slate-500 mt-1.5 block">
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
            <span className="text-rose-400 font-bold">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block mb-1">
                Driver Age
              </span>
              <input
                type="number"
                min="16"
                max="99"
                placeholder="e.g. 28"
                value={formData.driverAge}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    driverAge: e.target.value === '' ? '' : parseInt(e.target.value, 10)
                  })
                }
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition ${
                  attemptedSubmit && isAgeInvalid
                    ? 'border-rose-500/80 focus:border-rose-400'
                    : 'border-slate-700/80 focus:border-emerald-500'
                }`}
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Min. 16 years old</span>
              {attemptedSubmit && isAgeInvalid && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Please enter your driver age (16–99).
                </p>
              )}
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-medium block mb-1">
                Years with Full G License
              </span>
              <input
                type="number"
                min="0"
                max="70"
                placeholder="e.g. 8"
                value={formData.yearsLicensed}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    yearsLicensed: e.target.value === '' ? '' : parseInt(e.target.value, 10)
                  })
                }
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition ${
                  attemptedSubmit && isYearsInvalid
                    ? 'border-rose-500/80 focus:border-rose-400'
                    : 'border-slate-700/80 focus:border-emerald-500'
                }`}
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">0 for novice / newly licensed</span>
              {attemptedSubmit && isYearsInvalid && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Please enter years with full G license (0 or more).
                </p>
              )}
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

        {/* Anonymous Contribution Consent (Required when not estimating) */}
        {!formData.isEstimating && (
          <div className="space-y-1.5 pt-1">
            <label
              className={`flex items-start gap-2.5 cursor-pointer group p-3 rounded-xl border transition ${
                attemptedSubmit && isConsentMissing
                  ? 'bg-rose-950/20 border-rose-500/40 ring-1 ring-rose-500/30'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.shareAnonymously}
                onChange={(e) => setFormData({ ...formData, shareAnonymously: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 accent-emerald-500 cursor-pointer shrink-0"
              />
              <span className="text-xs text-slate-300 group-hover:text-emerald-300 transition leading-relaxed">
                I agree to share my anonymous rate parameters to help build Ontario's open driver benchmark (zero personal data saved)
              </span>
            </label>
            {attemptedSubmit && isConsentMissing && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5 px-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Please agree to share anonymous rate parameters to proceed.</span>
              </p>
            )}
          </div>
        )}

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={loading || (attemptedSubmit && !isFormValid)}
          className="w-full py-4 px-6 rounded-2xl font-extrabold text-base text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:opacity-95 transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing Ontario Benchmarks...</span>
            </>
          ) : !isFormValid ? (
            <>
              <span>
                {isCoverageMissing
                  ? 'Choose coverage level to start'
                  : !postalValidation.isValid
                  ? 'Enter postal code or FSA'
                  : isVehicleIncomplete
                  ? 'Select vehicle details'
                  : !formData.isEstimating && isPremiumInvalid
                  ? 'Enter monthly premium'
                  : !formData.isEstimating && isCustomCompanyMissing
                  ? 'Enter custom insurer name'
                  : !formData.isEstimating && !formData.insuranceCompany
                  ? 'Select your insurance company'
                  : isAgeInvalid || isYearsInvalid
                  ? 'Enter driver age & experience'
                  : isConsentMissing
                  ? 'Agree to share to continue'
                  : 'Complete form to compare'}
              </span>
              <ArrowRight className="w-5 h-5 opacity-40" />
            </>
          ) : (
            <>
              <span>{formData.isEstimating ? 'Calculate Fair Market Rate' : 'See how I compare'}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

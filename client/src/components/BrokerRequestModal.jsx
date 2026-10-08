import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  Car,
  MapPin,
  TrendingDown,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  AlertCircle,
  ArrowRight,
  Lock
} from 'lucide-react';

export function BrokerRequestModal({
  isOpen,
  onClose,
  calculationData
}) {
  if (!isOpen || !calculationData) return null;

  const {
    vehicle,
    location,
    driver,
    currentPremium,
    activeBenchmarkRate,
    savings,
    discounts = []
  } = calculationData;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactPref, setContactPref] = useState('phone'); // phone, text, email
  const [renewalTimeline, setRenewalTimeline] = useState(
    currentPremium ? 'within_30_days' : 'car_shopping'
  );
  const [consentBroker, setConsentBroker] = useState(false);
  const [consentDisclaimer, setConsentDisclaimer] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError('Please provide your name, email, and phone number.');
      return;
    }

    if (!consentBroker || !consentDisclaimer) {
      setError('Please accept both consent authorizations to connect with a licensed broker.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/marketplace/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postalCode: location?.fsa || 'L6P',
          city: location?.city || 'Ontario',
          vehicleYear: vehicle?.year || 2024,
          vehicleMake: vehicle?.make || 'Vehicle',
          vehicleModel: vehicle?.model || 'Model',
          driverAge: driver?.age || 35,
          yearsLicensed: driver?.yearsLicensed || 15,
          cleanRecord: driver?.cleanRecord !== false,
          coverageType: calculationData.selectedCoverageName || 'Standard',
          currentPremium: currentPremium || null,
          benchmarkRate: activeBenchmarkRate || 200,
          estimatedSavings: savings > 0 ? savings : 0,
          renewalTimeline,
          discounts,
          contactName: fullName.trim(),
          contactEmail: email.trim(),
          contactPhone: phone.trim(),
          contactPref,
          consentContact: true
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit broker request.');
      }

      setSubmissionSuccess(data);
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submissionSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                Reference: {submissionSuccess.reference}
              </span>
              <h3 className="text-2xl font-black text-white mt-1">Your Request is Submitted</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                Participating licensed Ontario brokers are reviewing your profile. An authorized broker will contact you via your preferred method (<span className="text-white font-semibold capitalize">{contactPref}</span>) if they can provide competitive coverage.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] text-slate-400 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exclusivity Guarantee</span>
              </div>
              <p>
                InsurCheck assigns your request to only one broker at a time to prevent multiple companies from spamming your phone.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="pr-8">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  InsurCheck Broker Marketplace
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">
                Find a broker who may offer you a better deal
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Connect with an independent, licensed Ontario insurance broker to shop multiple carriers for your vehicle.
              </p>
            </div>

            {/* Profile Snapshot Callout */}
            <div className="mt-4 p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-emerald-400" />
                  {vehicle?.year} {vehicle?.make} {vehicle?.model}
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {location?.city} ({location?.fsa})
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px]">
                {currentPremium ? (
                  <div>
                    <span className="text-slate-400">Your Current: </span>
                    <span className="font-bold text-white">${currentPremium}/mo</span>
                  </div>
                ) : (
                  <span className="text-slate-400">Vehicle Estimate Scenario</span>
                )}
                <div>
                  <span className="text-slate-400">InsurCheck Benchmark: </span>
                  <span className="font-bold text-emerald-400">${activeBenchmarkRate}/mo</span>
                </div>
                {savings > 0 && (
                  <div className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-[10px]">
                    ~${savings}/mo potential difference
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Your Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Tremblay"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(416) 555-0192"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.ca"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Contact Preference */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Preferred Contact Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'phone', label: 'Phone Call', icon: Phone },
                    { id: 'whatsapp', label: 'Text / WhatsApp', icon: MessageSquare },
                    { id: 'email', label: 'Email Only', icon: Mail }
                  ].map((p) => {
                    const Icon = p.icon;
                    const isSelected = contactPref === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setContactPref(p.id)}
                        className={`py-2 px-2.5 rounded-xl border text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Renewal Timeline */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Policy Renewal Timeline
                </label>
                <select
                  value={renewalTimeline}
                  onChange={(e) => setRenewalTimeline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="immediate">Immediate (renewing within 7 days)</option>
                  <option value="within_30_days">Within 30 days (standard renewal window)</option>
                  <option value="1_to_3_months">1 to 3 months</option>
                  <option value="car_shopping">Shopping for a new/used vehicle</option>
                </select>
              </div>

              {/* Un-preselected Consents (INS-65 Section 2) */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-300">
                  <input
                    type="checkbox"
                    checked={consentBroker}
                    onChange={(e) => setConsentBroker(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700 mt-0.5 cursor-pointer shrink-0"
                  />
                  <span>
                    I authorize InsurCheck to securely share my vehicle details, postal territory, and contact information with a licensed Ontario insurance brokerage to review my rate options.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-400">
                  <input
                    type="checkbox"
                    checked={consentDisclaimer}
                    onChange={(e) => setConsentDisclaimer(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700 mt-0.5 cursor-pointer shrink-0"
                  />
                  <span>
                    I understand that InsurCheck calculates independent market estimates and cannot guarantee a broker will accept this request or offer a lower price.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Submit Request to Brokers</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-500 text-center mt-2">
                  Zero obligation. 100% free for Ontario drivers. Your data is protected.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

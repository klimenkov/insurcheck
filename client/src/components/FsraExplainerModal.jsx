import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  Scale,
  MapPin,
  Car,
  UserCheck,
  FileText,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

export function FsraExplainerModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('formula');

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-3xl bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  What is the FSRA Fair Rate Benchmark?
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Actuarial Standard
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Ontario Financial Services Regulatory Authority (FSRA) Actuarial Methodology
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close FSRA Explainer"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-950/40 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveSection('formula')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSection === 'formula'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Rating Formula</span>
          </button>
          <button
            onClick={() => setActiveSection('territory')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSection === 'territory'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Territory Multipliers</span>
          </button>
          <button
            onClick={() => setActiveSection('theft')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSection === 'theft'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Vehicle Theft Index</span>
          </button>
          <button
            onClick={() => setActiveSection('rights')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSection === 'rights'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Driver Rights & Filing Cycles</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 flex-1">
          {activeSection === 'formula' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl">
                <h4 className="text-sm font-bold text-emerald-300 mb-1 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  The Pure Mathematical Cost of Risk
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In Ontario, insurance companies cannot arbitrarily set prices. Under the <em>Insurance Act</em>, every carrier must file their rating algorithms with <strong>FSRA (Financial Services Regulatory Authority of Ontario)</strong>. InsurCheck calculates the actuarial pure-cost baseline using standardized regulatory loss metrics.
                </p>
              </div>

              {/* Mathematical Formula Banner */}
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl font-mono text-center space-y-2 shadow-inner">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                  Actuarial Multiplicative Formula
                </span>
                <div className="text-sm sm:text-base font-bold text-slate-100 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-emerald-400 font-extrabold">$175 Base</span>
                  <span className="text-slate-500">×</span>
                  <span className="text-sky-400">Territory (R_terr)</span>
                  <span className="text-slate-500">×</span>
                  <span className="text-amber-400">Vehicle Risk</span>
                  <span className="text-slate-500">×</span>
                  <span className="text-rose-400">Driver Experience</span>
                  <span className="text-slate-500">×</span>
                  <span className="text-purple-400">Record</span>
                </div>
              </div>

              {/* Formula Factors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    1. Base Rate ($175/mo)
                  </span>
                  <p className="text-slate-400">
                    The Ontario province-wide neutral rate for a mature adult driver (G license) with standard mandatory coverage ($2M Liability, Comprehensive & Collision $1,000 deductible, DCPD, and Statutory Accident Benefits).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-1">
                  <span className="font-bold text-sky-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    2. Territorial Rating (0.73x – 1.48x)
                  </span>
                  <p className="text-slate-400">
                    Keyed to the driver’s 3-digit postal code (Forward Sortation Area). Brampton zones face up to +48% surcharge due to high collision and litigation claim frequency.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-1">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    3. Vehicle & Theft Rating (0.85x – 1.45x)
                  </span>
                  <p className="text-slate-400">
                    CLEAR (Canadian Loss Experience Automobile Rating) combined with Équité Association theft rankings. Highly targeted SUVs (Lexus RX, Highlander) face steep surcharges.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-1">
                  <span className="font-bold text-rose-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    4. Driver & Licensing Relativity (0.88x – 1.75x)
                  </span>
                  <p className="text-slate-400">
                    G2 novice drivers (1.75x) face higher risk curves due to claim probability, whereas full G drivers with 10+ years accident-free experience receive preferred discounts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'territory' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-xs text-slate-300">
                Ontario is divided into over 140 actuarial rating territories. Your address determines almost <strong>40% of your total premium</strong>. Here is how major regions compare against the provincial benchmark:
              </p>

              <div className="space-y-2.5">
                <div className="p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Brampton & Northwest GTA</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Extreme (1.42x – 1.48x)
                      </span>
                    </div>
                    <p className="text-xs text-rose-200/70 mt-0.5">
                      FSAs: L6P, L6R, L6Y, L4H. +42% to +48% surcharge due to collision density and medical accident benefits litigation.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-rose-400">$249 – $259</span>
                    <span className="text-[10px] text-slate-400 block">/mo baseline</span>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Mississauga, Vaughan & Scarborough</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        High Risk (1.18x – 1.28x)
                      </span>
                    </div>
                    <p className="text-xs text-amber-200/70 mt-0.5">
                      FSAs: L5M, M1B, L4L. Dense highway commuter traffic (Hwy 401, 410, 427 corridor).
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-amber-400">$206 – $224</span>
                    <span className="text-[10px] text-slate-400 block">/mo baseline</span>
                  </div>
                </div>

                <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/30 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Downtown Toronto & Oakville / Burlington</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Standard / Moderate (0.95x – 1.08x)
                      </span>
                    </div>
                    <p className="text-xs text-cyan-200/70 mt-0.5">
                      FSAs: M5V, L6H, L7L. High transit usage, lower average annual driving kilometers.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-cyan-400">$166 – $189</span>
                    <span className="text-[10px] text-slate-400 block">/mo baseline</span>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Ottawa, Kingston & Rural Ontario</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Low Risk (0.73x – 0.85x)
                      </span>
                    </div>
                    <p className="text-xs text-emerald-200/70 mt-0.5">
                      FSAs: K1P, K2M, K7L. Statistically lowest loss ratios and claim fraud in the province.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-emerald-400">$128 – $149</span>
                    <span className="text-[10px] text-slate-400 block">/mo baseline</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'theft' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-2xl space-y-1">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  The Équité Association Auto-Theft Impact
                </h4>
                <p className="text-xs text-slate-300">
                  In Ontario, auto theft insurance payouts exceeded $1 Billion annually. In response, carriers approved by FSRA have instituted mandatory $500 to $1,500 theft surcharges on high-risk targeted vehicles unless approved anti-theft tracking (Tag tracking system) is installed.
                </p>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Rank</th>
                      <th className="py-2.5 px-4">Target Vehicle</th>
                      <th className="py-2.5 px-4">Risk Factor</th>
                      <th className="py-2.5 px-4">Actuarial Surcharge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    <tr className="bg-rose-950/10">
                      <td className="py-3 px-4 font-bold text-rose-400">#1</td>
                      <td className="py-3 px-4 text-white font-bold">Lexus RX Series (2018–2023)</td>
                      <td className="py-3 px-4 text-rose-300">1.38x Multiplier</td>
                      <td className="py-3 px-4 text-rose-400 font-mono">+$40–$80/mo</td>
                    </tr>
                    <tr className="bg-rose-950/10">
                      <td className="py-3 px-4 font-bold text-rose-400">#2</td>
                      <td className="py-3 px-4 text-white font-bold">Toyota Highlander (2019–2023)</td>
                      <td className="py-3 px-4 text-rose-300">1.32x Multiplier</td>
                      <td className="py-3 px-4 text-rose-400 font-mono">+$35–$70/mo</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-amber-400">#3</td>
                      <td className="py-3 px-4 text-white font-bold">Honda CR-V (2017–2022)</td>
                      <td className="py-3 px-4 text-amber-300">1.25x Multiplier</td>
                      <td className="py-3 px-4 text-amber-400 font-mono">+$25–$50/mo</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-amber-400">#4</td>
                      <td className="py-3 px-4 text-white font-bold">Dodge Ram 1500 (2020–2023)</td>
                      <td className="py-3 px-4 text-amber-300">1.22x Multiplier</td>
                      <td className="py-3 px-4 text-amber-400 font-mono">+$20–$45/mo</td>
                    </tr>
                    <tr className="bg-emerald-950/10">
                      <td className="py-3 px-4 font-bold text-emerald-400">Low</td>
                      <td className="py-3 px-4 text-slate-200">Subaru Forester / Outback</td>
                      <td className="py-3 px-4 text-emerald-300">0.95x (Discounted)</td>
                      <td className="py-3 px-4 text-emerald-400 font-mono">-$15/mo discount</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'rights' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-xs text-slate-300">
                Understanding how rate filing cycles work in Ontario protects you from paying arbitrary broker markups or uncompetitive renewals:
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">Monthly / Quarterly FSRA Rate Filing Cycles</h5>
                    <p className="text-slate-400 mt-1 leading-relaxed">
                      Ontario carriers submit rate change applications to FSRA quarterly. Once approved, the new rates take effect on upcoming policy renewal dates. This is why InsurCheck harvests market benchmarks on a <strong>monthly batch cadence</strong> rather than real-time polling.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex items-start gap-3">
                  <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl mt-0.5">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">The "Take-All-Comers" Rule</h5>
                    <p className="text-slate-400 mt-1 leading-relaxed">
                      By Ontario law, any licensed insurance carrier must provide a quote to any licensed driver who meets their filed underwriting rules. If an insurer quotes you a 200% inflated price, it is often a soft refusal. You have the right to shop the entire competitive market.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex items-start gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl mt-0.5">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">How to Challenge an Unfair Renewal</h5>
                    <p className="text-slate-400 mt-1 leading-relaxed">
                      If your renewal rate exceeds InsurCheck's FSRA Fair Rate by more than <strong>15%</strong>, your insurer is likely applying legacy inertia pricing. Call your carrier or broker with your benchmark calculation to negotiate or switch 30 days prior to renewal with zero penalties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Source: FSRA Automobile Insurance Rate Approvals Database</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

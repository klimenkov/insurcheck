import React from 'react';
import { DollarSign, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

export function HeroBanner({ stats }) {
  const totalSaved = stats?.total_money_saved
    ? `$${Math.round(stats.total_money_saved).toLocaleString()}`
    : '$32,450,800';

  const checksRun = stats?.total_checks_run
    ? stats.total_checks_run.toLocaleString()
    : '14,820';

  const avgOverpay = stats?.avg_monthly_overpay
    ? `$${stats.avg_monthly_overpay}/mo`
    : '$86/mo';

  return (
    <div className="relative overflow-hidden pt-8 pb-12">
      {/* Background glow gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] pointer-events-none -z-10 rounded-full"></div>

      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-6">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Ontario drivers pay Canada's highest premiums</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Are you getting ripped off on{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Ontario auto insurance?
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Skip the 40-step questionnaires and spam broker phone calls. Answer{' '}
          <strong className="text-emerald-400 font-semibold">5 basic questions</strong> to instantly benchmark your rate against real Ontario crowdsourced data.
        </p>

        {/* Live Metrics Row */}
        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 text-center backdrop-blur-sm shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">{totalSaved}</div>
            <div className="text-xs text-slate-400 mt-1">Identified Savings</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 text-center backdrop-blur-sm shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-cyan-400">{checksRun}+</div>
            <div className="text-xs text-slate-400 mt-1">Ontario Checks Run</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 text-center backdrop-blur-sm shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-amber-400">{avgOverpay}</div>
            <div className="text-xs text-slate-400 mt-1">Avg Overpayment</div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { FEATURES } from '../config.js';

export function HeroBanner({ stats }) {
  const rawCount = (stats?.total_checks_run !== undefined && stats?.total_checks_run !== null)
    ? Number(stats.total_checks_run)
    : 0;
  const checksRun = (rawCount + (FEATURES.DISPLAY_CHECKS_OFFSET || 0)).toLocaleString();

  return (
    <div className="relative overflow-hidden pt-2 pb-6">
      {/* Background glow gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[240px] bg-emerald-500/10 blur-[100px] pointer-events-none -z-10 rounded-full"></div>

      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Are you getting ripped off on{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Ontario auto insurance?
          </span>
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Compare your premium with InsurCheck’s Ontario insurance model and help build a community database of real driver rates. Answer{' '}
          <strong className="text-emerald-400 font-semibold">a few details</strong> to benchmark your rate.
        </p>

        {/* Secondary checks count badge outside the main hero/form entry area */}
        <div className="mt-3 flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 text-xs font-medium shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Over <strong className="text-white font-semibold">{checksRun}</strong> Ontario sanity checks performed</span>
          </span>
        </div>
      </div>
    </div>
  );
}

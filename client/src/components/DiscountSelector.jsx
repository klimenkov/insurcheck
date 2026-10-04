import React, { useState } from 'react';
import {
  Snowflake,
  Home,
  Car,
  Users,
  Smartphone,
  Gauge,
  ShieldAlert,
  GraduationCap,
  BadgeCheck,
  Plus,
  Ban,
  HelpCircle,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import { DISCOUNT_ITEMS } from '../data/discounts.js';

const ICON_MAP = {
  Snowflake,
  Home,
  Car,
  Users,
  Smartphone,
  Gauge,
  ShieldAlert,
  GraduationCap,
  BadgeCheck,
  Plus
};

export function DiscountSelector({
  selectedDiscounts = [],
  discountStatus = '',
  otherDescription = '',
  onChange,
  isEstimating = false,
  showError = false,
  compact = false
}) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const isNoneSelected = discountStatus === 'none_reported';
  const isUnsureSelected = discountStatus === 'unsure';

  const handleToggleDiscount = (id) => {
    let newDiscounts = [...selectedDiscounts];
    if (newDiscounts.includes(id)) {
      newDiscounts = newDiscounts.filter((d) => d !== id);
    } else {
      newDiscounts.push(id);
    }

    const newStatus = newDiscounts.length > 0 ? 'selected' : '';
    onChange({
      discounts: newDiscounts,
      discountStatus: newStatus,
      otherDescription: newDiscounts.includes('other') ? otherDescription : ''
    });
  };

  const handleSelectNone = () => {
    if (isNoneSelected) {
      onChange({
        discounts: [],
        discountStatus: '',
        otherDescription: ''
      });
    } else {
      onChange({
        discounts: [],
        discountStatus: 'none_reported',
        otherDescription: ''
      });
    }
  };

  const handleSelectUnsure = () => {
    if (isUnsureSelected) {
      onChange({
        discounts: [],
        discountStatus: '',
        otherDescription: ''
      });
    } else {
      onChange({
        discounts: [],
        discountStatus: 'unsure',
        otherDescription: ''
      });
    }
  };

  return (
    <div className={`space-y-3 ${compact ? 'p-3' : 'p-4'} bg-slate-950/70 rounded-2xl border ${
      showError ? 'border-rose-500/80 bg-rose-950/10' : 'border-slate-800'
    } transition-all`}>
      {/* Header and Helper Text */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center justify-between">
          <span>{isEstimating ? 'Which discounts should we include?' : 'Which discounts are included in your price?'}</span>
          <span className="text-rose-400 font-bold">*</span>
        </label>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {isEstimating
            ? 'Choose discounts you expect to qualify for. Availability and savings depend on the insurer.'
            : 'Select the discounts your insurer has applied—not just ones you might qualify for.'}
        </p>
      </div>

      {/* Grid of 10 Discount Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {DISCOUNT_ITEMS.map((item) => {
          const isSelected = selectedDiscounts.includes(item.id) && !isNoneSelected && !isUnsureSelected;
          const IconComponent = ICON_MAP[item.iconName] || Plus;

          return (
            <div key={item.id} className="relative group">
              <button
                type="button"
                onClick={() => handleToggleDiscount(item.id)}
                className={`w-full flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800/80 hover:border-slate-700 hover:text-white hover:bg-slate-900'
                }`}
                title={item.explanation}
                aria-pressed={isSelected}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                )}
              </button>

              {/* Accessible Mobile/Keyboard Tooltip trigger */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTooltip(activeTooltip === item.id ? null : item.id);
                }}
                className="absolute right-1 top-1 text-slate-500 hover:text-slate-300 p-0.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label={`Explanation for ${item.label}`}
              >
                <Info className="w-2.5 h-2.5" />
              </button>

              {activeTooltip === item.id && (
                <div className="absolute z-20 bottom-full left-0 mb-1 w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-slate-300 shadow-xl">
                  <p>{item.explanation}</p>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(null)}
                    className="text-emerald-400 font-bold block mt-1 hover:underline"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Optional Short Description for "Other" */}
      {selectedDiscounts.includes('other') && !isNoneSelected && !isUnsureSelected && (
        <div className="pt-2 animate-fadeIn">
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Other discount description <span className="text-slate-500 text-[10px]">(optional context)</span>
          </label>
          <input
            type="text"
            maxLength={120}
            value={otherDescription}
            onChange={(e) =>
              onChange({
                discounts: selectedDiscounts,
                discountStatus: 'selected',
                otherDescription: e.target.value
              })
            }
            placeholder="e.g. Clean fuel / EV green vehicle discount, alumni plan"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      )}

      {/* Mutually Exclusive Secondary Options: "No discounts" and "Not sure" */}
      <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSelectNone}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
            isNoneSelected
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 ring-1 ring-amber-500/30'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
          aria-pressed={isNoneSelected}
        >
          <Ban className="w-3.5 h-3.5" />
          <span>{isEstimating ? 'Estimate without discounts' : 'No discounts'}</span>
        </button>

        <button
          type="button"
          onClick={handleSelectUnsure}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
            isUnsureSelected
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 ring-1 ring-cyan-500/30'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
          aria-pressed={isUnsureSelected}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Not sure</span>
        </button>

        {selectedDiscounts.length > 0 && !isNoneSelected && !isUnsureSelected && (
          <span className="text-[11px] text-emerald-400 font-medium ml-auto">
            {selectedDiscounts.length} discount{selectedDiscounts.length > 1 ? 's' : ''} selected
          </span>
        )}
      </div>

      {/* Validation Error Message */}
      {showError && (
        <p className="text-xs text-rose-400 flex items-center gap-1 pt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>
            Please select at least one discount, "{isEstimating ? 'Estimate without discounts' : 'No discounts'}", or "Not sure".
          </span>
        </p>
      )}
    </div>
  );
}

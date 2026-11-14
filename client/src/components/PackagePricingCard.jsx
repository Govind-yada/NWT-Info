import React from 'react';
import { useBooking } from '../context/BookingContext';
import { Check, Clock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const PackagePricingCard = ({ pkg, service }) => {
  const { openBookingModal } = useBooking();

  const total = pkg.price || 0;
  const advance = Math.round(total * 0.30);
  const remaining = total - advance;

  return (
    <div
      className={`relative rounded-2xl flex flex-col justify-between p-6 transition-all duration-300 ${
        pkg.isPopular
          ? 'glass-panel border-2 border-blue-500/80 shadow-glow'
          : 'glass-card border border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Popular Badge */}
      {pkg.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-brand-blue to-brand-violet text-white text-[10px] font-extrabold uppercase tracking-wider shadow-glow-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-electric" /> Most Popular
        </div>
      )}

      <div>
        {/* Tier Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-white">{pkg.name}</h4>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>{pkg.deliveryEstimate}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2 min-h-[36px]">{pkg.description}</p>
        </div>

        {/* Pricing Block */}
        <div className="mb-6 p-4 rounded-xl bg-navy-950/80 border border-slate-800/80 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              ₹{total.toLocaleString('en-IN')}
            </span>
            {pkg.discountPrice && (
              <span className="text-xs text-slate-500 line-through">
                ₹{pkg.discountPrice.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-[11px] text-slate-400">total project</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-brand-electric font-semibold">Pay 30% Advance:</span>
            <span className="text-brand-electric font-bold">₹{advance.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Remaining 70% at delivery:</span>
            <span>₹{remaining.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-2.5 mb-6">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            What's Included:
          </span>
          {(pkg.features || []).map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
              <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5" />
              </div>
              <span className="leading-snug">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Book Now Action */}
      <div className="pt-4 border-t border-slate-800/60">
        <button
          onClick={() => openBookingModal(service, pkg)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
            pkg.isPopular
              ? 'bg-gradient-to-r from-brand-blue to-brand-violet text-white shadow-glow hover:opacity-95'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          <span>Book with 30% Advance (₹{advance.toLocaleString('en-IN')})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

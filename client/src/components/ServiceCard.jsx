import React from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import {
  Layout,
  Code,
  Smartphone,
  TrendingUp,
  FileText,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
} from 'lucide-react';

const iconMap = {
  Layout,
  Code,
  Smartphone,
  TrendingUp,
  FileText,
  Target,
  Sparkles,
  Globe: Layout,
};

export const ServiceCard = ({ service }) => {
  const { openBookingModal } = useBooking();
  const IconComponent = iconMap[service.icon] || Layout;

  const startingPrice = service.startingPrice || 0;
  const packages = service.packages || [];

  return (
    <div className="group glass-card rounded-2xl overflow-hidden hover:shadow-glow transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Service Image Banner with Category Badge */}
        <div className="relative h-48 overflow-hidden bg-slate-900">
          <img
            src={service.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent"></div>
          
          <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-navy-950/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-semibold text-brand-electric">
            {service.category}
          </div>

          <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-blue-600/30 backdrop-blur-md border border-blue-500/40 text-brand-electric flex items-center justify-center shadow-glow-sm">
            <IconComponent className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
              {service.name}
            </h3>
            {packages.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                <Layers className="w-3 h-3 text-slate-400" />
                {packages.length} Packages
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
            {service.shortDescription}
          </p>

          {/* Key Features List */}
          <div className="space-y-2 mb-6">
            {(service.features || []).slice(0, 3).map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Pricing & Actions */}
      <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Starting At</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-white">
              ₹{startingPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-blue-400 font-medium">(₹{Math.round(startingPrice * 0.3).toLocaleString('en-IN')} adv.)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/services/${service.slug}`}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition"
            title="View Details"
          >
            Details
          </Link>

          <button
            onClick={() => {
              const defaultPkg = packages[0] || null;
              openBookingModal(service, defaultPkg);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-violet text-white text-xs font-semibold hover:shadow-glow-sm transition"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

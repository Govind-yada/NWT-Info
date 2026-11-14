import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useBooking } from '../context/BookingContext';
import { PackagePricingCard } from '../components/PackagePricingCard';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  Layers,
} from 'lucide-react';

export const ServiceDetail = () => {
  const { slug } = useParams();
  const { openBookingModal } = useBooking();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        const res = await api.get(`/services/${slug}`);
        if (res.data.success) {
          setService(res.data.data);
        } else {
          setError('Service not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading service details');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Service Not Found</h3>
        <p className="text-xs text-slate-400">{error || 'The requested service could not be located.'}</p>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>
      </div>
    );
  }

  const packages = service.packages || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Back Link */}
      <Link
        to="/services"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> All Digital Services
      </Link>

      {/* Hero Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-600/10 border border-blue-500/30 text-xs font-semibold text-brand-electric">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{service.category}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {service.name}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            {service.description}
          </p>

          {/* Key Deliverable Highlights */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Included Standards</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(service.features || []).map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button
              onClick={() => openBookingModal(service, packages[0] || null)}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-violet text-white text-xs font-bold shadow-glow hover:opacity-95 transition"
            >
              Book This Service (30% Adv.)
            </button>
            <span className="text-xs text-slate-400">
              Starting at <strong className="text-white">₹{service.startingPrice.toLocaleString('en-IN')}</strong>
            </span>
          </div>
        </div>

        {/* Feature Image */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl h-80 sm:h-96">
          <img
            src={service.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'}
            alt={service.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent"></div>
        </div>
      </div>

      {/* Available Packages Section */}
      <div className="pt-12 border-t border-slate-800 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">
            Dynamic Pricing Tiers
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            Available Packages for {service.name}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Prices and features are dynamically loaded from our MongoDB database. 30% advance is calculated automatically.
          </p>
        </div>

        {packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <PackagePricingCard
                key={pkg._id}
                pkg={pkg}
                service={service}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-navy-900/50 rounded-2xl border border-slate-800">
            <Layers className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Custom packages for this service are currently being configured.</p>
            <button
              onClick={() => openBookingModal(service)}
              className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              Request Custom Quote
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

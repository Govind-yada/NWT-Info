import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useBooking } from '../context/BookingContext';
import { ServiceCard } from '../components/ServiceCard';
import { PackagePricingCard } from '../components/PackagePricingCard';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  Users,
  CreditCard,
  Calendar,
  ChevronDown,
  Star,
  Zap,
} from 'lucide-react';

export const Home = () => {
  const { openBookingModal } = useBooking();
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, testimonialsRes, faqsRes] = await Promise.all([
          api.get('/services'),
          api.get('/content/testimonials'),
          api.get('/content/faqs'),
        ]);

        if (servicesRes.data.success) setServices(servicesRes.data.data);
        if (testimonialsRes.data.success) setTestimonials(testimonialsRes.data.data);
        if (faqsRes.data.success) setFaqs(faqsRes.data.data);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = ['All', 'Website Development', 'Software Development', 'Mobile App Development', 'SEO / SMO'];

  const filteredServices = activeCategory === 'All'
    ? services
    : services.filter((s) => s.category === activeCategory);

  // Extract featured packages (e.g. Website Development packages)
  const webDevService = services.find((s) => s.category === 'Website Development');
  const featuredPackages = webDevService?.packages || [];

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-md mb-8 shadow-glow-sm">
            <span className="flex h-2 w-2 rounded-full bg-brand-electric animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-200">
              Next World Tech (NWT Info) — Enterprise Digital Agency
            </span>
          </div>

          {/* Bold Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
            Engineering Next-Gen <br className="hidden sm:inline" />
            <span className="text-gradient-electric">Digital Services & Scalable Tech</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            From modern responsive websites and enterprise cloud software to native mobile apps. Book your project slot with a transparent <strong className="text-white">30% advance</strong> through Razorpay.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openBookingModal()}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-blue via-indigo-600 to-brand-violet text-white text-sm font-bold shadow-glow hover:shadow-glow-lg transition-all"
            >
              <Sparkles className="w-4 h-4 text-brand-electric" />
              Book Project Now (30% Adv.)
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/services"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm font-semibold hover:border-slate-700 hover:text-white transition"
            >
              Explore Services & Packages
            </Link>
          </div>

          {/* Key Metrics / Trust Bar */}
          <div className="mt-16 pt-12 border-t border-slate-800/60 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white block">250+</span>
              <span className="text-xs text-slate-400 font-medium mt-1 block">Projects Delivered</span>
            </div>
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-electric block">30%</span>
              <span className="text-xs text-slate-400 font-medium mt-1 block">Advance Booking</span>
            </div>
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white block">99.8%</span>
              <span className="text-xs text-slate-400 font-medium mt-1 block">Client Satisfaction</span>
            </div>
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-violet block">100%</span>
              <span className="text-xs text-slate-400 font-medium mt-1 block">Razorpay Secured</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. DYNAMIC SERVICES OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-electric mb-2">
            Tailored Digital Capabilities
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Comprehensive Digital Services
          </h3>
          <p className="text-sm text-slate-400 mt-3">
            Every service is backed by transparent pricing tiers, real-time availability scheduling, and dedicated senior engineers.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-brand-blue text-white shadow-glow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </section>

      {/* 3. FEATURED SERVICE PACKAGES (DYNAMIC PRICING) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-navy-900/90 to-navy-950 border border-slate-800 p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">
              Transparent Pricing Packages
            </span>
            <h3 className="text-3xl font-extrabold text-white">
              Website Development Packages
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              Choose the package that fits your ambition. Pay only 30% upfront to initiate production; balance is settled upon delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPackages.map((pkg) => (
              <PackagePricingCard
                key={pkg._id}
                pkg={pkg}
                service={webDevService}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE NWT INFO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-electric block mb-2">
            Engineered For Excellence
          </span>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            Why Partner With Next World Tech?
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card rounded-2xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-brand-electric flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Transparent 30% Advance</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No full upfront commitments. Lock your calendar kickoff date with just 30% advance via Razorpay; remaining 70% is collected only after project review.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-brand-violet flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Real-Time Calendar Scheduling</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our scheduling engine integrates directly with our internal calendar and Google Calendar API, preventing double-bookings and guaranteeing dedicated focus.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Production-Ready Architecture</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We do not build toy prototypes. Every solution is engineered with strict MERN standards, sub-second load times, secure JWT auth, and Cloudinary media assets.
            </p>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-electric block mb-2">
            Seamless Workflow
          </span>
          <h3 className="text-3xl font-extrabold text-white">
            How Project Booking Works
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            {
              step: '01',
              title: 'Select Service & Tier',
              desc: 'Choose from our dynamic catalog of digital services and pre-configured packages.',
            },
            {
              step: '02',
              title: 'Provide Specs & Files',
              desc: 'Submit your project description, domain preferences, and upload design briefs or assets.',
            },
            {
              step: '03',
              title: '30% Advance Payment',
              desc: 'Pay your verified 30% advance via Razorpay to lock your kickoff date in our calendar.',
            },
            {
              step: '04',
              title: 'Track & Deliver',
              desc: 'Monitor milestone progress live in your Customer Dashboard until final project handover.',
            },
          ].map((item, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 relative flex flex-col justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-800 block mb-3">{item.step}</span>
                <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">
              Verified Client Feedback
            </span>
            <h3 className="text-3xl font-extrabold text-white">What Our Partners Say</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t._id} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed mb-6">
                    "{t.review}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
                  <img
                    src={t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={t.clientName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">{t.clientName}</span>
                    <span className="text-[11px] text-slate-400">{t.clientRole}, {t.clientCompany}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. FAQ ACCORDION */}
      {faqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-electric block mb-2">
              Got Questions?
            </span>
            <h3 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={faq._id}
                  className="rounded-2xl bg-navy-900 border border-slate-800 overflow-hidden transition"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-white hover:text-blue-400 transition"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-blue-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 9. BOTTOM CONVERSION CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border border-blue-500/30 text-center shadow-glow">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Kickstart Your Digital Project?
            </h3>
            <p className="text-sm text-slate-300">
              Select your package, schedule your preferred kickoff date, and lock in our dedicated team with 30% advance via Razorpay.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => openBookingModal()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-navy-950 font-bold text-xs hover:bg-slate-100 transition shadow-lg"
              >
                Book Project (30% Adv.)
              </button>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-navy-950/60 border border-white/20 text-white font-medium text-xs hover:bg-navy-950 transition"
              >
                Talk to Solution Architect
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

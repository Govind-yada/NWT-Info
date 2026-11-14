import React from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import {
  ShieldCheck,
  Target,
  Sparkles,
  Users,
  Award,
  ArrowRight,
  Code2,
  Cpu,
  Globe2,
  CheckCircle2,
} from 'lucide-react';

export const About = () => {
  const { openBookingModal } = useBooking();

  const team = [
    {
      name: 'Devraj Chauhan',
      role: 'Chief Technology Officer & Lead Architect',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Ex-FAANG cloud architect with 12+ years of distributed systems engineering and modern MERN architecture.',
    },
    {
      name: 'Ananya Deshmukh',
      role: 'Head of Product & UX Design',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      bio: 'Specialist in design systems, micro-interactions, and conversion-focused SaaS product interfaces.',
    },
    {
      name: 'Sameer Sen',
      role: 'Lead Full-Stack Engineer',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      bio: 'React Native & Node.js specialist obsessed with sub-second performance and seamless Razorpay checkouts.',
    },
    {
      name: 'Pooja Iyer',
      role: 'Growth Marketing & SEO Director',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      bio: 'Data-driven growth strategist delivering measurable search rankings and client acquisition campaigns.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Header */}
      <section className="relative pt-12 pb-16 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-brand-electric" />
          <span className="text-xs font-semibold text-slate-300">About Next World Tech</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Pioneering <span className="text-gradient-electric">Intelligent Tech</span> For High-Growth Enterprises
        </h1>
        <p className="mt-6 text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
          NWT Info (Next World Tech) is a full-service digital engineering consultancy. We help brands turn vision into robust web platforms, automated cloud software, and revenue-driving mobile applications.
        </p>
      </section>

      {/* Mission & Vision Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel rounded-3xl p-8 sm:p-10 space-y-4 border border-blue-500/20">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-brand-electric flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white">Our Mission</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              To empower ambitious businesses with scalable, high-converting digital solutions through transparent pricing, zero-friction booking with our 30% advance model, and battle-tested software engineering.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Transparent milestone delivery with live client portals</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero vendor lock-in with clean, self-hosted code</span>
              </li>
            </ul>
          </div>

          <div className="glass-panel rounded-3xl p-8 sm:p-10 space-y-4 border border-purple-500/20">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-brand-violet flex items-center justify-center">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white">Our Vision</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              To be the premier digital transformation engine globally, known for uncompromising code craftsmanship, aesthetic superiority, and guaranteed on-schedule delivery.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>High-performance web platforms with 99.9% uptime</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>End-to-end security audits & payment integrations</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Expertise Stack */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-electric block mb-2">
            Technical Stack
          </span>
          <h3 className="text-3xl font-extrabold text-white">Built On Modern Technologies</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { name: 'React 18 & Vite', desc: 'Fast, responsive UI' },
            { name: 'Node & Express', desc: 'Resilient REST APIs' },
            { name: 'MongoDB Atlas', desc: 'Scalable NoSQL DB' },
            { name: 'Tailwind CSS', desc: 'Modern styling' },
            { name: 'Razorpay PG', desc: 'Secure payments' },
            { name: 'Google Calendar', desc: 'Live scheduling sync' },
          ].map((tech, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-5 text-center space-y-2">
              <span className="text-sm font-bold text-white block">{tech.name}</span>
              <span className="text-[11px] text-slate-400">{tech.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">
            Expert Leadership
          </span>
          <h3 className="text-3xl font-extrabold text-white">Meet Our Core Team</h3>
          <p className="text-sm text-slate-400 mt-2">
            The seasoned architects, designers, and growth strategists powering Next World Tech.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, idx) => (
            <div key={idx} className="glass-card rounded-2xl overflow-hidden group">
              <div className="h-56 overflow-hidden bg-slate-900">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
              </div>
              <div className="p-5 space-y-1.5">
                <h4 className="text-base font-bold text-white">{member.name}</h4>
                <span className="text-xs text-brand-electric font-medium block">{member.role}</span>
                <p className="text-xs text-slate-400 pt-2 leading-relaxed">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl p-10 bg-navy-900 border border-slate-800 space-y-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Have a project in mind? Let's build it together.
          </h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Book your kickoff date with just 30% advance. Our team will start working on your specs immediately.
          </p>
          <div className="pt-2">
            <button
              onClick={() => openBookingModal()}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-violet text-white text-xs font-bold shadow-glow hover:opacity-95 transition"
            >
              Book Project Kickoff (30% Adv.)
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

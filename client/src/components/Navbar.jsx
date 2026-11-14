import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { Menu, X, ArrowRight, ShieldCheck, User, LogOut, ChevronRight, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { openBookingModal } = useBooking();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-violet flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-all">
              <span className="font-extrabold text-white text-lg tracking-wider">NW</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                NWT <span className="text-brand-electric">Info</span>
              </span>
              <span className="text-[10px] tracking-widest text-slate-400 font-medium uppercase -mt-1">
                Next World Tech
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-brand-electric relative py-1 ${
                  isActive(link.path) ? 'text-brand-blue font-semibold' : 'text-slate-300'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-brand-blue to-brand-violet rounded-full"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA & Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {isAdmin ? (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-violet-950/60 border border-violet-800/60 text-violet-300 text-xs font-semibold hover:bg-violet-900/60 transition"
              >
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                Admin Dashboard
              </Link>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium hover:border-slate-700 transition"
                >
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  My Portal
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition px-3 py-1.5"
              >
                Client Login
              </Link>
            )}

            {/* Book Now Button */}
            <button
              onClick={() => openBookingModal()}
              className="relative group overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-brand-blue via-indigo-500 to-brand-violet group-hover:opacity-90 transition-opacity"></span>
              <span className="relative flex items-center gap-2 px-5 py-2.5 rounded-[11px] bg-navy-950 text-white text-xs font-semibold group-hover:bg-opacity-90 transition-all">
                <Sparkles className="w-3.5 h-3.5 text-brand-electric" />
                Book Project (30% Adv.)
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive(link.path)
                  ? 'bg-blue-600/10 text-brand-electric font-semibold'
                  : 'text-slate-300 hover:bg-slate-900/60'
              }`}
            >
              {link.name}
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </Link>
          ))}

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
            {isAdmin ? (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-950/60 border border-violet-800 text-violet-300 text-sm font-medium"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Dashboard
              </Link>
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-sm font-medium"
                >
                  <User className="w-4 h-4 text-blue-400" />
                  My Customer Portal
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 py-2 text-sm text-rose-400"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center py-2.5 rounded-lg bg-slate-900 text-slate-200 text-sm font-medium"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                openBookingModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-violet text-white text-sm font-semibold shadow-glow"
            >
              <Sparkles className="w-4 h-4" />
              Book Project (30% Adv.)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

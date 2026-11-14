import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  CreditCard,
  UserCircle,
  LogOut,
  Sparkles,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const CustomerLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const { openBookingModal } = useBooking();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Projects', path: '/dashboard/projects', icon: FolderKanban },
    { name: 'My Bookings', path: '/dashboard/bookings', icon: CalendarDays },
    { name: 'Payment History', path: '/dashboard/payments', icon: CreditCard },
    { name: 'Project Calendar', path: '/dashboard/calendar', icon: CalendarDays },
    { name: 'Profile Settings', path: '/dashboard/profile', icon: UserCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col md:flex-row text-slate-100">
      
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 glass-panel border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-violet flex items-center justify-center">
            <span className="font-extrabold text-white text-xs">NW</span>
          </div>
          <span className="font-bold text-white text-sm">NWT Client Portal</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-30 h-screen w-64 glass-panel border-r border-slate-800 flex flex-col justify-between p-5 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0 bg-navy-950' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-violet flex items-center justify-center shadow-glow-sm">
              <span className="font-extrabold text-white text-sm tracking-wider">NW</span>
            </div>
            <div>
              <span className="text-base font-bold text-white block">NWT Info</span>
              <span className="text-[10px] text-brand-electric font-semibold uppercase tracking-wider block -mt-1">
                Client Portal
              </span>
            </div>
          </Link>

          {/* User Profile Card */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 text-brand-electric border border-blue-500/30 flex items-center justify-center font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate">{user?.name}</span>
              <span className="text-[10px] text-slate-400 block truncate">{user?.company || user?.email}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-glow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Book Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                setSidebarOpen(false);
                openBookingModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-violet text-white text-xs font-bold shadow-glow hover:opacity-95 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Book New Project (30%)
            </button>
          </div>
        </div>

        {/* Bottom Options */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-violet-300 bg-violet-950/60 border border-violet-800 hover:bg-violet-900/50 transition font-medium"
            >
              <ShieldCheck className="w-4 h-4 text-violet-400" />
              Switch to Admin Terminal
            </Link>
          )}

          <Link
            to="/"
            className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <span>Visit Agency Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};

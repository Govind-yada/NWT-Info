import React, { useState, useEffect } from 'react';
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
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft,
} from 'lucide-react';

export const CustomerLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const { openBookingModal } = useBooking();
  const location = useLocation();
  const navigate = useNavigate();

  // Desktop Collapsed State (persistent across page reloads)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('nwt_customer_sidebar_collapsed') === 'true';
  });

  // Mobile Drawer State
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('nwt_customer_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Projects', path: '/dashboard/projects', icon: FolderKanban },
    { name: 'My Bookings', path: '/dashboard/bookings', icon: CalendarDays },
    { name: 'Payment History', path: '/dashboard/payments', icon: CreditCard },
    { name: 'Project Calendar', path: '/dashboard/calendar', icon: CalendarDays },
    { name: 'Profile Settings', path: '/dashboard/profile', icon: UserCircle },
  ];

  const getCurrentPageTitle = () => {
    const item = menuItems.find((m) => m.path === location.pathname);
    if (item) return item.name;
    if (location.pathname.startsWith('/dashboard/projects/')) return 'Project Details';
    return 'Customer Portal';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex text-slate-100 font-sans selection:bg-brand-blue selection:text-white">
      
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-navy-950/80 backdrop-blur-md z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen transition-all duration-300 ease-in-out flex flex-col justify-between overflow-y-auto overflow-x-hidden custom-scrollbar border-r border-slate-800/80 bg-gradient-to-b from-navy-900/95 via-navy-950/95 to-navy-950/98 backdrop-blur-2xl shadow-2xl ${
          mobileOpen ? 'translate-x-0 w-72 p-5' : '-translate-x-full md:translate-x-0'
        } ${
          isCollapsed ? 'md:w-20 md:p-3' : 'md:w-64 md:p-5'
        }`}
      >
        {/* Top Header inside Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
            <Link to="/" className="flex items-center gap-3 group overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue via-indigo-600 to-brand-violet flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-all shrink-0">
                <span className="font-extrabold text-white text-sm tracking-wider">NW</span>
              </div>
              {(!isCollapsed || mobileOpen) && (
                <div className="truncate animate-fadeIn">
                  <span className="text-base font-extrabold text-white block tracking-tight group-hover:text-blue-400 transition-colors">
                    NWT <span className="text-brand-electric">Info</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block -mt-1">
                    Client Portal
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Toggle Button */}
            <button
              onClick={toggleSidebarCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-brand-electric" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Book Project Button */}
          {(!isCollapsed || mobileOpen) ? (
            <button
              onClick={() => {
                setMobileOpen(false);
                openBookingModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-violet text-white text-xs font-bold shadow-glow hover:opacity-95 transition group"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200 group-hover:rotate-12 transition-transform" />
              <span>Book New Project (30%)</span>
            </button>
          ) : (
            <div className="relative group flex justify-center">
              <button
                onClick={() => openBookingModal()}
                className="w-11 h-11 rounded-xl bg-gradient-to-r from-brand-blue to-brand-violet text-white flex items-center justify-center shadow-glow hover:opacity-95 transition"
                title="Book New Project (30%)"
              >
                <Sparkles className="w-4 h-4 text-white" />
              </button>
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-navy-900 border border-slate-700 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                Book New Project (30%)
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {(!isCollapsed || mobileOpen) && (
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block mb-1">
                Menu
              </span>
            )}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <div key={item.name} className="relative group">
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isCollapsed && !mobileOpen ? 'justify-center px-0' : 'px-3.5'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/25 via-blue-600/15 to-transparent text-white border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:border-slate-800 border border-transparent'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-brand-electric to-brand-blue rounded-r-full shadow-glow"></div>
                    )}
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-brand-electric' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {(!isCollapsed || mobileOpen) && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </Link>

                  {/* Tooltip for Collapsed Sidebar */}
                  {isCollapsed && !mobileOpen && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-navy-900/95 border border-slate-700 text-white text-xs rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                      {item.name}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Options & Profile */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          {/* Admin Switcher if authorized */}
          {isAdmin && (
            <div className="relative group">
              <Link
                to="/admin/terminal"
                className={`flex items-center gap-2 py-2 rounded-xl text-xs text-violet-300 bg-violet-950/60 border border-violet-800/60 hover:bg-violet-900/60 transition font-medium ${
                  isCollapsed && !mobileOpen ? 'justify-center px-0' : 'px-3'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
                {(!isCollapsed || mobileOpen) && <span>Admin Terminal</span>}
              </Link>
              {isCollapsed && !mobileOpen && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-navy-900 border border-slate-700 text-violet-300 text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                  Admin Terminal
                </div>
              )}
            </div>
          )}

          {/* Visit Agency Website */}
          <div className="relative group">
            <Link
              to="/"
              className={`flex items-center gap-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition ${
                isCollapsed && !mobileOpen ? 'justify-center px-0' : 'justify-between px-3'
              }`}
            >
              {(!isCollapsed || mobileOpen) ? (
                <>
                  <span>Visit Website</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </>
              ) : (
                <ExternalLink className="w-4 h-4 text-slate-400" />
              )}
            </Link>
            {isCollapsed && !mobileOpen && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-navy-900 border border-slate-700 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                Visit Public Website
              </div>
            )}
          </div>

          {/* User Profile Card Near Sign Out */}
          <div className="relative group">
            <Link
              to="/dashboard/profile"
              className={`rounded-xl bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800/80 flex items-center transition group-hover:border-slate-700 ${
                isCollapsed && !mobileOpen ? 'p-2 justify-center' : 'p-2.5 gap-3'
              }`}
              title="Profile Settings"
            >
              <div className="relative w-9 h-9 rounded-full bg-blue-600/20 text-brand-electric border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0 group-hover:border-blue-400 transition">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-navy-950 animate-pulse"></span>
              </div>
              {(!isCollapsed || mobileOpen) && (
                <div className="truncate flex-1">
                  <span className="text-xs font-bold text-white block truncate group-hover:text-blue-400 transition">
                    {user?.name || 'Customer'}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {user?.email}
                  </span>
                </div>
              )}
            </Link>
            {isCollapsed && !mobileOpen && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 p-2.5 bg-navy-900 border border-slate-700 text-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                <span className="text-xs font-bold block">{user?.name}</span>
                <span className="text-[10px] text-slate-400 block">{user?.email}</span>
                <span className="text-[10px] text-brand-electric font-semibold block mt-1">Profile Settings →</span>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <div className="relative group">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-2 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition font-medium ${
                isCollapsed && !mobileOpen ? 'justify-center px-0' : 'px-3'
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {(!isCollapsed || mobileOpen) && <span>Sign Out</span>}
            </button>
            {isCollapsed && !mobileOpen && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-navy-900 border border-slate-700 text-rose-300 text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                Sign Out
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Viewport Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header Bar across complete website */}
        <header className="sticky top-0 z-20 h-16 border-b border-slate-800/80 bg-navy-950/85 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3.5">
            {/* Desktop Sidebar Toggle */}
            <button
              onClick={toggleSidebarCollapse}
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition shadow-sm"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <PanelLeft className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'text-brand-electric' : 'text-slate-400'}`} />
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Info */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 hidden sm:inline font-medium">Customer Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
              <span className="text-white font-bold tracking-tight">{getCurrentPageTitle()}</span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => openBookingModal()}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-violet text-white text-xs font-bold shadow-glow hover:opacity-95 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Book New Project</span>
            </button>

            {/* Quick Profile Badge */}
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition group"
              title="Profile Settings"
            >
              <div className="relative w-7 h-7 rounded-lg bg-blue-600/20 text-brand-electric border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0 group-hover:border-blue-400 transition">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-navy-950"></span>
              </div>
              <span className="text-xs font-semibold text-slate-300 hidden md:inline truncate max-w-[130px] group-hover:text-white transition">
                {user?.name || 'My Profile'}
              </span>
            </Link>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

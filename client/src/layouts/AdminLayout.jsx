import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  Package as PackageIcon,
  ShoppingBag,
  CreditCard,
  CalendarDays,
  Users,
  FileEdit,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft,
  Terminal,
  Settings,
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Desktop Collapsed State (persistent across page reloads)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('nwt_admin_sidebar_collapsed') === 'true';
  });

  // Mobile Drawer State
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('nwt_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const adminMenu = [
    { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Admin Terminal', path: '/admin/terminal', icon: Terminal },
    { name: 'Service Management', path: '/admin/services', icon: Layers },
    { name: 'Package Tiers', path: '/admin/packages', icon: PackageIcon },
    { name: 'Project Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Payment Transactions', path: '/admin/payments', icon: CreditCard },
    { name: 'Calendar & Slots', path: '/admin/calendar', icon: CalendarDays },
    { name: 'Customer Directory', path: '/admin/customers', icon: Users },
    { name: 'Content CMS', path: '/admin/content', icon: FileEdit },
    { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ];

  const getCurrentPageTitle = () => {
    const item = adminMenu.find((m) => m.path === location.pathname);
    if (item) return item.name;
    return 'Admin Command Center';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex text-slate-100 font-sans selection:bg-violet-600 selection:text-white">
      
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-navy-950/80 backdrop-blur-md z-40 md:hidden transition-opacity"
        />
      )}

      {/* Admin Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen transition-all duration-300 ease-in-out flex flex-col justify-between overflow-y-auto overflow-x-hidden custom-scrollbar border-r border-slate-800/80 bg-gradient-to-b from-navy-900/98 via-navy-950/98 to-navy-950/98 backdrop-blur-2xl shadow-2xl ${
          mobileOpen ? 'translate-x-0 w-72 p-5' : '-translate-x-full md:translate-x-0'
        } ${
          isCollapsed ? 'md:w-20 md:p-3' : 'md:w-68 md:p-5'
        }`}
      >
        {/* Top Header inside Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
            <Link to="/" className="flex items-center gap-3 group overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-brand-blue flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-all shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              {(!isCollapsed || mobileOpen) && (
                <div className="truncate animate-fadeIn">
                  <span className="text-base font-extrabold text-white block tracking-tight group-hover:text-violet-400 transition-colors">
                    NWT <span className="text-violet-400">Admin</span>
                  </span>
                  <span className="text-[10px] text-violet-300/80 font-semibold uppercase tracking-wider block -mt-1">
                    Command Center
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
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-violet-400" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {(!isCollapsed || mobileOpen) && (
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block mb-1">
                Management Modules
              </span>
            )}
            {adminMenu.map((item) => {
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
                        ? 'bg-gradient-to-r from-violet-600/30 via-violet-600/15 to-transparent text-white border border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:border-slate-800 border border-transparent'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-violet-400 to-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(167,139,250,0.6)]"></div>
                    )}
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-200'
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
          {/* Customer Portal Switcher */}
          <div className="relative group">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 py-2 rounded-xl text-xs text-blue-300 bg-blue-950/50 border border-blue-800/50 hover:bg-blue-900/50 transition font-medium ${
                isCollapsed && !mobileOpen ? 'justify-center px-0' : 'justify-between px-3'
              }`}
            >
              {(!isCollapsed || mobileOpen) ? (
                <>
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    Customer View
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                </>
              ) : (
                <ExternalLink className="w-4 h-4 text-blue-400" />
              )}
            </Link>
            {isCollapsed && !mobileOpen && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-navy-900 border border-slate-700 text-blue-300 text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                Open Customer Portal
              </div>
            )}
          </div>

          {/* Public Website */}
          <div className="relative group">
            <Link
              to="/"
              className={`flex items-center gap-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition ${
                isCollapsed && !mobileOpen ? 'justify-center px-0' : 'justify-between px-3'
              }`}
            >
              {(!isCollapsed || mobileOpen) ? (
                <>
                  <span>Public Website</span>
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

          {/* Admin Identity Card Near Sign Out */}
          <div className="relative group">
            <div
              className={`rounded-xl bg-violet-950/40 border border-violet-800/40 flex items-center transition ${
                isCollapsed && !mobileOpen ? 'p-2 justify-center' : 'p-2.5 gap-3'
              }`}
            >
              <div className="relative w-9 h-9 rounded-full bg-violet-600/30 text-violet-300 border border-violet-500/40 flex items-center justify-center font-bold text-xs shrink-0">
                AD
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-navy-950 animate-pulse"></span>
              </div>
              {(!isCollapsed || mobileOpen) && (
                <div className="truncate flex-1">
                  <span className="text-xs font-bold text-white block truncate">
                    {user?.name || 'Administrator'}
                  </span>
                  <span className="text-[10px] text-violet-300/80 block truncate">
                    Super Administrator
                  </span>
                </div>
              )}
            </div>
            {isCollapsed && !mobileOpen && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 p-2.5 bg-navy-900 border border-slate-700 text-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                <span className="text-xs font-bold block">{user?.name}</span>
                <span className="text-[10px] text-violet-400 font-semibold block">Super Administrator</span>
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
              <PanelLeft className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'text-violet-400' : 'text-slate-400'}`} />
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
              <span className="text-slate-500 hidden sm:inline font-medium">NWT Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
              <span className="text-white font-bold tracking-tight">{getCurrentPageTitle()}</span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Customer Portal</span>
            </Link>

            {/* Admin Badge */}
            <div className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-violet-950/40 border border-violet-800/40">
              <div className="relative w-7 h-7 rounded-lg bg-violet-600/30 text-violet-300 border border-violet-500/40 flex items-center justify-center font-bold text-xs shrink-0">
                AD
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-navy-950"></span>
              </div>
              <span className="text-xs font-semibold text-slate-200 hidden md:inline truncate max-w-[130px]">
                {user?.name || 'Administrator'}
              </span>
            </div>
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

import React, { useState } from 'react';
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
  Bell,
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminMenu = [
    { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Service Management', path: '/admin/services', icon: Layers },
    { name: 'Package Tiers', path: '/admin/packages', icon: PackageIcon },
    { name: 'Project Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Payment Transactions', path: '/admin/payments', icon: CreditCard },
    { name: 'Calendar & Slots', path: '/admin/calendar', icon: CalendarDays },
    { name: 'Customer Directory', path: '/admin/customers', icon: Users },
    { name: 'Content CMS', path: '/admin/content', icon: FileEdit },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col md:flex-row text-slate-100">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-navy-900 border-b border-violet-900/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-xs text-white">
            ADM
          </div>
          <span className="font-bold text-white text-sm">NWT Admin Terminal</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-300">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-navy-900/95 border-r border-slate-800 flex flex-col justify-between p-5 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-glow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white block">NWT Admin</span>
              <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider block -mt-1">
                Command Center
              </span>
            </div>
          </Link>

          {/* Admin Identity Card */}
          <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-800/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate">{user?.name}</span>
              <span className="text-[10px] text-violet-300 block truncate">Super Administrator</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {adminMenu.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-glow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Options */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-blue-400 hover:bg-slate-800 transition font-medium"
          >
            <span>Customer View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white transition font-medium"
          >
            <span>Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};

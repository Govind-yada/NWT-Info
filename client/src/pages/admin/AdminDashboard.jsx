import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  ShoppingBag,
  Clock,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Terminal,
  Settings,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard-stats');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const COLORS = ['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444', '#64748B'];

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-600/10 text-violet-400 border border-violet-500/30 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Overview & Executive Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">NWT Admin Operations</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/terminal"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 hover:text-white text-xs font-bold transition shadow-glow-sm"
          >
            <Terminal className="w-4 h-4 text-violet-400" />
            <span>Launch Admin Terminal</span>
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* 8 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Customers */}
        <div className="glass-card rounded-2xl p-5 space-y-2 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Customers</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-extrabold text-white block">
            {stats.totalCustomers || 0}
          </span>
          <span className="text-[10px] text-slate-500">Registered platform clients</span>
        </div>

        {/* Total Orders */}
        <div className="glass-card rounded-2xl p-5 space-y-2 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-extrabold text-white block">
            {stats.totalOrders || 0}
          </span>
          <span className="text-[10px] text-slate-500">Submitted project requests</span>
        </div>

        {/* New / Pending Orders */}
        <div className="glass-card rounded-2xl p-5 space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">New Unpaid Orders</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-extrabold text-amber-400 block">
            {stats.newOrders || 0}
          </span>
          <span className="text-[10px] text-slate-500">Awaiting 30% advance checkout</span>
        </div>

        {/* Active Projects */}
        <div className="glass-card rounded-2xl p-5 space-y-2 border-l-4 border-l-violet-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active In-Flight</span>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-2xl font-extrabold text-violet-400 block">
            {stats.activeProjects || 0}
          </span>
          <span className="text-[10px] text-slate-500">Confirmed / In production</span>
        </div>

        {/* Completed Projects */}
        <div className="glass-card rounded-2xl p-5 space-y-2 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Completed Projects</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-400 block">
            {stats.completedProjects || 0}
          </span>
          <span className="text-[10px] text-slate-500">Shipped and delivered</span>
        </div>

        {/* Total Revenue */}
        <div className="glass-card rounded-2xl p-5 space-y-2 border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Revenue Settled</span>
            <DollarSign className="w-4 h-4 text-teal-400" />
          </div>
          <span className="text-2xl font-extrabold text-white block">
            ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500">Verified Razorpay receipts</span>
        </div>

        {/* Advance Received */}
        <div className="glass-card rounded-2xl p-5 space-y-2 border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">30% Advance Received</span>
            <CreditCard className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-extrabold text-cyan-400 block">
            ₹{(stats.advancePaymentsReceived || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500">Kickoff advance funds</span>
        </div>

        {/* Pending Remaining Payments */}
        <div className="glass-card rounded-2xl p-5 space-y-2 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Pending 70% Balances</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-extrabold text-rose-400 block">
            ₹{(stats.pendingRemainingPayments || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500">Collectable upon milestone handover</span>
        </div>

      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Monthly Revenue Trend Area Chart (2 Cols) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Monthly Revenue Trends (Advance vs Balance)</h3>
            <span className="text-[10px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              Last 6 Months
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyRevenue || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAdvance" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRemaining" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '11px', color: '#F8FAFC' }}
                  formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="advance" name="30% Advance" stroke="#3B82F6" fillOpacity={1} fill="url(#colorAdvance)" />
                <Area type="monotone" dataKey="remaining" name="70% Balance" stroke="#10B981" fillOpacity={1} fill="url(#colorRemaining)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Pie Chart (1 Col) */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-white">Project Status Distribution</h3>
          
          <div className="h-72 w-full flex items-center justify-center">
            {charts.statusBreakdown && charts.statusBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {charts.statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px', color: '#F8FAFC' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">No project status data recorded.</p>
            )}
          </div>
        </div>

      </div>

      {/* Recent Orders Overview Table */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Recent Incoming Orders</h3>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-violet-400 hover:underline flex items-center gap-1"
          >
            Manage All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Order Number</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Total Value</th>
                <th className="px-4 py-3">30% Advance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentOrders.map((ord) => (
                <tr key={ord._id} className="hover:bg-slate-900/40 transition">
                  <td className="px-4 py-3 font-mono font-bold text-brand-electric">
                    {ord.orderNumber}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white font-medium block">{ord.userId?.name}</span>
                    <span className="text-[10px] text-slate-400">{ord.userId?.email}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {ord.serviceId?.name}
                  </td>
                  <td className="px-4 py-3 font-bold text-white">
                    ₹{ord.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-400">
                    ₹{ord.advanceAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 uppercase text-[10px] font-bold text-slate-300">
                    {ord.projectStatus}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to="/admin/orders"
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] transition"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  CreditCard,
  ArrowRight,
  Calendar,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const CustomerOverview = () => {
  const { user } = useAuth();
  const { openBookingModal } = useBooking();
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, bookingsRes] = await Promise.all([
          api.get('/orders/my-orders'),
          api.get('/bookings/my-bookings'),
        ]);

        if (ordersRes.data.success) setOrders(ordersRes.data.data);
        if (bookingsRes.data.success) setBookings(bookingsRes.data.data);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute metrics
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => ['confirmed', 'in_progress', 'review'].includes(o.projectStatus));
  const advancePaidTotal = orders
    .filter((o) => o.advancePaid)
    .reduce((sum, o) => sum + o.advanceAmount, 0);
  const remainingPendingTotal = orders
    .filter((o) => o.advancePaid && !o.remainingPaid)
    .reduce((sum, o) => sum + o.remainingAmount, 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-brand-electric border border-blue-500/30 text-[11px] font-semibold">Confirmed (30% Adv.)</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-semibold">In Progress</span>;
      case 'review':
        return <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[11px] font-semibold">In Review</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-semibold">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-[11px] font-semibold">Pending Payment</span>;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/10 text-brand-electric border border-blue-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customer Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user?.name || 'Partner'}!
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Monitor real-time progress for your digital projects, inspect milestone audit logs, and settle remaining balances seamlessly.
          </p>
        </div>

        <button
          onClick={() => openBookingModal()}
          className="relative z-10 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-violet text-white text-xs font-bold shadow-glow hover:opacity-95 transition flex items-center gap-2 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" /> Book New Project (30% Adv.)
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Projects</span>
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-brand-blue flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-white block">{totalOrders}</span>
          <span className="text-[11px] text-slate-500">Across all service categories</span>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Deliverables</span>
            <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-amber-400 block">{activeOrders.length}</span>
          <span className="text-[11px] text-slate-500">In production / review</span>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Advance Paid (30%)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-emerald-400 block">
            ₹{advancePaidTotal.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500">Settled via Razorpay</span>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Remaining Balances</span>
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-brand-violet flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-200 block">
            ₹{remainingPendingTotal.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500">Due upon milestone delivery</span>
        </div>
      </div>

      {/* Active Projects Table & Upcoming Kickoffs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Projects List (2 Cols) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Your Project Deliverables</h3>
            <Link
              to="/dashboard/projects"
              className="text-xs font-semibold text-brand-electric hover:underline flex items-center gap-1"
            >
              View All ({orders.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="h-20 rounded-xl bg-slate-900 animate-pulse"></div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.slice(0, 4).map((order) => (
                <div
                  key={order._id}
                  className="p-4 rounded-2xl bg-navy-950 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand-electric">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.projectStatus)}
                    </div>
                    <h4 className="text-sm font-bold text-white">{order.projectTitle}</h4>
                    <span className="text-xs text-slate-400 block">
                      {order.serviceId?.name} • {order.packageId?.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-500 block">Total / Advance</span>
                      <span className="text-xs font-bold text-white">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-400 block">
                        (₹{order.advanceAmount.toLocaleString('en-IN')} pd.)
                      </span>
                    </div>

                    <Link
                      to={`/dashboard/projects/${order._id}`}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                    >
                      Track
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-3">
              <FolderKanban className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No active projects yet.</p>
              <button
                onClick={() => openBookingModal()}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                Book Your First Project
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Kickoff Bookings (1 Col) */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Upcoming Kickoffs</h3>
            <Link
              to="/dashboard/bookings"
              className="text-xs font-semibold text-brand-electric hover:underline"
            >
              Calendar
            </Link>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.slice(0, 3).map((bk) => (
                <div key={bk._id} className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400">{bk.bookingReference}</span>
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase">
                      {bk.status}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white">{bk.serviceId?.name}</h5>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-brand-electric" />
                    <span>{new Date(bk.scheduledDate).toDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-2">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No scheduled bookings.</p>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-brand-electric block">Need Architectural Support?</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Reach out to our project management desk directly at <span className="text-white">support@nwtinfo.com</span>.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

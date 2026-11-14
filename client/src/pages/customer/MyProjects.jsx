import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FolderKanban, Search, Filter, ArrowRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const MyProjects = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const statuses = ['All', 'confirmed', 'in_progress', 'review', 'completed', 'pending'];

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'All' || o.projectStatus === statusFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
      (o.serviceId?.name && o.serviceId.name.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

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
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Projects & Orders</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track active deliverables, milestone updates, and financial status
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order number, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-brand-blue text-white shadow-glow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-slate-900 animate-pulse border border-slate-800"></div>
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs font-bold text-brand-electric">
                    {order.orderNumber}
                  </span>
                  {getStatusBadge(order.projectStatus)}
                  {order.remainingPaymentRequested && !order.remainingPaid && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold animate-pulse">
                      Remaining 70% Balance Requested
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white">{order.projectTitle}</h3>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span>{order.serviceId?.name}</span>
                  <span>•</span>
                  <span>{order.packageId?.name}</span>
                  <span>•</span>
                  <span>Kickoff: {new Date(order.scheduledDate).toDateString()}</span>
                </div>
              </div>

              {/* Financial Snapshot & Link */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-slate-500 block">Total Investment</span>
                  <span className="text-sm font-bold text-white block">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                  <div className="text-[10px] flex items-center gap-1.5 mt-0.5">
                    <span className="text-emerald-400">₹{order.advanceAmount.toLocaleString('en-IN')} Adv.</span>
                    <span className="text-slate-500">|</span>
                    <span className={order.remainingPaid ? 'text-emerald-400' : 'text-slate-400'}>
                      {order.remainingPaid ? 'Balance Settled' : `₹${order.remainingAmount.toLocaleString('en-IN')} Bal.`}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/dashboard/projects/${order._id}`}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 transition shadow-glow-sm"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-navy-900/40 rounded-2xl border border-slate-800">
          <FolderKanban className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-white">No matching projects found</h4>
          <p className="text-xs text-slate-400 mt-1">Adjust your search query or filter</p>
        </div>
      )}

    </div>
  );
};

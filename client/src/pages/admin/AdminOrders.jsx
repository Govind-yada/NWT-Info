import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  CreditCard,
  FileText,
  ExternalLink,
  ChevronRight,
  Send,
  X,
} from 'lucide-react';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [newStatus, setNewStatus] = useState('in_progress');
  const [statusNote, setStatusNote] = useState('');

  const [newKickoffDate, setNewKickoffDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      let url = '/admin/orders?limit=50';
      if (statusFilter) url += `&status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  useEffect(() => {
    if (statusModalOpen || rescheduleModalOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [statusModalOpen, rescheduleModalOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  // Open Status Update Modal
  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.projectStatus || 'in_progress');
    setStatusNote('');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      await api.put(`/admin/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        note: statusNote,
      });
      setStatusModalOpen(false);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Reschedule Modal
  const openRescheduleModal = (order) => {
    setSelectedOrder(order);
    setNewKickoffDate(order.scheduledDate ? new Date(order.scheduledDate).toISOString().split('T')[0] : '');
    setRescheduleReason('');
    setRescheduleModalOpen(true);
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      await api.put(`/admin/orders/${selectedOrder._id}/reschedule`, {
        newDate: newKickoffDate,
        reason: rescheduleReason,
      });
      setRescheduleModalOpen(false);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error rescheduling order');
    } finally {
      setActionLoading(false);
    }
  };

  // Request Remaining 70% Payment
  const handleRequestRemaining = async (orderId) => {
    if (window.confirm('Send request to customer for remaining 70% balance payment?')) {
      try {
        await api.put(`/admin/orders/${orderId}/request-balance`);
        await fetchOrders();
      } catch (err) {
        alert(err.response?.data?.message || 'Error requesting balance');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Project Order Management</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Approve bookings, update live milestone progress, reschedule kickoff slots, and trigger remaining balance requests
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, customer, domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['', 'confirmed', 'in_progress', 'review', 'completed', 'pending', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-violet-600 text-white shadow-glow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st ? st.replace('_', ' ').toUpperCase() : 'ALL ORDERS'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Order Number</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Service & Package</th>
                <th className="px-5 py-4">Financials (30% / 70%)</th>
                <th className="px-5 py-4">Kickoff Date</th>
                <th className="px-5 py-4">Project Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                    Loading project orders...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-4 font-mono font-bold text-brand-electric">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white font-semibold block">{order.userId?.name}</span>
                      <span className="text-[10px] text-slate-400">{order.userId?.email}</span>
                      <span className="text-[10px] text-slate-500 block">{order.userId?.phone}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-200 font-medium block">{order.serviceId?.name}</span>
                      <span className="text-[10px] text-slate-400">{order.packageId?.name}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-extrabold text-white block">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-400 block">
                        ₹{order.advanceAmount.toLocaleString('en-IN')} Adv. ({order.advancePaid ? 'Paid' : 'Pending'})
                      </span>
                      <span className={`text-[10px] ${order.remainingPaid ? 'text-emerald-400' : 'text-slate-400'}`}>
                        ₹{order.remainingAmount.toLocaleString('en-IN')} Bal. ({order.remainingPaid ? 'Paid' : 'Pending'})
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {new Date(order.scheduledDate).toDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        {order.projectStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => openStatusModal(order)}
                        className="px-2.5 py-1.5 rounded-lg bg-violet-600/30 text-violet-300 hover:bg-violet-600 hover:text-white transition font-medium"
                      >
                        Status
                      </button>

                      <button
                        onClick={() => openRescheduleModal(order)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      >
                        Reschedule
                      </button>

                      {order.advancePaid && !order.remainingPaid && (
                        <button
                          onClick={() => handleRequestRemaining(order._id)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition ${
                            order.remainingPaymentRequested
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          {order.remainingPaymentRequested ? 'Bal. Requested' : 'Request 70%'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Update Status */}
      {statusModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-navy-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Update Milestone Status</h3>
              <button onClick={() => setStatusModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Project Order:</span>
                <span className="font-bold text-white">{selectedOrder.projectTitle} ({selectedOrder.orderNumber})</span>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">New Project Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Client Review</option>
                  <option value="completed">Completed & Shipped</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Audit Note for Customer Timeline</label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Wireframes approved. Frontend component integration commenced..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold"
                >
                  {actionLoading ? 'Updating...' : 'Save Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reschedule */}
      {rescheduleModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-navy-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Reschedule Kickoff Date</h3>
              <button onClick={() => setRescheduleModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReschedule} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Order:</span>
                <span className="font-bold text-white">{selectedOrder.orderNumber} - {selectedOrder.projectTitle}</span>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">New Kickoff Date *</label>
                <input
                  type="date"
                  required
                  value={newKickoffDate}
                  onChange={(e) => setNewKickoffDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Reason for Rescheduling</label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Awaiting client assets / Client requested revised date"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold"
                >
                  {actionLoading ? 'Saving...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

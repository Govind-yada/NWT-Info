import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  CreditCard,
  QrCode,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Image as ImageIcon,
  X,
  Download,
} from 'lucide-react';

export const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeProof, setActiveProof] = useState(null);

  useEffect(() => {
    if (activeProof) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [activeProof]);

  const fetchPayments = async () => {
    try {
      let url = '/admin/payments?';
      if (typeFilter) url += `&type=${typeFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const res = await api.get(url);
      if (res.data.success) {
        setPayments(res.data.data);
        setSummary(res.data.summary || {});
      }
    } catch (err) {
      console.error('Error fetching admin payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [typeFilter, statusFilter]);

  const exportPaymentsCSV = () => {
    if (!payments || payments.length === 0) {
      alert('No payments available to export.');
      return;
    }

    const headers = [
      'Payment Reference',
      'Order Number',
      'Customer Name',
      'Customer Email',
      'Amount (INR)',
      'Type',
      'Payment Method',
      'Status',
      'Razorpay Payment ID',
      'UPI UTR Reference',
      'Transaction Date',
    ];

    const rows = payments.map((p) => [
      `"${p.paymentReference || ''}"`,
      `"${p.orderId?.orderNumber || ''}"`,
      `"${(p.userId?.name || '').replace(/"/g, '""')}"`,
      `"${(p.userId?.email || '').replace(/"/g, '""')}"`,
      p.amount || 0,
      `"${p.type || ''}"`,
      `"${p.paymentMethod || 'razorpay'}"`,
      `"${p.status || ''}"`,
      `"${p.razorpayPaymentId || ''}"`,
      `"${p.upiTransactionId || ''}"`,
      `"${p.createdAt ? new Date(p.createdAt).toISOString() : ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NWT_Payments_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment & Revenue Ledger</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audited Razorpay payment records, 30% advances, and 70% remaining balance settlements
          </p>
        </div>

        <button
          onClick={exportPaymentsCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-900 border border-slate-700/80 hover:border-violet-500/50 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition shrink-0 shadow-sm"
        >
          <Download className="w-4 h-4 text-violet-400" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card rounded-2xl p-5 space-y-2 border-l-4 border-l-emerald-500">
          <span className="text-xs text-slate-400 font-medium">Total Revenue Settled</span>
          <span className="text-2xl font-extrabold text-white block">
            ₹{(summary.totalRevenue || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500">All successful transactions</span>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-2 border-l-4 border-l-blue-500">
          <span className="text-xs text-slate-400 font-medium">30% Advance Payments</span>
          <span className="text-2xl font-extrabold text-brand-electric block">
            ₹{(summary.advanceReceived || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500">Initial project booking deposits</span>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-2 border-l-4 border-l-purple-500">
          <span className="text-xs text-slate-400 font-medium">70% Remaining Balances</span>
          <span className="text-2xl font-extrabold text-purple-400 block">
            ₹{(summary.remainingReceived || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500">Milestone handover payments</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center gap-3 text-xs">
        <span className="text-slate-400 font-semibold uppercase text-[10px]">Filter Ledger:</span>
        
        <button
          onClick={() => setTypeFilter('')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            typeFilter === '' ? 'bg-violet-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          All Types
        </button>
        <button
          onClick={() => setTypeFilter('advance')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            typeFilter === 'advance' ? 'bg-violet-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          30% Advance Only
        </button>
        <button
          onClick={() => setTypeFilter('remaining')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            typeFilter === 'remaining' ? 'bg-violet-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          70% Balance Only
        </button>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Receipt Ref</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Project Order</th>
                <th className="px-5 py-4">Payment Type</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Method & Transaction IDs</th>
                <th className="px-5 py-4">Timestamp</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-8 text-center text-slate-500">
                    Loading ledger entries...
                  </td>
                </tr>
              ) : payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-4 font-mono font-bold text-violet-400">
                      {p.paymentReference}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white font-semibold block">{p.userId?.name || 'Customer'}</span>
                      <span className="text-[10px] text-slate-400">{p.userId?.email}</span>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-200">
                      {p.orderId?.orderNumber}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        p.type === 'advance' ? 'bg-blue-500/10 text-brand-electric' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {p.type === 'advance' ? '30% Advance' : '70% Balance'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-extrabold text-white">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-[10px]">
                      {p.paymentMethod === 'UPI QR Code' ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 font-semibold text-purple-300">
                            <QrCode className="w-3 h-3" /> UPI QR Code
                          </span>
                          <div className="font-mono text-slate-300">
                            UTR: {p.upiTransactionId || 'N/A'}
                          </div>
                          {p.screenshotUrl && (
                            <button
                              type="button"
                              onClick={() => setActiveProof(p.screenshotUrl)}
                              className="inline-flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 underline"
                            >
                              <ImageIcon className="w-3 h-3" /> View Proof Receipt
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1 font-mono text-slate-400">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 font-semibold text-blue-300">
                            <CreditCard className="w-3 h-3" /> Razorpay
                          </span>
                          <div>Ord: {p.razorpayOrderId || 'N/A'}</div>
                          <div className="text-slate-500">Pay: {p.razorpayPaymentId || 'N/A'}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Success
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-5 py-8 text-center text-slate-500">
                    No transactions match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Modal */}
      {activeProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-navy-900 border border-slate-800 rounded-3xl p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white">Customer Payment Receipt Proof</span>
              <button onClick={() => setActiveProof(null)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-96 overflow-auto rounded-xl">
              <img src={activeProof} alt="Payment Proof" className="w-full object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

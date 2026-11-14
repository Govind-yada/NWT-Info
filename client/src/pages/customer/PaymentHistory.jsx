import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CreditCard, CheckCircle2, AlertCircle, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/payments/my-payments');
        if (res.data.success) {
          setPayments(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const totalPaid = payments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment History & Receipts</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified Razorpay transactional records for advance and remaining balances
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4 text-xs">
          <span className="text-slate-400">Total Settled:</span>
          <span className="text-base font-extrabold text-emerald-400">
            ₹{totalPaid.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Receipt Ref</th>
                <th className="px-6 py-4">Project Order</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Razorpay Payment ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    Loading verified transaction records...
                  </td>
                </tr>
              ) : payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-900/40 transition">
                    <td className="px-6 py-4 font-mono font-semibold text-brand-electric">
                      {p.paymentReference}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {p.orderId?.projectTitle || p.orderId?.orderNumber || 'Digital Service'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                        p.type === 'advance' ? 'bg-blue-500/10 text-brand-electric' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {p.type === 'advance' ? '30% Advance' : '70% Balance'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                      {p.razorpayPaymentId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Success
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

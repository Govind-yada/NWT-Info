import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, Phone, Mail, Building, MapPin, ShoppingBag, CreditCard, X } from 'lucide-react';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Customer Detail Drawer/Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerPayments, setCustomerPayments] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      let url = '/admin/customers';
      if (search) url += `?search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const viewCustomerDetails = async (id) => {
    setDetailLoading(true);
    setSelectedCustomer(null);

    try {
      const res = await api.get(`/admin/customers/${id}`);
      if (res.data.success) {
        setSelectedCustomer(res.data.customer);
        setCustomerOrders(res.data.orders || []);
        setCustomerPayments(res.data.payments || []);
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Customer Directory</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          View registered client profiles, purchase history, and lifetime investment metrics
        </p>
      </div>

      {/* Search Input */}
      <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Customer Name</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Company</th>
                <th className="px-5 py-4">Orders</th>
                <th className="px-5 py-4">Lifetime Spent</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                    Loading customer directory...
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-4 font-bold text-white">
                      {c.name}
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {c.email}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {c.phone}
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {c.company || '—'}
                    </td>
                    <td className="px-5 py-4 font-semibold text-violet-400">
                      {c.orderCount || 0} Projects
                    </td>
                    <td className="px-5 py-4 font-extrabold text-emerald-400">
                      ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => viewCustomerDetails(c._id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
                      >
                        Profile & History
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                    No customers found matching search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-navy-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Client Dossier: {selectedCustomer.name}</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-navy-950 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Email:</span>
                <span className="font-semibold text-white">{selectedCustomer.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Phone (WhatsApp):</span>
                <span className="font-semibold text-white">{selectedCustomer.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Company:</span>
                <span className="text-slate-200">{selectedCustomer.company || 'Not Specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Address:</span>
                <span className="text-slate-200">{selectedCustomer.address || 'Not Specified'}</span>
              </div>
            </div>

            {/* Orders History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Project Orders ({customerOrders.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {customerOrders.map((ord) => (
                  <div key={ord._id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-mono text-brand-electric font-semibold mr-2">{ord.orderNumber}</span>
                      <span className="text-white font-medium">{ord.projectTitle}</span>
                      <span className="text-[10px] text-slate-400 block">{ord.serviceId?.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white block">₹{ord.totalAmount.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase">{ord.projectStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payments History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Payment Transactions ({customerPayments.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {customerPayments.map((p) => (
                  <div key={p._id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-mono text-violet-400 font-semibold mr-2">{p.paymentReference}</span>
                      <span className="text-slate-300 text-[11px]">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white block">₹{p.amount.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">{p.type === 'advance' ? '30% Advance' : '70% Balance'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

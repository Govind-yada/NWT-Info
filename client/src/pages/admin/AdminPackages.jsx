import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Package as PackageIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertCircle,
  X,
  Layers,
  Clock,
} from 'lucide-react';

export const AdminPackages = () => {
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const [formData, setFormData] = useState({
    serviceId: '',
    name: '',
    description: '',
    price: 6999,
    discountPrice: '',
    deliveryEstimate: '5-7 Business Days',
    features: '',
    isPopular: false,
    isActive: true,
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/services');
      if (res.data.success) {
        setServices(res.data.data);
        // Flatten packages from all services
        const allPkgs = [];
        res.data.data.forEach((s) => {
          (s.packages || []).forEach((p) => {
            allPkgs.push({ ...p, serviceName: s.name, serviceCategory: s.category });
          });
        });
        setPackages(allPkgs);
      }
    } catch (err) {
      console.error('Error loading admin packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingPackage(null);
    setFormData({
      serviceId: services[0]?._id || '',
      name: '',
      description: '',
      price: 9999,
      discountPrice: '',
      deliveryEstimate: '7-10 Business Days',
      features: '',
      isPopular: false,
      isActive: true,
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      serviceId: pkg.serviceId?._id || pkg.serviceId,
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      discountPrice: pkg.discountPrice || '',
      deliveryEstimate: pkg.deliveryEstimate,
      features: (pkg.features || []).join('\n'),
      isPopular: pkg.isPopular,
      isActive: pkg.isActive,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      const payload = {
        serviceId: formData.serviceId,
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        deliveryEstimate: formData.deliveryEstimate,
        isPopular: Boolean(formData.isPopular),
        isActive: Boolean(formData.isActive),
        features: formData.features.split('\n').map((f) => f.trim()).filter(Boolean),
      };

      if (editingPackage) {
        await api.put(`/admin/packages/${editingPackage._id}`, payload);
      } else {
        await api.post('/admin/packages', payload);
      }

      setModalOpen(false);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving package');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this package tier?')) {
      try {
        await api.delete(`/admin/packages/${id}`);
        await fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting package');
      }
    }
  };

  const toggleStatus = async (pkg) => {
    try {
      await api.put(`/admin/packages/${pkg._id}`, {
        isActive: !pkg.isActive,
      });
      await fetchData();
    } catch (err) {
      console.error('Error toggling package status:', err);
    }
  };

  const filteredPackages = selectedServiceId === 'all'
    ? packages
    : packages.filter((p) => p.serviceId?._id === selectedServiceId || p.serviceId === selectedServiceId);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dynamic Package & Pricing Tiers</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure package names (Static, Classic, Premium), authoritative prices, 30% advance split, and feature checklists
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-glow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Package Tier
        </button>
      </div>

      {/* Filter by Service */}
      <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3 overflow-x-auto text-xs">
        <span className="text-slate-400 font-semibold uppercase text-[10px] shrink-0">Filter By Service:</span>
        <button
          onClick={() => setSelectedServiceId('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium ${
            selectedServiceId === 'all' ? 'bg-violet-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          All Packages ({packages.length})
        </button>
        {services.map((s) => (
          <button
            key={s._id}
            onClick={() => setSelectedServiceId(s._id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium ${
              selectedServiceId === s._id ? 'bg-violet-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {s.name} ({(s.packages || []).length})
          </button>
        ))}
      </div>

      {/* Packages Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Package Name</th>
                <th className="px-5 py-4">Associated Service</th>
                <th className="px-5 py-4">Total Price</th>
                <th className="px-5 py-4">30% Advance</th>
                <th className="px-5 py-4">Delivery Estimate</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                    Loading package tiers...
                  </td>
                </tr>
              ) : filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <tr key={pkg._id} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span>{pkg.name}</span>
                        {pkg.isPopular && (
                          <span className="px-1.5 py-0.5 rounded bg-violet-600/30 text-violet-300 text-[9px] font-bold">
                            POPULAR
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {pkg.serviceName || 'Service'}
                    </td>
                    <td className="px-5 py-4 font-extrabold text-white">
                      ₹{pkg.price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 font-bold text-brand-electric">
                      ₹{Math.round(pkg.price * 0.3).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {pkg.deliveryEstimate}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleStatus(pkg)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                          pkg.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {pkg.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(pkg)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg._id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                    No packages found. Click "Create Package Tier" above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create / Edit Package */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-navy-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingPackage ? `Edit Package: ${editingPackage.name}` : 'Create New Package Tier'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Associated Service *</label>
                <select
                  required
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="">-- Choose Service --</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Package Name (Tier) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Classic Website / Premium"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="9999"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Delivery Estimate *</label>
                  <input
                    type="text"
                    required
                    value={formData.deliveryEstimate}
                    onChange={(e) => setFormData({ ...formData, deliveryEstimate: e.target.value })}
                    placeholder="7-10 Business Days"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Discount Strikethrough Price (Optional)</label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="12999"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Package Description *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Perfect for growing businesses needing client portal & payment integration..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                ></textarea>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Included Features (One per line)</label>
                <textarea
                  rows={4}
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Up to 10 Responsive Pages&#10;Razorpay 30% Advance Integration&#10;Speed Optimization&#10;Google Calendar Sync"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPopularCheck"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded text-violet-600 focus:ring-0"
                  />
                  <label htmlFor="isPopularCheck" className="text-slate-300 font-medium">
                    Mark as "Most Popular"
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPkgActiveCheck"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-violet-600 focus:ring-0"
                  />
                  <label htmlFor="isPkgActiveCheck" className="text-slate-300 font-medium">
                    Active / Available
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  AlertCircle,
  X,
  Save,
} from 'lucide-react';

export const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Website Development',
    shortDescription: '',
    description: '',
    icon: 'Globe',
    startingPrice: 6999,
    features: '',
    isActive: true,
    image: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    'Website Development',
    'Software Development',
    'Mobile App Development',
    'SEO / SMO',
    'Content Management',
    'Digital Marketing',
    'Branding & Campaign Management',
  ];

  const fetchServices = async () => {
    try {
      const res = await api.get('/admin/services');
      if (res.data.success) {
        setServices(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'Website Development',
      shortDescription: '',
      description: '',
      icon: 'Globe',
      startingPrice: 6999,
      features: '',
      isActive: true,
      image: '',
    });
    setImageFile(null);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      shortDescription: service.shortDescription,
      description: service.description,
      icon: service.icon || 'Globe',
      startingPrice: service.startingPrice,
      features: (service.features || []).join('\n'),
      isActive: service.isActive,
      image: service.image || '',
    });
    setImageFile(null);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('shortDescription', formData.shortDescription);
      data.append('description', formData.description);
      data.append('icon', formData.icon);
      data.append('startingPrice', formData.startingPrice);
      data.append('isActive', formData.isActive);
      data.append(
        'features',
        JSON.stringify(formData.features.split('\n').map((f) => f.trim()).filter(Boolean))
      );

      if (imageFile) {
        data.append('image', imageFile);
      } else if (formData.image) {
        data.append('image', formData.image);
      }

      if (editingService) {
        await api.put(`/admin/services/${editingService._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/admin/services', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setModalOpen(false);
      await fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving service');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service and all its associated packages?')) {
      try {
        await api.delete(`/admin/services/${id}`);
        await fetchServices();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting service');
      }
    }
  };

  const toggleStatus = async (service) => {
    try {
      await api.put(`/admin/services/${service._id}`, {
        isActive: !service.isActive,
      });
      await fetchServices();
    } catch (err) {
      console.error('Error toggling service status:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Digital Services Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure dynamic services, descriptions, starting prices, and promotional banners
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-glow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Service
        </button>
      </div>

      {/* Services List Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Service Name</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Packages</th>
                <th className="px-5 py-4">Starting Price</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-500">
                    Loading services...
                  </td>
                </tr>
              ) : services.length > 0 ? (
                services.map((svc) => (
                  <tr key={svc._id} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-4 font-bold text-white flex items-center gap-3">
                      {svc.image ? (
                        <img src={svc.image} alt={svc.name} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                          <Layers className="w-4 h-4" />
                        </div>
                      )}
                      <span>{svc.name}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {svc.category}
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-semibold">
                      {svc.packagesCount || 0} Tiers
                    </td>
                    <td className="px-5 py-4 font-bold text-white">
                      ₹{svc.startingPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleStatus(svc)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                          svc.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {svc.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(svc)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                        title="Edit Service"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(svc._id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                        title="Delete Service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-500">
                    No services defined. Click "Add New Service" above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add / Edit Service */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-navy-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingService ? `Edit Service: ${editingService.name}` : 'Create New Digital Service'}
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
                <label className="block font-medium text-slate-300 mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Website Development"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Starting Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.startingPrice}
                    onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Short Description (Summary) *</label>
                <input
                  type="text"
                  required
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="High-performance responsive websites built with modern frameworks..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Full architectural overview of what this service delivers..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                ></textarea>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Features (One per line)</label>
                <textarea
                  rows={3}
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Responsive design&#10;Razorpay gateway ready&#10;Fast loading speed"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Image URL or Upload</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-slate-800 text-white mb-2"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="text-[11px] text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-violet-600 focus:ring-0"
                  />
                  <label htmlFor="isActiveCheck" className="text-slate-300 font-medium">
                    Publish Service as Active
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
                  {actionLoading ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

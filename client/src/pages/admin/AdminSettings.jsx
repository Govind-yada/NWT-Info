import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Sliders,
  CreditCard,
  QrCode,
  Building,
  CalendarDays,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('payments');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Settings State
  const [formData, setFormData] = useState({
    companyName: 'NWT Info (Next World Tech)',
    companyTagline: 'Engineering Next-Gen Digital Services & Scalable Tech',
    supportEmail: 'support@nwtinfo.com',
    supportPhone: '+91 7859088239',
    companyAddress: 'Cyber City, Phase 2, Gurugram, Haryana 122002, India',
    companyUpiId: '7859088239@okbizaxis',
    companyPayeeName: 'Implex Cart International',
    advancePercentage: 30,
    maxBookingsPerDay: 3,
    razorpayKeyId: 'rzp_test_mockKeyId12345',
    razorpayEnabled: true,
    upiQrEnabled: true,
    autoConfirmBookings: true,
    maintenanceMode: false,
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Fetch Current Settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings');
      if (res.data.success && res.data.data) {
        setFormData((prev) => ({
          ...prev,
          ...res.data.data,
        }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setErrorMessage('Could not load current platform settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await api.put('/admin/settings', formData);
      if (res.data.success) {
        setSuccessMessage('Platform and payment configuration saved successfully!');
        setFormData((prev) => ({
          ...prev,
          ...res.data.data,
        }));
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await api.put('/admin/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.data.success) {
        setSuccessMessage('Admin security password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Preview UPI Intent Link
  const sampleAmount = 15000;
  const previewUpiUrl = `upi://pay?pa=${encodeURIComponent(
    formData.companyUpiId || 'nwtinfo@okaxis'
  )}&pn=${encodeURIComponent(
    formData.companyPayeeName || 'NWT Info'
  )}&am=${sampleAmount}&cu=INR&tn=${encodeURIComponent('NWT-Project-Advance')}`;

  const tabs = [
    { id: 'payments', label: 'Payment & UPI QR', icon: QrCode },
    { id: 'company', label: 'Company Profile', icon: Building },
    { id: 'bookings', label: 'Booking & Capacity', icon: CalendarDays },
    { id: 'security', label: 'Admin Security', icon: Lock },
  ];

  if (loading) {
    return (
      <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center space-y-3 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-violet-400" />
        <span className="text-xs font-mono">Loading platform configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-violet-400" />
            System & Gateway Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure live UPI payment parameters, Razorpay keys, booking capacity, and organizational credentials
          </p>
        </div>

        {/* Action Status Notifications */}
        {successMessage && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSuccessMessage('');
                setErrorMessage('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                isActive
                  ? 'bg-violet-600 text-white shadow-glow-sm'
                  : 'bg-navy-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Payment & UPI QR Settings */}
      {activeTab === 'payments' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Form Inputs */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-5 border border-slate-800/80">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-violet-400" />
                  UPI QR & Razorpay Configuration
                </h3>
                <span className="text-[10px] uppercase font-bold text-slate-500">Live Dynamic Config</span>
              </div>

              {/* UPI ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Company Official UPI ID (VPA) *
                </label>
                <input
                  type="text"
                  name="companyUpiId"
                  value={formData.companyUpiId}
                  onChange={handleChange}
                  required
                  placeholder="e.g. nwtinfo@okaxis / 9876543210@paytm"
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-violet-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Customer payments via the dynamic QR code are credited directly to this UPI address.
                </p>
              </div>

              {/* Payee Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Verified Business Payee Name *
                </label>
                <input
                  type="text"
                  name="companyPayeeName"
                  value={formData.companyPayeeName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. NWT Info (Next World Tech)"
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-violet-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Appears as beneficiary title on customer UPI apps (Google Pay, PhonePe, Paytm).
                </p>
              </div>

              {/* Advance Percentage & Razorpay Key */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Advance Payment Percentage (%) *
                  </label>
                  <input
                    type="number"
                    name="advancePercentage"
                    value={formData.advancePercentage}
                    onChange={handleChange}
                    min={10}
                    max={100}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-violet-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Standard industry default: 30%</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Razorpay Key ID
                  </label>
                  <input
                    type="text"
                    name="razorpayKeyId"
                    value={formData.razorpayKeyId}
                    onChange={handleChange}
                    placeholder="rzp_test_... or rzp_live_..."
                    className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-violet-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Leave empty to use .env key</p>
                </div>
              </div>

              {/* Gateway Toggles */}
              <div className="pt-2 border-t border-slate-800/60 space-y-3">
                <span className="text-xs font-bold text-slate-300 block">Payment Methods Availability</span>

                <div className="flex items-center justify-between p-3 rounded-xl bg-navy-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-purple-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">UPI Instant QR Code</span>
                      <span className="text-[11px] text-slate-400">Zero transaction fees, immediate UTR verification</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="upiQrEnabled"
                      checked={formData.upiQrEnabled}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-navy-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">Razorpay Payment Gateway</span>
                      <span className="text-[11px] text-slate-400">Credit / Debit Cards, NetBanking, International cards</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="razorpayEnabled"
                      checked={formData.razorpayEnabled}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs shadow-glow-sm transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Changes...' : 'Save Payment Settings'}</span>
                </button>
              </div>
            </div>

            {/* Right Col: Live Dynamic Preview */}
            <div className="glass-panel p-6 rounded-2xl space-y-4 border border-violet-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800/60">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Customer QR Live Preview
                  </h3>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-white text-navy-950 text-center space-y-2 shadow-xl">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider block text-slate-700">
                    Scan with any UPI App
                  </span>

                  <div className="flex justify-center p-2 bg-slate-50 rounded-lg">
                    {/* Visual QR Code Representation */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        previewUpiUrl
                      )}`}
                      alt="Live UPI QR Preview"
                      className="w-40 h-40 object-contain rounded-md"
                      loading="lazy"
                    />
                  </div>

                  <div className="space-y-0.5 text-left border-t border-slate-200 pt-2 text-[11px]">
                    <div className="text-slate-500 text-[10px]">Beneficiary Name:</div>
                    <div className="font-bold text-slate-900 truncate">
                      {formData.companyPayeeName || 'NWT Info'}
                    </div>
                    <div className="text-slate-500 text-[10px]">UPI VPA:</div>
                    <div className="font-mono font-bold text-violet-700 truncate">
                      {formData.companyUpiId || 'nwtinfo@okaxis'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-[11px] text-slate-400 space-y-1">
                  <span className="text-emerald-400 font-semibold block">✓ Instant Sync:</span>
                  <p>
                    Changes saved here take immediate effect inside the booking checkout modal for all customers in real time.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </form>
      )}

      {/* Tab 2: Company Profile Settings */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveSettings} className="glass-panel p-6 rounded-2xl space-y-5 border border-slate-800/80">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-violet-400" />
              Company Details & Public Contact
            </h3>
            <span className="text-[10px] uppercase font-bold text-slate-500">Corporate Identity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                name="companyTagline"
                value={formData.companyTagline}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Support Email Address *
              </label>
              <input
                type="email"
                name="supportEmail"
                value={formData.supportEmail}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Support Phone Number *
              </label>
              <input
                type="text"
                name="supportPhone"
                value={formData.supportPhone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Office HQ Address
            </label>
            <textarea
              name="companyAddress"
              rows={2}
              value={formData.companyAddress}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs shadow-glow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Booking & Capacity */}
      {activeTab === 'bookings' && (
        <form onSubmit={handleSaveSettings} className="glass-panel p-6 rounded-2xl space-y-5 border border-slate-800/80">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-violet-400" />
              Booking Capacity & Operating Rules
            </h3>
            <span className="text-[10px] uppercase font-bold text-slate-500">Resource Control</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Maximum Project Bookings Allowed Per Day *
              </label>
              <input
                type="number"
                name="maxBookingsPerDay"
                min={1}
                max={20}
                value={formData.maxBookingsPerDay}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-violet-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                When this threshold is reached on any calendar date, the slot is automatically marked reserved.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-navy-950/60 border border-slate-800/80">
                <div>
                  <span className="text-xs font-bold text-white block">Auto-Confirm on Payment</span>
                  <span className="text-[11px] text-slate-400">Instantly switch project order to "Confirmed" once advance is verified</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="autoConfirmBookings"
                    checked={formData.autoConfirmBookings}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-navy-950/60 border border-slate-800/80">
                <div>
                  <span className="text-xs font-bold text-white block">Platform Maintenance Mode</span>
                  <span className="text-[11px] text-slate-400">Temporarily pauses new checkout bookings for scheduled updates</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={formData.maintenanceMode}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs shadow-glow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Booking Rules'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Admin Security & Password */}
      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="max-w-xl glass-panel p-6 rounded-2xl space-y-5 border border-slate-800/80">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-violet-400" />
              Admin Password & Authentication
            </h3>
            <span className="text-[10px] uppercase font-bold text-slate-500">Security</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Current Admin Password *
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              New Admin Password (Minimum 6 characters) *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Confirm New Admin Password *
            </label>
            <input
              type="password"
              required
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs shadow-glow-sm transition"
            >
              <Lock className="w-4 h-4" />
              <span>{passwordLoading ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
};

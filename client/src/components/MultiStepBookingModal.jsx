import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import {
  X,
  CheckCircle2,
  Calendar,
  CreditCard,
  QrCode,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ArrowLeft,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

export const MultiStepBookingModal = () => {
  const {
    isModalOpen,
    closeBookingModal,
    currentStep,
    nextStep,
    prevStep,
    bookingData,
    updateBookingData,
    submitBookingAndPay,
    submitBookingAndPayQr,
    qrConfig,
    loading,
    error,
    setError,
    resetBooking,
  } = useBooking();

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState(null);
  const [featureInput, setFeatureInput] = useState('');

  // Payment Method & QR Code State
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'qr'
  const [upiUtr, setUpiUtr] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const handleCopyUpi = () => {
    const idToCopy = qrConfig?.upiId || 'nwtinfo@okaxis';
    navigator.clipboard.writeText(idToCopy);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
  };

  // Prefill user details if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      updateBookingData({
        fullName: bookingData.fullName || user.name || '',
        email: bookingData.email || user.email || '',
        phone: bookingData.phone || user.phone || '',
        company: bookingData.company || user.company || '',
      });
    }
  }, [isAuthenticated, user]);

  // Load all dynamic services from backend
  useEffect(() => {
    if (isModalOpen) {
      const fetchServices = async () => {
        try {
          const res = await api.get('/services');
          if (res.data.success) {
            setServices(res.data.data);
            // If service selected, populate packages
            if (bookingData.serviceId) {
              const currentSvc = res.data.data.find((s) => s._id === bookingData.serviceId);
              if (currentSvc && currentSvc.packages) {
                setAvailablePackages(currentSvc.packages);
              }
            }
          }
        } catch (err) {
          console.error('Error fetching services:', err);
        }
      };
      fetchServices();
    }
  }, [isModalOpen, bookingData.serviceId]);

  // When service changes, update packages
  const handleServiceChange = (e) => {
    const sId = e.target.value;
    const selectedSvc = services.find((s) => s._id === sId);
    if (selectedSvc) {
      setAvailablePackages(selectedSvc.packages || []);
      const firstPkg = selectedSvc.packages && selectedSvc.packages[0];
      updateBookingData({
        serviceId: sId,
        selectedService: selectedSvc,
        packageId: firstPkg ? firstPkg._id : '',
        selectedPackage: firstPkg || null,
        projectTitle: `${selectedSvc.name} Project`,
      });
    }
  };

  const handlePackageChange = (e) => {
    const pId = e.target.value;
    const pkg = availablePackages.find((p) => p._id === pId);
    if (pkg) {
      updateBookingData({
        packageId: pId,
        selectedPackage: pkg,
      });
    }
  };

  // Check date availability
  const handleDateChange = async (e) => {
    const selectedDate = e.target.value;
    updateBookingData({ scheduledDate: selectedDate });

    if (selectedDate) {
      setCheckingAvailability(true);
      setSlotAvailability(null);
      try {
        const res = await api.get(`/bookings/check-availability?date=${selectedDate}`);
        if (res.data.success) {
          setSlotAvailability(res.data);
        }
      } catch (err) {
        console.error('Error checking availability:', err);
      } finally {
        setCheckingAvailability(false);
      }
    }
  };

  // Add custom feature tag
  const addFeature = () => {
    if (featureInput.trim()) {
      const updated = [...(bookingData.requiredFeatures || []), featureInput.trim()];
      updateBookingData({ requiredFeatures: updated });
      setFeatureInput('');
    }
  };

  const removeFeature = (idx) => {
    const updated = bookingData.requiredFeatures.filter((_, i) => i !== idx);
    updateBookingData({ requiredFeatures: updated });
  };

  // Handle file uploads
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((f) => f.size <= 15 * 1024 * 1024);
    if (validFiles.length < files.length) {
      setError('Some files exceeded the 15MB size limit and were excluded.');
    }
    updateBookingData({
      attachments: [...(bookingData.attachments || []), ...validFiles],
    });
  };

  const removeFile = (idx) => {
    const updated = bookingData.attachments.filter((_, i) => i !== idx);
    updateBookingData({ attachments: updated });
  };

  // Step Validations
  const validateStep = () => {
    setError(null);
    if (currentStep === 1) {
      if (!bookingData.fullName || !bookingData.email || !bookingData.phone) {
        setError('Please provide your full name, email, and phone number.');
        return false;
      }
      if (!/^\S+@\S+\.\S+$/.test(bookingData.email)) {
        setError('Please enter a valid email address.');
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      if (!bookingData.serviceId || !bookingData.packageId) {
        setError('Please select both a service and a package tier.');
        return false;
      }
      if (!bookingData.projectTitle || !bookingData.description) {
        setError('Please enter a project title and description.');
        return false;
      }
      return true;
    }
    if (currentStep === 3) {
      // File upload is optional
      return true;
    }
    if (currentStep === 4) {
      if (!bookingData.scheduledDate) {
        setError('Please select your preferred project kickoff date.');
        return false;
      }
      if (slotAvailability && !slotAvailability.available) {
        setError('Selected date is fully booked or unavailable. Please choose another date.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      nextStep();
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-navy-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-navy-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-brand-blue flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-electric" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Project Booking & Kickoff</h3>
              <p className="text-xs text-slate-400">Step {currentStep} of 6 — Transparent 30% Advance</p>
            </div>
          </div>
          <button
            onClick={() => {
              closeBookingModal();
              if (currentStep === 6) resetBooking();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            {['Contact', 'Project', 'Files', 'Date', 'Summary', 'Done'].map((label, idx) => {
              const stepNum = idx + 1;
              const isPassed = currentStep > stepNum;
              const isCurrent = currentStep === stepNum;
              return (
                <div key={label} className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isPassed
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-brand-blue text-white shadow-glow-sm'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                  </div>
                  <span className={`text-[10px] mt-1 hidden sm:block ${isCurrent ? 'text-blue-400 font-medium' : 'text-slate-500'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-blue to-brand-violet h-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          
          {/* STEP 1: Customer Contact Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-200">Customer Contact Details</h4>
              <p className="text-xs text-slate-400">
                Provide your contact information for order confirmation and communication.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={bookingData.fullName}
                    onChange={(e) => updateBookingData({ fullName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => updateBookingData({ email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => updateBookingData({ phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Company / Brand (Optional)</label>
                  <input
                    type="text"
                    value={bookingData.company}
                    onChange={(e) => updateBookingData({ company: e.target.value })}
                    placeholder="Acme Innovations"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Project Specifications */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-200">Project Information & Service Tier</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Service Selection */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Selected Service *</label>
                  <select
                    value={bookingData.serviceId}
                    onChange={handleServiceChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Choose Digital Service --</option>
                    {services.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} (from ₹{s.startingPrice.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Package Tier Selection */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Selected Package Tier *</label>
                  <select
                    value={bookingData.packageId}
                    onChange={handlePackageChange}
                    disabled={!bookingData.serviceId || availablePackages.length === 0}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="">-- Choose Package Tier --</option>
                    {availablePackages.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} — ₹{p.price.toLocaleString('en-IN')} ({p.deliveryEstimate})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Project Title & Proposed Domain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Project Title *</label>
                  <input
                    type="text"
                    value={bookingData.projectTitle}
                    onChange={(e) => updateBookingData({ projectTitle: e.target.value })}
                    placeholder="e.g. Modern E-Commerce Web App"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Proposed Domain / Name (Optional)</label>
                  <input
                    type="text"
                    value={bookingData.proposedDomain}
                    onChange={(e) => updateBookingData({ proposedDomain: e.target.value })}
                    placeholder="mybrand.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Description & Goal *</label>
                <textarea
                  rows={3}
                  value={bookingData.description}
                  onChange={(e) => updateBookingData({ description: e.target.value })}
                  placeholder="Tell us about your business, target audience, and primary objectives..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              {/* Required Features Tags */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Key Required Features (Optional)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                    placeholder="Type feature (e.g. Razorpay Payment, Admin CMS) & press Add"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-navy-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-3.5 py-2 rounded-xl bg-blue-600/30 text-blue-300 text-xs font-medium hover:bg-blue-600/40"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(bookingData.requiredFeatures || []).map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300"
                    >
                      {feat}
                      <button type="button" onClick={() => removeFeature(idx)} className="text-slate-400 hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Reference Websites */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reference Websites or Inspirations</label>
                <input
                  type="text"
                  value={bookingData.referenceWebsites}
                  onChange={(e) => updateBookingData({ referenceWebsites: e.target.value })}
                  placeholder="https://example.com, https://stripe.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: File Uploads */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-200">Upload Project Documents & Media</h4>
              <p className="text-xs text-slate-400">
                Upload your wireframes, logos, design references, briefs, or documents (Images, PDF, DOCX, ZIP up to 15MB each).
              </p>

              <div className="relative border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 text-center bg-navy-950/50 transition overflow-hidden">
                <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-medium">Click to upload files</p>
                <p className="text-[11px] text-slate-500 mt-1">Supports PNG, JPG, PDF, DOC, ZIP up to 15MB</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Uploaded File List */}
              {bookingData.attachments && bookingData.attachments.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-slate-400">Attached Files ({bookingData.attachments.length})</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {bookingData.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                          <span className="text-slate-200 truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-500">
                            ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Scheduling & Available Slots */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-200">Select Project Kickoff Date</h4>
              <p className="text-xs text-slate-400">
                Choose your preferred kickoff date. We check calendar availability in real time to avoid scheduling conflicts.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kickoff Date *</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingData.scheduledDate}
                    onChange={handleDateChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Time Slot</label>
                  <select
                    value={bookingData.timeSlot}
                    onChange={(e) => updateBookingData({ timeSlot: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Morning Slot (10:00 AM - 01:00 PM)">Morning Slot (10:00 AM - 01:00 PM)</option>
                    <option value="Afternoon Slot (02:00 PM - 05:00 PM)">Afternoon Slot (02:00 PM - 05:00 PM)</option>
                    <option value="Evening Slot (05:00 PM - 08:00 PM)">Evening Slot (05:00 PM - 08:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Slot Availability Notice */}
              {checkingAvailability ? (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  Checking calendar availability...
                </div>
              ) : slotAvailability ? (
                slotAvailability.available ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Slot is available! ({slotAvailability.slotsLeft} slots remaining on this day)</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{slotAvailability.reason || 'This date is currently unavailable. Please choose another date.'}</span>
                  </div>
                )
              ) : null}
            </div>
          )}

          {/* STEP 5: Payment Summary & Method Selection (30% Advance Calculation) */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-200">Investment Breakdown & 30% Advance</h4>
              
              <div className="rounded-2xl bg-navy-950 border border-slate-800 p-4 space-y-3">
                <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-800/80">
                  <span className="text-slate-400">Service:</span>
                  <span className="font-semibold text-white">{bookingData.selectedService?.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-800/80">
                  <span className="text-slate-400">Package Tier:</span>
                  <span className="font-semibold text-white">{bookingData.selectedPackage?.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-800/80">
                  <span className="text-slate-400">Estimated Delivery:</span>
                  <span className="text-slate-300">{bookingData.selectedPackage?.deliveryEstimate}</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-800/80">
                  <span className="text-slate-400">Kickoff Date:</span>
                  <span className="text-slate-300">{bookingData.scheduledDate}</span>
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-400">Total Project Value:</span>
                  <span className="font-bold text-white text-sm">
                    ₹{bookingData.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Highlighted 30% Advance */}
                <div className="p-3 rounded-xl bg-blue-600/10 border border-blue-500/30 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-brand-electric block">30% Advance Payable Today</span>
                    <span className="text-[10px] text-slate-400">Confirms your slot & initiates production</span>
                  </div>
                  <span className="text-base font-extrabold text-brand-electric">
                    ₹{bookingData.advanceAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Remaining 70% Note */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-300 font-medium block">Remaining 70% Balance</span>
                    <span className="text-[10px] text-slate-500">Payable only after milestone review & project delivery</span>
                  </div>
                  <span className="font-bold text-slate-300">
                    ₹{bookingData.remainingAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector (Keep Both Razorpay and QR Code) */}
              <div className="space-y-2 pt-1">
                <span className="block text-xs font-semibold text-slate-300">Choose Payment Method:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Razorpay Option */}
                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition relative flex items-start gap-3 ${
                      paymentMethod === 'razorpay'
                        ? 'bg-blue-600/15 border-blue-500 shadow-glow-sm'
                        : 'bg-navy-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${paymentMethod === 'razorpay' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Razorpay Gateway</span>
                        {paymentMethod === 'razorpay' && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Cards, Net Banking, Razorpay UPI & Wallets</p>
                    </div>
                  </div>

                  {/* UPI QR Code Option */}
                  <div
                    onClick={() => setPaymentMethod('qr')}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition relative flex items-start gap-3 ${
                      paymentMethod === 'qr'
                        ? 'bg-purple-600/15 border-purple-500 shadow-glow-sm'
                        : 'bg-navy-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${paymentMethod === 'qr' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Scan UPI QR Code</span>
                        {paymentMethod === 'qr' && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">GPay, PhonePe, Paytm, BHIM (Zero Fee)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditional Payment Details */}
              {paymentMethod === 'razorpay' ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Secure Razorpay checkout with instant digital invoice.</span>
                </div>
              ) : (
                /* UPI QR Code Container */
                <div className="space-y-3 p-4 rounded-2xl bg-navy-950 border border-purple-500/30">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Rendered SVG QR Code */}
                    <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-slate-700 shrink-0 flex items-center justify-center">
                      <QRCodeSVG
                        value={`upi://pay?pa=${encodeURIComponent(qrConfig?.upiId || 'nwtinfo@okaxis')}&pn=${encodeURIComponent(qrConfig?.payeeName || 'NWT Info')}&am=${bookingData.advanceAmount}&cu=INR&tn=${encodeURIComponent('30% Advance ' + (bookingData.projectTitle || 'NWT Project'))}`}
                        size={140}
                        level="H"
                        includeMargin={false}
                      />
                    </div>

                    <div className="flex-1 space-y-2 text-xs text-left w-full">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Payee Beneficiary</span>
                        <span className="font-bold text-white text-sm">{qrConfig?.payeeName || 'NWT Info (Next World Tech)'}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Company UPI ID</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <code className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-semibold text-brand-electric">
                            {qrConfig?.upiId || 'nwtinfo@okaxis'}
                          </code>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition"
                          >
                            {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copiedUpi ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="pt-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Payable Advance (30%)</span>
                        <span className="text-base font-extrabold text-emerald-400">
                          ₹{bookingData.advanceAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* UTR Input Form */}
                  <div className="pt-2 border-t border-slate-800 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1">
                        12-Digit UPI Transaction ID / UTR <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={upiUtr}
                        onChange={(e) => setUpiUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                        placeholder="e.g. 512345678901 (from GPay / PhonePe / Paytm)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono tracking-wider"
                        required
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Open your UPI app payment receipt, locate the 12-digit UTR/Ref No, and paste it here.
                      </span>
                    </div>

                    {/* Optional Screenshot Upload */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Payment Screenshot Proof <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      {screenshotPreview ? (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <img src={screenshotPreview} alt="Proof" className="w-10 h-10 object-cover rounded-lg border border-slate-700 shrink-0" />
                            <span className="text-slate-200 truncate">{screenshotFile?.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={removeScreenshot}
                            className="p-1 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="relative border border-dashed border-slate-700 hover:border-purple-500/50 rounded-xl p-3 text-center bg-slate-900/40 transition cursor-pointer flex items-center justify-center gap-2">
                          <Upload className="w-4 h-4 text-purple-400" />
                          <span className="text-xs text-slate-300">Attach payment screenshot proof</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleScreenshotChange}
                            className="sr-only"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Confirmation Screen */}
          {currentStep === 6 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-glow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Project Booking Confirmed!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Your 30% advance payment has been verified. Welcome to Next World Tech!
                </p>
              </div>

              {bookingData.confirmedOrder && (
                <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 text-left space-y-2 max-w-md mx-auto text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order Reference:</span>
                    <span className="font-mono font-bold text-brand-electric">
                      {bookingData.confirmedOrder.orderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Project:</span>
                    <span className="text-white font-medium">{bookingData.confirmedOrder.projectTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Method:</span>
                    <span className="font-semibold text-purple-400">
                      {bookingData.confirmedPayment?.paymentMethod || 'Razorpay Gateway'}
                    </span>
                  </div>
                  {bookingData.confirmedPayment?.upiTransactionId && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">UPI Ref / UTR:</span>
                      <span className="font-mono text-slate-300">
                        {bookingData.confirmedPayment.upiTransactionId}
                      </span>
                    </div>
                  )}
                  {bookingData.confirmedPayment?.razorpayPaymentId && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Razorpay ID:</span>
                      <span className="font-mono text-slate-300">
                        {bookingData.confirmedPayment.razorpayPaymentId}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Advance Paid:</span>
                    <span className="text-emerald-400 font-bold">
                      ₹{bookingData.confirmedOrder.advanceAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Remaining Balance:</span>
                    <span className="text-slate-300">
                      ₹{bookingData.confirmedOrder.remainingAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kickoff Date:</span>
                    <span className="text-slate-300">
                      {new Date(bookingData.confirmedOrder.scheduledDate).toDateString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    closeBookingModal();
                    resetBooking();
                    navigate('/dashboard');
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-violet text-white text-xs font-semibold hover:shadow-glow transition"
                >
                  Go to Customer Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeBookingModal();
                    resetBooking();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        {currentStep < 6 && (
          <div className="relative z-10 flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-navy-950/50">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 transition shadow-glow-sm"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : paymentMethod === 'razorpay' ? (
              <button
                type="button"
                onClick={submitBookingAndPay}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-brand-blue text-white text-xs font-bold hover:shadow-glow transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Launching Razorpay...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay 30% Advance with Razorpay (₹{bookingData.advanceAmount.toLocaleString('en-IN')})
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => submitBookingAndPayQr({ upiTransactionId: upiUtr, screenshotFile })}
                disabled={loading || !upiUtr.trim() || upiUtr.trim().length < 6}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold hover:shadow-glow transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying UPI Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm UPI Booking (₹{bookingData.advanceAmount.toLocaleString('en-IN')})
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

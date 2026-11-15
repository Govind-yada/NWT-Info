import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';
import { ProjectTimeline } from '../../components/ProjectTimeline';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  QrCode,
  Copy,
  Check,
  FileText,
  Globe,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  X,
  Trash2,
} from 'lucide-react';

export const ProjectDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingRemaining, setPayingRemaining] = useState(false);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  // Remaining Balance Payment Modal & QR Code State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [upiUtr, setUpiUtr] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [qrConfig, setQrConfig] = useState({
    upiId: 'nwtinfo@okaxis',
    payeeName: 'NWT Info (Next World Tech)',
  });

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    const fetchQrConfig = async () => {
      try {
        const res = await api.get('/payments/qr-config');
        if (res.data?.success && res.data.data) {
          setQrConfig(res.data.data);
        }
      } catch (e) {
        // Fallback to default
      }
    };
    fetchQrConfig();
  }, [id]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(qrConfig?.upiId || 'nwtinfo@okaxis');
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

  // Handle Remaining Balance Settlement via QR Code
  const handlePayRemainingQr = async () => {
    if (!upiUtr.trim() || upiUtr.trim().length < 6) {
      setError('Please enter a valid 12-digit UPI Transaction Reference / UTR.');
      return;
    }

    setPayingRemaining(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('orderId', order._id);
      formData.append('upiTransactionId', upiUtr.trim());
      formData.append('paymentType', 'remaining');
      if (screenshotFile) {
        formData.append('screenshot', screenshotFile);
      }

      const res = await api.post('/payments/submit-qr-payment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setPaymentSuccess('Remaining 70% balance verified successfully via UPI QR Code! Project is fully settled.');
        setShowPaymentModal(false);
        setUpiUtr('');
        setScreenshotFile(null);
        setScreenshotPreview(null);
        await fetchOrder();
      } else {
        setError(res.data.message || 'Payment submission failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error processing UPI payment');
    } finally {
      setPayingRemaining(false);
    }
  };

  // Handle Remaining Balance Settlement via Razorpay
  const handlePayRemaining = async () => {
    setPayingRemaining(true);
    setError(null);
    setPaymentSuccess(null);

    try {
      // 1. Create Razorpay order for remaining balance on backend
      const res = await api.post(`/payments/initiate-remaining/${order._id}`);
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to initiate remaining balance payment');
      }

      const { razorpayOrderId, amount, razorpayKeyId } = res.data.data;

      // 2. Open Razorpay Checkout Modal
      if (typeof window.Razorpay === 'function') {
        const options = {
          key: razorpayKeyId || 'rzp_test_mockKeyId12345',
          amount: amount * 100,
          currency: 'INR',
          name: 'NWT Info (Next World Tech)',
          description: `70% Remaining Balance for ${order.projectTitle}`,
          order_id: razorpayOrderId,
          prefill: {
            name: order.userId?.name,
            email: order.userId?.email,
            contact: order.userId?.phone,
          },
          theme: {
            color: '#10B981',
          },
          handler: async function (response) {
            try {
              // 3. Verify Razorpay cryptographic signature on backend
              const verifyRes = await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
                razorpay_payment_id: response.razorpay_payment_id || `pay_rem_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || 'simulated_sig',
                orderId: order._id,
                paymentType: 'remaining',
              });

              if (verifyRes.data.success) {
                setPaymentSuccess('Remaining balance payment verified successfully! Order is fully settled.');
                setShowPaymentModal(false);
                await fetchOrder();
              } else {
                setError(verifyRes.data.message || 'Payment verification failed');
              }
            } catch (verErr) {
              setError(verErr.response?.data?.message || 'Payment verification failed');
            } finally {
              setPayingRemaining(false);
            }
          },
          modal: {
            ondismiss: function () {
              setPayingRemaining(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback simulated payment in sandbox
        const verifyRes = await api.post('/payments/verify', {
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: `pay_rem_${Date.now()}`,
          razorpay_signature: 'simulated_sig',
          orderId: order._id,
          paymentType: 'remaining',
        });

        if (verifyRes.data.success) {
          setPaymentSuccess('Remaining balance payment verified successfully! Order is fully settled.');
          setShowPaymentModal(false);
          await fetchOrder();
        }
        setPayingRemaining(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment error');
      setPayingRemaining(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="text-center py-20 space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-white">Project Not Found</h3>
        <p className="text-xs text-slate-400">{error}</p>
        <Link to="/dashboard/projects" className="inline-block px-4 py-2 rounded-xl bg-slate-800 text-xs text-white">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Back Link */}
      <Link
        to="/dashboard/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to My Projects
      </Link>

      {/* Success Notification */}
      {paymentSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{paymentSuccess}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Project Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-brand-electric">
              {order.orderNumber}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{order.projectTitle}</h1>
            <span className="text-xs text-slate-400 block">
              {order.serviceId?.name} • {order.packageId?.name}
            </span>
          </div>

          {/* Payment Request Callout if Admin requested remaining 70% */}
          {order.remainingPaymentRequested && !order.remainingPaid && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-right">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Remaining 70% Balance Due
              </span>
              <span className="text-xl font-extrabold text-white block">
                ₹{order.remainingAmount.toLocaleString('en-IN')}
              </span>
              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-glow hover:opacity-95 transition"
              >
                Settle 70% Balance (Razorpay / QR)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2-Column Specs & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Project Specs & Files (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Milestone Progress Component */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8">
            <h3 className="text-sm font-bold text-white mb-6">Delivery Milestones & Status</h3>
            <ProjectTimeline currentStatus={order.projectStatus} timeline={order.timeline} />
          </div>

          {/* Project Information */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-sm font-bold text-white">Project Specifications</h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Project Description:</span>
                <p className="text-slate-200 leading-relaxed bg-navy-950 p-4 rounded-xl border border-slate-800">
                  {order.description}
                </p>
              </div>

              {order.proposedDomain && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Proposed Domain:</span>
                  <span className="font-semibold text-white">{order.proposedDomain}</span>
                </div>
              )}

              {/* Key Features */}
              {order.requiredFeatures && order.requiredFeatures.length > 0 && (
                <div>
                  <span className="text-slate-400 block mb-2">Required Features:</span>
                  <div className="flex flex-wrap gap-2">
                    {order.requiredFeatures.map((feat, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference Websites */}
              {order.referenceWebsites && order.referenceWebsites.length > 0 && (
                <div>
                  <span className="text-slate-400 block mb-1">Inspirations / References:</span>
                  <div className="space-y-1">
                    {order.referenceWebsites.map((ref, idx) => (
                      <a
                        key={idx}
                        href={ref.startsWith('http') ? ref : `https://${ref}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-brand-electric hover:underline block"
                      >
                        <ExternalLink className="w-3 h-3" /> {ref}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Attachments */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-sm font-bold text-white">Uploaded Project Documents</h3>

            {order.attachments && order.attachments.length > 0 ? (
              <div className="space-y-2">
                {order.attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-navy-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="text-slate-200 font-medium truncate">{file.originalName}</span>
                    </div>

                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-electric text-xs transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>View File</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No attachments were uploaded with this order.</p>
            )}
          </div>

        </div>

        {/* Right: Financial & Booking Summary (1 Col) */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Financial Ledger</h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Total Project Value:</span>
                <span className="text-sm font-bold text-white">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">30% Advance (Paid):</span>
                <span className="font-bold text-emerald-400">
                  ₹{order.advanceAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">70% Remaining Balance:</span>
                <span className={`font-bold ${order.remainingPaid ? 'text-emerald-400' : 'text-slate-300'}`}>
                  ₹{order.remainingAmount.toLocaleString('en-IN')}
                  {order.remainingPaid && ' (Settled)'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400">Settlement Status:</span>
                <span className="font-semibold text-white uppercase text-[10px]">
                  {order.paymentStatus.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                🔒 All transactions are protected by Razorpay SHA-256 HMAC digital signatures.
              </div>
            </div>
          </div>

          {/* Kickoff Schedule Card */}
          <div className="glass-panel rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white">Scheduled Kickoff</h3>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <Calendar className="w-5 h-5 text-brand-electric shrink-0" />
              <div>
                <span className="font-semibold text-white block">
                  {new Date(order.scheduledDate).toDateString()}
                </span>
                <span className="text-slate-400 text-[11px]">Standard Kickoff Slot</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Settle Remaining Balance Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-navy-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Settle 70% Milestone Balance</h3>
                <p className="text-xs text-slate-400 mt-0.5">Order #{order.orderNumber} • {order.projectTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amount Summary */}
            <div className="p-3.5 rounded-2xl bg-navy-950 border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Payable Remaining Balance:</span>
              <span className="text-lg font-extrabold text-emerald-400">
                ₹{order.remainingAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Method Tabs */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-300">Choose Settlement Method:</span>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`cursor-pointer p-3 rounded-2xl border transition flex items-center gap-2.5 ${
                    paymentMethod === 'razorpay'
                      ? 'bg-blue-600/15 border-blue-500 shadow-glow-sm'
                      : 'bg-navy-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className={`w-4 h-4 shrink-0 ${paymentMethod === 'razorpay' ? 'text-blue-400' : 'text-slate-400'}`} />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block">Razorpay</span>
                    <span className="text-[10px] text-slate-400">Cards / Netbanking</span>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('qr')}
                  className={`cursor-pointer p-3 rounded-2xl border transition flex items-center gap-2.5 ${
                    paymentMethod === 'qr'
                      ? 'bg-purple-600/15 border-purple-500 shadow-glow-sm'
                      : 'bg-navy-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <QrCode className={`w-4 h-4 shrink-0 ${paymentMethod === 'qr' ? 'text-purple-400' : 'text-slate-400'}`} />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block">UPI QR Code</span>
                    <span className="text-[10px] text-slate-400">GPay / PhonePe / Paytm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Options Body */}
            {paymentMethod === 'razorpay' ? (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Opens secure Razorpay checkout modal with instant verification.</span>
                </div>
                <button
                  type="button"
                  onClick={handlePayRemaining}
                  disabled={payingRemaining}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-glow hover:opacity-95 transition disabled:opacity-50"
                >
                  {payingRemaining ? 'Connecting Razorpay...' : `Pay ₹${order.remainingAmount.toLocaleString('en-IN')} via Razorpay`}
                </button>
              </div>
            ) : (
              <div className="space-y-3 p-3.5 rounded-2xl bg-navy-950 border border-purple-500/30">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="p-2.5 bg-white rounded-2xl shadow-md border-2 border-slate-700 shrink-0 flex items-center justify-center">
                    <QRCodeSVG
                      value={`upi://pay?pa=${encodeURIComponent(qrConfig?.upiId || 'nwtinfo@okaxis')}&pn=${encodeURIComponent(qrConfig?.payeeName || 'NWT Info')}&am=${order.remainingAmount}&cu=INR&tn=${encodeURIComponent('70% Balance ' + order.orderNumber)}`}
                      size={130}
                      level="H"
                    />
                  </div>

                  <div className="flex-1 space-y-2 text-xs text-left w-full">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Company UPI ID</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-semibold text-brand-electric">
                          {qrConfig?.upiId || 'nwtinfo@okaxis'}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition"
                        >
                          {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedUpi ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Payable Balance</span>
                      <span className="text-base font-extrabold text-emerald-400">
                        ₹{order.remainingAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      12-Digit UPI UTR / Transaction ID <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={upiUtr}
                      onChange={(e) => setUpiUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      placeholder="e.g. 512345678901 (from payment receipt)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono tracking-wider"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Payment Screenshot Proof <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    {screenshotPreview ? (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <img src={screenshotPreview} alt="Proof" className="w-9 h-9 object-cover rounded-lg border border-slate-700 shrink-0" />
                          <span className="text-slate-200 truncate">{screenshotFile?.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={removeScreenshot}
                          className="p-1 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="relative border border-dashed border-slate-700 hover:border-purple-500/50 rounded-xl p-2.5 text-center bg-slate-900/40 transition cursor-pointer flex items-center justify-center gap-2">
                        <Upload className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-xs text-slate-300">Attach payment receipt screenshot</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleScreenshotChange}
                          className="sr-only"
                        />
                      </label>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handlePayRemainingQr}
                    disabled={payingRemaining || !upiUtr.trim() || upiUtr.trim().length < 6}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-glow hover:opacity-95 transition disabled:opacity-50"
                  >
                    {payingRemaining ? 'Verifying UPI Payment...' : `Confirm UPI Payment (₹${order.remainingAmount.toLocaleString('en-IN')})`}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

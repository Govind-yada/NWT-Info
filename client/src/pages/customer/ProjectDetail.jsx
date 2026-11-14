import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ProjectTimeline } from '../../components/ProjectTimeline';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  Globe,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';

export const ProjectDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingRemaining, setPayingRemaining] = useState(false);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

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
  }, [id]);

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
                onClick={handlePayRemaining}
                disabled={payingRemaining}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-glow hover:opacity-95 transition disabled:opacity-50"
              >
                {payingRemaining ? 'Connecting Razorpay...' : 'Pay Remaining Balance'}
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

    </div>
  );
};

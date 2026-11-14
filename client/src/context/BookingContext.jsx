import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [bookingData, setBookingData] = useState({
    // Step 1: Customer Details
    fullName: '',
    email: '',
    phone: '',
    company: '',

    // Step 2: Project Information
    serviceId: '',
    packageId: '',
    selectedService: null,
    selectedPackage: null,
    projectTitle: '',
    proposedDomain: '',
    description: '',
    requiredFeatures: [],
    referenceWebsites: '',

    // Step 3: File Uploads
    attachments: [],

    // Step 4: Scheduling
    scheduledDate: '',
    timeSlot: 'Morning Slot (10:00 AM - 01:00 PM)',

    // Step 5: Pricing
    totalAmount: 0,
    advanceAmount: 0,
    remainingAmount: 0,

    // Step 6: Confirmation
    confirmedOrder: null,
    confirmedBooking: null,
  });

  const openBookingModal = (service = null, pkg = null) => {
    if (service && pkg) {
      const total = pkg.price;
      const advance = Math.round(total * 0.30);
      const remaining = total - advance;

      setBookingData((prev) => ({
        ...prev,
        serviceId: service._id,
        packageId: pkg._id,
        selectedService: service,
        selectedPackage: pkg,
        totalAmount: total,
        advanceAmount: advance,
        remainingAmount: remaining,
        projectTitle: prev.projectTitle || `${service.name} Project`,
      }));
    }
    setError(null);
    setIsModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsModalOpen(false);
  };

  const updateBookingData = (fields) => {
    setBookingData((prev) => {
      const updated = { ...prev, ...fields };

      // Recompute 30% advance if package changes
      if (fields.selectedPackage) {
        const total = fields.selectedPackage.price;
        const advance = Math.round(total * 0.30);
        updated.totalAmount = total;
        updated.advanceAmount = advance;
        updated.remainingAmount = total - advance;
        updated.packageId = fields.selectedPackage._id;
      }

      return updated;
    });
  };

  const nextStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const resetBooking = () => {
    setBookingData({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      serviceId: '',
      packageId: '',
      selectedService: null,
      selectedPackage: null,
      projectTitle: '',
      proposedDomain: '',
      description: '',
      requiredFeatures: [],
      referenceWebsites: '',
      attachments: [],
      scheduledDate: '',
      timeSlot: 'Morning Slot (10:00 AM - 01:00 PM)',
      totalAmount: 0,
      advanceAmount: 0,
      remainingAmount: 0,
      confirmedOrder: null,
      confirmedBooking: null,
    });
    setCurrentStep(1);
    setError(null);
  };

  /**
   * Submits booking data to backend, creates Razorpay order,
   * launches checkout modal, and verifies signature.
   */
  const submitBookingAndPay = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append('fullName', bookingData.fullName);
      formData.append('email', bookingData.email);
      formData.append('phone', bookingData.phone);
      formData.append('serviceId', bookingData.serviceId);
      formData.append('packageId', bookingData.packageId);
      formData.append('projectTitle', bookingData.projectTitle);
      formData.append('proposedDomain', bookingData.proposedDomain);
      formData.append('description', bookingData.description);
      formData.append('scheduledDate', bookingData.scheduledDate);
      formData.append('timeSlot', bookingData.timeSlot);
      formData.append('requiredFeatures', JSON.stringify(bookingData.requiredFeatures));
      formData.append('referenceWebsites', JSON.stringify(
        bookingData.referenceWebsites ? bookingData.referenceWebsites.split('\n').filter(Boolean) : []
      ));

      if (bookingData.attachments && bookingData.attachments.length > 0) {
        for (let i = 0; i < bookingData.attachments.length; i++) {
          formData.append('attachments', bookingData.attachments[i]);
        }
      }

      // 1. Initiate booking & get Razorpay order
      const initRes = await api.post('/bookings/initiate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!initRes.data.success) {
        throw new Error(initRes.data.message || 'Failed to initiate booking');
      }

      const { orderId, razorpayOrderId, amount, razorpayKeyId, orderNumber } = initRes.data.data;

      // 2. Open Razorpay Checkout Modal
      if (typeof window.Razorpay === 'function') {
        const options = {
          key: razorpayKeyId || 'rzp_test_mockKeyId12345',
          amount: amount * 100, // paise
          currency: 'INR',
          name: 'NWT Info (Next World Tech)',
          description: `30% Advance for ${bookingData.projectTitle}`,
          order_id: razorpayOrderId,
          prefill: {
            name: bookingData.fullName,
            email: bookingData.email,
            contact: bookingData.phone,
          },
          theme: {
            color: '#3B82F6',
          },
          handler: async function (response) {
            try {
              // 3. Verify Razorpay cryptographic signature on backend
              const verifyRes = await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
                razorpay_payment_id: response.razorpay_payment_id || `pay_sim_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || 'simulated_sig',
                orderId,
                paymentType: 'advance',
              });

              if (verifyRes.data.success) {
                setBookingData((prev) => ({
                  ...prev,
                  confirmedOrder: verifyRes.data.data.order,
                  confirmedPayment: verifyRes.data.data.payment,
                }));
                setCurrentStep(6); // Confirmation screen
              } else {
                setError(verifyRes.data.message || 'Payment verification failed');
              }
            } catch (verErr) {
              setError(verErr.response?.data?.message || 'Verification failed on server');
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setError(resp.error?.description || 'Payment was unsuccessful. Please retry.');
          setLoading(false);
        });
        rzp.open();
      } else {
        // Fallback for environments where checkout.js is blocked or simulated
        const verifyRes = await api.post('/payments/verify', {
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: 'simulated_sig',
          orderId,
          paymentType: 'advance',
        });

        if (verifyRes.data.success) {
          setBookingData((prev) => ({
            ...prev,
            confirmedOrder: verifyRes.data.data.order,
            confirmedPayment: verifyRes.data.data.payment,
          }));
          setCurrentStep(6);
        }
        setLoading(false);
      }
    } catch (err) {
      console.error('[Booking Error]:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred during booking initiation');
      setLoading(false);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        isModalOpen,
        openBookingModal,
        closeBookingModal,
        bookingData,
        updateBookingData,
        nextStep,
        prevStep,
        resetBooking,
        submitBookingAndPay,
        loading,
        error,
        setError,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

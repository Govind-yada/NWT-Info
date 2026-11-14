import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import Booking from '../models/Booking.js';
import CalendarEvent from '../models/CalendarEvent.js';
import { verifyRazorpaySignature, verifyWebhookSignature, createRazorpayOrder, getRazorpayKeyId } from '../config/razorpay.js';
import { generatePaymentReference } from '../utils/helpers.js';
import { syncToGoogleCalendar } from '../config/googleCalendar.js';

// @desc    Verify Razorpay payment signature & confirm booking / order
// @route   POST /api/payments/verify
// @access  Public (Authenticated or Guest)
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, paymentType = 'advance' } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification parameters missing (order_id, payment_id, signature, orderId required).',
      });
    }

    // 1. Check for duplicate payment processing
    const existingPayment = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id, status: 'success' });
    if (existingPayment) {
      return res.status(200).json({
        success: true,
        message: 'Payment has already been verified and processed.',
        payment: existingPayment,
      });
    }

    // 2. Cryptographic signature verification
    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      // Record failed payment attempt
      await Payment.create({
        paymentReference: generatePaymentReference(),
        orderId,
        userId: req.user?._id || null,
        type: paymentType,
        amount: 0,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'failed',
        errorReason: 'Invalid cryptographic HMAC SHA256 signature',
      });

      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed. Untrusted or altered transaction.',
      });
    }

    // 3. Find and update Order
    const order = await Order.findById(orderId).populate('serviceId packageId userId bookingId');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Associated project order not found.' });
    }

    let amountPaid = 0;

    if (paymentType === 'advance') {
      amountPaid = order.advanceAmount;
      order.advancePaid = true;
      order.paymentStatus = 'advance_paid';
      order.projectStatus = 'confirmed';
      order.timeline.push({
        status: '30% Advance Paid',
        note: `Payment of ₹${amountPaid.toLocaleString('en-IN')} verified successfully (Razorpay ID: ${razorpay_payment_id}). Project confirmed!`,
        timestamp: new Date(),
      });

      // Update Booking status
      if (order.bookingId) {
        await Booking.findByIdAndUpdate(order.bookingId._id, {
          status: 'confirmed',
        });
      }

      // Synchronize Calendar Event
      const calendarEvent = await CalendarEvent.create({
        title: `Project: ${order.projectTitle} (${order.serviceId?.name || 'Digital Service'})`,
        description: `Customer: ${order.userId?.name} (${order.userId?.email}). Order #${order.orderNumber}`,
        date: order.scheduledDate,
        startTime: '10:00 AM',
        endTime: '06:00 PM',
        type: 'booking',
        bookingId: order.bookingId?._id,
        orderId: order._id,
        userId: order.userId?._id,
      });

      // Sync to Google Calendar if configured
      try {
        const googleEventId = await syncToGoogleCalendar({
          title: calendarEvent.title,
          description: calendarEvent.description,
          date: order.scheduledDate,
        });
        if (googleEventId) {
          calendarEvent.googleEventId = googleEventId;
          await calendarEvent.save();
        }
      } catch (gErr) {
        console.warn('[Calendar Sync] Non-blocking Google Calendar sync error:', gErr.message);
      }
    } else if (paymentType === 'remaining') {
      amountPaid = order.remainingAmount;
      order.remainingPaid = true;
      order.paymentStatus = 'fully_paid';
      order.timeline.push({
        status: 'Remaining 70% Balance Paid',
        note: `Balance payment of ₹${amountPaid.toLocaleString('en-IN')} verified successfully (Razorpay ID: ${razorpay_payment_id}). Order fully settled.`,
        timestamp: new Date(),
      });
    }

    await order.save();

    // 4. Save Payment record
    const payment = await Payment.create({
      paymentReference: generatePaymentReference(),
      orderId: order._id,
      userId: order.userId._id,
      type: paymentType,
      amount: amountPaid,
      currency: 'INR',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'success',
      paymentMethod: 'Razorpay PG',
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully and booking confirmed!',
      data: {
        payment,
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate Remaining 70% Balance Payment
// @route   POST /api/payments/initiate-remaining/:orderId
// @access  Private (Customer or Admin)
export const initiateRemainingPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('serviceId packageId');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.remainingPaid) {
      return res.status(400).json({
        success: false,
        message: 'Remaining balance for this project has already been paid in full.',
      });
    }

    if (!order.advancePaid) {
      return res.status(400).json({
        success: false,
        message: 'Advance payment must be completed before settling remaining balance.',
      });
    }

    const remainingAmount = order.remainingAmount;
    const razorpayOrder = await createRazorpayOrder({
      amount: remainingAmount,
      receipt: `rem_${order.orderNumber.replace(/[^a-zA-Z0-9]/g, '').slice(-14)}`,
      notes: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: order.userId.toString(),
        paymentType: 'remaining',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        razorpayOrderId: razorpayOrder.id,
        amount: remainingAmount,
        currency: 'INR',
        razorpayKeyId: getRazorpayKeyId(),
        projectTitle: order.projectTitle,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay Webhook Handler
// @route   POST /api/payments/webhook
// @access  Public
export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = JSON.stringify(req.body);

    const isAuthentic = verifyWebhookSignature(rawBody, signature);
    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      const notes = paymentEntity.notes || {};
      const orderId = notes.orderId;

      if (orderId) {
        const existingPayment = await Payment.findOne({ razorpayPaymentId: paymentEntity.id });
        if (!existingPayment) {
          const order = await Order.findById(orderId);
          if (order) {
            const isRemaining = notes.paymentType === 'remaining';
            if (isRemaining) {
              order.remainingPaid = true;
              order.paymentStatus = 'fully_paid';
            } else {
              order.advancePaid = true;
              order.paymentStatus = 'advance_paid';
              order.projectStatus = 'confirmed';
            }
            await order.save();

            await Payment.create({
              paymentReference: generatePaymentReference(),
              orderId: order._id,
              userId: order.userId,
              type: isRemaining ? 'remaining' : 'advance',
              amount: paymentEntity.amount / 100,
              currency: paymentEntity.currency,
              razorpayOrderId: paymentEntity.order_id,
              razorpayPaymentId: paymentEntity.id,
              status: 'success',
              paymentMethod: paymentEntity.method || 'webhook',
            });
          }
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[Razorpay Webhook] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer payment history
// @route   GET /api/payments/my-payments
// @access  Private (Customer)
export const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate('orderId', 'orderNumber projectTitle totalAmount advanceAmount remainingAmount')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all payments/transactions with analytics
// @route   GET /api/admin/payments
// @access  Private (Admin)
export const getAdminPayments = async (req, res, next) => {
  try {
    const { status, type, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    const payments = await Payment.find(query)
      .populate('orderId', 'orderNumber projectTitle totalAmount')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    // Financial calculations
    const successfulPayments = await Payment.find({ status: 'success' });
    const totalRevenue = successfulPayments.reduce((acc, curr) => acc + curr.amount, 0);
    const advanceReceived = successfulPayments
      .filter((p) => p.type === 'advance')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const remainingReceived = successfulPayments
      .filter((p) => p.type === 'remaining')
      .reduce((acc, curr) => acc + curr.amount, 0);

    res.status(200).json({
      success: true,
      summary: {
        totalRevenue,
        advanceReceived,
        remainingReceived,
        transactionCount: payments.length,
      },
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

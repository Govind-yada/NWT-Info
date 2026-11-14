import Order from '../models/Order.js';
import Booking from '../models/Booking.js';
import CalendarEvent from '../models/CalendarEvent.js';
import { syncToGoogleCalendar } from '../config/googleCalendar.js';

// @desc    Get customer orders / projects
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('serviceId', 'name category image')
      .populate('packageId', 'name price deliveryEstimate')
      .populate('bookingId', 'scheduledDate timeSlot status bookingReference')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details by ID
// @route   GET /api/orders/:id
// @access  Private (Customer owner or Admin)
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('serviceId')
      .populate('packageId')
      .populate('bookingId')
      .populate('userId', 'name email phone company address avatar');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure customer only accesses their own order
    if (req.user.role !== 'admin' && order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this project order' });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all orders with filtering, search & pagination
// @route   GET /api/admin/orders
// @access  Private (Admin)
export const getAdminOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 15 } = req.query;
    let query = {};

    if (status) query.projectStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { projectTitle: { $regex: search, $options: 'i' } },
        { proposedDomain: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate('serviceId', 'name category')
      .populate('packageId', 'name price deliveryEstimate')
      .populate('userId', 'name email phone company')
      .populate('bookingId', 'scheduledDate status bookingReference')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update project status & timeline
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin)
export const updateProjectStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in_progress', 'review', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.projectStatus = status;
    order.timeline.push({
      status: `Status changed to: ${status.replace('_', ' ').toUpperCase()}`,
      note: note || `Admin updated project status to ${status}.`,
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Project status updated successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Reschedule project date
// @route   PUT /api/admin/orders/:id/reschedule
// @access  Private (Admin)
export const rescheduleOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newDate, reason } = req.body;

    if (!newDate) {
      return res.status(400).json({ success: false, message: 'Please provide newDate' });
    }

    const order = await Order.findById(id).populate('bookingId');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const prevDate = order.scheduledDate;
    order.scheduledDate = new Date(newDate);
    order.timeline.push({
      status: 'Project Rescheduled',
      note: `Date rescheduled from ${new Date(prevDate).toDateString()} to ${new Date(newDate).toDateString()}.${reason ? ` Reason: ${reason}` : ''}`,
      updatedBy: req.user._id,
      timestamp: new Date(),
    });
    await order.save();

    // Update booking if exists
    if (order.bookingId) {
      await Booking.findByIdAndUpdate(order.bookingId._id, {
        scheduledDate: new Date(newDate),
        status: 'rescheduled',
        adminNotes: reason || 'Rescheduled by administrator',
      });
    }

    // Update Calendar event
    const calEvent = await CalendarEvent.findOne({ orderId: order._id });
    if (calEvent) {
      calEvent.date = new Date(newDate);
      await calEvent.save();

      // Sync to Google Calendar
      if (calEvent.googleEventId) {
        try {
          await syncToGoogleCalendar({
            title: calEvent.title,
            description: calEvent.description,
            date: new Date(newDate),
            existingEventId: calEvent.googleEventId,
          });
        } catch (gErr) {
          console.warn('[Calendar Sync] Reschedule sync warning:', gErr.message);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Project successfully rescheduled',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Request remaining 70% balance payment
// @route   PUT /api/admin/orders/:id/request-balance
// @access  Private (Admin)
export const requestRemainingPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.remainingPaid) {
      return res.status(400).json({ success: false, message: 'Remaining balance has already been settled.' });
    }

    order.remainingPaymentRequested = true;
    order.remainingPaymentRequestedAt = new Date();
    order.timeline.push({
      status: 'Remaining Balance Requested',
      note: `Administrator generated request for remaining 70% payment of ₹${order.remainingAmount.toLocaleString('en-IN')}.`,
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Remaining balance payment request sent to customer dashboard.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

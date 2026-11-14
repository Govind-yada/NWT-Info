import Booking from '../models/Booking.js';
import Order from '../models/Order.js';
import Service from '../models/Service.js';
import Package from '../models/Package.js';
import User from '../models/User.js';
import CalendarEvent from '../models/CalendarEvent.js';
import { createRazorpayOrder, getRazorpayKeyId } from '../config/razorpay.js';
import { generateBookingReference, generateOrderNumber } from '../utils/helpers.js';
import { uploadFile } from '../config/cloudinary.js';

// @desc    Check booking availability for a date
// @route   GET /api/bookings/check-availability
// @access  Public
export const checkAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Please provide a date query parameter' });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Check if blocked by admin
    const blockedEvent = await CalendarEvent.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
      isBlocked: true,
    });

    if (blockedEvent) {
      return res.status(200).json({
        success: true,
        available: false,
        reason: 'This date is currently reserved or unavailable. Please choose another date.',
      });
    }

    // Check count of active bookings on this date
    const existingBookingsCount = await Booking.countDocuments({
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['confirmed', 'pending'] },
    });

    // Limit maximum bookings per day to 3 for guaranteed quality
    const maxBookingsPerDay = 3;
    const isAvailable = existingBookingsCount < maxBookingsPerDay;

    res.status(200).json({
      success: true,
      available: isAvailable,
      bookingsCount: existingBookingsCount,
      slotsLeft: Math.max(0, maxBookingsPerDay - existingBookingsCount),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate Booking & Create Razorpay Order for 30% Advance
// @route   POST /api/bookings/initiate
// @access  Public (Guest or Authenticated)
export const initiateBooking = async (req, res, next) => {
  try {
    let {
      fullName,
      email,
      phone,
      serviceId,
      packageId,
      projectTitle,
      proposedDomain,
      description,
      requiredFeatures,
      referenceWebsites,
      scheduledDate,
      timeSlot,
      notes,
    } = req.body;

    // Validate required fields
    if (!serviceId || !packageId || !projectTitle || !description || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required project and booking information.',
      });
    }

    // 1. Identify or register user
    let user = req.user;
    if (!user) {
      if (!fullName || !email || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Contact name, email, and phone number are required.',
        });
      }

      user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Create customer account with random initial password
        const autoPassword = `Nwt@${Math.floor(100000 + Math.random() * 900000)}`;
        user = await User.create({
          name: fullName,
          email: email.toLowerCase(),
          password: autoPassword,
          phone,
          role: 'customer',
        });
      }
    }

    // 2. Fetch authoritative Service and Package from MongoDB
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: 'Selected service is invalid or unavailable.' });
    }

    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage || !selectedPackage.isActive) {
      return res.status(404).json({ success: false, message: 'Selected package is invalid or inactive.' });
    }

    // 3. Authoritative Price and 30% Advance Calculation
    // Never trust frontend calculations
    const totalAmount = selectedPackage.price;
    const advanceAmount = Math.round(totalAmount * 0.30);
    const remainingAmount = totalAmount - advanceAmount;

    // 4. Handle Uploaded Files
    let attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadFile(file.path, 'nwt-projects');
        attachments.push({
          originalName: file.originalname,
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          fileType: file.mimetype,
          size: file.size,
        });
      }
    }

    // Parse features and reference websites if passed as string
    let parsedFeatures = [];
    if (typeof requiredFeatures === 'string') {
      try {
        parsedFeatures = JSON.parse(requiredFeatures);
      } catch (e) {
        parsedFeatures = requiredFeatures.split('\n').map((s) => s.trim()).filter(Boolean);
      }
    } else if (Array.isArray(requiredFeatures)) {
      parsedFeatures = requiredFeatures;
    }

    let parsedReferences = [];
    if (typeof referenceWebsites === 'string') {
      try {
        parsedReferences = JSON.parse(referenceWebsites);
      } catch (e) {
        parsedReferences = referenceWebsites.split('\n').map((s) => s.trim()).filter(Boolean);
      }
    } else if (Array.isArray(referenceWebsites)) {
      parsedReferences = referenceWebsites;
    }

    // 5. Create Booking Record (Status: pending)
    const bookingReference = generateBookingReference();
    const booking = await Booking.create({
      bookingReference,
      userId: user._id,
      serviceId: service._id,
      packageId: selectedPackage._id,
      scheduledDate: new Date(scheduledDate),
      timeSlot: timeSlot || 'Standard Slot (10:00 AM - 06:00 PM)',
      notes: notes || '',
      status: 'pending',
    });

    // 6. Create Order Record (Status: pending)
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      userId: user._id,
      bookingId: booking._id,
      serviceId: service._id,
      packageId: selectedPackage._id,
      projectTitle,
      proposedDomain: proposedDomain || '',
      description,
      requiredFeatures: parsedFeatures,
      referenceWebsites: parsedReferences,
      attachments,
      totalAmount,
      advanceAmount,
      remainingAmount,
      advancePaid: false,
      remainingPaid: false,
      paymentStatus: 'pending',
      projectStatus: 'pending',
      scheduledDate: new Date(scheduledDate),
      timeline: [
        {
          status: 'Order Placed',
          note: `Booking initiated. Awaiting 30% advance payment of ₹${advanceAmount.toLocaleString('en-IN')}`,
          timestamp: new Date(),
        },
      ],
    });

    // 7. Create Razorpay Order on Backend
    const razorpayOrder = await createRazorpayOrder({
      amount: advanceAmount,
      receipt: `rcpt_${orderNumber.replace(/[^a-zA-Z0-9]/g, '').slice(-15)}`,
      notes: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        bookingReference: booking.bookingReference,
        userId: user._id.toString(),
        paymentType: 'advance',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Booking initiated. Please complete the 30% advance payment to confirm.',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        bookingId: booking._id,
        bookingReference: booking.bookingReference,
        razorpayOrderId: razorpayOrder.id,
        amount: advanceAmount,
        currency: 'INR',
        razorpayKeyId: getRazorpayKeyId(),
        service: {
          name: service.name,
          category: service.category,
        },
        package: {
          name: selectedPackage.name,
          price: selectedPackage.price,
          advanceAmount,
          remainingAmount,
        },
        customer: {
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (Customer)
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('serviceId', 'name category image')
      .populate('packageId', 'name price deliveryEstimate')
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

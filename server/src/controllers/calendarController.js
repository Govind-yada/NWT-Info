import CalendarEvent from '../models/CalendarEvent.js';
import Booking from '../models/Booking.js';
import Order from '../models/Order.js';

// @desc    Get Calendar events (Customer view: their own events + blocked dates)
// @route   GET /api/calendar
// @access  Public or Private
export const getCalendarEvents = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    let query = {};

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // If customer, show only their events and general blackout dates
    if (!req.user || req.user.role !== 'admin') {
      const userCondition = req.user ? [{ userId: req.user._id }] : [];
      query.$or = [{ isBlocked: true }, ...userCondition];
    }

    const events = await CalendarEvent.find(query)
      .populate('orderId', 'orderNumber projectTitle projectStatus')
      .populate('userId', 'name email phone')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Block specific date / blackout slot
// @route   POST /api/admin/calendar/block
// @access  Private (Admin)
export const blockDate = async (req, res, next) => {
  try {
    const { date, title, reason } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));

    const existingBlock = await CalendarEvent.findOne({
      date: startOfDay,
      isBlocked: true,
    });

    if (existingBlock) {
      return res.status(400).json({
        success: false,
        message: 'This date is already blocked in the calendar.',
      });
    }

    const blockedEvent = await CalendarEvent.create({
      title: title || 'Unavailable / Reserved Slot',
      description: reason || 'Blocked by administrator',
      date: startOfDay,
      isBlocked: true,
      type: 'blackout',
    });

    res.status(201).json({
      success: true,
      message: 'Date successfully blocked from customer bookings',
      data: blockedEvent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Unblock a previously blocked date
// @route   DELETE /api/admin/calendar/unblock/:id
// @access  Private (Admin)
export const unblockDate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await CalendarEvent.findById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Calendar event not found' });
    }

    if (!event.isBlocked) {
      return res.status(400).json({ success: false, message: 'This event is a live customer booking, not a blocked date.' });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Date slot successfully unblocked and reopened for bookings',
    });
  } catch (error) {
    next(error);
  }
};

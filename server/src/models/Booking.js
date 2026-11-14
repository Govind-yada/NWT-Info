import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled project date is required'],
      index: true,
    },
    timeSlot: {
      type: String,
      default: 'Standard Slot (10:00 AM - 06:00 PM)',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rescheduled', 'cancelled'],
      default: 'pending',
      index: true,
    },
    calendarEventId: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;

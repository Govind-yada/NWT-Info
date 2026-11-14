import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
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
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
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
    projectTitle: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    proposedDomain: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
    },
    requiredFeatures: [
      {
        type: String,
        trim: true,
      },
    ],
    referenceWebsites: [
      {
        type: String,
        trim: true,
      },
    ],
    attachments: [
      {
        originalName: String,
        url: String,
        publicId: String,
        fileType: String,
        size: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    advanceAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    advancePaid: {
      type: Boolean,
      default: false,
    },
    remainingPaid: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'advance_paid', 'fully_paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    projectStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'review', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    remainingPaymentRequested: {
      type: Boolean,
      default: false,
    },
    remainingPaymentRequestedAt: {
      type: Date,
    },
    timeline: [
      {
        status: String,
        note: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;

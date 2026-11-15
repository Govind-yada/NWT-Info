import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    paymentReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['advance', 'remaining', 'full'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    razorpayOrderId: {
      type: String,
      required: false,
      index: true,
      sparse: true,
    },
    razorpayPaymentId: {
      type: String,
      index: true,
      sparse: true,
    },
    razorpaySignature: {
      type: String,
    },
    upiId: {
      type: String,
      trim: true,
      default: '',
    },
    upiTransactionId: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
      default: '',
    },
    screenshotUrl: {
      type: String,
      default: '',
    },
    screenshotPublicId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['created', 'pending_verification', 'success', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    paymentMethod: {
      type: String,
      default: 'Razorpay',
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    errorReason: {
      type: String,
      default: '',
    },
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'processed', 'rejected'],
      default: 'none',
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

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;

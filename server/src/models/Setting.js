import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'NWT Info (Next World Tech)',
      trim: true,
    },
    companyTagline: {
      type: String,
      default: 'Engineering Next-Gen Digital Services & Scalable Tech',
      trim: true,
    },
    supportEmail: {
      type: String,
      default: 'support@nwtinfo.com',
      trim: true,
    },
    supportPhone: {
      type: String,
      default: '+91 7859088239',
      trim: true,
    },
    companyAddress: {
      type: String,
      default: 'Cyber City, Phase 2, Gurugram, Haryana 122002, India',
      trim: true,
    },
    companyUpiId: {
      type: String,
      default: 'nwtinfo@okaxis',
      trim: true,
    },
    companyPayeeName: {
      type: String,
      default: 'NWT Info (Next World Tech)',
      trim: true,
    },
    advancePercentage: {
      type: Number,
      default: 30,
      min: 10,
      max: 100,
    },
    maxBookingsPerDay: {
      type: Number,
      default: 3,
      min: 1,
      max: 20,
    },
    razorpayKeyId: {
      type: String,
      default: 'rzp_test_mockKeyId12345',
      trim: true,
    },
    razorpayEnabled: {
      type: Boolean,
      default: true,
    },
    upiQrEnabled: {
      type: Boolean,
      default: true,
    },
    autoConfirmBookings: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;

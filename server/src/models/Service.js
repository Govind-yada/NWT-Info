import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Website Development',
        'Software Development',
        'Mobile App Development',
        'SEO / SMO',
        'Content Management',
        'Digital Marketing',
        'Branding & Campaign Management',
      ],
      index: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: 250,
    },
    description: {
      type: String,
      required: [true, 'Detailed description is required'],
    },
    icon: {
      type: String,
      default: 'Globe',
    },
    image: {
      type: String,
      default: '',
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    startingPrice: {
      type: Number,
      required: [true, 'Starting price is required'],
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model('Service', serviceSchema);
export default Service;

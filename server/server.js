import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './src/config/db.js';
import { seedDatabase } from './src/seeds/seedDatabase.js';
import User from './src/models/User.js';
import { notFound, errorHandler } from './src/middleware/error.js';

// Route Imports
import authRoutes from './src/routes/authRoutes.js';
import serviceRoutes from './src/routes/serviceRoutes.js';
import packageRoutes from './src/routes/packageRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import calendarRoutes from './src/routes/calendarRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import contentRoutes from './src/routes/contentRoutes.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();

// Connect to Database & Auto-Seed if empty
export const dbReady = connectDB()
  .then(async () => {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Database] Empty database detected. Auto-seeding initial services, packages, and admin...');
        await seedDatabase();
      }
    } catch (e) {
      console.warn('[Database] Auto-seed check notice:', e.message);
    }
  })
  .catch((err) => {
    console.error('[Server] Critical DB connection failure:', err.message);
  });

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
  })
);

// Request Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting (100 requests per 15 minutes per IP for general endpoints)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', generalLimiter);

// Express body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder for serving locally stored uploads
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'NWT Info - Digital Services & Project Booking Platform',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
let server;

const isTest = process.env.NODE_ENV === 'test' || process.env.npm_lifecycle_event === 'test' || process.argv[1]?.includes('test');
if (!isTest) {
  server = app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  NWT Info (Next World Tech) API Server Running`);
    console.log(`  Port: ${PORT} | Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

export default app;

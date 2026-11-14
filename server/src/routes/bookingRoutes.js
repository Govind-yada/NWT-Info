import express from 'express';
import { checkAvailability, initiateBooking, getMyBookings } from '../controllers/bookingController.js';
import { optionalAuth, protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/check-availability', checkAvailability);
router.post('/initiate', optionalAuth, upload.array('attachments', 5), initiateBooking);
router.get('/my-bookings', protect, getMyBookings);

export default router;

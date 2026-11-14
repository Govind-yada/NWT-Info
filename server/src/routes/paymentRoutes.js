import express from 'express';
import {
  verifyPayment,
  initiateRemainingPayment,
  handleWebhook,
  getMyPayments,
} from '../controllers/paymentController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/verify', optionalAuth, verifyPayment);
router.post('/initiate-remaining/:orderId', protect, initiateRemainingPayment);
router.post('/webhook', handleWebhook);
router.get('/my-payments', protect, getMyPayments);

export default router;

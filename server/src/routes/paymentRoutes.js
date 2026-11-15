import express from 'express';
import {
  verifyPayment,
  getQrConfig,
  submitQrPayment,
  initiateRemainingPayment,
  handleWebhook,
  getMyPayments,
} from '../controllers/paymentController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/qr-config', getQrConfig);
router.post('/submit-qr-payment', optionalAuth, upload.single('screenshot'), submitQrPayment);
router.post('/verify', optionalAuth, verifyPayment);
router.post('/initiate-remaining/:orderId', protect, initiateRemainingPayment);
router.post('/webhook', handleWebhook);
router.get('/my-payments', protect, getMyPayments);

export default router;

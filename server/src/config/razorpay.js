import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId12345';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'mockRazorpaySecretKey987654';
const webhook_secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'mockWebhookSecretKey54321';

export const isLiveRazorpay = 
  key_id.startsWith('rzp_') && 
  key_id !== 'rzp_test_mockKeyId12345' && 
  key_secret !== 'mockRazorpaySecretKey987654';

let razorpayInstance = null;
if (isLiveRazorpay) {
  try {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
    console.log('[Razorpay] Initialized with live/test API keys');
  } catch (err) {
    console.error('[Razorpay] Initialization error:', err.message);
  }
} else {
  console.log('[Razorpay] Running in simulated/sandbox development mode');
}

/**
 * Creates a Razorpay order for an amount (in INR)
 * Note: Razorpay accepts amount in paise (1 INR = 100 paise)
 */
export const createRazorpayOrder = async ({ amount, receipt, notes = {} }) => {
  const amountInPaise = Math.round(amount * 100);

  if (isLiveRazorpay && razorpayInstance) {
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
      notes,
    };
    const order = await razorpayInstance.orders.create(options);
    return order;
  }

  // Simulated order for sandbox testing
  const mockOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  return {
    id: mockOrderId,
    entity: 'order',
    amount: amountInPaise,
    amount_paid: 0,
    amount_due: amountInPaise,
    currency: 'INR',
    receipt: receipt || `rcpt_${Date.now()}`,
    status: 'created',
    attempts: 0,
    notes,
    created_at: Math.floor(Date.now() / 1000),
  };
};

/**
 * Verifies the Razorpay payment signature
 */
export const verifyRazorpaySignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  // If simulated mock order
  if (razorpay_order_id.startsWith('order_sim_') && !isLiveRazorpay) {
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  return generatedSignature === razorpay_signature;
};

/**
 * Verifies Razorpay Webhook signature
 */
export const verifyWebhookSignature = (rawBody, signature) => {
  if (!webhook_secret || webhook_secret === 'mockWebhookSecretKey54321') {
    return true;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhook_secret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
};

export const getRazorpayKeyId = () => key_id;
export default razorpayInstance;

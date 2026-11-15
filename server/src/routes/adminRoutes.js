import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/admin.js';
import { upload } from '../middleware/upload.js';
import {
  getDashboardStats,
  getAdminCustomers,
  getCustomerDetails,
  executeTerminalCommand,
  getPlatformSettings,
  updatePlatformSettings,
  changeAdminPassword,
} from '../controllers/adminController.js';
import { getAdminServices, createService, updateService, deleteService } from '../controllers/serviceController.js';
import { createPackage, updatePackage, deletePackage } from '../controllers/packageController.js';
import { getAdminOrders, updateProjectStatus, rescheduleOrder, requestRemainingPayment } from '../controllers/orderController.js';
import { getAdminPayments } from '../controllers/paymentController.js';
import { blockDate, unblockDate } from '../controllers/calendarController.js';
import {
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from '../controllers/contentController.js';

const router = express.Router();

// Apply protect & authorizeAdmin to all routes in this router
router.use(protect, authorizeAdmin);

// Analytics
router.get('/dashboard-stats', getDashboardStats);

// Customers
router.get('/customers', getAdminCustomers);
router.get('/customers/:id', getCustomerDetails);

// Services
router.get('/services', getAdminServices);
router.post('/services', upload.single('image'), createService);
router.put('/services/:id', upload.single('image'), updateService);
router.delete('/services/:id', deleteService);

// Packages
router.post('/packages', createPackage);
router.put('/packages/:id', updatePackage);
router.delete('/packages/:id', deletePackage);

// Orders
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateProjectStatus);
router.put('/orders/:id/reschedule', rescheduleOrder);
router.put('/orders/:id/request-balance', requestRemainingPayment);

// Payments & Financials
router.get('/payments', getAdminPayments);

// Calendar management
router.post('/calendar/block', blockDate);
router.delete('/calendar/unblock/:id', unblockDate);

// Content Management: Portfolio
router.post('/portfolios', upload.single('thumbnail'), createPortfolio);
router.put('/portfolios/:id', upload.single('thumbnail'), updatePortfolio);
router.delete('/portfolios/:id', deletePortfolio);

// Content Management: Testimonials
router.post('/testimonials', createTestimonial);
router.put('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

// Content Management: FAQs
router.post('/faqs', createFAQ);
router.put('/faqs/:id', updateFAQ);
router.delete('/faqs/:id', deleteFAQ);

// Interactive Admin Terminal Execution
router.post('/terminal/execute', executeTerminalCommand);

// Dynamic Platform Settings & Configuration
router.get('/settings', getPlatformSettings);
router.put('/settings', updatePlatformSettings);

// Security & Password Management
router.put('/change-password', changeAdminPassword);

export default router;

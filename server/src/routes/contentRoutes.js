import express from 'express';
import { getPortfolios, getTestimonials, getFAQs } from '../controllers/contentController.js';

const router = express.Router();

router.get('/portfolios', getPortfolios);
router.get('/testimonials', getTestimonials);
router.get('/faqs', getFAQs);

export default router;

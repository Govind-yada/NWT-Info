import express from 'express';
import { getCalendarEvents } from '../controllers/calendarController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getCalendarEvents);

export default router;

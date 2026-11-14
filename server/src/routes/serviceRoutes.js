import express from 'express';
import { getServices, getServiceByIdentifier } from '../controllers/serviceController.js';

const router = express.Router();

router.get('/', getServices);
router.get('/:identifier', getServiceByIdentifier);

export default router;

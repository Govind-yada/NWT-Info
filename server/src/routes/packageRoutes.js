import express from 'express';
import { getPackagesByService, getPackageById } from '../controllers/packageController.js';

const router = express.Router();

router.get('/service/:serviceIdentifier', getPackagesByService);
router.get('/:id', getPackageById);

export default router;

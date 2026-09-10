import express from 'express';
import { getOverview, getDetailedAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/overview', protect, getOverview);
router.get('/detailed', protect, getDetailedAnalytics);

export default router;

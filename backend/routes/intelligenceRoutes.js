import express from 'express';
import { getDigitalScore, getCompetitorComparison, getGapAnalysis, getRecommendations, dismissRecommendation, refreshRecommendations } from '../controllers/intelligenceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/score', protect, getDigitalScore);
router.get('/comparison', protect, getCompetitorComparison);
router.get('/gaps', protect, getGapAnalysis);
router.get('/recommendations', protect, getRecommendations);
router.post('/recommendations/refresh', protect, refreshRecommendations);
router.post('/recommendations/:id/dismiss', protect, dismissRecommendation);

export default router;

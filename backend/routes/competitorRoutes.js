import express from 'express';
import { addCompetitor, getCompetitors, getCompetitor, updateCompetitor, deleteCompetitor, getCompetitorPosts, analyzeCompetitor, fetchRealData } from '../controllers/competitorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/add', protect, addCompetitor);
router.get('/', protect, getCompetitors);
router.get('/:id', protect, getCompetitor);
router.put('/:id', protect, updateCompetitor);
router.delete('/:id', protect, deleteCompetitor);
router.get('/posts/:competitorId', protect, getCompetitorPosts);
router.post('/analyze/:id', protect, analyzeCompetitor);
router.post('/fetch-data/:id', protect, fetchRealData);

export default router;

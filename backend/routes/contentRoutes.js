import express from 'express';
import { generateContent, getContent, deleteContent, getContentIdeas, getContentCalendar } from '../controllers/contentController.js';
import { getLatestCalendar } from '../controllers/calendarController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateContent);
router.get('/', protect, getContent);
router.delete('/:id', protect, deleteContent);
router.post('/ideas', protect, getContentIdeas);
router.post('/calendar', protect, getContentCalendar);
router.get('/calendar/latest', protect, getLatestCalendar);

export default router;

import express from 'express';
import {
  generateContentImage,
  getImageQuota,
  getImageStyles,
} from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateContentImage);
router.get('/quota', protect, getImageQuota);
router.get('/styles', protect, getImageStyles);

export default router;

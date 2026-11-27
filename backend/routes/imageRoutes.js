import express from 'express';
import {
  generateContentImage,
  getImageQuota,
  getImageStyles,
  serveGeneratedImage,
} from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateContentImage);
router.get('/quota', protect, getImageQuota);
router.get('/styles', protect, getImageStyles);
router.get('/serve/:fileName', serveGeneratedImage);

export default router;

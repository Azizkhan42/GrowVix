import express from 'express';
import {
  getAuthUrl,
  handleOAuthCallback,
  selectFacebookPage,
  connectAccount,
  getConnectedAccounts,
  disconnectAccount,
  publishPost,
  schedulePost,
  getScheduledPosts,
  deleteScheduledPost
} from '../controllers/socialController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// OAuth flows
router.get('/auth-url/:platform', protect, getAuthUrl);
router.get('/callback/:platform', handleOAuthCallback);
router.post('/facebook/select-page', protect, selectFacebookPage);

// Manual connect / account management
router.post('/connect', protect, connectAccount);
router.get('/accounts', protect, getConnectedAccounts);
router.delete('/accounts/:platform', protect, disconnectAccount);

// Publishing
router.post('/post', protect, publishPost);
router.post('/schedule', protect, schedulePost);
router.get('/scheduled', protect, getScheduledPosts);
router.delete('/scheduled/:id', protect, deleteScheduledPost);

export default router;
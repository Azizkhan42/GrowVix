import express from 'express';
import { registerUser, loginUser, getMe, updateProfile, changePassword, updatePlan } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.put('/plan', protect, updatePlan);

export default router;

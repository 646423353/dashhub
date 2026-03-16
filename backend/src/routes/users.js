import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Get user profile (public)
router.get('/:id', userController.getUserProfile);

// Update my profile (requires auth)
router.put('/me', authMiddleware, userController.updateUserProfile);

// Update my avatar (requires auth)
router.put('/me/avatar', authMiddleware, userController.updateUserAvatar);

// Get all users (requires auth)
router.get('/', authMiddleware, userController.getAllUsers);

export default router;

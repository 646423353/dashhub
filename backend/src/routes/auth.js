import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Send verification code
router.post('/send-code', authController.sendVerificationCode);

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Reset password
router.post('/reset-password', authController.resetPassword);

// Get current user (requires auth)
router.get('/me', authMiddleware, authController.getMe);

export default router;

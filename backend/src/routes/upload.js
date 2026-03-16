import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { uploadFields, uploadFiles } from '../controllers/uploadController.js';

const router = express.Router();

// Upload files (requires auth)
router.post('/', authMiddleware, uploadFields, uploadFiles);

export default router;

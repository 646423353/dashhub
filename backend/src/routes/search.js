import express from 'express';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import * as searchController from '../controllers/searchController.js';

const router = express.Router();

// Search projects (public)
router.get('/projects', optionalAuth, searchController.searchProjects);

// Get trending searches (public)
router.get('/trending', optionalAuth, searchController.getTrendingSearches);

// Get search history (requires auth)
router.get('/history', authMiddleware, searchController.getSearchHistory);

// Clear search history (requires auth)
router.delete('/history', authMiddleware, searchController.clearSearchHistory);

export default router;

import express from 'express';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import * as projectController from '../controllers/projectController.js';

const router = express.Router();

// Get home projects (public)
router.get('/home', optionalAuth, projectController.getHomeProjects);

// Get my projects (requires auth)
router.get('/my', authMiddleware, projectController.getMyProjects);

// Leaderboard Routes (must be before dynamic :id routes)
router.get('/leaderboard/total', optionalAuth, projectController.getTotalLeaderboard);
router.get('/leaderboard/rising', optionalAuth, projectController.getRisingLeaderboard);

// Get projects by type (public)
router.get('/type/:type', optionalAuth, projectController.getProjectsByType);

// Visit project URL (public - increments click count and redirects)
router.get('/:id/visit', optionalAuth, projectController.visitProject);

// Get project by ID (public)
router.get('/:id', optionalAuth, projectController.getProjectById);

// Create project (requires auth)
router.post('/', authMiddleware, projectController.createProject);

// Update project (requires auth)
router.put('/:id', authMiddleware, projectController.updateProject);

// Update project stats (requires auth)
router.put('/:id/stats', authMiddleware, projectController.updateProjectStats);

// Delete project (requires auth)
router.delete('/:id', authMiddleware, projectController.deleteProject);

export default router;

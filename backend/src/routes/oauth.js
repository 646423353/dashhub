import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as oauthController from '../controllers/oauthController.js';

const router = express.Router();

router.get('/authorize', authMiddleware, oauthController.authorize);
router.post('/authorize', oauthController.authorizeWithToken);
router.post('/token', oauthController.token);
router.get('/userinfo', oauthController.userinfo);

export default router;

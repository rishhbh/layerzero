import express from 'express';
import { loginUser, logout, registerUser, checkUser } from '../controllers/auth.js';
import rateLimiter from '../middlewares/authRateLimit.js';
import { protectRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/user/register', rateLimiter, registerUser);
router.post('/user/login', rateLimiter, loginUser);
router.post('/user/logout', logout);
router.get('/user/check', rateLimiter, protectRoute, checkUser);

export default router;
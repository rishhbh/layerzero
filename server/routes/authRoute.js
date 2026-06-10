import express from 'express';
import { loginUser, logout, registerUser, checkUser } from '../controllers/auth.js';
import rateLimiter from '../middlewares/authRateLimit.js';

const router = express.Router();

router.post('/user/register', rateLimiter, registerUser);
router.post('/user/login', rateLimiter, loginUser);
router.post('/user/logout', rateLimiter, logout);
router.get('/user/check', rateLimiter, checkUser);

export default router;
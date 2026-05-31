import express from 'express';
import { loginUser, logout, registerUser, checkUser } from '../controllers/auth.js';

const router = express.Router();

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.post('/user/logout', logout);
router.get('/user/check', checkUser);

export default router;
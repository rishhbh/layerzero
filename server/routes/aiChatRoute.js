import express from 'express';
import gemmaChat from '../controllers/gemmaChat.js';
import geminiChat from '../controllers/geminiChat.js';

const router = express.Router();

router.get('/chat/gemma', gemmaChat);
router.get('/chat/gemini', geminiChat);

export default router;
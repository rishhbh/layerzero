import express from 'express';
import gemmaChat from '../controllers/gemmaChat.js';
import geminiChat from '../controllers/geminiChat.js';

const router = express.Router();

router.get('/gemma', gemmaChat);
router.get('/gemini', geminiChat);

export default router;
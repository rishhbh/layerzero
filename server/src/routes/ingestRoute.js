import express from 'express';
import scrapePage from '../controllers/scrape.js';
import { protectRoute } from '../middlewares/authMiddleware.js';
import summariseDoc from '../controllers/docSummary.js';
import upload from '../services/multer.js';
import rateLimiter from '../middlewares/llmRateLimit.js';

const router = express.Router();

router.post(
    '/web', 
    rateLimiter, 
    protectRoute, 
    scrapePage
);
router.post(
    '/doc', 
    rateLimiter,
    protectRoute, 
    upload.single("document"), 
    summariseDoc
);

export default router;
import express from 'express';
import scrapePage from '../controllers/scrape.js';
import { protectRoute } from '../middlewares/authMiddleware.js';
import summariseDoc from '../controllers/docSummary.js';
import upload from '../services/multer.js';
import { rateLimit } from '../middlewares/rateLimiter.js';
import { aiLimiter } from '../middlewares/redisRateLimit.js';

const router = express.Router();

router.post(
    '/web', 
    rateLimit(aiLimiter), 
    protectRoute, 
    scrapePage
);
router.post(
    '/doc', 
    rateLimit(aiLimiter),
    protectRoute, 
    upload.single("document"), 
    summariseDoc
);

export default router;
import { Router } from 'express';
import scrapePage from '../controllers/scrape.js';
import { protectRoute } from '../middlewares/authMiddleware.js';
import summariseDoc from '../controllers/docSummary.js';
import upload from '../services/multer.js';
import { rateLimit } from '../middlewares/rateLimiter.js';
import { aiLimiter } from '../middlewares/redisRateLimit.js';

const router = Router();

router.post(
    '/web',
    protectRoute,
    rateLimit(aiLimiter),
    scrapePage
);
router.post(
    '/doc',
    protectRoute,
    rateLimit(aiLimiter),
    upload.single("document"),
    summariseDoc
);

export default router;
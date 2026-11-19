import { Router } from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import { rateLimit } from "../middlewares/rateLimiter.js";
import { summaryLimiter } from "../middlewares/redisRateLimit.js";
import getUserSummaries from "../controllers/summary.js";

const router = Router();

router.get(
    '/',
    protectRoute,
    rateLimit(summaryLimiter),
    getUserSummaries
);

export default router;
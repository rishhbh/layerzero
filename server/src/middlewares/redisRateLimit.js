import redis from "../config/redis.js";
import { Ratelimit } from "@upstash/ratelimit";

const authLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "10m"),
    analytics: true,
    prefix: "auth",
});

const resendLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "24h"),
    analytics: true,
    prefix: "auth",
});

const aiLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "15m"),
    analytics: true,
    prefix: "ai",
});

const summaryLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, "60m"),
    analytics: true,
    prefix: "summary",
});

export { authLimiter, aiLimiter, resendLimiter, summaryLimiter };
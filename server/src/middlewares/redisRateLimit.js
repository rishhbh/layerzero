import redis from "../config/redis.js";
import { Ratelimit } from "@upstash/ratelimit";

const authLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "10m"),
    prefix: "auth",
    analytics: true,
});

const aiLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "15m"),
    analytics: true,
    prefix: "ai",
});

export { authLimiter, aiLimiter };
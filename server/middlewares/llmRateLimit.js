import { rateLimit } from 'express-rate-limit'

const rateLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    limit: 60, // 60 requests per 30 min
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
    message: "AI requests limit reached, try again later"
});

export default rateLimiter;
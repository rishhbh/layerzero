import { rateLimit } from 'express-rate-limit'

const rateLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    limit: 15, // 15 requests per 30 min
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
    message: "Too many authentication requests, try again later"
});

export default rateLimiter;
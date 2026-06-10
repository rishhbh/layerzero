import { rateLimit } from 'express-rate-limit'

const rateLimiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 30 minutes
	limit: 5, // 10 requests per 5 min
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	ipv6Subnet: 56,
    message: "AI requests limit reached, try again later"
});

export default rateLimiter;
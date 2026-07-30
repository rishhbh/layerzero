export const rateLimit = (limiter) => async (req, res, next) => {
    const identifier = req.user?.id ?? req.ip;

    const { success } = await limiter.limit(identifier);

    if (!success) {
        return res.status(429).json({
            success: false,
            message: "Too many requests. Try again later.",
        });
    }

    next();
};
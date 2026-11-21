import logger from "../config/logger.js";

const handleError = (err, req, res, next) => {
    const statusCode = err.statusCode || err.status || 500;

    logger.error({
        err,
        method: req.method,
        url: req.originalUrl
    }, "Request failed");

    return res.status(statusCode).json({
        success: false,
        message: statusCode >= 500 && process.env.NODE_ENV === "production"
            ? "Internal server error"
            : (err.message || "Something went wrong")
    });
};

export default handleError;

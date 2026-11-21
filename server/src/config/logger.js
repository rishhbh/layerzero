import pino from 'pino';

const logger = pino({
    level: process.env.LOG_LEVEL || "debug",
    base: {
        service: "layerzero-api"
    },

    timestamp: pino.stdTimeFunctions.isoTime,
    transport: process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty" }
        : undefined
});

export default logger;
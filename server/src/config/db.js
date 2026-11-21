import mongoose from "mongoose";
import logger from "./logger.js";

const connectDatabase = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        logger.info(`Connected to MongoDB: ${conn.connection.host}`);
    } catch(err) {
        logger.error(`Some error occured while connecting to the database: ${err}`);
        process.exit(1);
    }
}

export default connectDatabase;
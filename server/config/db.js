import mongoose from "mongoose";

const connectWithDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to MongoDB: ${conn.connection.host}`);
    } catch(err) {
        console.log(`Some error occured while connecting to the database: ${err}`);
    }
}

export default connectWithDB;
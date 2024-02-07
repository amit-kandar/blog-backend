import mongoose from "mongoose";
import logger from "../config/logger";

export async function connectToDB(): Promise<void> {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}`);
        logger.info(`MongoDB Connected: ${connectionInstance.connection.host + "/" + connectionInstance.connection.name}`);
    } catch (error) {
        logger.error("MongoDB connection Error: ", error);
        process.exit(1);
    }
}
import mongoose from "mongoose";

export async function connectToDB(): Promise<void> {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}`);
        console.info(`MongoDB Connected: ${connectionInstance.connection.host + "/" + connectionInstance.connection.name}`);
    } catch (error) {
        console.error("MongoDB connection Error: ", error);
        process.exit(1);
    }
}
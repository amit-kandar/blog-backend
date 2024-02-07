import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { connectToDB } from "./database";
import { app } from "./app";
import logger from "./config/logger";

if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: '.env' });
} else if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: '.env.test' });
} else if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: '.env.prod' });
}

const PORT = process.env.PORT || 8080;

// Define the configuration parameters
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

connectToDB()
    .then(() => {
        app.on("error", err => {
            logger.error("Error: ", err);

        })
        app.listen(PORT, () => {
            logger.info(`server is running at port ${PORT}`);
        })
    })
    .catch(err => logger.error("MongoDB connection failed!!", err))
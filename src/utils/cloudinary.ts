import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from 'fs';
import logger from '../config/logger';

const MAX_UPLOAD_TRIES = 2;

export const uploadToCloudinary = async (filePath: string, folderName: string): Promise<UploadApiResponse | string> => {
    let tries = 0;

    while (tries < MAX_UPLOAD_TRIES) {
        try {
            if (!filePath) throw new Error("File path is required!");

            // Upload the file to Cloudinary
            const response = await cloudinary.uploader.upload(filePath, {
                resource_type: "auto",
                folder: `blog/${folderName}`
            });

            // File uploaded successfully
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Delete the temporary file after successful file upload or after maximum tries
            }

            return response;
        } catch (error) {
            tries++;
            logger.error("Cloudinary Error: ", { error }); // Logging the Cloudinary error using your logger

            if (tries === MAX_UPLOAD_TRIES) {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath); // Remove the local saved file if it exists after maximum tries
                }
                logger.error("Cloudinary file upload operation failed after multiple attempts!"); // Logging upload failure after multiple tries
                return "Cloudinary file upload operation failed after multiple attempts!";
            }
        }
    }

    return "Cloudinary file upload operation failed after multiple attempts!";
};

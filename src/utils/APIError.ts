import fs from "fs";
import path from "path";
import logger from "../config/logger"; // Import your logger instance here

class APIError extends Error {
    statusCode: number;
    message: string;
    errors: Array<string>;
    data: any;

    constructor(
        statusCode: number,
        message: string = "Something went wrong",
        errors: Array<string> = [],
        data: any = null
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        this.data = data;

        const directoryPath = "public/temp/";

        fs.readdir(directoryPath, (err: NodeJS.ErrnoException | null, files: string[]) => {
            if (err) {
                logger.error('Error reading directory:', { error: err });
                return;
            }

            files.forEach((file) => {
                if (path.extname(file) === ".png") {
                    const filePath = path.join(directoryPath, file);
                    fs.unlink(filePath, (error: NodeJS.ErrnoException | null) => {
                        if (error) {
                            logger.error(`Error deleting file ${filePath}:`, { error });
                        }
                    });
                }
            });
        });
    }
}

export { APIError };

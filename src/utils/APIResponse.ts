import logger from "../config/logger";

class APIResponse {
    statusCode: number;
    data: any;
    message: string;
    success: boolean;
    timestamp: Date;

    constructor(
        statusCode: number,
        data: any,
        message: string = "Success"
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
        this.timestamp = new Date();

        // Log the API response creation
        logger.info(`API Response - Status: ${statusCode}, Message: ${message}`);
    }
}

export { APIResponse };

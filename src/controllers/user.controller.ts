import { NextFunction, Response, Request } from "express";
import validator from "validator";
import { APIError } from "../utils/APIError";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";
import { APIResponse } from "../utils/APIResponse";


// @route   POST /api/v1/users/check-email
// @desc    Check if email exists
// @access  Public
export const checkEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Extract email from the request body
        const { email } = req.body;

        // Validate the email format
        if (!validator.isEmail(email)) {
            throw new APIError(400, "Invalid Email Format");
        }

        // Check if the email exists in the database
        const userWithEmail = await User.findOne({ email });
        const isEmailExists = Boolean(userWithEmail);

        // Construct the response data
        const responseData = {
            email_exists: isEmailExists
        };

        // Send response with email existence status
        res.status(200).json(
            new APIResponse(
                200,
                responseData,
                `Email: ${email}, Exists: ${isEmailExists}`
            )
        );
    } catch (error) {
        next(error);
    }
});
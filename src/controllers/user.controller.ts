import { NextFunction, Response, Request } from "express";
import validator from "validator";
import { APIError } from "../utils/APIError";
import { asyncHandler } from "../utils/asyncHandler";
import { User, UserDocument } from "../models/user.model";
import { APIResponse } from "../utils/APIResponse";
import { UploadApiResponse } from "cloudinary";
import redisClient from "../config/redis";
import { uploadToCloudinary } from "../utils/cloudinary";
import { createImageWithInitials } from "../utils/createImage";
import { generateUniqueUsernameFromName } from "../utils/generateUsername";

const generateRefreshTokenAndAccessToken = async (user_id: string): Promise<{ accessToken: string, refreshToken: string }> => {
    try {
        const user: UserDocument | null = await User.findById(user_id);
        if (!user)
            throw new APIError(404, "User Not Found");

        const accessToken: string = await user.generateAccessToken();
        const refreshToken: string = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new APIError(500, "Something Went Wrong While Generating AccessToken And RefreshToken");
    }
}


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

// @route   POST /api/v1/users/signup
// @desc    User signup
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            throw new APIError(400, "All Fields Are Required");
        }

        if (!validator.isEmail(email)) {
            throw new APIError(400, "Invalid Email");
        }

        const isExistUser = await User.findOne({ email: email });
        if (isExistUser) {
            throw new APIError(409, "Email Already In Use");
        }

        let avatarLocalPath: string | undefined;

        if (!req.file?.path) {
            avatarLocalPath = await createImageWithInitials(name);
        } else {
            avatarLocalPath = req.file.path;
        }

        const avatar: UploadApiResponse | string = await uploadToCloudinary(avatarLocalPath, "users");

        if (typeof avatar !== 'object' || !avatar.hasOwnProperty('url') || !avatar.hasOwnProperty('public_id'))
            throw new APIError(400, "Invalid Cloudinary Response");

        const { url: avatarURL, public_id } = avatar as UploadApiResponse;

        const username = generateUniqueUsernameFromName(name);

        const user = await User.create({
            name,
            username,
            email,
            password,
            avatar: {
                url: avatarURL,
                public_id: public_id
            }
        });

        const { accessToken, refreshToken } = await generateRefreshTokenAndAccessToken(user._id);

        const updatedUserDetails = await User.findOneAndUpdate(
            { _id: user._id },
            { $set: { refreshToken: refreshToken } },
            { new: true, select: "-password -refreshToken" }
        );

        await redisClient.setEx(`${user._id}`, 3600, JSON.stringify(updatedUserDetails));

        res
            .status(201)
            .cookie("accessToken", accessToken, { secure: true, httpOnly: true })
            .cookie("refreshToken", refreshToken, { secure: true, httpOnly: true })
            .json(
                new APIResponse(
                    201,
                    {
                        user: updatedUserDetails,
                        accessToken,
                        refreshToken
                    },
                    "User Registered Successfully"
                )
            );
    } catch (error) {
        next(error);
    }
});
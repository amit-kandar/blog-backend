import { NextFunction, Response, Request } from "express";
import validator from "validator";
import { APIError } from "../utils/APIError";
import { asyncHandler } from "../utils/asyncHandler";
import { User, UserDocument } from "../models/user.model";
import { APIResponse } from "../utils/APIResponse";
import { UploadApiResponse } from "cloudinary";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import redisClient from "../config/redis";
import { uploadToCloudinary } from "../utils/cloudinary";
import { createImageWithInitials } from "../utils/createImage";
import { generateUniqueUsernameFromName } from "../utils/generateUsername";
import mongoose from "mongoose";

const generateRefreshTokenAndAccessToken = async (user_id: string): Promise<{ accessToken: string, refreshToken: string }> => {
    try {
        const user: UserDocument | null = await User.findById(user_id);
        if (!user)
            throw new APIError(404, "User Not Found");

        const accessToken: string = await user.generateAccessToken();
        const refreshToken: string = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
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

// @route   POST /api/v1/users/register
// @desc    User Register
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

// @route   POST /api/v1/users/login
// @desc    User login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Get user credentials
        const { email, username, password } = req.body;

        // Check for empty fields
        if ((!email && !username) || !password) {
            throw new APIError(400, (!email && !username) ? "Email Or Username Is Required" : "Password Is Required");
        }

        // Check email validation
        if (email && !validator.isEmail(email)) {
            throw new APIError(400, "Invalid Email");
        }

        // Retrieve the user using email or username
        const user = await User.findOne({ $or: [{ username }, { email }] });

        // Check if the user exists
        if (!user) {
            throw new APIError(404, "User Doesn't Exist");
        }

        // Compare input password and existing user password
        const isValidPassword: boolean = await user.isCorrectPassword(password);

        if (!isValidPassword) {
            throw new APIError(401, "Invalid User Credentials");
        }

        // Generate refresh token and access token and set refreshToken into the database
        const { accessToken, refreshToken } = await generateRefreshTokenAndAccessToken(user._id);

        // Retrieve the user from the database again because refresh token has been set
        const newUser = await User.findById(user._id).select("-password -refreshToken");

        // Validate retrieved user data
        if (!newUser) {
            throw new APIError(400, "Invalid Retrieved User Data");
        }

        // Store user data in Redis cache
        await redisClient.setEx(`${user._id}`, 3600, JSON.stringify(newUser));

        // Set the refreshToken and accessToken to cookies and send back user
        res
            .status(200)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
            .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
            .json(new APIResponse(
                200,
                {
                    user: newUser,
                    accessToken,
                    refreshToken
                },
                "User Successfully Logged In"
            ));
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/v1/users/logout
// @desc    User logout
// @access  Private
export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw new APIError(401, "Unauthorized Request, Signin Again");
        }

        await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    refreshToken: ""
                }
            }
        );

        res
            .status(200)
            .clearCookie("accessToken", { httpOnly: true, secure: true })
            .clearCookie("refreshToken", { httpOnly: true, secure: true })
            .json(new APIResponse(200, {}, "User Signout Successfully"))
            .end();
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/v1/users/refresh-token
// @desc    Get Access Token by Refresh Token
// @access  Private
export const getAccessTokenByRefreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new APIError(401, "Unauthorized Request, Signin Again");
        }

        const refreshSecret: string | undefined = process.env.REFRESH_TOKEN_SECRET;
        if (!refreshSecret) {
            throw new APIError(404, "Refresh Token Secret Not Found");
        }

        const decoded = jwt.verify(incomingRefreshToken, refreshSecret);
        if (typeof decoded === "string") {
            throw new APIError(400, "Invalid Decoded Information");
        }

        const user = await User.findById(decoded._id).select("-password");
        if (!user) {
            throw new APIError(400, "User Not Found");
        }

        if (user.refreshToken !== incomingRefreshToken) {
            throw new APIError(401, "Unauthorized. Please Sign in Again");
        }

        const accessToken = await user.generateAccessToken();

        res
            .status(200)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
            .json(new APIResponse(
                200,
                { accessToken },
                "Access Token Refreshed Successfully"
            ));
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/users/
// @desc    Get user details
// @access  Private
export const getUserDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user;

        if (!user) {
            throw new APIError(401, "Unauthorized Request, Signin Again");
        }

        res.status(200).json(new APIResponse(
            200,
            user,
            "Successfully Fetched User Details"
        ));
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/v1/users/
// @desc    Update user details
// @access  Private
export const updateUserDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user_id = req.user?._id;

        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            throw new APIError(401, "Unauthorized Request, Signin Again");
        }

        const { name, email } = req.body;
        const user = req.user;

        if (!name && !email) {
            throw new APIError(400, "At Least One Field Is Required");
        }

        // Check if the email exists in the database
        if (email) {
            if (!validator.isEmail(email)) {
                throw new APIError(400, "Invalid Email");
            }
            const userWithEmail = await User.findOne({ email }).lean();
            if (userWithEmail) {
                throw new APIError(400, "Email Already In Use");
            }
        }

        if (user?.name === name || user?.email === email) {
            throw new APIError(400, "Given Value Already Exists");
        }

        const updatedUserDetails = await User.findOneAndUpdate(
            { _id: user_id },
            { $set: { name: name, email: email } },
            { new: true, select: "-password -refreshToken" }
        );

        if (!updatedUserDetails) {
            throw new APIError(404, 'User Details Were Not Updated Or Not Found');
        }

        if (name) {
            user.name = name;
        }
        if (email) {
            user.email = email;
        }

        await redisClient.set(`${user_id}`, JSON.stringify(user))

        res.status(200).json(new APIResponse(
            200,
            { user: updatedUserDetails },
            "User updated successfully"
        ));
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/v1/users/change-avatar
// @desc    Change Avatar
// @access  Private
export const changeAvatar = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user;
        if (!user) {
            throw new APIError(401, "Unauthorized Request, Signin Again");
        }

        if (!req.file?.path) {
            throw new APIError(400, "Image Not Found");
        }
        const avatarLocalPath: string | undefined = req.file.path;

        const avatar: UploadApiResponse | string = await uploadToCloudinary(avatarLocalPath, "users");

        let avatarURL: string;
        let public_id: string;

        if (typeof avatar === 'object' && avatar.hasOwnProperty('url')) {
            avatarURL = (avatar as UploadApiResponse).url;
            public_id = (avatar as UploadApiResponse).public_id;
        } else {
            throw new APIError(400, "Invalid Cloudinary Response");
        }

        const oldPublicId: string = user.avatar.public_id;
        if (!oldPublicId) {
            throw new APIError(400, "Previous Public Id Not Found");
        }

        await cloudinary.uploader.destroy(oldPublicId);

        const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            { $set: { avatar: { url: avatarURL, public_id: public_id } } },
            { new: true, select: "-password -refreshToken" }
        );
        if (!updatedUser) {
            throw new APIError(400, "Failed to update the user");
        }

        user.avatar.url = updatedUser.avatar.url
        user.avatar.public_id = updatedUser.avatar.public_id

        await redisClient.set(`${user._id}`, JSON.stringify(user));

        res.status(200).json(new APIResponse(200, user, "Avatar Updated Successfully"));
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/v1/users/change-password
// @desc    Change password
// @access  Private
export const changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user_id = req.user?._id;

        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            throw new APIError(401, "Unauthorized Request, Signin Again");
        }

        const { current_password, new_password } = req.body;

        const user = await User.findById(user_id);
        if (!user) {
            throw new APIError(404, "User Not Found");
        }

        const isCorrectPassword = await user.isCorrectPassword(current_password);

        if (!isCorrectPassword) {
            throw new APIError(400, "Incorrect Current Password");
        }

        user.password = new_password;

        await user.save();

        res.status(200).json(new APIResponse(200, {}, "Password Changed Successfully"));
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/v1/users/reset-password
// @desc    Reset password
// @access  Private
export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user;

        if (!user) {
            throw new APIError(401, "Unauthorized Request, Signin Again");
        }

        const { password } = req.body;

        await User.updateOne(
            { _id: user._id },
            { $set: { password: password } },
        );

        res.status(200).json(new APIResponse(200, {}, "Password Reset Successful"));
    } catch (error) {
        next(error);
    }
});
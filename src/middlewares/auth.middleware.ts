import logger from "../config/logger";
import redisClient from "../config/redis";
import { User } from "../models/user.model";
import { APIError } from "../utils/APIError";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const checkAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // get access token
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // if token not found send unauthorized user
        if (!token)
            throw new APIError(401, "Unauthorized Request, Signin Again");

        // fetch token secret
        const secret: string | undefined = process.env.ACCESS_TOKEN_SECRET;
        if (!secret)
            throw new APIError(500, "Secret not found in environment variables");

        // validate access token and store decoded token
        const decoded: JwtPayload | string = jwt.verify(token, secret);
        if (typeof decoded === "string")
            throw new APIError(400, "Invalid Decoded Information");

        // retrieve the user from redis
        try {
            let userData = await redisClient.get(`${decoded._id}`);

            if (!userData) {
                const user = await User.findById(decoded._id).select("-password -refreshToken");

                if (!user) {
                    throw new APIError(404, "Invalid Authentication Token");
                }
                req.user = user;
            } else {
                const user = JSON.parse(userData);
                req.user = user;
            }

        } catch (error) {
            next(error);
        }

    } catch (error) {
        next(error);
    }

    logger.info(`Authentication successful for user: ${req.user?.username}`);

    next();
});

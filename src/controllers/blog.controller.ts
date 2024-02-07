import { NextFunction, Request, Response } from "express";
import validator from "validator";
import { User } from "../models/user.model";
import { APIError } from "../utils/APIError";
import { APIResponse } from "../utils/APIResponse";
import { asyncHandler } from "../utils/asyncHandler";
import mongoose from "mongoose";
import { UploadApiResponse } from "cloudinary";
import { uploadToCloudinary } from "../utils/cloudinary";
import { Blog } from "../models/blog.model";

// @route   POST /api/v1/blogs/
// @desc    Create blog
// @access  Private
export const createBlog = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user_id = req.user?._id;
        const { title, content, tags } = req.body;

        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            throw new APIError(401, "Unauthorized Request, Sign in Again");
        }

        if (!title) {
            throw new APIError(400, "Title Is Required");
        }
        if (!content) {
            throw new APIError(400, "Content Is Required");
        }
        if (!tags) {
            throw new APIError(400, "Tags Are Required");
        }

        // Convert the tags string to an array
        const tagArray = tags.split(',').map((tag: string) => tag.trim());

        // Ensure each tag starts with a hash (#)
        const validTags = tagArray.every((tag: string) => typeof tag === 'string' && tag.trim().startsWith('#'));

        if (!validTags) {
            throw new APIError(400, "Tags must be strings starting with '#'");
        }

        let imageURL: string | undefined = undefined;
        let public_id: string | undefined = undefined;

        if (req.file) {
            const imageLocalPath: string | undefined = req.file.path;

            const image: UploadApiResponse | string = await uploadToCloudinary(imageLocalPath, "blogs");

            if (typeof image === 'object' && image.hasOwnProperty('url')) {
                imageURL = (image as UploadApiResponse).url;
                public_id = (image as UploadApiResponse).public_id;
            } else {
                throw new APIError(400, "Invalid Cloudinary Response");
            }
        }

        const blogData: any = {
            title,
            content,
            tags: tagArray,
            author: user_id
        };

        if (imageURL !== undefined && public_id !== undefined) {
            blogData.image = { url: imageURL, public_id: public_id };
        }

        const blog = await Blog.create(blogData);

        if (!blog) {
            throw new APIError(400, "Failed To Create Blog");
        }

        res.status(201).json(new APIResponse(201, blog, "Blog Successfully Created"));
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/blogs/:id
// @desc    Get blog
// @access  Private
export const getBlogDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user_id = req.user?._id;
        const blog_id = new mongoose.Types.ObjectId(req.params.id || req.body.id);

        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            throw new APIError(401, "Unauthorized Request, Sign in Again");
        }

        if (!mongoose.Types.ObjectId.isValid(blog_id)) {
            throw new APIError(400, "Blog ID Is Required");
        }

        const blog = await Blog.findById(blog_id).lean();

        if (!blog) {
            throw new APIError(400, "Blog Not Found");
        }

        res.status(201).json(new APIResponse(201, { blog }, "Blog Fetched Successfully"));
    } catch (error) {
        next(error);
    }
});
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { APIError } from "../utils/APIError";
import { APIResponse } from "../utils/APIResponse";
import { asyncHandler } from "../utils/asyncHandler";
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

        if (!user_id) {
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

// @route   GET /api/v1/blogs/
// @desc    Get blogs
// @access  Private
export const getBlogs = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user_id = req.user?._id;

        if (!user_id) {
            throw new APIError(401, "Unauthorized Request, Sign in Again");
        }

        // Extract page number and items per page from query parameters
        const page: number = parseInt(req.query.page as string) || 1;
        const limit: number = parseInt(req.query.limit as string) || 10;

        // Calculate the skip value based on the page and limit
        const skip = (page - 1) * limit;

        const blogs = await Blog.find()
            .skip(skip)
            .limit(limit)
            .lean();

        const totalBlogsCount = await Blog.countDocuments();

        if (!blogs) {
            throw new APIError(404, "Blogs Not Found");
        }

        res.status(200).json(new APIResponse(200, { total: totalBlogsCount, blogs }, "Blogs Fetched Successfully"));
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
        const blog_id = req.params.id || req.body.id;

        if (!user_id) {
            throw new APIError(401, "Unauthorized Request, Sign in Again");
        }

        if (!blog_id) {
            throw new APIError(400, "Blog ID Is Required");
        }

        const blog = await Blog.findById(blog_id).lean();

        if (!blog) {
            throw new APIError(400, "Blog Not Found");
        }

        res.status(200).json(new APIResponse(200, { blog }, "Blog Fetched Successfully"));
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/v1/blogs/:id
// @desc    Update blog
// @access  Private
export const updateBlog = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user_id = req.user?._id;
        const blog_id = new mongoose.Types.ObjectId(req.params.id || req.body.id);
        const { title, content } = req.body;

        if (!user_id) {
            throw new APIError(401, "Unauthorized Request, Sign in Again");
        }

        if (!blog_id) {
            throw new APIError(400, "Blog ID Is Required");
        }

        const blog = await Blog.findById(blog_id);
        if (!blog) {
            throw new APIError(400, "Blog Not Found");
        }

        if (!title && !content) {
            throw new APIError(400, "Atleast One Field Is Required");
        }

        if (title) {
            blog.title = title;
        }
        if (content) {
            blog.content = content;
        }

        const updatedBlog = await blog.save();

        res.status(200).json(new APIResponse(200, { blog: updatedBlog }, "Blog Updated Successfully"));
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/v1/blogs/:id
// @desc    Delete blog
// @access  Private
export const deleteBlog = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user_id = req.user?._id;
        const blog_id = req.params.id || req.body.id;

        if (!user_id) {
            throw new APIError(401, "Unauthorized Request, Sign in Again");
        }

        if (!blog_id) {
            throw new APIError(400, "Blog ID Is Required");
        }

        const blog = await Blog.findById(blog_id).lean();
        if (!blog) {
            throw new APIError(400, "Blog Not Found");
        }

        const public_id = blog.image?.public_id;
        if (public_id) {
            await cloudinary.uploader.destroy(public_id);
        }

        await Blog.deleteOne({ _id: blog_id });

        res.status(200).json(new APIResponse(200, {}, "Blog Deleted Successfully"));
    } catch (error) {
        next(error);
    }
})
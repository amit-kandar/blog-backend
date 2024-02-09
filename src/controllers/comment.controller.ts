import { NextFunction, Request, Response } from "express";
import { Blog } from "../models/blog.model";
import { APIError } from "../utils/APIError";
import { APIResponse } from "../utils/APIResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Comment } from "../models/comment.model";


// @route   POST /api/v1/comments/
// @desc    Add comments
// @access  Private
export const addComment = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user_id = req.user?._id;
        const { content, blog_id } = req.body;

        if (!user_id) {
            throw new APIError(401, "Unauthorized Request, Sign in Again");
        }

        if (!content || !blog_id) {
            throw new APIError(400, "All Fields Are Required!");
        }

        const blog = await Blog.findById(blog_id).lean();
        if (!blog) {
            throw new APIError(400, "Blog Not Found");
        }

        const comment = await Comment.create({ content, author: user_id, blog: blog_id });
        if (!comment) {
            throw new APIError(400, "Comment Add Operation Failed");
        }

        res.status(201).json(new APIResponse(201, { comment }, "Comment Add Successfully"));
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/v1/comments/
// @desc    Get comments
// @access  Private
export const getComments = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user_id = req.user?._id;
        const { blog_id } = req.body;

        if (!user_id) {
            throw new APIError(401, "Unauthorized Request, Sign in Again");
        }

        if (!blog_id) {
            throw new APIError(400, "Invalid Blog ID!");
        }

        const comments = await Comment.find({ blog: blog_id }).lean();
        if (!comments) {
            throw new APIError(400, "Comments Not Found");
        }

        res.status(200).json(new APIResponse(200, { total: comments.length, comments }, "Comments Fetched Successfully"));
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/v1/comments/:id
// @desc    Update comment
// @access  Private
export const updateComment = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user_id = req.user?._id;
        const comment_id = req.params.id;
        const { content } = req.body;

        if (!user_id) {
            throw new APIError(401, "Unauthorized Request, Sign in Again");
        }

        if (!comment_id) {
            throw new APIError(400, "Invalid Comment ID");
        }

        if (!content) {
            throw new APIError(400, "Comment is required");
        }

        const comment = await Comment.findById(comment_id);
        if (!comment) {
            throw new APIError(400, "Comments Not Found");
        }

        if (comment.author.toString() !== user_id.toString()) {
            throw new APIError(400, "You Don't Have Permission To Perform This Operation!");
        }

        comment.content = content;

        const updatedComment = await comment.save();
        if (!updatedComment) {
            throw new APIError(400, "Failed To Update The Comment");
        }

        res.status(200).json(new APIResponse(200, { comment: updatedComment }, "Comment Updated Successfully"));
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/v1/comments/:id
// @desc    Delete comment
// @access  Private
export const deleteComment = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user_id = req.user?._id;
        const comment_id = req.params.id;

        if (!user_id) {
            throw new APIError(401, "Unauthorized Request, Sign in Again");
        }

        if (!comment_id) {
            throw new APIError(400, "Invalid Comment ID");
        }

        const comment = await Comment.findByIdAndDelete(comment_id);
        if (!comment) {
            throw new APIError(400, "Failed To Delete Comments");
        }

        res.status(200).json(new APIResponse(200, {}, "Comment Deleted Successfully"));
    } catch (error) {
        next(error);
    }
});
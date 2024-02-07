import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware";
import { createBlog, deleteBlog, getBlogDetails, getBlogs, updateBlog } from "../controllers/blog.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.post('/', checkAuth, upload.single('image'), createBlog);

router.get('/', checkAuth, getBlogs);

router.get('/:id', checkAuth, getBlogDetails);

router.put('/:id', checkAuth, updateBlog);

router.delete('/:id', checkAuth, deleteBlog);

export default router;
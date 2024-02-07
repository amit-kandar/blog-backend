import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware";
import { createBlog, getBlogDetails } from "../controllers/blog.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.post('/', checkAuth, upload.single('image'), createBlog);

router.get('/:id', checkAuth, getBlogDetails);

export default router;
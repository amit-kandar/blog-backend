import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware";
import { createBlog } from "../controllers/blog.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.post('/', checkAuth, upload.single('image'), createBlog);

export default router;
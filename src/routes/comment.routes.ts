import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware";
import { addComment, deleteComment, getComments, updateComment } from "../controllers/comment.controller";

const router = Router();

router.post('/', checkAuth, addComment);

router.get('/', checkAuth, getComments);

router.put('/:id', checkAuth, updateComment);

router.delete('/:id', checkAuth, deleteComment);

export default router;
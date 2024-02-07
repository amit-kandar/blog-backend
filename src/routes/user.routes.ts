import { Router } from "express";
import { checkEmail } from "../controllers/user.controller";

const router = Router();

router.post('/check-email', checkEmail);

export default router;
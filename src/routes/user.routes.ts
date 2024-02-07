import { Router } from "express";
import { checkEmail, register } from "../controllers/user.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.post('/check-email', checkEmail);

router.post('/register', upload.single("avatar"), register);

export default router;
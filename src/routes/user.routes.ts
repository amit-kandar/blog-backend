import { Router } from "express";
import { checkEmail, login, register } from "../controllers/user.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.post('/check-email', checkEmail);

router.post('/register', upload.single("avatar"), register);

router.post('/login', login);

export default router;
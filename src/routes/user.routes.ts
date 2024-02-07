import { Router } from "express";
import { checkEmail, login, logout, register } from "../controllers/user.controller";
import { upload } from "../middlewares/multer.middleware";
import { checkAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post('/check-email', checkEmail);

router.post('/register', upload.single("avatar"), register);

router.post('/login', login);

router.get('/logout', checkAuth, logout);

export default router;
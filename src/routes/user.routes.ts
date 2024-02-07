import { Router } from "express";
import { checkEmail, getAccessTokenByRefreshToken, getUserDetails, login, logout, register, updateUserDetails } from "../controllers/user.controller";
import { upload } from "../middlewares/multer.middleware";
import { checkAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post('/check-email', checkEmail);

router.post('/register', upload.single("avatar"), register);

router.post('/login', login);

router.get('/logout', checkAuth, logout);

router.post('/refresh-token', getAccessTokenByRefreshToken);

router.get('/', checkAuth, getUserDetails);

router.put('/', checkAuth, updateUserDetails);

export default router;
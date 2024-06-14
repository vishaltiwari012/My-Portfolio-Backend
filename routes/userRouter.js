import express from 'express';
import { forgotPassword, getUser, getUserForPortfolio, login, logout, register, resetPassword, updatePassword, updateProfile } from '../controller/userController.js';
import {isAuthenticated} from '../middlewares/auth.js';

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.put("/me/profile/update", isAuthenticated, updateProfile);
router.put("/password/update", isAuthenticated, updatePassword);
router.get("/portfolio/me", getUserForPortfolio);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

export default router;
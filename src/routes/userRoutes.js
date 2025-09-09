import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { auth, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// Register + Login
router.post("/register", userController.register);
router.post("/login", userController.login);

// Email Verification
router.get("/verify-email/:token", userController.verifyEmail);

// Password Reset
router.post("/request-password-reset", userController.requestPasswordReset);
router.post("/request-password-reset", userController.requestPasswordReset);
router.post("/reset-password/:token", userController.resetPassword);

// 🔄 إعادة إرسال رابط التفعيل
router.post("/resend-verification", userController.resendVerificationEmail);

// Profile
router.get("/profile", auth, userController.getProfile);

export default router;

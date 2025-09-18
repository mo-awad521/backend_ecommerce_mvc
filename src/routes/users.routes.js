import { Router } from "express";
import { userController } from "../controllers/index.js";
import { auth, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// Register + Login
router.post("/register", userController.register);
router.post("/login", userController.login);

// Email Verification
router.get("/verify-email/:token", userController.verifyEmail);

// Password Reset
router.post("/request-password-reset", userController.requestPasswordReset);
router.post("/reset-password/:token", userController.resetPassword);

// 🔄 إعادة إرسال رابط التفعيل
router.post("/resend-verification", userController.resendVerificationEmail);

// Profile
router.get("/profile", auth, userController.getProfile);

// Admin Routes
router.get("/", userController.getAllUsers);
router.get("/:id", auth, isAdmin, userController.getUserById);
router.put("/:id/role", auth, isAdmin, userController.updateUserRole);
router.delete("/:id", auth, isAdmin, userController.deleteUser);

export default router;

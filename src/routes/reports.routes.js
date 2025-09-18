import { Router } from "express";
import { reportController } from "../controllers/index.js";
import { auth, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/dashboard", auth, isAdmin, reportController.getDashboardStats);
export default router;

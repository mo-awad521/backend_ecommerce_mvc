import { Router } from "express";
import { paymentController } from "../controllers/index.js";
import { auth, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", auth, paymentController.createPayment);
router.get("/:orderId", auth, paymentController.getPayment);
router.put("/:orderId", auth, paymentController.updatePayment);

// ✅ عرض جميع المدفوعات (Admin فقط)
router.get("/", auth, isAdmin, paymentController.getAllPayments);

export default router;

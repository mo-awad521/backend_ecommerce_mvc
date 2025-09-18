import { Router } from "express";
import { orderController } from "../controllers/index.js";
import { auth, isAdmin } from "../middlewares/authMiddleware.js";
import { createOrderValidator } from "../validators/index.js";
import { validate } from "../middlewares/validationRequest.js";

const router = Router();

// المستخدم: Checkout من Cart
router.post("/", auth, orderController.createOrder);

// المستخدم: عرض الطلبات
router.get("/", auth, orderController.getMyOrders);

// المستخدم: عرض تفاصيل طلب محدد
router.get("/:id", auth, orderController.getOrderById);

// المستخدم: إلغاء طلب
router.patch("/:id/cancel", auth, orderController.cancelOrder);

// أدمن: تحديث حالة الطلب
router.patch("/:id/status", auth, isAdmin, orderController.updateOrderStatus);

// ✅ الأدمن يقدر يشوف جميع الطلبات
router.get("/", auth, isAdmin, orderController.getAllOrders);

export default router;

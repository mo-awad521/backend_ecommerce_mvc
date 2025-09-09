import { Router } from "express";
import * as reviewController from "../controllers/reviewController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = Router();

// إضافة مراجعة
router.post("/add", auth, reviewController.addReview);

// تعديل مراجعة
router.put("/update", auth, reviewController.updateReview);

// حذف مراجعة
router.delete("/delete", auth, reviewController.deleteReview);

// جلب مراجعات المنتج
router.get("/product/:productId", reviewController.getProductReviews);

export default router;

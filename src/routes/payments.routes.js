import { Router } from "express";
import { paymentController } from "../controllers/index.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", auth, paymentController.createPayment);
router.get("/:orderId", auth, paymentController.getPayment);
router.put("/:orderId", auth, paymentController.updatePayment);

export default router;

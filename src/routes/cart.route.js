import { Router } from "express";
import { cartController } from "../controllers/index.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", auth, cartController.getCart);
router.post("/add", auth, cartController.addItem);
router.put("/update/:itemId", auth, cartController.updateItem);
router.delete("/remove/:itemId", auth, cartController.removeItem);
router.delete("/clear", auth, cartController.clearCart);

export default router;

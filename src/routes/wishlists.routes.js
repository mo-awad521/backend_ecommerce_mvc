import express from "express";
import { wishlistController } from "../controllers/index.js";
import { isCustomer, auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", auth, isCustomer, wishlistController.addWishlist);
router.delete(
  "/:productId",
  auth,
  isCustomer,
  wishlistController.removeWishlist
);
router.get("/", auth, isCustomer, wishlistController.getWishlist);

export default router;

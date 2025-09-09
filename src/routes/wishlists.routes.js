import express from "express";
import {
  addWishlist,
  removeWishlist,
  getWishlist,
} from "../controllers/wishlistController.js";
import { isCustomer, auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", auth, isCustomer, addWishlist);
router.delete("/:productId", auth, isCustomer, removeWishlist);
router.get("/", auth, isCustomer, getWishlist);

export default router;

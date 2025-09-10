import { Router } from "express";
import { auth, isAdmin } from "../middlewares/authMiddleware.js";
import { productController } from "../controllers/index.js";
import { productValidator } from "../validators/index.js";
import { validate } from "../middlewares/validationRequest.js";
import { upload } from "../middlewares/upload.js";

// إضافة منتج مع صورة

const router = Router();

router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);
router.post(
  "/add",
  auth,
  isAdmin,
  upload.array("images", 5), // رفع حتى 5 صور
  productValidator,
  validate,
  productController.createProduct
);
router.put(
  "/update/:id",
  auth,
  isAdmin,
  upload.array("images", 5), // رفع حتى 5 صور
  productValidator,
  validate,
  productController.updateProduct
);
router.delete("/delete/:id", auth, isAdmin, productController.deleteProduct);

export default router;

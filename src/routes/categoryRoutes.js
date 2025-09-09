import { Router } from "express";
import * as categoryController from "../controllers/categoryController.js";
import { auth, isAdmin } from "../middlewares/authMiddleware.js";
import { createCategoryValidator } from "../validators/categoryValidator.js";
import { validate } from "../middlewares/validationRequest.js";

const router = Router();

router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategory);
router.post(
  "/",
  createCategoryValidator,
  validate,
  auth,
  isAdmin,
  categoryController.createCategory
);
router.put("/:id", auth, isAdmin, categoryController.updateCategory);
router.delete("/:id", auth, isAdmin, categoryController.deleteCategory);

export default router;

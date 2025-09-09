import { body } from "express-validator";

export const addToCartValidator = [
  body("productId").isInt().withMessage("ProductId must be an integer"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

import { body } from "express-validator";

export const productValidator = [
  body("title").notEmpty().withMessage("Product title is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("categoryId")
    .optional()
    .isInt()
    .withMessage("CategoryId must be an integer"),
];

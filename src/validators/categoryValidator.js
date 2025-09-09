import { body } from "express-validator";

export const createCategoryValidator = [
  body("name").notEmpty().withMessage("Category name is required"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
];

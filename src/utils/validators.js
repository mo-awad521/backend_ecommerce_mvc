import { body, validationResult } from "express-validator";

export const validate = (rules) => [
  ...rules,
  (req, _res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next({
        status: 400,
        message: errors
          .array()
          .map((e) => e.msg)
          .join(", "),
      });
    }
    next();
  },
];

export const registerRules = [
  body("name").isLength({ min: 2 }).withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password min length 6"),
];

export const loginRules = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password min length 6"),
];

export const categoryRules = [
  body("name").isLength({ min: 2 }).withMessage("Category name required"),
];

export const productRules = [
  body("title").isLength({ min: 2 }).withMessage("Product title required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be > 0"),
  body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be >= 0"),
];

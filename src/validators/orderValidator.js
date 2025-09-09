import { body } from "express-validator";

export const createOrderValidator = [
  // body("userId").isInt().withMessage("UserId must be an integer"),
  body("totalAmount")
    .isFloat({ min: 0 })
    .withMessage("TotalAmount must be a positive number"),
  body("paymentMethod")
    .optional()
    .isString()
    .withMessage("Payment method must be a string"),
];

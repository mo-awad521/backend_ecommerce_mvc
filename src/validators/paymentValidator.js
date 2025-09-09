import { body } from "express-validator";

export const createPaymentValidator = [
  body("orderId").isInt().withMessage("OrderId must be an integer"),
  body("provider")
    .optional()
    .isString()
    .withMessage("Provider must be a string"),
  body("transactionId")
    .optional()
    .isString()
    .withMessage("TransactionId must be a string"),
  body("status").optional().isString().withMessage("Status must be a string"),
];

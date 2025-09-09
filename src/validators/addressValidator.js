import { body } from "express-validator";

export const createAddressValidator = [
  body("street").notEmpty().withMessage("Street is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("country").notEmpty().withMessage("Country is required"),
  body("postalCode").notEmpty().withMessage("Postal code is required"),
];

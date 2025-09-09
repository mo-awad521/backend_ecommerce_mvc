// middleware/validateRequest.js
import { validationResult } from "express-validator";
import { ResponseStatus, CustomResponse } from "../utils/customResponse.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(ResponseStatus.BAD_REQUEST.code).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }

  next();
};

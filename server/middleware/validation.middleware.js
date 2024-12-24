import { body, param, query, validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res
      .status(422)
      .json(new ApiError(422, "Validation failed", extractedErrors));
  };
};

// Common validation chains
export const commonValidations = {
  pagination: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],

  objectId: (field) =>
    param(field).isMongoId().withMessage(`Invalid ${field} ID format`),

  email: body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  password: body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage(
      "Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character"
    ),

  username: body("username")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage("Username can only contain letters and spaces"),
};

// User validation chains
export const validateRegister = validate([
  commonValidations.username,
  commonValidations.email,
  commonValidations.password,
]);

export const validateSingin = validate([
  commonValidations.email,
  commonValidations.password,
]);

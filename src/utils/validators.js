const { body, param, query } = require("express-validator");

const signupValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 3 })
    .withMessage("username must be at least 3 chars"),
  body("email").trim().isEmail().withMessage("valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 chars"),
  body("role")
    .optional()
    .isIn(["client", "admin"])
    .withMessage("role must be client or admin")
];

const loginValidator = [
  body("email").trim().isEmail().withMessage("valid email is required"),
  body("password").notEmpty().withMessage("password is required")
];

const createProductValidator = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage("price must be a number greater than 0")
];

const putProductValidator = [
  param("id").isInt({ gt: 0 }).withMessage("id must be a positive integer"),
  body("name").trim().notEmpty().withMessage("name is required"),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage("price must be a number greater than 0")
];

const patchProductValidator = [
  param("id").isInt({ gt: 0 }).withMessage("id must be a positive integer"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("name cannot be empty"),
  body("price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("price must be a number greater than 0")
];

const idParamValidator = [
  param("id").isInt({ gt: 0 }).withMessage("id must be a positive integer")
];

const productsQueryValidator = [
  query("limit")
    .optional()
    .isInt({ gt: 0, lt: 101 })
    .withMessage("limit must be an integer between 1 and 100"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("offset must be an integer >= 0")
];

module.exports = {
  signupValidator,
  loginValidator,
  createProductValidator,
  putProductValidator,
  patchProductValidator,
  idParamValidator,
  productsQueryValidator
};

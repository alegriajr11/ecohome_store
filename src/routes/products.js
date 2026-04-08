const express = require("express");
const productsController = require("../controllers/productsController");
const authJWT = require("../middleware/authJWT");
const authorizeRole = require("../middleware/authorizeRole");
const validateRequest = require("../middleware/validateRequest");
const {
  createProductValidator,
  putProductValidator,
  patchProductValidator,
  idParamValidator,
  productsQueryValidator
} = require("../utils/validators");

const router = express.Router();

router.get("/", productsQueryValidator, validateRequest, productsController.getProducts);
router.get("/:id", idParamValidator, validateRequest, productsController.getProductById);

router.post(
  "/",
  authJWT,
  authorizeRole("admin"),
  createProductValidator,
  validateRequest,
  productsController.createProduct
);

router.put(
  "/:id",
  authJWT,
  authorizeRole("admin"),
  putProductValidator,
  validateRequest,
  productsController.putProduct
);

router.patch(
  "/:id",
  authJWT,
  authorizeRole("admin"),
  patchProductValidator,
  validateRequest,
  productsController.patchProduct
);

router.delete(
  "/:id",
  authJWT,
  authorizeRole("admin"),
  idParamValidator,
  validateRequest,
  productsController.deleteProduct
);

module.exports = router;

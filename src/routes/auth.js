const express = require("express");
const authController = require("../controllers/authController");
const validateRequest = require("../middleware/validateRequest");
const { signupValidator, loginValidator } = require("../utils/validators");

const router = express.Router();

router.post("/signup", signupValidator, validateRequest, authController.signup);
router.post("/login", loginValidator, validateRequest, authController.login);

module.exports = router;

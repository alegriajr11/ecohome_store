const express = require("express");
const authJWT = require("../middleware/authJWT");
const usersController = require("../controllers/usersController");

const router = express.Router();

router.get("/me/stats", authJWT, usersController.getMeStats);

module.exports = router;

/**
 * Messages Routes
 * REST API endpoints for chat messages
 */

const express = require("express");
const messagesController = require("../controllers/messagesController");
const authJWT = require("../middleware/authJWT");

const router = express.Router();

// All message routes require authentication
router.use(authJWT);

// Get recent messages (public to authenticated users)
router.get("/", messagesController.getMessages);

// Get current user's messages
router.get("/me", messagesController.getMyMessages);

module.exports = router;

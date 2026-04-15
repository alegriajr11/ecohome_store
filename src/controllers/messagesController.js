/**
 * Messages Controller
 * Handles REST API endpoints for chat messages
 */

const messageService = require("../services/messageService");

/**
 * Get recent messages
 * GET /messages?limit=50
 */
async function getMessages(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;

    // Validate limit
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        message: "Limit must be between 1 and 100"
      });
    }

    const messages = await messageService.getRecentMessages(limit);

    res.json({
      success: true,
      count: messages.length,
      messages: messages
    });
  } catch (error) {
    console.error("❌ Error en getMessages:", error);
    res.status(500).json({
      message: "Error retrieving messages",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get messages by current user
 * GET /messages/me?limit=20
 */
async function getMyMessages(req, res) {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        message: "Limit must be between 1 and 50"
      });
    }

    const messages = await messageService.getMessagesByUser(userId, limit);

    res.json({
      success: true,
      count: messages.length,
      messages: messages
    });
  } catch (error) {
    console.error("❌ Error en getMyMessages:", error);
    res.status(500).json({
      message: "Error retrieving user messages",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = {
  getMessages,
  getMyMessages
};

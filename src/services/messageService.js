/**
 * Message Service
 * Handles database operations for chat messages
 */

const pool = require("../config/db");

/**
 * Save a new message to the database
 * @param {Object} messageData - Message data
 * @param {number} messageData.user_id - User ID from JWT
 * @param {string} messageData.username - Username for display
 * @param {string} messageData.text - Message content
 * @returns {Promise<Object>} - Saved message with ID and timestamp
 */
async function saveMessage({ user_id, username, text }) {
  try {
    const query = `
      INSERT INTO messages (user_id, username, text, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, user_id, username, text, created_at
    `;

    const values = [user_id, username, text];
    const result = await pool.query(query, values);

    console.log(`💾 Mensaje guardado: ${username} (${user_id}): "${text}"`);
    return result.rows[0];
  } catch (error) {
    console.error("❌ Error guardando mensaje:", error);
    throw error;
  }
}

/**
 * Get recent messages from database
 * @param {number} limit - Maximum number of messages to return (default: 50)
 * @returns {Promise<Array>} - Array of messages ordered by created_at DESC
 */
async function getRecentMessages(limit = 50) {
  try {
    const query = `
      SELECT id, user_id, username, text, created_at
      FROM messages
      ORDER BY created_at DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    return result.rows.reverse(); // Return in chronological order (oldest first)
  } catch (error) {
    console.error("❌ Error obteniendo mensajes:", error);
    throw error;
  }
}

/**
 * Get messages by user ID
 * @param {number} userId - User ID
 * @param {number} limit - Maximum number of messages to return (default: 20)
 * @returns {Promise<Array>} - Array of user's messages
 */
async function getMessagesByUser(userId, limit = 20) {
  try {
    const query = `
      SELECT id, user_id, username, text, created_at
      FROM messages
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [userId, limit]);
    return result.rows.reverse();
  } catch (error) {
    console.error("❌ Error obteniendo mensajes del usuario:", error);
    throw error;
  }
}

module.exports = {
  saveMessage,
  getRecentMessages,
  getMessagesByUser
};

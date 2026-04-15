/**
 * Socket.IO Authentication Middleware
 * Validates JWT tokens for WebSocket connections
 */

const jwt = require("jsonwebtoken");

/**
 * Socket.IO middleware for JWT authentication
 * @param {Object} socket - Socket.IO socket instance
 * @param {Function} next - Next middleware function
 */
function socketAuth(socket, next) {
  try {
    // Get token from handshake auth
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.warn(`🚫 Conexión rechazada: no se proporcionó token (socket_id=${socket.id})`);
      return next(new Error("Authentication error: No token provided"));
    }

    // Remove "Bearer " prefix if present
    const cleanToken = token.replace(/^Bearer\s+/, "");

    // Verify JWT token
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

    // Attach user data to socket
    socket.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      username: decoded.username || decoded.email // Fallback to email if no username
    };

    console.log(`🔐 Usuario autenticado: ${socket.user.username} (ID: ${socket.user.id})`);
    next();

  } catch (error) {
    console.warn(`🚫 Token inválido: ${error.message} (socket_id=${socket.id})`);

    if (error.name === 'TokenExpiredError') {
      return next(new Error("Authentication error: Token expired"));
    } else if (error.name === 'JsonWebTokenError') {
      return next(new Error("Authentication error: Invalid token"));
    } else {
      return next(new Error("Authentication error: Token verification failed"));
    }
  }
}

module.exports = socketAuth;

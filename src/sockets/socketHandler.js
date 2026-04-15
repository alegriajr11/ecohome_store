/**
 * Socket.IO event handlers
 * Manages real-time communication with connected clients
 */

const messageService = require("../services/messageService");

const initializeSocket = (io) => {
  // Apply authentication middleware
  io.use(require("../middleware/socketAuth"));

  io.on("connection", (socket) => {
    // Log connection with user info
    console.log(`✅ Cliente conectado: socket_id=${socket.id}, user=${socket.user.username} (ID: ${socket.user.id}), timestamp=${new Date().toISOString()}`);

    // Handle new message event
    socket.on("new-message", async (data) => {
      try {
        // Validate message structure
        if (!data || !data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
          console.warn(`⚠️  Mensaje inválido del socket ${socket.id}: falta o está vacío el campo 'message'`);
          socket.emit("error", {
            message: "El mensaje debe tener contenido válido"
          });
          return;
        }

        // Get user data from authenticated socket
        const { id: userId, username } = socket.user;

        // Save message to database
        const savedMessage = await messageService.saveMessage({
          user_id: userId,
          username: username,
          text: data.message.trim()
        });

        // Prepare payload for broadcast
        const messagePayload = {
          id: savedMessage.id,
          user: username,
          message: savedMessage.text,
          timestamp: savedMessage.created_at.toISOString(),
          userId: userId
        };

        console.log(`📨 Mensaje guardado y enviado: ${username}: "${savedMessage.text}"`);

        // Broadcast to all connected clients
        io.emit("receive-message", messagePayload);

      } catch (error) {
        console.error(`❌ Error procesando mensaje del socket ${socket.id}:`, error);
        socket.emit("error", {
          message: "Error interno del servidor al procesar el mensaje"
        });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`❌ Cliente desconectado: socket_id=${socket.id}, user=${socket.user?.username || 'unknown'}, timestamp=${new Date().toISOString()}`);
    });

    // Handle connection error
    socket.on("error", (error) => {
      console.error(`❌ Error de socket ${socket.id}:`, error);
    });
  });
};

module.exports = { initializeSocket };

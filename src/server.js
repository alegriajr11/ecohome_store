const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const productsRoutes = require("./routes/products");
const messagesRoutes = require("./routes/messages");
const errorHandler = require("./middleware/errorHandler");
const { initializeSocket } = require("./sockets/socketHandler");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middlewares PRIMERO
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Socket.IO DESPUÉS de middlewares
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = Number(process.env.PORT || 3000);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "ecohome-store-backend",
    timestamp: new Date().toISOString()
  });
});

app.use("/auth", authRoutes);
app.use("/products", productsRoutes);
app.use("/messages", messagesRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

// Initialize Socket.IO handlers
initializeSocket(io);

server.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] API listening on port ${PORT}`);
  console.log(`[${new Date().toISOString()}] Socket.IO server ready for real-time communication`);
});

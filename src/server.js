const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const productsRoutes = require("./routes/products");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "ecohome-store-backend",
    timestamp: new Date().toISOString()
  });
});

app.use("/auth", authRoutes);
app.use("/products", productsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] API listening on port ${PORT}`);
});

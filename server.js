// server.js
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const historyRoutes = require("./routes/historyRoutes");

const app = express();
const port = 8080;

// Middleware untuk membaca JSON dari body request
app.use(express.json());

// ROUTE UTAMA
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/history", historyRoutes);

// SERVER RUNNING
app.listen(port, () => {
  console.log(`Server Express berjalan di http://localhost:${port}`);
});
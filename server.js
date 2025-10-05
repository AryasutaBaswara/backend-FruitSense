// server.js
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

const app = express();
const port = 8080;

// Middleware
app.use(express.json());

// ROUTE UTAMA: Hanya memuat Auth
// Endpoint: /api/v1/auth/register dan /api/v1/auth/login
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/inventory", inventoryRoutes);

// SERVER RUNNING
app.listen(port, () => {
  console.log(`Server Express berjalan di http://localhost:${port}`);
});

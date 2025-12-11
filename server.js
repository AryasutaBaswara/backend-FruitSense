// server.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require("express");
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
// const userRoutes = require("./routes/userRoutes");
const historyRoutes = require("./routes/historyRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const userProfileRoutes = require("./routes/userprofileRoutes");
const fcmRoutes = require("./routes/fcmRoutes");
// --- [BARU 1] Import Route Resep yang tadi kita buat ---
// Pastikan kamu sudah punya file 'routes/recipeRoutes.js' ya
const recipeRoutes = require("./routes/recipeRoutes");

const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./swaggerConfig");

const { startScheduler } = require("./services/notificationScheduler");

const app = express();
const port = 3001;

// Middleware untuk membaca JSON dari body request
app.use(express.json());

// --- ROUTE UTAMA ---
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
// app.use("/api/v1/users", userRoutes);
app.use("/api/v1/history", historyRoutes);
app.use("/api/v1/analyze", analysisRoutes);
app.use("/api/v1/user-profile", userProfileRoutes);
app.use("/api/v1/recipes", recipeRoutes);
app.use("/api/v1/fcm", fcmRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.get('/', (req, res) => {
    res.send('Backend FruitSense Berjalan di Port 3001!');
});

// SERVER RUNNING
app.listen(port, () => {
  console.log(`Server Express berjalan di http://localhost:${port}`);
  console.log('Testing CI/CD Again...');
  startScheduler();
});

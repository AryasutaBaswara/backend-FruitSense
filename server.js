// server.js
require("dotenv").config();

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

const { startScheduler } = require("./services/notificationScheduler");

const app = express();
const port = 8080;

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

// Route Bawaan
app.get("/", (req, res) => {
  // Kirim pesan konfirmasi yang jelas
  res.send(
    "<h1>Verifikasi Sukses!</h1><p>Akun Anda telah diaktifkan. Silakan kembali ke aplikasi mobile.</p>"
  );
});

app.get("/reset-password", (req, res) => {
  // Saat user mengklik link di email, token dikirim via URL query.
  const resetUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

  res.send(`
        <h1>Landing Page Reset Password (Simulasi)</h1>
        <p>Token sudah ada di URL. Silakan salin URL di address bar dan lanjutkan di Postman.</p>
        <p>Token Anda: <strong>${req.query.access_token}</strong></p>
    `);
});

// SERVER RUNNING
app.listen(port, () => {
  console.log(`Server Express berjalan di http://localhost:${port}`);
  startScheduler();
});

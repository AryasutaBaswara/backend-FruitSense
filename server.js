// server.js
require("dotenv").config();

const express = require("express");
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const userRoutes = require("./routes/userRoutes");
const historyRoutes = require("./routes/historyRoutes");
const analysisRoutes = require("./routes/analysisRoutes");

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
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/history", historyRoutes);
app.use("/api/v1/analyze", analysisRoutes);

// --- [BARU 2] Pasang Jalur Resep di sini ---
// Nanti Frontend aksesnya ke: http://localhost:8080/api/v1/recipes/saran
app.use("/api/v1/recipes", recipeRoutes);

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

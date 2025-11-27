// routes/historyRoutes.js

const express = require("express");
const router = express.Router();
const {
  addHistory,
  getUserHistory,
  removeHistory,
} = require("../controllers/historyController.js");
const { verifyToken } = require("../middleware/auth.js");

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   - name: History
 *     description: Manajemen Riwayat Analisis Buah
 */
// Endpoint untuk histori

// --- 1. ADD HISTORY (POST) ---
/**
 * @swagger
 * /api/v1/history:
 *   post:
 *     summary: Simpan riwayat analisis baru
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fruit_name
 *               - image_url
 *             properties:
 *               fruit_name:
 *                 type: string
 *                 example: "Apel Fuji"
 *               image_url:
 *                 type: string
 *                 example: "https://supabase.../gambar.jpg"
 *               grade:
 *                 type: string
 *                 example: "Grade A"
 *               expiration_days:
 *                 type: integer
 *                 example: 7
 *               result_summary:
 *                 type: string
 *                 example: "Apel segar, estimasi 7 hari."
 *               analysis_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-20T10:00:00Z"
 *     responses:
 *       201:
 *         description: Berhasil disimpan
 *       500:
 *         description: Gagal menyimpan
 */
router.post("/", addHistory);

// --- 2. GET USER HISTORY (GET) ---
/**
 * @swagger
 * /api/v1/history:
 *   get:
 *     summary: Ambil semua riwayat milik user
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: UUID
 *                       fruit_name:
 *                         type: string
 *                       image_url:
 *                         type: string
 *                       grade:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 */
router.get("/", getUserHistory);

// --- 3. DELETE HISTORY (DELETE) ---
/**
 * @swagger
 * /api/v1/history/{id}:
 *   delete:
 *     summary: Hapus satu riwayat analisis
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID History yang akan dihapus
 *     responses:
 *       200:
 *         description: Berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Histori berhasil dihapus"
 *       404:
 *         description: History tidak ditemukan atau bukan milik user
 */
router.delete("/:id", removeHistory);

// BAGIAN PALING PENTING: Mengekspor router agar bisa digunakan oleh server.js
module.exports = router;

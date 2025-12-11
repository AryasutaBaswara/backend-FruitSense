// routes/fcmRoutes.js
const express = require("express");
const router = express.Router();
const fcmController = require("../controllers/fcmController");
const { verifyToken } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   - name: Notification
 *     description: Setup Notifikasi Push (FCM)
 */

// --- 1. STORE TOKEN (PUT) ---
//
/**
 * @swagger
 * /api/v1/fcm/save-token:
 *   put:
 *     summary: Simpan FCM Token dari perangkat user ke database
 *     description: Frontend wajib memanggil ini setiap kali user login agar notifikasi bisa terkirim.
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fcm_token
 *             properties:
 *               fcm_token:
 *                 type: string
 *                 description: Token unik perangkat yang diperoleh dari Firebase SDK
 *                 example: "dKjs82...token_panjang_dari_firebase...xyz"
 *     responses:
 *       200:
 *         description: Token berhasil disimpan atau diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "FCM Token berhasil disimpan."
 *                 user:
 *                   type: object
 *                   description: Data user yang diperbarui
 *       400:
 *         description: Token kosong
 */
router.put("/save-token", verifyToken, fcmController.saveFcmToken);

// --- 2. TEST SEND (POST) ---
//
/**
 * @swagger
 * /api/v1/fcm/test-send:
 *   post:
 *     summary: Tes kirim notifikasi manual (Development Only)
 *     description: Untuk menguji apakah koneksi ke Firebase FCM berjalan. Tidak memerlukan login.
 *     tags: [Notification]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token FCM tujuan
 *                 example: "dKjs82...token_panjang..."
 *               title:
 *                 type: string
 *                 example: "Halo dari Backend!"
 *               body:
 *                 type: string
 *                 example: "Ini adalah pesan tes notifikasi."
 *     responses:
 *       200:
 *         description: Notifikasi berhasil dikirim ke Firebase
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: object
 *                   description: Detail response dari Firebase
 */
router.post("/test-send", verifyToken, fcmController.testSend);

module.exports = router;

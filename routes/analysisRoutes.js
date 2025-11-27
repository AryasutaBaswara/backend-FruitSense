// routes/analysisRoutes.js
const express = require("express");
const router = express.Router();
const analysisController = require("../controllers/analysisController");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/upload"); // Middleware Multer

// Lindungi route dengan JWT
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   - name: AI Analysis
 *     description: Upload gambar dan deteksi buah otomatis via Python ML
 */

/**
 * @swagger
 * /api/v1/analyze:
 *   post:
 *     summary: Upload gambar buah untuk analisis AI (disimpan ke History & Inventory)
 *     tags: [AI Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - stock_quantity
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File gambar buah (JPG/PNG)
 *               stock_quantity:
 *                 type: integer
 *                 example: 10
 *                 description: Jumlah stok awal yang ingin dimasukkan
 *     responses:
 *       201:
 *         description: Analisis berhasil, data disimpan ke Inventory & History
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Analisis Berhasil! Data disimpan."
 *                 analysis_result:
 *                   type: object
 *                   properties:
 *                     detected:
 *                       type: string
 *                       example: "Banana"
 *                     grade:
 *                       type: string
 *                       example: "Grade B (Ripe)"
 *                     nutrients:
 *                       type: string
 *                       example: "Potassium, Vitamin B6"
 *                     days_left:
 *                       type: integer
 *                       example: 7
 *                 inventory:
 *                   type: object
 *                   description: Data lengkap yang tersimpan di database
 *       400:
 *         description: Gambar atau stok tidak diberikan
 *       500:
 *         description: Gagal memproses analisis AI atau simpan database
 */
router.post("/", upload.single("image"), analysisController.analyzeAndSave);

module.exports = router;

// routes/recipeRoutes.js
const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const { verifyToken } = require("../middleware/auth");

// Middleware: Semua route resep butuh login
router.use(verifyToken);
/**
 * @swagger
 * tags:
 *   - name: Recipes
 *     description: Generator resep pintar menggunakan Gemini AI
 */

// POST: Bikin Resep baru dari Inventory (Panggil Gemini AI)
//
// --- 1. GENERATE RECIPE (POST) ---
//
/**
 * @swagger
 * /api/v1/recipes/generate:
 *   post:
 *     summary: Buat resep baru dari stok buah (Powered by Gemini AI)
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inventory_id
 *             properties:
 *               inventory_id:
 *                 type: string
 *                 description: UUID buah di inventory
 *                 example: "uuid-buah-dari-inventory"
 *     responses:
 *       201:
 *         description: Resep berhasil dibuat dan disimpan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Resep berhasil dibuat!"
 *                 recipe:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                       example: "Smoothie Pisang Coklat"
 *                     ingredients:
 *                       type: string
 *                       example: "2 Pisang, 100ml Susu, Coklat Bubuk"
 *                     instructions:
 *                       type: string
 *                       example: "1. Blender semua bahan. 2. Sajikan dingin."
 *                     cooking_time:
 *                       type: string
 *                       example: "5 Menit"
 *       404:
 *         description: Buah tidak ditemukan di inventory
 *       500:
 *         description: Gagal menghubungi AI
 */
router.post("/generate", recipeController.createRecipeFromInventory);

// GET: Ambil semua resep saya
// --- 2. GET ALL RECIPES ---
//
/**
 * @swagger
 * /api/v1/recipes:
 *   get:
 *     summary: Lihat semua resep yang sudah disimpan user
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar resep berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   fruit_name:
 *                     type: string
 *                   fruit_image_url:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 */
router.get("/", recipeController.getMyRecipes);

// GET: Ambil detail 1 resep
// --- 3. GET DETAIL ---
//
/**
 * @swagger
 * /api/v1/recipes/{id}:
 *   get:
 *     summary: Lihat detail lengkap satu resep
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID Resep
 *     responses:
 *       200:
 *         description: Detail resep ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 ingredients:
 *                   type: string
 *                 instructions:
 *                   type: string
 *                 cooking_time:
 *                   type: string
 *       404:
 *         description: Resep tidak ditemukan
 */
router.get("/:id", recipeController.getRecipeDetail);

// --- 4. DELETE RECIPE ---
//
/**
 * @swagger
 * /api/v1/recipes/{id}:
 *   delete:
 *     summary: Hapus resep
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID Resep yang mau dihapus
 *     responses:
 *       200:
 *         description: Resep berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Resep berhasil dihapus."
 *       404:
 *         description: Resep tidak ditemukan atau bukan milik user
 */
router.delete("/:id", recipeController.deleteRecipe);

module.exports = router;

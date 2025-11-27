const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   - name: Inventory
 *     description: Manajemen stok buah
 */

// --- 1. CREATE INVENTORY (POST) ---
/**
 * @swagger
 * /api/v1/inventory:
 *   post:
 *     summary: Tambah data inventory baru (Upload Gambar)
 *     tags: [Inventory]
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
 *               - fruit_name
 *               - stock_quantity
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File gambar buah
 *               fruit_name:
 *                 type: string
 *                 example: "Apel Malang"
 *               stock_quantity:
 *                 type: integer
 *                 example: 10
 *               grade:
 *                 type: string
 *                 description: (Opsional) Jika mau input manual
 *                 example: "Grade A"
 *     responses:
 *       201:
 *         description: Berhasil disimpan
 */
router.post("/", upload.single("image"), inventoryController.createInventory);

// --- 2. GET ALL (GET) ---
/**
 * @swagger
 * /api/v1/inventory:
 *   get:
 *     summary: Ambil semua data inventory (Support Search & Sort)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Cari nama buah (contoh "pisang")
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, stock]
 *         description: Urutkan data (default by expired date)
 *     responses:
 *       200:
 *         description: Data berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   fruit_name:
 *                     type: string
 *                   stock_quantity:
 *                     type: integer
 *                   days_until_expired:
 *                     type: integer
 *                   image_url:
 *                     type: string
 */
router.get("/", inventoryController.getInventories);

// --- 3. UPDATE (PUT) ---
/**
 * @swagger
 * /api/v1/inventory/{id}:
 *   put:
 *     summary: Update stok atau nama buah
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID Inventory
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stock_quantity:
 *                 type: integer
 *                 description: Update jumlah stok
 *                 example: 5
 *               fruit_name:
 *                 type: string
 *                 description: Ganti nama buah
 *                 example: "Pisang Cavendish"
 *     responses:
 *       200:
 *         description: Data berhasil diupdate
 *       404:
 *         description: Item tidak ditemukan
 */
router.put("/:id", inventoryController.updateInventory);

// --- 4. DELETE ---
/**
 * @swagger
 * /api/v1/inventory/{id}:
 *   delete:
 *     summary: Hapus item inventory
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Berhasil dihapus (No Content)
 *       404:
 *         description: Item tidak ditemukan
 */
router.delete("/:id", inventoryController.deleteInventory);

module.exports = router;

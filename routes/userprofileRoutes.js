const express = require("express");
const router = express.Router();
const userprofileController = require("../controllers/userprofileController");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/upload"); // Untuk upload avatar

// Middleware wajib login
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   - name: User Profile
 *     description: Manajemen Profil Pengguna (Nama & Avatar)
 */

//
// --- GET PROFILE ---
//
/**
 * @swagger
 * /api/v1/user-profile:
 *   get:
 *     summary: Lihat data diri user yang sedang login
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profil berhasil diambil"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "uuid-user"
 *                     email:
 *                       type: string
 *                       example: "user@test.com"
 *                     name:
 *                       type: string
 *                       example: "Budi Santoso"
 *                     avatar_url:
 *                       type: string
 *                       example: "https://supabase.../avatar.jpg"
 *                     fcm_token:
 *                       type: string
 */
router.get("/", userprofileController.getProfile);

/**
 * @swagger
 * /api/v1/user-profile:
 *   put:
 *     summary: Edit nama atau upload foto profil
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nama baru (opsional)
 *                 example: "Budi Ganteng"
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: File foto profil baru (opsional)
 *     responses:
 *       200:
 *         description: Profil berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profil berhasil diperbarui."
 *                 user:
 *                   type: object
 *                   description: Data user terbaru setelah update
 *       500:
 *         description: Gagal update profil
 */
router.put("/", upload.single("avatar"), userprofileController.updateProfile);

module.exports = router;

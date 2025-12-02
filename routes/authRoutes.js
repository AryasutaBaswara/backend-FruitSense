const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

// --- DEFINISI TAG ---
/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication routes
 */

// --- REGISTER ---
/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Mendaftar user baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@test.com
 *               password:
 *                 type: string
 *                 example: pass123
 *               name:
 *                 type: string
 *                 example: Budi
 *     responses:
 *       201:
 *         description: Registrasi sukses
 */
router.post("/register", authController.registerUser);

// --- VERIFY OTP ---
/**
 * @swagger
 * /api/v1/auth/verify-otp:
 *   post:
 *     summary: Verifikasi OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@test.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Akun aktif
 */
router.post("/verify-otp", authController.verifyOtp);

// --- LOGIN ---
/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@test.com
 *               password:
 *                 type: string
 *                 example: pass123
 *     responses:
 *       200:
 *         description: Login sukses
 */
router.post("/login", authController.loginUser);

// --- LOGOUT ---
/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout sukses
 */
router.post("/logout", verifyToken, authController.logoutUser);

// --- FORGOT PASSWORD ---
/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Lupa password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@test.com
 *     responses:
 *       200:
 *         description: OTP terkirim
 */
router.post("/forgot-password", authController.forgotPassword);

// --- VERIFY RECOVERY ---
/**
 * @swagger
 * /api/v1/auth/verify-recovery:
 *   post:
 *     summary: Cek OTP reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@test.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Kode benar
 */
router.post("/verify-recovery", authController.verifyRecovery);

// --- RESET PASSWORD ---
/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   put:
 *     summary: Ganti password baru
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               new_password:
 *                 type: string
 *                 example: newpass123
 *     responses:
 *       200:
 *         description: Password diganti
 */
router.put("/reset-password", verifyToken, authController.resetPasswordFinal);

router.post("/resend-otp", authController.resendOtp);

router.post("/resend-recovery-otp", authController.resendRecoveryOtp);

module.exports = router;

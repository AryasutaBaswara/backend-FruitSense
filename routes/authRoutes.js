// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 * name: Auth
 * description: Sistem Autentikasi Lengkap (Register, Login, OTP, Reset Pass)
 */

// --- 1. REGISTER ---
/**
 * @swagger
 * /api/v1/auth/register:
 * post:
 * summary: Mendaftar user baru (Mengirim OTP ke Email)
 * tags: [Auth]
 * security: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [email, password, name]
 * properties:
 * email:
 * type: string
 * example: aryasuta@gmail.com
 * password:
 * type: string
 * example: rahasia123
 * name:
 * type: string
 * example: Aryasuta Baswara
 * responses:
 * 201:
 * description: Registrasi berhasil, cek email untuk OTP
 */
router.post("/register", authController.registerUser);

// --- 2. VERIFY OTP (REGISTER) ---
/**
 * @swagger
 * /api/v1/auth/verify-otp:
 * post:
 * summary: Verifikasi OTP Pendaftaran (Finalisasi Register)
 * tags: [Auth]
 * security: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [email, otp]
 * properties:
 * email:
 * type: string
 * example: aryasuta@gmail.com
 * otp:
 * type: string
 * description: Kode 6 digit dari email
 * example: "123456"
 * responses:
 * 200:
 * description: Akun aktif & Login otomatis (Dapat Token)
 * 400:
 * description: Kode salah atau kadaluarsa
 */
router.post("/verify-otp", authController.verifyOtp);

// --- 3. LOGIN ---
/**
 * @swagger
 * /api/v1/auth/login:
 * post:
 * summary: Login user
 * tags: [Auth]
 * security: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [email, password]
 * properties:
 * email:
 * type: string
 * example: aryasuta@gmail.com
 * password:
 * type: string
 * example: rahasia123
 * responses:
 * 200:
 * description: Login berhasil (Dapat Token JWT)
 * 401:
 * description: Email atau password salah
 */
router.post("/login", authController.loginUser);

// --- 4. LOGOUT ---
/**
 * @swagger
 * /api/v1/auth/logout:
 * post:
 * summary: Logout user (Server-side session clear)
 * tags: [Auth]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Logout berhasil
 */
router.post("/logout", verifyToken, authController.logoutUser);

// --- 5. FORGOT PASSWORD (REQUEST) ---
/**
 * @swagger
 * /api/v1/auth/forgot-password:
 * post:
 * summary: Lupa Password (Minta Kode OTP Pemulihan)
 * tags: [Auth]
 * security: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [email]
 * properties:
 * email:
 * type: string
 * example: aryasuta@gmail.com
 * responses:
 * 200:
 * description: Kode OTP dikirim ke email jika terdaftar
 */
router.post("/forgot-password", authController.forgotPassword); // Step 1: Kirim Email

// --- 6. VERIFY RECOVERY OTP ---
/**
 * @swagger
 * /api/v1/auth/verify-recovery:
 * post:
 * summary: Cek Kode OTP Lupa Password
 * tags: [Auth]
 * security: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [email, otp]
 * properties:
 * email:
 * type: string
 * example: aryasuta@gmail.com
 * otp:
 * type: string
 * example: "654321"
 * responses:
 * 200:
 * description: Kode benar, mengembalikan Token Session untuk ganti password
 */
router.post("/verify-recovery", authController.verifyRecovery);

// Step 2: Cek Kode -> Dapat Token
// --- 7. RESET PASSWORD FINAL (CHANGE PASSWORD) ---
/**
 * @swagger
 * /api/v1/auth/reset-password:
 * put:
 * summary: Set Password Baru (Setelah verifikasi recovery atau Login)
 * tags: [Auth]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [new_password]
 * properties:
 * new_password:
 * type: string
 * example: PasswordBaru123!
 * responses:
 * 200:
 * description: Password berhasil diubah
 */
router.put("/reset-password", verifyToken, authController.resetPasswordFinal); // Step 3: Ganti Pass (Perlu Token)

module.exports = router;

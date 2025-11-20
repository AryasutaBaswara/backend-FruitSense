// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

// Route Auth

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/logout", verifyToken, authController.logoutUser);
router.post("/forgot-password", authController.forgotPassword); // Step 1: Kirim Email
router.post("/verify-recovery", authController.verifyRecovery); // Step 2: Cek Kode -> Dapat Token
router.put("/reset-password", verifyToken, authController.resetPasswordFinal); // Step 3: Ganti Pass (Perlu Token)
router.post("/verify-otp", authController.verifyOtp);

module.exports = router;

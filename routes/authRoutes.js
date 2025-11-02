// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

// Route Auth

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/logout", verifyToken, authController.logoutUser);
router.post("/forgot-password", authController.forgotPassword);
router.put("/reset-password", authController.resetPasswordFinal);
router.post("/reset-password", authController.resetPasswordFinal);

module.exports = router;

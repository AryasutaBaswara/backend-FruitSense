// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Route Auth
// POST /auth/register
router.post("/register", authController.registerUser);

// POST /auth/login
router.post("/login", authController.loginUser);

module.exports = router;

// routes/fcmRoutes.js
const express = require("express");
const router = express.Router();
const fcmController = require("../controllers/fcmController");
const { verifyToken } = require("../middleware/auth");

// Endpoint simpan token butuh login
router.put("/token", verifyToken, fcmController.storeToken);

// Endpoint test manual (Bisa dimatikan nanti di production)
router.post("/test-send", fcmController.testNotification);

module.exports = router;

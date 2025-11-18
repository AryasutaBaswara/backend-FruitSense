// routes/analysisRoutes.js
const express = require("express");
const router = express.Router();
const analysisController = require("../controllers/analysisController");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/upload"); // Middleware Multer

// Lindungi route dengan JWT
router.use(verifyToken);

// POST /api/v1/analyze
// upload.single('image') akan menangkap file dari form-data dengan key 'image'
router.post("/", upload.single("image"), analysisController.analyzeAndSave);

module.exports = router;

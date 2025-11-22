const express = require("express");
const router = express.Router();
const userprofileController = require("../controllers/userprofileController");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/upload"); // Untuk upload avatar

// Middleware wajib login
router.use(verifyToken);

// GET /api/v1/user-profile (Lihat Profil)
router.get("/", userprofileController.getProfile);

// PUT /api/v1/user-profile (Edit Profil + Upload Avatar)
// Key di Postman untuk gambar: 'avatar'
router.put("/", upload.single("avatar"), userprofileController.updateProfile);

module.exports = router;

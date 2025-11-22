const express = require("express");
const router = express.Router();
const userController = require("../controllers/fcmController");
const { verifyToken } = require("../middleware/auth");

router.use(verifyToken);

router.put("/fcm-token", userController.updateFcmToken);

module.exports = router;

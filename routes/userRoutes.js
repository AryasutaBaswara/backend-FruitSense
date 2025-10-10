const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");

router.use(verifyToken);

router.put("/fcm-token", userController.updateFcmToken);

module.exports = router;

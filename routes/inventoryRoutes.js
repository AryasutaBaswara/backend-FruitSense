const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(verifyToken);

router.post("/", upload.single("image"), inventoryController.createInventory);

router.get("/", inventoryController.getInventories);

router.put("/:id", inventoryController.updateInventory);

router.delete("/:id", inventoryController.deleteInventory);

module.exports = router;

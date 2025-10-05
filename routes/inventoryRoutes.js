const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const { verifyToken } = require("../middleware/auth");

router.use(verifyToken);

router.post("/", inventoryController.createInventory);

router.get("/", inventoryController.getInventories);

router.put("/:id", inventoryController.updateInventory);

router.delete("/:id", inventoryController.deleteInventory);

module.exports = router;

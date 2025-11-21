// routes/recipeRoutes.js
const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const { verifyToken } = require("../middleware/auth");

// Middleware: Semua route resep butuh login
router.use(verifyToken);

// POST: Bikin Resep baru dari Inventory (Panggil Gemini AI)
// Body: { "inventory_id": "uuid-buah" }
router.post("/generate", recipeController.createRecipeFromInventory);

// GET: Ambil semua resep saya
router.get("/", recipeController.getMyRecipes);

// GET: Ambil detail 1 resep
router.get("/:id", recipeController.getRecipeDetail);
router.delete("/:id", recipeController.deleteRecipe);

module.exports = router;

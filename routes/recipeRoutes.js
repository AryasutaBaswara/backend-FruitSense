// routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// Method GET. Alamatnya nanti jadi: /api/resep/saran
router.get('/saran', recipeController.getRecommendation);

module.exports = router;
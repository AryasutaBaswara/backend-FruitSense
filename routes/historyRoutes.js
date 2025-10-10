// routes/historyRoutes.js

const express = require('express');
const router = express.Router();
const { addHistory, getUserHistory } = require('../controllers/historyController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

// Middleware ini akan melindungi semua rute di bawahnya
router.use(authMiddleware);

// Endpoint untuk histori
router.post('/', addHistory);
router.get('/', getUserHistory);

// BAGIAN PALING PENTING: Mengekspor router agar bisa digunakan oleh server.js
module.exports = router;

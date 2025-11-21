// controllers/recipeController.js

const { generateRecipe } = require('../services/aiservicegemini');

// Misal: Import model database (kalau sudah ada)
// const InventoryModel = require('../models/Inventory');

exports.getRecommendation = async (req, res) => {
  try {
    // --- LANGKAH 1: Ambil Data Inventory ---
    // Nanti ganti ini dengan: const items = await InventoryModel.findAll({ where: { qty: > 0 } });
    
    // Contoh data dummy (Pura-puranya ini hasil dari Database)
    const inventoryItems = [
      "Apple (Grade A)", 
      "Banana (Sisa 2 hari)", 
      "Yoghurt", 
      "Madu"
    ];

    // Cek kalau kosong
    if (inventoryItems.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Inventory kosong. Masukkan buah dulu!'
      });
    }

    // --- LANGKAH 2: Panggil AI Aurel ---
    // Kita kirim list inventory ke fungsi yang baru kamu buat tadi
    const resepSaran = await generateRecipe(inventoryItems);

    // --- LANGKAH 3: Kirim Balasan ke Frontend ---
    res.status(200).json({
      status: 'success',
      message: 'Resep berhasil dibuat oleh Chef Fruitsense',
      data: resepSaran
    });

  } catch (error) {
    console.error("Error di Controller:", error);
    res.status(500).json({
      status: 'error',
      message: 'Maaf, gagal membuat resep saat ini.',
      error: error.message
    });
  }
};
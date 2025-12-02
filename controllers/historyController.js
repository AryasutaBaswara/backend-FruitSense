const historyService = require("../services/historyService.js");

// --- 1. ADD HISTORY ---
const addHistory = async (req, res) => {
  try {
    // AUREL UPDATE: Pakai cara aman (Safety Check)
    const userId = req.user ? req.user.id : req.userId;

    // Cek jika userId tidak ketemu
    if (!userId) {
      return res.status(401).json({ 
        status: "error", 
        message: "Unauthorized: User ID tidak ditemukan. Silakan login ulang." 
      });
    }

    const {
      fruit_name,
      image_url,
      grade,
      expiration_days,
      result_summary,
      analysis_time,
    } = req.body;

    const newHistoryData = {
      user_id: userId,
      fruit_name,
      image_url,
      grade,
      expiration_days,
      result_summary,
      analysis_time,
    };

    const newHistory = await historyService.createHistory(newHistoryData);
    res.status(201).json({
      status: "success",
      message: "Histori berhasil ditambahkan",
      data: newHistory,
    });
  } catch (error) {
    console.error("Error di addHistory:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// --- 2. GET USER HISTORY ---
const getUserHistory = async (req, res) => {
  try {
    // AUREL UPDATE: Pakai cara aman (Safety Check)
    const userId = req.user ? req.user.id : req.userId;

    // Jaga-jaga kalau userId masih null/undefined
    if (!userId) {
      return res.status(401).json({ 
        status: "error", 
        message: "Unauthorized: User ID tidak ditemukan." 
      });
    }

    const histories = await historyService.getHistoryByUserId(userId);
    res.status(200).json({
      status: "success",
      message: "Histori berhasil diambil",
      data: histories,
    });
  } catch (error) {
    // Log error ke terminal biar kita tau masalah aslinya apa
    console.error("Error di getUserHistory:", error); 
    res.status(500).json({ status: "error", message: error.message });
  }
};

// --- 3. REMOVE HISTORY ---
const removeHistory = async (req, res) => {
  try {
    // AUREL UPDATE: Pakai cara aman (Safety Check)
    const userId = req.user ? req.user.id : req.userId;
    const historyId = req.params.id;

    await historyService.deleteHistoryById(historyId, userId);

    res.status(200).json({
      status: "success",
      message: "Histori berhasil dihapus",
    });
  } catch (error) {
    // Cek jika errornya karena "Tidak ditemukan" (404)
    if (error.message.includes("tidak ditemukan")) {
      return res.status(404).json({ status: "error", message: error.message });
    }
    console.error("Error di removeHistory:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// BAGIAN PENTING: Export semua fungsi
module.exports = {
  addHistory,
  getUserHistory,
  removeHistory,
};
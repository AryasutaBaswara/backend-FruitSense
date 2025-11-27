const historyService = require("../services/historyService.js");

const addHistory = async (req, res) => {
  try {
    const userId = req.user.id;
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
    res.status(500).json({ status: "error", message: error.message });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const histories = await historyService.getHistoryByUserId(userId);
    res.status(200).json({
      status: "success",
      message: "Histori berhasil diambil",
      data: histories,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const removeHistory = async (req, res) => {
  try {
    // Pastikan middleware auth Anda mengisi req.user atau req.userId
    // Sesuaikan dengan codingan middleware Anda (biasanya req.userId)
    const userId = req.user ? req.user.id : req.userId;
    const historyId = req.params.id;

    await historyService.deleteHistoryById(historyId, userId);

    res.status(200).json({
      status: "success",
      message: "Histori berhasil dihapus",
    });
  } catch (error) {
    // Cek jika errornya karena "Tidak ditemukan" (404) atau Server Error (500)
    if (error.message.includes("tidak ditemukan")) {
      return res.status(404).json({ status: "error", message: error.message });
    }
    res.status(500).json({ status: "error", message: error.message });
  }
};
// BAGIAN PENTING: Mengekspor handler agar bisa digunakan oleh routes
module.exports = {
  addHistory,
  getUserHistory,
  removeHistory,
};

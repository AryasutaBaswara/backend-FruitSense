const historyService = require('../services/historyService.js');

const addHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fruit_name, image_url, grade, expiration_days, result_summary, analysis_time } = req.body;

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
            status: 'success',
            message: 'Histori berhasil ditambahkan',
            data: newHistory,
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const getUserHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const histories = await historyService.getHistoryByUserId(userId);
        res.status(200).json({
            status: 'success',
            message: 'Histori berhasil diambil',
            data: histories,
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// BAGIAN PENTING: Mengekspor handler agar bisa digunakan oleh routes
module.exports = {
    addHistory,
    getUserHistory,
};
// controllers/fcmController.js
const supabase = require("../config/supabase");
const fcmService = require("../services/fcmService"); // Import service kamu tadi

// 1. Simpan Token ke Database
exports.saveFcmToken = async (req, res) => {
  const userId = req.userId; // Dari middleware auth
  const { fcm_token } = req.body;

  if (!fcm_token) {
    return res.status(400).json({ error: "Token FCM wajib diisi." });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .update({ fcm_token: fcm_token })
      .eq("id", userId)
      .select("id, email, fcm_token")
      .single();

    if (error) throw error;

    res
      .status(200)
      .json({ message: "Token notifikasi berhasil disimpan.", user: data });
  } catch (error) {
    console.error("Save Token Error:", error.message);
    res.status(500).json({ error: "Gagal menyimpan token." });
  }
};

// 2. Test Manual (Opsional)
exports.testSend = async (req, res) => {
  const userId = req.userId;

  // Ambil token user dari DB
  const { data } = await supabase
    .from("users")
    .select("fcm_token")
    .eq("id", userId)
    .single();

  if (!data?.fcm_token)
    return res.status(404).json({ error: "User belum punya token" });

  // Panggil Service kamu
  const result = await fcmService.sendNotification(
    data.fcm_token,
    "Tes Notifikasi",
    "Ini adalah pesan percobaan dari server."
  );

  res.json(result);
};

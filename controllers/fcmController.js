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
  console.log("\n--- 🕵️‍♂️ DEBUGGING NOTIFIKASI ---");
  console.log("🔑 ID dari Token Login:", userId);

  // Cek apakah ID ini cocok dengan Marcelino (998a3...)

  try {
    // Kita select semua kolom biar kelihatan apa yang didapat
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("❌ Error Query Supabase:", error);
      return res.status(500).json({ error: "Database Error", details: error });
    }

    console.log("📦 Data User Ditemukan:", data ? "ADA" : "KOSONG");
    console.log("📱 FCM Token di DB:", data?.fcm_token);

    if (!data?.fcm_token) {
      console.log("⚠️ Masalah: Token NULL atau Kosong");
      return res.status(404).json({
        error: "User belum punya token",
        debug_id: userId,
        db_token_status: data?.fcm_token ? "Ada" : "NULL",
      });
    }

    // Lanjut kirim...
    const result = await fcmService.sendNotification(
      data.fcm_token,
      "Tes Notifikasi",
      "Ini pesan debugging dari server."
    );

    res.json(result);
  } catch (err) {
    console.error("🔥 Crash:", err.message);
    res.status(500).json({ error: err.message });
  }
};

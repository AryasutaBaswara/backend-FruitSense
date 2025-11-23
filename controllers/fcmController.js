const supabase = require("../config/supabase");

exports.storeToken = async (req, res) => {
  const userId = req.userId; // Dari middleware JWT
  const { fcm_token } = req.body;

  if (!fcm_token) {
    return res.status(400).json({ error: "FCM Token wajib dikirim." });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .update({ fcm_token: fcm_token }) // Update kolom fcm_token
      .eq("id", userId)
      .select("id, email, fcm_token")
      .single();

    if (error) throw error;

    res.status(200).json({
      message: "FCM Token berhasil disimpan.",
      user: data,
    });
  } catch (error) {
    console.error("FCM Store Error:", error.message);
    res.status(500).json({ error: "Gagal menyimpan token." });
  }
};

// Test Manual (Opsional)

const fcmService = require("../services/fcmService");
exports.testNotification = async (req, res) => {
  const { token, title, body } = req.body;
  const result = await fcmService.sendNotification(token, title, body);
  res.json(result);
};

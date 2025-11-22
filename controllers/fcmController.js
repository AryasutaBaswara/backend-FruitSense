const supabase = require("../config/supabase");

exports.updateFcmToken = async (req, res) => {
  const userId = req.userId;
  const { fcm_token } = req.body;

  if (!fcm_token) {
    return res.status(400).json({ error: "FCM Token wajib dikirim." });
  }

  const { data, error } = await supabase
    .from("users")
    .update({ fcm_token: fcm_token })
    .eq("id", userId)
    .select("id, email, fcm_token");

  if (error) {
    console.error("Supabase FCM Update Error:", error);
    return res.status(500).json({ error: "Gagal menyimpan FCM token." });
  }

  if (data.length === 0) {
    return res.status(404).json({ error: "Pengguna tidak ditemukan." });
  }

  res
    .status(200)
    .json({ message: "FCM Token berhasil diperbarui.", user: data[0] });
};

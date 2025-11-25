// services/fcmService.js
const admin = require("firebase-admin");

// Pastikan path ini benar mengarah ke file JSON rahasia Anda
// const serviceAccount = require("../firebase-credentials.json");

let serviceAccount;
try {
  // Cek apakah environment variable ada (untuk Production/Railway)
  if (process.env.FIREBASE_CREDENTIALS) {
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  } else {
    // Fallback untuk Localhost (kalau file masih ada di laptop)
    serviceAccount = require("../firebase-credentials.json");
  }
} catch (error) {
  console.error("❌ Gagal memuat kredensial Firebase:", error.message);
}

// Cek agar tidak inisialisasi ganda (mencegah error saat hot-reload)
if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

exports.sendNotification = async (token, title, body) => {
  const message = {
    notification: { title, body },
    token: token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ FCM Sent:", response);
    return { success: true, response };
  } catch (error) {
    console.error("❌ FCM Error:", error);
    // Jangan throw error agar cron job tidak mati total, cukup return false
    return { success: false, error };
  }
};

// services/notificationScheduler.js
const cron = require("node-cron");
const dayjs = require("dayjs");
const supabase = require("../config/supabase");
const { sendNotification } = require("./fcmService"); // Panggil service pengirim

// Logika inti untuk mencari buah yang mendekati busuk (misalnya, <= 3 hari)
const checkExpiredFruits = async () => {
  // 1. Tentukan tanggal batas: 3 hari dari sekarang (YYYY-MM-DD)
  const threeDaysFromNow = dayjs().add(3, "day").format("YYYY-MM-DD");

  // 2. Query data (JOIN inventories dan users untuk mendapatkan FCM token)
  const { data: inventories, error } = await supabase
    .from("inventories")
    // Gunakan PostgREST JOIN untuk mengambil kolom fcm_token dari tabel users
    .select(
      `
            fruit_name, expiration_date, stock_quantity,
            users (fcm_token)
        `
    )
    .lte("expiration_date", threeDaysFromNow) // <= 3 hari dari sekarang
    .neq("stock_quantity", 0); // Hanya jika stok tidak nol

  if (error) {
    console.error("CRON Job Query Error:", error);
    return;
  }

  // 3. Proses dan Kirim Notifikasi
  if (inventories && inventories.length > 0) {
    console.log(`\n[CRON] Ditemukan ${inventories.length} item kritis.`);

    for (const item of inventories) {
      const fcmToken = item.users ? item.users.fcm_token : null;
      const daysLeft = dayjs(item.expiration_date).diff(dayjs(), "days");

      // Hanya kirim jika token ada dan buah belum busuk (>= 0 hari)
      if (fcmToken && daysLeft >= 0) {
        const messageTitle = `🚨 Buah Segera Busuk: ${item.fruit_name}`;
        const messageBody = `Stok ${item.stock_quantity} akan busuk dalam ${daysLeft} hari. Segera dikonsumsi!`;

        sendNotification(fcmToken, messageTitle, messageBody);
      }
    }
  }
};

// Jadwal: Setiap hari pada pukul 08:00 dan 20:00 WIB
exports.startScheduler = () => {
  // Jalankan satu kali saat server start untuk testing dan kemudian jalankan sesuai jadwal
  checkExpiredFruits();

  cron.schedule("0 8,20 * * *", checkExpiredFruits, {
    scheduled: true,
    timezone: "Asia/Jakarta", // Zona Waktu Indonesia Barat
  });
  console.log("Scheduler buah busuk telah dimulai dan diuji.");
};

// services/notificationScheduler.js
const cron = require("node-cron");
const dayjs = require("dayjs");
const supabase = require("../config/supabase");
const { sendNotification } = require("./fcmService"); // Pastikan file ini ada

const checkExpiredFruits = async () => {
  // 1. Tanggal batas: 3 hari dari sekarang
  const threeDaysFromNow = dayjs().add(3, "day").format("YYYY-MM-DD");
  // 2. Tanggal hari ini (agar tidak ambil yg sudah busuk bulan lalu)
  const today = dayjs().format("YYYY-MM-DD");

  console.log(
    `⏰ [CRON] Mengecek buah exp antara ${today} s/d ${threeDaysFromNow}`
  );

  // 3. Query: Ambil yg exp <= 3 hari DAN exp >= hari ini
  const { data: inventories, error } = await supabase
    .from("inventories")
    .select(
      `
            id, fruit_name, expiration_date, stock_quantity,
            users!inner (fcm_token)
        `
    )
    .lte("expiration_date", threeDaysFromNow) // Kurang dari sama dengan H+3
    .gte("expiration_date", today) // Lebih dari sama dengan Hari Ini
    .neq("stock_quantity", 0);

  if (error) {
    console.error("❌ CRON Query Error:", error.message);
    return;
  }

  // 4. Kirim Notif
  if (inventories && inventories.length > 0) {
    console.log(`\n🚨 [CRON] Ditemukan ${inventories.length} item kritis.`);

    for (const item of inventories) {
      // Handle jika users berupa array atau object
      const fcmToken = Array.isArray(item.users)
        ? item.users[0]?.fcm_token
        : item.users?.fcm_token;

      if (fcmToken) {
        const daysLeft = dayjs(item.expiration_date).diff(dayjs(), "days");

        console.log(
          `🚀 Kirim notif: ${item.fruit_name} (Sisa ${daysLeft} hari)`
        );

        const messageTitle = `🚨 Buah Segera Busuk: ${item.fruit_name}`;
        const messageBody = `Stok ${item.stock_quantity} ${item.fruit_name} kamu akan busuk dalam ${daysLeft} hari. Segera habiskan!`;

        // Panggil helper FCM
        await sendNotification(fcmToken, messageTitle, messageBody);
      }
    }
  } else {
    console.log(
      "✅ [CRON] Aman. Tidak ada buah yang mau busuk dalam 3 hari ini."
    );
  }
};

exports.startScheduler = () => {
  // Jalankan sekali saat server start (biar kelihatan log-nya)
  checkExpiredFruits();

  // Jadwal: 08:00 dan 20:00 WIB
  cron.schedule("0 8,20 * * *", checkExpiredFruits, {
    scheduled: true,
    timezone: "Asia/Jakarta",
  });
  console.log("✅ Scheduler buah busuk aktif (08:00 & 20:00 WIB).");
};

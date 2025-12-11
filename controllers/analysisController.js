// controllers/analysisController.js
const supabase = require("../config/supabase");
const { v4: uuidv4 } = require("uuid");
const dayjs = require("dayjs");

// Import Services
const aiService = require("../services/aiService");
const historyService = require("../services/historyService");

// Helper untuk mengubah angka hari menjadi tanggal (YYYY-MM-DD)
const getExpirationDate = (days) => {
  const daysToAdd = parseInt(days) || 0;
  return dayjs().add(daysToAdd, "day").format("YYYY-MM-DD");
};

exports.analyzeAndSave = async (req, res) => {
  const userId = req.userId; // Dari middleware JWT
  const imageFile = req.file; // Dari middleware Multer
  const { stock_quantity } = req.body;

  // 1. Validasi Input
  if (!stock_quantity || !imageFile) {
    return res
      .status(400)
      .json({ error: "Kuantitas stok dan file gambar wajib diisi." });
  }

  let imageUrl = null;
  const bucketName = "fruit-images";
  // Buat nama file unik: user_id/uuid.jpg
  const fileExtension = imageFile.originalname.split(".").pop();
  const filePath = `${userId}/${uuidv4()}.${fileExtension}`;

  try {
    // --- LANGKAH 2: PANGGIL AI SERVICE (Ke Python) ---
    // Ini akan mengirim gambar ke server Python dan dapet output JSON mentah
    console.log("🔄 Mengirim gambar ke AI Server...");
    const rawAI = await aiService.predictImage(imageFile);

    // --- LANGKAH 3: PROSES DATA (Auto-Correct & Nutrisi) ---
    // Ini akan memperbaiki nama buah (misal Jambu -> Pisang) dan ambil nutrisinya
    const aiResult = await aiService.processLabels(
      rawAI.predicted_fruit_name,
      rawAI.predicted_grade_label,
      rawAI.confidence,
      imageFile.buffer, // <-- Tambahan Parameter 4
      imageFile.mimetype
    );
    console.log("✅ Hasil Analisis:", aiResult.summary);

    if (aiResult.is_valid === false) {
      console.warn("❌ Gambar ditolak:", aiResult.summary);
      return res.status(400).json({
        error: "Gambar tidak dikenali atau buah tidak didukung.",
        details: aiResult.summary,
      });
    }

    // --- LANGKAH 4: UPLOAD GAMBAR KE SUPABASE ---
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, imageFile.buffer, { contentType: imageFile.mimetype });

    if (uploadError) throw new Error("Gagal mengupload gambar ke Storage.");

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    imageUrl = publicUrlData.publicUrl;

    // --- LANGKAH 5: HITUNG TANGGAL BUSUK ---
    const expirationDate = getExpirationDate(aiResult.expiration_days);

    // --- LANGKAH 6: SIMPAN KE HISTORY (Log) ---
    const historyPayload = {
      user_id: userId,
      image_url: imageUrl,
      fruit_name: aiResult.fruit_name,
      grade: aiResult.grade,
      expiration_days: aiResult.expiration_days,
      result_summary: aiResult.summary,
    };

    console.log("🔍 DEBUG PAYLOAD:", historyPayload);
    console.log("🔍 DEBUG AI RESULT:", aiResult);
    // Panggil fungsi punya temanmu
    await historyService.createHistory(historyPayload);

    // --- LANGKAH 7: SIMPAN KE INVENTORY (Stok) ---
    const inventoryData = {
      user_id: userId,
      image_url: imageUrl,
      fruit_name: aiResult.fruit_name,
      grade: aiResult.grade,
      nutrients: aiResult.nutrients, // <-- Nutrisi otomatis masuk di sini!
      expiration_date: expirationDate,
      stock_quantity: stock_quantity,
    };

    const { data: inventoryItem, error: inventoryError } = await supabase
      .from("inventories")
      .insert([inventoryData])
      .select("*");

    if (inventoryError) throw new Error("Gagal menyimpan inventory.");

    // --- RESPONSE SUKSES ---
    res.status(201).json({
      message: "Analisis Berhasil! Data disimpan.",
      analysis_result: {
        detected: aiResult.fruit_name,
        grade: aiResult.grade,
        nutrients: aiResult.nutrients,
        days_left: aiResult.expiration_days,
      },
      inventory: inventoryItem[0],
    });
  } catch (error) {
    console.error("❌ Analysis Flow Error:", error.message);

    // Cleanup: Hapus file dari Storage jika database insert gagal agar tidak jadi sampah
    if (imageUrl) {
      await supabase.storage.from(bucketName).remove([filePath]);
    }

    return res
      .status(500)
      .json({ error: error.message || "Terjadi kesalahan sistem." });
  }
};

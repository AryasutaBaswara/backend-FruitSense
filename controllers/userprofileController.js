const supabase = require("../config/supabase");
const { v4: uuidv4 } = require("uuid");

// GET: Ambil Data Profil (Nama, Email, Foto)
exports.getProfile = async (req, res) => {
  const userId = req.userId; // Dari middleware

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, avatar_url, fcm_token")
      .eq("id", userId)
      .single();

    if (error) throw error;

    let finalAvatar = data.avatar_url;

    // Kalo kosong, Backend generate link inisial
    if (!finalAvatar) {
      // Contoh: https://ui-avatars.com/api/?name=Aryasuta+Baswara
      finalAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        data.name
      )}&background=random`;
    }

    res.status(200).json({
      message: "Profil berhasil diambil",
      user: {
        ...data,
        avatar_url: finalAvatar, // Frontend terima link siap pakai
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT: Update Profil (Ganti Nama & Upload Avatar)
exports.updateProfile = async (req, res) => {
  const userId = req.userId;
  const { name } = req.body;
  const imageFile = req.file; // Dari middleware multer

  console.log(`🔍 Request Masuk -> UserID: ${userId}`);
  console.log(`📦 Data Body:`, req.body);
  console.log(
    `📁 File Image:`,
    imageFile ? `Ada (${imageFile.originalname})` : "Tidak Ada"
  );

  try {
    let updates = {
      updated_at: new Date().toISOString(),
    };

    if (name) updates.name = name;

    // --- LOGIC UPLOAD AVATAR (Jika user kirim file) ---
    if (imageFile) {
      console.log("🚀 Memulai proses upload ke Supabase Storage...");
      const bucketName = "fruit-images"; // Kita pakai bucket yg sama biar praktis
      const fileExtension = imageFile.originalname.split(".").pop();
      // Simpan di folder khusus 'avatars/' biar rapi
      const filePath = `avatars/${userId}/$${require("uuid").v4()}.${fileExtension}`;

      // 1. Upload ke Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, imageFile.buffer, {
          contentType: imageFile.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error("❌ Gagal Upload ke Storage:", uploadError); // LOG ERROR SUPABASE ASLI
        throw new Error(`Upload Failed: ${uploadError.message}`);
      }

      console.log("✅ Upload Berhasil:", uploadData);
      // 2. Ambil Public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      updates.avatar_url = publicUrlData.publicUrl;
      console.log("🔗 Public URL:", updates.avatar_url);
    }

    // --- UPDATE DATABASE ---
    console.log("💾 Mengupdate database users...");
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select("id, email, name, avatar_url")
      .single();

    if (error) {
      console.error("❌ Gagal Update Database:", error); // LOG ERROR DB ASLI
      throw new Error(`Database Update Failed: ${error.message}`);
    }

    res.status(200).json({
      message: "Profil berhasil diperbarui.",
      user: data,
    });
  } catch (error) {
    console.error("🔥 CRITICAL ERROR di updateProfile:", error);
    res.status(500).json({
      error: "Gagal memperbarui profil.",
      details: error.message || JSON.stringify(error),
    });
  }
};

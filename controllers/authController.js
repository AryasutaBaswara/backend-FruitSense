// controllers/authController.js
const supabase = require("../config/supabase");

// POST: Register/Signup User
exports.registerUser = async (req, res) => {
  // Kita asumsikan frontend hanya mengirim email, password, dan nama saat registrasi
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ error: "Email, password, dan name wajib diisi." });
  }

  // Menggunakan supabase.auth.signUp() untuk keamanan dan token otomatis
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    // Menyimpan nama di metadata pengguna (user_metadata)
    options: {
      data: {
        name: name,
      },
    },
  });

  if (error) {
    console.error("Supabase Auth Error:", error);
    return res.status(400).json({ error: error.message });
  }

  // Supabase biasanya memerlukan konfirmasi email, jadi pesan ini penting
  res.status(201).json({
    message: "Registrasi berhasil. Harap cek email Anda untuk konfirmasi.",
    user: data.user,
    session: data.session,
  });
};

// POST: Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi." });
  }

  // validasi format email sederhana
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Email tidak valid." });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Supabase Login Error:", error);

      const msg = (error?.message || "").toString().toLowerCase();

      // Deteksi error kredensial salah
      if (
        msg.includes("invalid") ||
        msg.includes("wrong") ||
        error?.status === 400
      ) {
        return res.status(401).json({ error: "Email atau password salah." });
      }

      // Deteksi kalau email belum terkonfirmasi
      if (
        msg.includes("confirm") ||
        msg.includes("verification") ||
        error?.status === 403
      ) {
        return res
          .status(403)
          .json({ error: "Email belum dikonfirmasi. Cek email Anda." });
      }

      // fallback untuk error lain
      return res.status(500).json({ error: "Gagal login. Silakan coba lagi." });
    }

    if (!data || !data.session) {
      return res
        .status(500)
        .json({ error: "Gagal membuat sesi. Silakan coba lagi." });
    }

    // sukses
    res.status(200).json({
      message: "Login berhasil.",
      session: data.session,
      user: data.user,
    });
  } catch (err) {
    console.error("Unexpected login error:", err);
    return res
      .status(500)
      .json({ error: "Terjadi kesalahan server saat login." });
  }
};

exports.logoutUser = async (req, res) => {
  const userId = req.userId;

  res.status(200).json({
    message: `Logout berhasil. Sesi untuk user ID ${userId} telah diakhiri di sisi server.`,
    user_id: userId,
  });
};

// controllers/authController.js (Koreksi Final untuk Self-Service Reset)

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email wajib diisi." });

  // Ini akan kirim email berisi OTP (karena template sudah diubah)
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    console.error("Forgot Password Error:", error.message);
    // Tetap return 200 agar tidak bocor email mana yang terdaftar (Security Best Practice)
    // Atau return 400/500 kalau mau eksplisit saat dev
    return res.status(500).json({ error: "Gagal mengirim email." });
  }

  res.status(200).json({
    message: "Jika email terdaftar, kode OTP reset password telah dikirim.",
  });
};

exports.verifyRecovery = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email dan kode OTP wajib diisi." });
  }

  // Verifikasi OTP tipe 'recovery' (khusus reset password)
  const { data, error } = await supabase.auth.verifyOtp({
    email: email,
    token: otp,
    type: "recovery",
  });

  if (error) {
    return res.status(400).json({ error: "Kode OTP salah atau kadaluarsa." });
  }

  // PENTING: Ini akan mengembalikan SESSION (Token JWT)
  // User dianggap "Login Sementara" untuk bisa ganti password
  res.status(200).json({
    message: "Kode valid! Silakan gunakan token ini untuk ganti password.",
    session: data.session,
  });
};

exports.resetPasswordFinal = async (req, res) => {
  const { new_password } = req.body;

  // Ingat: User harus kirim Header Authorization: Bearer <TOKEN DARI LANGKAH 2>

  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ error: "Password baru minimal 6 karakter." });
  }

  // Fungsi updateUser otomatis pakai Token dari header
  const { data, error } = await supabase.auth.updateUser({
    password: new_password,
  });

  if (error) {
    return res.status(500).json({ error: "Gagal mengganti password." });
  }

  res.status(200).json({
    message: "Password berhasil diganti! Silakan login kembali.",
  });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  // Basic validation
  if (!email || !otp) {
    return res.status(400).json({ error: "Email dan kode OTP wajib diisi." });
  }
  // simple email check
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Email tidak valid." });
  }
  // OTP format: 6 digit (sesuaikan jika berbeda)
  if (!/^\d{6}$/.test(String(otp))) {
    return res.status(400).json({ error: "Kode OTP harus 6 digit angka." });
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: String(otp),
      type: "signup", // atau "recovery" jika untuk reset password
    });

    if (error) {
      console.warn("Supabase verifyOtp failed:", error.message || error);
      return res.status(400).json({ error: "Kode OTP salah atau kadaluarsa." });
    }

    // sukses: data.session dan data.user mungkin tersedia tergantung SDK/version
    // Opsional: set cookie httpOnly dengan session.access_token untuk auto-login
    // res.cookie('sb_token', data.session.access_token, { httpOnly: true, secure: true });

    return res.status(200).json({
      message: "Verifikasi berhasil.",
      session: data?.session ?? null,
      user: data?.user ?? null,
    });
  } catch (err) {
    console.error("verifyOtp unexpected error:", err);
    return res
      .status(500)
      .json({ error: "Terjadi kesalahan server saat verifikasi OTP." });
  }
};

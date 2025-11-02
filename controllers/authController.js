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

  // Menggunakan supabase.auth.signInWithPassword()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error("Supabase Login Error:", error);
    return res.status(401).json({
      error: "Kredensial tidak valid atau pengguna belum dikonfirmasi.",
    });
  }

  // Mengembalikan token sesi (JWT) yang akan digunakan frontend untuk permintaan aman
  res.status(200).json({
    message: "Login berhasil.",
    session: data.session, // Berisi access_token (JWT) dan refresh_token
    user: data.user,
  });
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
  const { email } = req.body; // Hanya butuh email dari user

  if (!email) {
    return res.status(400).json({ error: "Email wajib diisi." });
  }

  // Panggil fungsi Supabase untuk mengirim email reset
  // PERHATIAN: Ganti URL di redirectTo dengan URL halaman reset password di aplikasi/web Anda
  // Jika tidak diisi, Supabase menggunakan default yang mungkin tidak bekerja.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:8080/reset-password", // <-- GANTI DENGAN URL ASLI!
  });

  if (error) {
    console.error("Supabase Password Reset Error:", error);
    // Mengembalikan error 500 karena masalah SMTP/koneksi
    return res
      .status(500)
      .json({ error: "Gagal mengirim email reset password." });
  }

  // Respon yang aman: Beri tahu user untuk cek email (terlepas dari apakah akun terdaftar).
  res.status(200).json({
    message:
      "Jika akun terdaftar, email untuk reset password telah dikirimkan ke alamat Anda. Cek Mailtrap.",
  });
};

exports.resetPasswordFinal = async (req, res) => {
  // 1. Token Reset (Access Token) datang di Header Authorization
  const authHeader = req.headers.authorization;
  const { new_password } = req.body;

  if (!authHeader || !new_password || new_password.length < 6) {
    return res.status(400).json({
      error:
        "Token otorisasi dan password baru minimal 6 karakter wajib diisi.",
    });
  }

  // Token yang dikirim adalah token reset dari URL
  const resetToken = authHeader.split(" ")[1];

  try {
    // DEBUG: log token (hapus log ini di produksi)
    console.log("Reset token (first 20 chars):", resetToken?.slice(0, 20));

    // 1) Coba panggil SDK dengan beberapa bentuk argumen (tergantung versi SDK)
    let updateResult;
    try {
      // bentuk modern: second arg sebagai opsi object (kadang { accessToken })
      updateResult = await supabase.auth.updateUser(
        { password: new_password },
        { accessToken: resetToken }
      );
    } catch (sdkErr) {
      // fallback: beberapa versi menerima token langsung sebagai second param
      try {
        updateResult = await supabase.auth.updateUser(
          { password: new_password },
          resetToken
        );
      } catch (e) {
        // biarkan updateResult undefined untuk melakukan fallback REST
        console.warn(
          "SDK updateUser attempts failed:",
          sdkErr?.message || sdkErr,
          e?.message || e
        );
      }
    }

    // Jika SDK mengembalikan error, atau tidak tersedia, pakai REST API Supabase sebagai fallback
    if (!updateResult || updateResult.error) {
      // Fallback: PUT ke /auth/v1/user dengan Authorization: Bearer <resetToken>
      const fetchImpl = global.fetch || require("node-fetch");
      const supabaseUrl = process.env.SUPABASE_URL;
      const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
      const url = supabaseUrl.replace(/\/$/, "") + "/auth/v1/user";

      const resp = await fetchImpl(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${resetToken}`,
          apikey: anonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: new_password }),
      });

      const respBody = await resp.text();
      let parsed;
      try {
        parsed = JSON.parse(respBody);
      } catch (_) {
        parsed = respBody;
      }

      if (!resp.ok) {
        console.error("REST reset failed:", resp.status, parsed);
        throw new Error(
          typeof parsed === "object" ? JSON.stringify(parsed) : String(parsed)
        );
      }
    }

    // 3. Response Sukses
    res.status(200).json({
      message:
        "Password berhasil direset. Silakan login dengan password baru Anda.",
    });
  } catch (error) {
    console.error("Final Reset Error Detailed:", error);
    // Error sering terjadi jika token sudah kadaluarsa/salah
    return res
      .status(401)
      .json({ error: "Reset gagal. Tautan kadaluarsa atau tidak valid." });
  }
};

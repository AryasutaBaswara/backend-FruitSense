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

// config/supabase.js
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Kesalahan: Variabel Supabase tidak ditemukan. Cek file .env Anda."
  );
  // Matikan proses jika konfigurasi gagal
  process.exit(1);
}

// Inisialisasi klien Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Ekspor klien agar bisa diakses oleh controller
module.exports = supabase;

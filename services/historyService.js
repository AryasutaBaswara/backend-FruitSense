// services/historyService.js

const supabase = require("../config/supabase.js");

const createHistory = async (historyData) => {
  const { data, error } = await supabase
    .from("history")
    .insert([historyData])
    .select()
    .single();

  if (error) {
    console.error("Supabase Insert Error:", error.message);
    throw new Error("Gagal menyimpan histori ke database.");
  }
  return data;
};

const getHistoryByUserId = async (userId) => {
  const { data, error } = await supabase
    .from("history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase Select Error:", error.message);
    throw new Error("Gagal mengambil histori dari database.");
  }
  return data;
};

const deleteHistoryById = async (historyId, userId) => {
  // Kita delete dengan filter ID dan UserID (biar tidak hapus punya orang lain)
  const { error, count } = await supabase
    .from("history")
    .delete({ count: "exact" }) // Minta info berapa baris yang dihapus
    .eq("id", historyId)
    .eq("user_id", userId);

  if (error) {
    console.error("Supabase Delete Error:", error.message);
    throw new Error("Gagal menghapus histori.");
  }

  // Jika count 0, berarti data tidak ketemu atau bukan punya user ini
  if (count === 0) {
    throw new Error("Histori tidak ditemukan atau Anda tidak memiliki akses.");
  }

  return true;
};

// BAGIAN PENTING: Mengekspor semua fungsi agar bisa digunakan file lain
module.exports = {
  createHistory,
  getHistoryByUserId,
  deleteHistoryById,
};

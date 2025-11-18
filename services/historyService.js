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

// BAGIAN PENTING: Mengekspor semua fungsi agar bisa digunakan file lain
module.exports = {
  createHistory,
  getHistoryByUserId,
};

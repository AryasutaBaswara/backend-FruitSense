require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

(async () => {
  const { data, error } = await supabase
    .from("users")
    .insert([{ email: "test2@ok.com", name: "tester2", is_verified: false }])
    .select(); // 👈 tambahkan ini

  if (error) console.error("Gagal insert:", error);
  else console.log("Berhasil insert:", data);
})();

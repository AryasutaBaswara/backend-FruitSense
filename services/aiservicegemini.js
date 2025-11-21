const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

// 1. Inisialisasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Fungsi untuk meminta resep ke Gemini berdasarkan nama buah
 * @param {string} fruitName
 * @returns {object} - Objek resep (title, ingredients, instructions, cooking_time)
 */
const generateRecipe = async (fruitName) => {
  try {
    const prompt = `
Buatkan satu resep makanan atau minuman sehat yang lezat menggunakan bahan utama: ${fruitName}.

PENTING: Berikan output HANYA dalam format JSON murni tanpa markdown, tanpa pembungkus kode, dan tanpa teks tambahan.
Struktur JSON harus seperti ini:
{
  "title": "Nama Resep yang Menarik",
  "ingredients": "Daftar bahan dipisahkan koma (contoh: 2 buah pisang, 100ml susu, madu)",
  "instructions": "Langkah-langkah pembuatan yang jelas dan singkat (paragraf atau poin-poin)",
  "cooking_time": "Estimasi waktu (contoh: 10 menit)"
}

Pastikan resepnya praktis untuk dibuat di rumah. Bahasa: Indonesia.
`.trim();

    // 3. Kirim ke Gemini (penanganan respons yang lebih toleran)
    const result = await model.generateContent(prompt);

    // Beberapa SDK mengembalikan struktur berbeda — coba beberapa kemungkinan
    let text = "";
    if (result == null) {
      throw new Error("Empty response from Gemini");
    }

    // case: result.response.text() async function
    if (result.response && typeof result.response.text === "function") {
      text = await result.response.text();
    } else if (typeof result === "string") {
      text = result;
    } else if (typeof result.response === "string") {
      text = result.response;
    } else if (result.outputText) {
      text = result.outputText;
    } else {
      // fallback: stringify result
      text = JSON.stringify(result);
    }

    // 4. Bersihkan kode fence atau teks tambahan jika ada
    text = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // 5. Jika AI masih menyertakan teks sebelum/ sesudah JSON, ekstrak bagian JSON pertama
    let jsonText = text;
    try {
      // coba parse langsung
      return JSON.parse(jsonText);
    } catch (_) {
      // cari substring yang dimulai dengan { dan diakhiri dengan }
      const firstBrace = text.indexOf("{");
      const lastBrace = text.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonText = text.slice(firstBrace, lastBrace + 1);
        try {
          return JSON.parse(jsonText);
        } catch (err) {
          // lanjut ke error di bawah
        }
      }
    }

    // Jika sampai sini gagal parsing, tampilkan error dengan sample (potong panjangnya)
    const sample = text.length > 400 ? text.slice(0, 400) + "..." : text;
    console.error("Failed to parse JSON from Gemini. Sample:", sample);
    throw new Error("Gagal mem-parse JSON dari respons AI.");
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new Error("Gagal membuat resep dengan AI.");
  }
};

module.exports = {
  generateRecipe,
};

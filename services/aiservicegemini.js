// services/aiservicegemini.js

const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const recipeSchema = {
  description: "Resep Fruitsense",
  type: SchemaType.OBJECT,
  properties: {
    judul_resep: { type: SchemaType.STRING, nullable: false },
    deskripsi: { type: SchemaType.STRING, nullable: false },
    estimasi_kalori: { type: SchemaType.NUMBER, nullable: false },
    bahan_digunakan: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, nullable: false },
    langkah_pembuatan: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, nullable: false },
  },
  required: ["judul_resep", "bahan_digunakan", "langkah_pembuatan"]
};

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: recipeSchema,
  },
});

const generateRecipe = async (inventoryList) => {
  try {
    console.log("⏳ Gemini sedang berpikir..."); // Tambahan log biar tau proses jalan
    const prompt = `
      Kamu adalah Chef Fruitsense. Buat resep sehat dari bahan: ${inventoryList.join(", ")}.
      Pastikan Output JSON.
    `;
    
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
    
  } catch (error) {
    console.error("Error di AI Service:", error);
    throw new Error("Gagal meracik resep");
  }
};

module.exports = { generateRecipe };
const axios = require("axios");
const formData = require("form-data");
const dayjs = require("dayjs");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const ML_SERVER_URL =
  process.env.ML_SERVER_URL || "http://localhost:5001/analyze";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_VISION_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const SUPPORTED_FRUITS = [
  "Apple",
  "Banana",
  "Durian",
  "Grape",
  "Guava",
  "Jackfruit",
  "Mango",
  "Orange",
  "Papaya",
  "Pineapple",
  "Watermelon",
];

const FRUIT_NUTRIENTS = {
  Apple: "Vitamin C, Fiber, Potassium, Antioxidants",
  Banana: "Potassium, Vitamin B6, Vitamin C, Magnesium",
  Durian: "Vitamin C, B Vitamins, Potassium, Healthy Fats",
  Grape: "Vitamin C, Vitamin K, Antioxidants (Resveratrol)",
  Guava: "Vitamin C (High), Fiber, Potassium, Vitamin A",
  Jackfruit: "Vitamin C, Potassium, Dietary Fiber, Magnesium",
  Mango: "Vitamin C, Vitamin A, Folate, Fiber",
  Orange: "Vitamin C, Folate, Potassium, Thiamine",
  Papaya: "Vitamin C, Vitamin A, Folate, Potassium",
  Pineapple: "Vitamin C, Manganese, Bromelain (Enzyme)",
  Watermelon: "Vitamin A, Vitamin C, Lycopene, Hydration (92% Water)",
};

// --- HELPER GEMINI ---
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

// --- FUNGSI TANYA GEMINI ---
const askGeminiVision = async (imageBuffer, mimeType) => {
  console.log("🤖 Mengaktifkan Mode Dewa (Gemini Vision)...");
  const prompt = `Peran kamu adalah Ahli Kualitas Buah (Fruit Grader) yang SANGAT KRITIS dan TELITI.
    Analisis gambar ini untuk menentukan jenis buah dan kualitasnya.
    
    Output JSON Murni:
    {
        "fruit_name": "Nama Buah (English)",
        "grade": "Grade A/Grade B/Grade C/Rotten"
    }
    
    KRITERIA GRADING (WAJIB PATUH):
    1. Grade A (Perfect): 
       - Kulit mulus 100%, warna cerah merata.
       - TIDAK ADA bintik, goresan, atau kerutan sedikitpun.
       - Bentuk simetris sempurna.
    
    2. Grade B (Good/Ripe):
       - Masih layak makan tapi tidak sempurna.
       - Ada SEDIKIT bintik kecil, warna tidak rata, atau goresan halus.
    
    3. Grade C (Poor/Old):
       - Terlihat layu, kulit mulai keriput/lembek.
       - Ada memar (bruise), bintik hitam yang jelas, atau noda besar.
       - Warna kusam/pucat.
       - JIKA RAGU ANTARA B DAN C, PILIH C.
    
    4. Rotten (Busuk):
       - Ada JAMUR (putih/abu-abu), hancur, berair, atau noda hitam busuk yang parah.
    
    Jika bukan buah, fruit_name="Unknown".`;

  try {
    const imagePart = fileToGenerativePart(imageBuffer, mimeType);
    const result = await geminiModel.generateContent([prompt, imagePart]);
    const text = result.response
      .text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(text);
  } catch (e) {
    console.error("Gemini Error:", e.message);
    return null;
  }
};

/**
 * FUNGSI 1: Kirim Gambar ke Python
 * Tugasnya cuma jadi kurir: Kirim gambar -> Terima JSON mentah
 */

exports.predictImage = async (imageFile) => {
  try {
    const form = new formData();
    form.append("image", imageFile.buffer, imageFile.originalname);
    const response = await axios.post(ML_SERVER_URL, form, {
      headers: { ...form.getHeaders() },
    });
    return response.data; // Kembalikan JSON mentah dari server Python
  } catch (error) {
    console.error("Error mengirim gambar ke server ML:", error);
    throw new Error("Gagal mengirim gambar ke server ML.");
  }
};

/**
 * FUNGSI 2: Logic Cerdas (Heuristic / Post-Processing)
 * Di sinilah kita memperbaiki kesalahan AI
 */

exports.processLabels = async (
  predictedFruit,
  predictedGradeLabel,
  confidence,
  imageBuffer,
  mimeType
) => {
  // 🛑 CEK 1: Apakah Python bilang "Unknown"? (Confidence rendah)
  console.log(
    `🔍 AI Result -> Fruit: ${predictedFruit}, Grade: ${predictedGradeLabel}, Confidence: ${confidence}`
  );

  let finalFruitName = predictedFruit;
  let finalGrade = predictedGradeLabel || "";
  let source = "Local Model";
  // Default string kosong biar aman

  if (
    true ||
    confidence < 0.6 ||
    !predictedFruit ||
    predictedFruit === "Unknown"
  ) {
    // Panggil Gemini
    const geminiResult = await askGeminiVision(imageBuffer, mimeType);

    if (geminiResult && geminiResult.fruit_name !== "Unknown") {
      console.log("✨ Gemini menyelamatkan hari!", geminiResult);

      // Override hasil Python dengan hasil Gemini
      finalFruitName = geminiResult.fruit_name;
      // Mapping grade Gemini ke format kita (biar masuk if-else di bawah)
      let gGrade = (geminiResult.grade || "").toLowerCase();
      if (gGrade.includes("grade a")) finalGrade = "grade_a";
      else if (gGrade.includes("grade b")) finalGrade = "grade_b";
      else if (gGrade.includes("grade c")) finalGrade = "grade_c";
      else if (gGrade.includes("rotten")) finalGrade = "rotten";
      else finalGrade = gGrade; // Fallback
    } else {
      // Kalau Gemini juga nyerah, baru kita return Invalid
      return {
        is_valid: false,
        summary: `Objek tidak dikenali (Python: ${(confidence * 100).toFixed(
          0
        )}%, Gemini: Gagal).`,
      };
    }
  }

  const pFruit = (finalFruitName || "").toLowerCase();
  const pGrade = (finalGrade || "").toLowerCase();

  finalFruitName = pFruit.charAt(0).toUpperCase() + pFruit.slice(1);
  let baseDays = 3;

  if (pGrade.includes("banana")) finalFruitName = "Banana";
  else if (pGrade.includes("apple")) finalFruitName = "Apple";
  else if (pGrade.includes("guava")) finalFruitName = "Guava";
  else if (pGrade.includes("orange")) finalFruitName = "Orange";
  else if (pGrade.includes("mango")) finalFruitName = "Mango";
  else if (pGrade.includes("grape")) finalFruitName = "Grape";
  else if (pGrade.includes("durian")) finalFruitName = "Durian";
  else if (pGrade.includes("watermelon")) finalFruitName = "Watermelon";
  else if (pGrade.includes("jackfruit")) finalFruitName = "Jackfruit";
  else if (pGrade.includes("pineapple")) finalFruitName = "Pineapple";
  else if (pGrade.includes("papaya")) finalFruitName = "Papaya";

  // Fallback standarisasi jika tidak ada konflik
  if (finalFruitName.toLowerCase() === "banana") finalFruitName = "Banana";
  if (finalFruitName.toLowerCase() === "apple") finalFruitName = "Apple";
  if (finalFruitName.toLowerCase() === "guava") finalFruitName = "Guava";
  if (finalFruitName.toLowerCase() === "orange") finalFruitName = "Orange";
  if (finalFruitName.toLowerCase() === "mango") finalFruitName = "Mango";
  if (finalFruitName.toLowerCase() === "grape") finalFruitName = "Grape";
  if (finalFruitName.toLowerCase() === "durian") finalFruitName = "Durian";
  if (finalFruitName.toLowerCase() === "watermelon")
    finalFruitName = "Watermelon";
  if (finalFruitName.toLowerCase() === "jackfruit")
    finalFruitName = "Jackfruit";
  if (finalFruitName.toLowerCase() === "pineapple")
    finalFruitName = "Pineapple";
  if (finalFruitName.toLowerCase() === "papaya") finalFruitName = "Papaya";

  const isSupported = SUPPORTED_FRUITS.includes(finalFruitName);
  if (!isSupported) {
    return {
      is_valid: false,
      summary: `Maaf, buah '${finalFruitName}' belum didukung oleh sistem.`,
    };
  }

  const finalNutrients =
    FRUIT_NUTRIENTS[finalFruitName] || "Vitamins, Fiber, Minerals";
  // --- LOGIC MAPPING GRADE TO DAYS ---
  if (pGrade.includes("grade_a") || pGrade.includes("_a")) {
    baseDays = 14;
    finalGrade = "Grade A ";
  } else if (pGrade.includes("grade_b") || pGrade.includes("_b")) {
    baseDays = 7;
    finalGrade = "Grade B ";
  } else if (pGrade.includes("grade_c") || pGrade.includes("_c")) {
    baseDays = 3;
    finalGrade = "Grade C ";
  } else if (pGrade.includes("rotten") || pGrade.includes("busuk")) {
    baseDays = 0;
    finalGrade = "Rotten ";
  } else {
    // Jika grade tidak dikenali (misal dari Gemini formatnya beda), default ke B
    baseDays = 3;
    finalGrade = finalGrade || "Unknown Grade";
  }

  const variance = Math.floor(Math.random() * 3) - 1;
  let expirationDays = Math.max(0, baseDays + variance);

  // force 0 days if rotten
  if (finalGrade.includes("Rotten")) expirationDays = 0;

  return {
    is_valid: true,
    fruit_name: finalFruitName,
    grade: finalGrade,
    nutrients: finalNutrients,
    expiration_days: expirationDays,
    summary: `${finalFruitName} - ${finalGrade}. Contains: ${finalNutrients}.`,
  };
};

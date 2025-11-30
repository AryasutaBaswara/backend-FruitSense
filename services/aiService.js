const axios = require("axios");
const formData = require("form-data");
const dayjs = require("dayjs");

const ML_SERVER_URL =
  process.env.ML_SERVER_URL || "http://localhost:5001/analyze";

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

exports.processLabels = async (predictedFruit, predictedGradeLabel) => {
  // 🛑 CEK 1: Apakah Python bilang "Unknown"? (Confidence rendah)
  console.log("------------------------------------------------");
  console.log("🔍 DEBUG AI SERVICE:");
  console.log("👉 Raw Fruit from Python:", predictedFruit);
  console.log("👉 Raw Grade from Python:", predictedGradeLabel);
  console.log("------------------------------------------------");

  if (!predictedFruit || predictedFruit === "Unknown") {
    return {
      is_valid: false, // Tanda untuk Controller: JANGAN SIMPAN
      summary: "Objek tidak dikenali atau bukan buah yang didukung.",
    };
  }

  const pFruit = predictedFruit.toLowerCase();
  const pGrade = predictedGradeLabel.toLowerCase();

  let finalFruitName = pFruit;
  let finalGrade = "unknown";
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
      is_valid: false, // Tanda untuk Controller: JANGAN SIMPAN
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
  }

  const variance = Math.floor(Math.random() * 3) - 1;
  let expirationDays = Math.max(0, baseDays + variance);

  // force 0 days if rotten
  if (finalGrade.includes("Rotten")) expirationDays = 0;

  return {
    fruit_name: finalFruitName,
    grade: finalGrade,
    nutrients: finalNutrients,
    expiration_days: expirationDays,
    summary: `${finalFruitName} - ${finalGrade}. Contains: ${finalNutrients}.`,
  };
};

// config/firebase.js
const admin = require("firebase-admin");
require("dotenv").config();

let serviceAccount;

// Cek: Apakah kita di Railway (pakai ENV) atau di Local (pakai File)?
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Parsing JSON string dari Railway Variables
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Fallback ke file lokal (buat development di laptop)
  try {
    serviceAccount = require("./firebaseServiceAccount.json");
  } catch (e) {
    console.error(
      "❌ Gagal load firebase config. Pastikan variable atau file ada."
    );
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const messaging = admin.messaging();
module.exports = { messaging };

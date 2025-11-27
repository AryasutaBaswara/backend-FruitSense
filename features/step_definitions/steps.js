const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("chai");

// --- 1. DATABASE BOHONGAN (MOCK DATA) ---
// Ini kredensial yang dianggap "Benar" oleh sistem
const CORRECT_EMAIL = "user@example.com";
const CORRECT_PASSWORD = "password123";

// Variable untuk menyimpan status aplikasi saat tes berjalan
let currentPage = "";
let displayedMessage = "";

// --- 2. STEP DEFINITIONS ---

// GIVEN: Kondisi Awal
Given("the user is on the login page", function () {
  // Reset kondisi seolah-olah baru buka aplikasi
  currentPage = "login_page";
  displayedMessage = "";
  console.log("\n[TEST START] User membuka halaman Login.");
});

// WHEN: User melakukan aksi (Input Email & Password)
When("the user enters {string} and {string}", function (email, password) {
  console.log(
    `[ACTION] User mengetik Email: "${email}" dan Password: "${password}"`
  );

  // Logika Pengecekan Sederhana
  if (email === CORRECT_EMAIL && password === CORRECT_PASSWORD) {
    // Jika benar, pindahkan user ke dashboard
    currentPage = "dashboard";
  } else {
    // Jika salah, tetap di login page dan tampilkan error
    currentPage = "login_page";
    displayedMessage = "Invalid email or password";
  }
});

// THEN (Skenario Sukses): Cek apakah pindah halaman
Then("they should be redirected to the dashboard", function () {
  // Pastikan halaman sekarang adalah dashboard
  expect(currentPage).to.equal("dashboard");
  console.log("[ASSERT] Sukses! User berhasil masuk ke Dashboard.");
});

// THEN (Skenario Gagal): Cek pesan error
Then("they should see an error message {string}", function (expectedMessage) {
  // 1. Pastikan User MASIH di halaman login (karena gagal)
  expect(currentPage).to.equal("login_page");

  // 2. Pastikan pesan error yang muncul sesuai
  expect(displayedMessage).to.equal(expectedMessage);
  console.log(`[ASSERT] Sukses! Pesan error muncul: "${displayedMessage}"`);
});

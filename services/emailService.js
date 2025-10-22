// services/emailService.js
const nodemailer = require("nodemailer");
const supabase = require("../config/supabase");

// --- PENTING: GANTI DENGAN KREDENSIAL MAILTRAP ANDA ---
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io", // Host Mailtrap Anda
  port: 2525, // Port Mailtrap Anda
  secure: false, // Gunakan false untuk port 2525 atau 587
  auth: {
    user: "c374b2cb3e9523",
    pass: "c374b2cb3e9523",
  },
});
// ----------------------------------------------------

/**
 * Mengirim email verifikasi kustom, menggunakan link verifikasi dari Supabase.
 */
exports.sendVerificationEmail = async (email, verificationLink) => {
  const mailOptions = {
    from: "no-reply@fruitsense.com", // Sender Email yang Anda setel
    to: email,
    subject: "FruitSense: Verifikasi Email Pendaftaran",
    html: `
            <h2>Selamat datang di FruitSense!</h2>
            <p>Silakan klik tautan di bawah ini untuk memverifikasi alamat email Anda dan mengaktifkan akun.</p>
            <a href="${verificationLink}">Verifikasi Akun Saya</a>
            <p>Jika Anda tidak mendaftar di layanan ini, abaikan email ini.</p>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("NodeMailer Error:", error);
    throw new Error("Gagal mengirim email menggunakan NodeMailer.");
  }
};

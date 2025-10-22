const nodemailer = require("nodemailer");

async function testMail() {
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "1ba5c0df2e4128",
      pass: "c374b2cb3e9523",
    },
  });

  const info = await transporter.sendMail({
    from: '"FruitSense" <no-reply@mailtrap.io>',
    to: "test@example.com",
    subject: "Test Mailtrap SMTP",
    text: "Kalau ini terkirim, berarti koneksi SMTP aman 🚀",
  });

  console.log("✅ Email terkirim:", info.messageId);
}

testMail().catch(console.error);

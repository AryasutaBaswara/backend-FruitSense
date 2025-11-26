// swaggerConfig.js
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0", // Versi standar
    info: {
      title: "FruitSense API Documentation",
      version: "1.0.0",
      description:
        "Dokumentasi lengkap API Backend FruitSense (Node.js + Supabase)",
      contact: {
        name: "Backend Developer",
      },
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Local Development Server",
      },
      {
        url: "https://backend-fruitsense-production.up.railway.app", // Ganti dengan URL Railway kamu
        description: "Production Server (Railway)",
      },
    ],
    // Konfigurasi agar Swagger punya tombol "Authorize" (Gembok) buat masukin Token
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Ini penting! Kita suruh dia baca komentar di semua file dalam folder routes
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);
module.exports = specs;

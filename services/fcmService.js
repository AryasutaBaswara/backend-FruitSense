const admin = require("firebase-admin");

const serviceAccount = require("../firebase-credentials.json");
const { response } = require("express");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/**
 *
 * @param {string} token
 * @param {string} title
 * @param {string} body
 */

exports.sendNotification = (token, title, body) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token,
  };

  return admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log(`\n[FCM NYATA] Notifikasi berhasil dikirim:`, response);
      return response;
    })
    .catch((error) => {
      console.error(
        `\n[FCM ERROR] Gagal mengirim notifikasi via FCM.`,
        error.errorInfo
      );
      // CATATAN: Dalam aplikasi nyata, Anda harus menghapus token yang invalid dari database.
      return { success: false, error: error.errorInfo };
    });
};

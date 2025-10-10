exports.sendNotification = (token, title, body) => {
  console.log(`\n[PUSH SIMULASI] Peringatan Buah Busuk:`);
  console.log(`  Token Tujuan: ${token.substring(0, 10)}...`);
  console.log(`  Judul: ${title}`);
  console.log(`  Body: ${body}`);
  // Nanti diganti dengan return client.send(message);
  return { success: true, message: "Simulasi berhasil" };
};

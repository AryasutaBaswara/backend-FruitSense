const supabase = require("../config/supabase");

const getExpirationDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return date.toISOString().split("T")[0];
};

exports.createInventory = async (req, res) => {
  const userId = req.userId;
  const { fruit_name, stock_quantity } = req.body;

  // Dummy Data
  const mockGrade = "A";
  const mockNutrients = "Vitamin C";
  const mockExpirationDays = 7;

  if (!fruit_name || !stock_quantity) {
    return res
      .status(400)
      .json({ error: "fruit and stock should not empty!." });
  }

  const inventoryData = {
    user_id: userId,
    fruit_name: fruit_name,
    grade: mockGrade,
    nutrients: mockNutrients,
    expiration_date: getExpirationDate(mockExpirationDays),
    stock_quantity: stock_quantity,
  };

  const { data, error } = await supabase
    .from("inventories")
    .insert([inventoryData])
    .select("*");

  if (error) {
    console.error("Supabase Insert Error: ", error);
    return res.status(500).json({ error: "Failed to add data to inventory." });
  }

  res.status(200).json({
    message: "Item berhasil ditambahkan ke inventory!",
    item: data[0],
  });
};

exports.getInventories = async (req, res) => {
  const userId = req.userId;

  const { data, error } = await supabase
    .from("inventories")
    .select("*")
    .eq("user_id", userId)
    .order("expiration_date", { ascending: true });

  if (error) {
    console.error("Supabase Fetch Error: ", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch data from inventory." });
  }

  res.status(200).json(data);
};

exports.updateInventory = async (req, res) => {
  const userId = req.userId;
  const inventoryId = req.params.id;
  const { stock_quantity } = req.body;

  if (stock_quantity === undefined) {
    return res.status(400).json({ error: "Kuantitas stok wajib diisi." });
  }

  const { data, error } = await supabase
    .from("inventories")
    .update({
      stock_quantity: stock_quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", inventoryId)
    .eq("user_id", userId)
    .select("*");

  if (error) {
    console.error("Supabase Update Error:", error);
    return res.status(500).json({ error: "Gagal memperbarui stok inventory." });
  }

  if (data.length === 0) {
    return res
      .status(404)
      .json({ error: "Item tidak ditemukan atau Anda bukan pemilik item." });
  }

  res.status(200).json({ message: "Stok berhasil diperbarui.", item: data[0] });
};

exports.deleteInventory = async (req, res) => {
  const userId = req.userId;
  const inventoryId = req.params.id;

  const { error } = await supabase
    .from("inventories")
    .delete()
    .eq("id", inventoryId)
    .eq("user_id", userId);

  if (error) {
    console.error("Supabase Delete Error:", error);
    return res
      .status(500)
      .json({ error: "Gagal menghapus item dari inventory." });
  }

  res.status(204).send(); // 204 No Content adalah status standar untuk Delete
};

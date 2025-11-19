const supabase = require("../config/supabase");
const { v4: uuidv4 } = require("uuid");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const calculateDaysUntilExpired = (expirationDate) => {
  // Diasumsikan expirationDate datang dari DB dalam format YYYY-MM-DD
  const today = dayjs().startOf("day");
  const expiry = dayjs(expirationDate).startOf("day");

  // Mengembalikan nilai integer (positif, nol, atau negatif)
  return expiry.diff(today, "days");
};

const getExpirationDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return date.toISOString().split("T")[0];
};

exports.createInventory = async (req, res) => {
  const userId = req.userId;
  const { fruit_name, stock_quantity } = req.body;
  const imageFile = req.file;

  if (!fruit_name || !stock_quantity || !imageFile) {
    return res
      .status(400)
      .json({ error: "Nama buah, kuantitas, dan gambar wajib diisi." });
  }

  let imageUrl = null;
  const bucketName = "fruit-images";

  try {
    const fileExtension = imageFile.originalname.split(".").pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${userId}/${uniqueFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, imageFile.buffer, {
        contentType: imageFile.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    imageUrl = publicUrlData.publicUrl;
  } catch (error) {
    console.error("Supabase Storage Error:", error);
    return res.status(500).json({
      error: "Gagal mengupload gambar. Periksa konfigurasi Storage Anda.",
    });
  }

  // Dummy Data
  const mockGrade = "A";
  const mockNutrients = "Vitamin C";
  const mockExpirationDays = 7;
  const expirationDate = getExpirationDate(mockExpirationDays);

  const inventoryData = {
    user_id: userId,
    image_url: imageUrl,
    fruit_name: fruit_name,
    grade: mockGrade,
    nutrients: mockNutrients,
    expiration_date: expirationDate,
    stock_quantity: stock_quantity,
  };

  const { data: insertData, error: insertError } = await supabase
    .from("inventories")
    .insert([inventoryData])
    .select("*");

  if (insertError) {
    console.error("Database Insert Error, Cleaning up file:", insertError);
    return res
      .status(500)
      .json({ error: "Gagal menambahkan stok inventory ke database." });
  }

  res.status(201).json({
    message: "Item berhasil ditambahkan ke inventory!",
    item: insertData[0],
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

  const processedData = data.map((item) => {
    const daysLeft = calculateDaysUntilExpired(item.expiration_date);

    return {
      ...item,
      days_until_expired: daysLeft,
    };
  });

  res.status(200).json(processedData);
};

exports.updateInventory = async (req, res) => {
  const userId = req.userId;
  const inventoryId = req.params.id;
  const { stock_quantity, fruit_name } = req.body;

  if (stock_quantity === undefined && !fruit_name) {
    return res.status(400).json({ error: "Kuantitas stok wajib diisi." });
  }

  const updateData = {
    updated_at: new Date().toISOString(),
  };

  if (stock_quantity !== undefined) {
    updateData.stock_quantity = stock_quantity;
  }

  if (fruit_name) {
    updateData.fruit_name = fruit_name;
  }

  const { data, error } = await supabase
    .from("inventories")
    .update(updateData)
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

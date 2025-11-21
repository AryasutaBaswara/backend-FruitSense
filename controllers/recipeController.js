const supabase = require("../config/supabase");
const recipeService = require("../services/recipeService");

// POST: Generate Recipe from Inventory Item
exports.createRecipeFromInventory = async (req, res) => {
  const userId = req.userId;
  const { inventory_id } = req.body;

  if (!inventory_id) {
    return res.status(400).json({ error: "Inventory ID wajib diisi." });
  }

  try {
    // 1. Ambil Data Buah dari Inventory (Snapshot)
    const { data: inventoryItem, error: fetchError } = await supabase
      .from("inventories")
      .select("fruit_name, image_url")
      .eq("id", inventory_id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !inventoryItem) {
      return res
        .status(404)
        .json({ error: "Buah tidak ditemukan di inventory." });
    }

    // 2. Panggil AI Service (Gemini)
    // Kita pakai nama buah dari inventory sebagai bahan utama
    console.log(`Meminta resep untuk: ${inventoryItem.fruit_name}...`);
    const aiRecipe = await recipeService.generateRecipe(
      inventoryItem.fruit_name
    );

    // 3. Susun Data untuk Disimpan
    const recipeData = {
      user_id: userId,
      inventory_id: inventory_id,

      // Snapshot dari Inventory
      fruit_name: inventoryItem.fruit_name,
      fruit_image_url: inventoryItem.image_url,

      // Data dari Gemini AI
      title: aiRecipe.title,
      ingredients: aiRecipe.ingredients,
      instructions: aiRecipe.instructions,
      cooking_time: aiRecipe.cooking_time,
    };

    // 4. Simpan ke Tabel Recipes
    const { data: savedRecipe, error: insertError } = await supabase
      .from("recipes")
      .insert([recipeData])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({
      message: "Resep berhasil dibuat!",
      recipe: savedRecipe,
    });
  } catch (error) {
    console.error("Recipe Creation Error:", error.message);
    return res
      .status(500)
      .json({ error: "Gagal membuat resep. Coba lagi nanti." });
  }
};

// GET: Ambil Daftar Resep User
exports.getMyRecipes = async (req, res) => {
  const userId = req.userId;

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
};

// GET: Ambil Detail 1 Resep
exports.getRecipeDetail = async (req, res) => {
  const userId = req.userId;
  const recipeId = req.params.id;

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .eq("user_id", userId)
    .single();

  if (error) {
    return res.status(404).json({ error: "Resep tidak ditemukan." });
  }

  res.status(200).json(data);
};

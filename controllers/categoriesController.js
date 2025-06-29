const Category = require("../models/categories");
const path = require("path");
const fs = require("fs");
// Create new category
exports.uploadCategory = async (req, res) => {
  try {
    console.log(req.body);
    const { name, description, parentCategoryId, slug, sequence } = req.body;
    console.log(req.files);
    const file = req.files.file[0];
    const secondaryFile = req.files.secondaryFile[0];

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const ext = path.extname(file.originalname).toLowerCase();
    const type = [".jpg", ".jpeg", ".png", ".webp"].includes(ext)
      ? "image"
      : [".mp4", ".mov", ".avi", ".webm"].includes(ext)
      ? "video"
      : null;

    if (!type) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: "Unsupported file type" });
    }

    let secondaryFilePath = null;
    if (secondaryFile) {
      const secondaryExt = path
        .extname(secondaryFile.originalname)
        .toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(secondaryExt)) {
        fs.unlinkSync(secondaryFile.path);
        return res
          .status(400)
          .json({ error: "Unsupported secondary file type" });
      }
      secondaryFilePath = `/uploads/${secondaryFile.filename}`;
    }

    const category = await Category.create({
      name,
      description,
      parentCategoryId,
      slug,
      type,
      sequence,
      filePath: `/uploads/${file.filename}`,
      secondaryFilePath,
    });

    res.status(201).json({
      status: true,
      data: category,
      message: "Category Created!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all categories (optionally filter by active)
exports.getCategories = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const categories = await Category.findAll({
      where: {
        deleted: false,
        ...(activeOnly === "true" ? { isActive: true } : {}),
      },
    });

    res.json({ status: true, data: categories, message: "Categories fetched" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// Get single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, deleted: false },
    });

    if (!category) {
      return res
        .status(404)
        .json({ status: false, message: "Category not found" });
    }

    res.json({ status: true, data: category, message: "Category fetched" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// Update category by ID
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, deleted: false },
    });

    if (!category) {
      return res
        .status(404)
        .json({ status: false, message: "Category not found" });
    }

    await category.update(req.body);
    res.json({ status: true, data: category, message: "Category updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// Soft delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, deleted: false },
    });

    if (!category) {
      return res
        .status(404)
        .json({ status: false, message: "Category not found" });
    }

    await category.update({ deleted: true });
    res.json({ status: true, message: "Category deleted (soft)" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

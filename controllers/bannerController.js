const path = require("path");
const fs = require("fs");
const Banner = require("../models/Banner");

exports.uploadBanner = async (req, res) => {
  try {
    const { title, subtitle, buttonLabel, sequence, link } = req.body;
    const file = req.file;
    const baseUrl = `${req.protocol}://${req.get("host")}`;
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

    const banner = await Banner.create({
      title,
      subtitle,
      buttonLabel,
      type,
      sequence,
      link,
      filePath: `/uploads/${file.filename}`,
    });

    res.status(201).json({
      status: true,
      data: banner,
      message: "Banner Created!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      where: { deleted: false }, // only enabled banners
      order: [["sequence", "ASC"]],
    });
    res.json({
      status: true,
      data: banners,
      message: "Banner List Fetched",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.disableBanner = async (req, res) => {
  try {
    const { id, disabled } = req.body;
    const banner = await Banner.findByPk(id);

    if (!banner) return res.status(404).json({ error: "Banner not found" });

    banner.disabled = disabled;
    await banner.save();

    res.json({
      status: true,
      data: banner,
      message: "Banner disabled successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getBannerById = async (req, res) => {
  try {
    const bannerId = req.params.id;

    const banner = await Banner.findOne({
      where: { id: bannerId, deleted: false },
    });

    if (!banner) {
      return res.status(404).json({
        status: false,
        message: "Banner not found",
      });
    }

    res.json({
      status: true,
      data: banner,
      message: "Banner fetched successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;

    const banner = await Banner.findOne({
      where: { id: bannerId, deleted: false },
    });

    if (!banner) {
      return res.status(404).json({
        status: false,
        message: "Banner not found",
      });
    }

    await banner.update({ deleted: true });

    res.json({
      status: true,
      message: "Banner deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, buttonLabel, sequence, link } = req.body;
    const file = req.file;

    const banner = await Banner.findByPk(id);
    if (!banner) {
      if (file) fs.unlinkSync(file.path); // cleanup if uploaded
      return res.status(404).json({ error: "Banner not found" });
    }

    // Prepare fields to update
    const updatedFields = {
      title: title ?? banner.title,
      subtitle: subtitle ?? banner.subtitle,
      buttonLabel: buttonLabel ?? banner.buttonLabel,
      sequence: sequence ?? banner.sequence,
      link: link ?? banner.link,
    };

    // If file is uploaded, validate type and update
    if (file) {
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

      // Delete old file
      if (banner.filePath && fs.existsSync(`.${banner.filePath}`)) {
        fs.unlinkSync(`.${banner.filePath}`);
      }

      updatedFields.type = type;
      updatedFields.filePath = `/uploads/${file.filename}`;
    }

    // Update banner
    await banner.update(updatedFields);

    res.json({
      status: true,
      data: banner,
      message: "Banner updated successfully!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

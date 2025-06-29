const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bannerController = require("../controllers/bannerController");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Routes
router.post("/", upload.single("file"), bannerController.uploadBanner);
router.get("/", bannerController.getBanners);
router.get("/:id", bannerController.getBannerById);
router.delete("/:id", bannerController.deleteBanner);
router.put("/:id", upload.single("file"), bannerController.updateBanner);
// New route to disable a banner by id
router.put("/:id", bannerController.disableBanner);

module.exports = router;

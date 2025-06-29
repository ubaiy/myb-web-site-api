const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoriesController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
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
// CRUD routes
router.post(
  "/",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "secondaryFile", maxCount: 1 },
  ]),
  categoryController.uploadCategory
);
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.put(
  "/:id",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "secondaryFile", maxCount: 1 },
  ]),
  categoryController.updateCategory
);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;

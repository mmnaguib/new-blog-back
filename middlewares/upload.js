// middleware/upload.js
const multer = require("multer");
const path = require("path");

// تحديد مكان الحفظ واسم الملف
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // اتأكد إن الفولدر ده موجود
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// فلتر للأنواع المسموح بها
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;

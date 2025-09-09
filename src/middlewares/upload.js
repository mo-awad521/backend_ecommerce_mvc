// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary.js";

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "ecommerce_products", // مجلد على Cloudinary
//     allowed_formats: ["jpg", "png", "jpeg", "webp"],
//   },
// });

import multer from "multer";

// نخزن في الذاكرة (buffer) عشان نرفعها مباشرة لـ Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB لكل صورة
});

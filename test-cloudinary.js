import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "media_uploads", 
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf", "mp4", "avi", "mov", "xlsx", "xls"],
    resource_type: "auto",
  },
});
console.log("CloudinaryStorage created successfully")

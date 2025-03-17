import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "media_uploads", 
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf", "mp4", "avi", "mov", "xlsx", "xls"],
    resource_type: "auto",
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "video/mp4",
    "video/avi",
    "video/quicktime",
  ];
  
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Invalid file type. Only images, PDFs, and videos are allowed."), false);
  }
  cb(null, true);
};

export const mediaUpload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, 
  fileFilter: fileFilter,
}).array("files", 10); 





const getImageDimensions = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    return { width: metadata.width, height: metadata.height, format: metadata.format };
  } catch (error) {
    console.error("Error extracting image dimensions:", error);
    return null;
  }
};

// Upload Handler with Sharp Processing
export const uploadHandler = async (req, res) => {
  mediaUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    try {
      const tempFilePath = req.file.path;

      // Get Image Dimensions
      const dimensions = await getImageDimensions(tempFilePath);

      return res.status(200).json({
        success: true,
        message: "File uploaded successfully!",
        file: {
          url: req.file.path, // Cloudinary URL
          width: dimensions?.width || null,
          height: dimensions?.height || null,
          format: dimensions?.format || null,
        },
      });
    } catch (error) {
      console.error("Upload Error:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
  });
};
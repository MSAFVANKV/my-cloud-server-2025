import axios from "axios";
import sharp from "sharp";
import { MediaModal } from "../model/mediaModal.js";
import mongoose from "mongoose";
import { UserModal } from "../model/UserSchema.js";

export const getImageDimensions = async (filePath, mimetype) => {
  if (!mimetype.startsWith("image/")) return null;

  try {
    let imageBuffer;

    if (filePath.startsWith("http")) {
      const response = await axios.get(filePath, {
        responseType: "arraybuffer",
      });
      imageBuffer = Buffer.from(response.data);
    } else {
      imageBuffer = await sharp(filePath).toBuffer();
    }

    const metadata = await sharp(imageBuffer).metadata();

    return { width: metadata.width, height: metadata.height };
  } catch (error) {
    console.error("Error extracting image dimensions:", error);
    return null;
  }
};

export const uploadFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    const { folderId } = req.body;

    console.log(folderId, "folderId");

    const MediaSchema = await MediaModal(req.dbName);

    if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
      return res
        .status(400)
        .json({
          message: "Invalid folderId. It must be a valid Mongoose ObjectId.",
        });
    }

    const savedFiles = await Promise.all(
      req.files.map(async (file) => {
        const dimensions = await getImageDimensions(file.path, file.mimetype);

        return {
          name: file.originalname,
          size: file.size,
          format: file.mimetype,
          folderId,
          src: file.path,
          width: dimensions?.width || null,
          height: dimensions?.height || null,
          uploadedBy: req.user._id,
        };
      })
    );

    await MediaSchema.insertMany(savedFiles);
    // Update used storage
    const UserDb = await UserModal();
    await UserDb.findByIdAndUpdate(req.user._id, {
      usedStorage: req.newUsedStorage,
    });

    res.status(200).json({
      message: "Files uploaded successfully!",
      files: savedFiles,
    });
  } catch (error) {
    console.error("File upload error:", error);
    res
      .status(500)
      .json({ message: "File upload failed", error: error.message });
  }
};

// export const getUploadedFiles = async (req, res) => {
//   try {
//     let filter = { isDeleted: false };
//     const MediaSchema = await MediaModal(req.dbName);
//     const files = await MediaSchema.find({ uploadedBy: req.user._id });

//     return res.status(200).json({ files });
//   } catch (error) {
//     console.error("Error fetching files:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
export const getUploadedFiles = async (req, res) => {
    try {
      let filter = { isDeleted: false, uploadedBy: req.user._id };
  
      if (req.query.filters) {
        const filters = JSON.parse(req.query.filters); // Parse the filters from the query
        filters.forEach(({ key, value }) => {
          filter[key] = value;
        });
      }
  
      const MediaSchema = await MediaModal(req.dbName)
      const files = await MediaSchema.find(filter).sort({_id:-1})
  
      return res.status(200).json({ files });
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  

// delete files uploaded
export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const MediaSchema = await MediaModal(req.dbName);
    const file = await MediaSchema.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const UserDb = await UserModal();
    await UserDb.findByIdAndUpdate(req.user._id, {
      $inc: { usedStorage: -file.size },
    });

    await MediaSchema.findByIdAndDelete(fileId);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("File deletion error:", error);
    res.status(500).json({ message: "File deletion failed" });
  }
};

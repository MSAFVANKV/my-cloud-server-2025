
// import { UserModal } from "../model/UserSchema.js";
// import mongoose from "mongoose";

// /**
//  * Middleware to check if user has enough storage before proceeding.
//  */
// export const checkStorageLimit = async (req, res, next) => {
//   try {
//     const UserDb = await UserModal();
//     const user = await UserDb.findById(req.user._id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Get the user's database connection dynamically
//     const userDb = mongoose.connection.useDb(req.dbName);
    
//     // Define the collections that store files
//     const fileCollections = ["Media", "Folder"]; // Collection names in the user's DB

//     let totalUsedStorage = 0;

//     // Loop through all collections and sum up storage usage
//     for (const collectionName of fileCollections) {
//       const collection = userDb.collection(collectionName);
      
//       // Sum up the 'size' field from all documents in this collection
//       const storageData = await collection.aggregate([
//         { $group: { _id: null, totalSize: { $sum: "$size" } } }
//       ]).toArray();

//       if (storageData.length > 0) {
//         totalUsedStorage += storageData[0].totalSize;
//       }
//     }

//     // If request contains new files, calculate their total size
//     let newFileSize = 0;
//     if (req.files && req.files.length > 0) {
//       newFileSize = req.files.reduce((acc, file) => acc + file.size, 0);
//     }

//     const newUsedStorage = totalUsedStorage + newFileSize;

//     // Check if new usage exceeds total storage limit
//     if (newUsedStorage > user.totalStorage) {
//       return res.status(400).json({ message: "Storage limit exceeded!" });
//     }

//     // Attach updated storage data to request
//     req.totalUsedStorage = totalUsedStorage;
//     req.newUsedStorage = newUsedStorage;

//     next();
//   } catch (error) {
//     console.error("Storage limit check error:", error);
//     res.status(500).json({ message: "Server error while checking storage limit" });
//   }
// };
import { UserModal } from "../model/UserSchema.js";
import { MediaModal } from "../model/mediaModal.js";

/**
 * Middleware to check if user has enough storage before proceeding with file uploads.
 */
export const checkStorageLimit = async (req, res, next) => {
  try {
    const UserDb = await UserModal();
    const user = await UserDb.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the total size of all stored files in user's database
    const MediaSchema = await MediaModal(req.dbName);
    const allFiles = await MediaSchema.find({ uploadedBy: req.user._id });

    const totalUsedStorage = allFiles.reduce((acc, file) => acc + file.size, 0);

    // If request contains new files, calculate their total size
    let newFileSize = 0;
    if (req.files && req.files.length > 0) {
      newFileSize = req.files.reduce((acc, file) => acc + file.size, 0);
    }

    const newUsedStorage = totalUsedStorage + newFileSize;

    // Check if new usage exceeds total storage limit
    if (newUsedStorage > user.totalStorage) {
      return res.status(400).json({ message: "Storage limit exceeded!" });
    }

    // Attach updated storage data to request
    req.totalUsedStorage = totalUsedStorage;
    req.newUsedStorage = newUsedStorage;

    next();
  } catch (error) {
    console.error("Storage limit check error:", error);
    res.status(500).json({ message: "Server error while checking storage limit" });
  }
};

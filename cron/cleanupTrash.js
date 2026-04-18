import cron from "node-cron";
import cloudinaryPkg from "cloudinary";
const cloudinary = cloudinaryPkg.v2;
import { FolderModal } from "../model/folderModal.js";
import { MediaModal } from "../model/mediaModal.js";
import { UserModal } from "../model/UserSchema.js";

// Make sure Cloudinary is globally configured if it isn't automatically resolving 
// config from dotenv/index.js before this executes.
import dotenv from "dotenv";
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export const initializeCronJobs = () => {
  // Run daily at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("Running scheduled trash cleanup job...");
    try {
      const UserDb = await UserModal();
      const users = await UserDb.find({});
      
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

      for (const user of users) {
        if (!user.databaseName) continue;
        
        const MediaSchema = await MediaModal(user.databaseName);
        const FolderSchema = await FolderModal(user.databaseName);

        // 1. Delete Media that exceeded 10 days
        const expiredMedia = await MediaSchema.find({
          isDeleted: true,
          deletedAt: { $lte: tenDaysAgo }
        });

        for (const media of expiredMedia) {
          try {
            // Delete from Cloudinary natively
            if (media.src && media.src.includes("cloudinary.com")) {
              const urlParts = media.src.split('/');
              const fileWithExt = urlParts[urlParts.length - 1];
              const folderOpt = urlParts[urlParts.length - 2]; 
              
              // Depending on folder structures, public_id format is typically "folder/filename"
              const publicIdWithExt = `${folderOpt}/${fileWithExt}`.split('.')[0];
              
              await cloudinary.uploader.destroy(publicIdWithExt, { resource_type: "raw" }).catch(() => {});
              await cloudinary.uploader.destroy(publicIdWithExt, { resource_type: "image" }).catch(() => {});
              await cloudinary.uploader.destroy(publicIdWithExt, { resource_type: "video" }).catch(() => {});
            }
          } catch(err) {
            console.error("Cloudinary cleanup error:", err);
          }
          await MediaSchema.findByIdAndDelete(media._id);
        }

        // 2. Delete Folders that exceeded 10 days natively without nested queries since media deletes ran sequentially
        await FolderSchema.deleteMany({
          isDeleted: true,
          deletedAt: { $lte: tenDaysAgo }
        });
      }
      
      console.log("Daily trash cleanup finished securely.");
    } catch (error) {
      console.error("Error during scheduled trash cleanup:", error);
    }
  });
};

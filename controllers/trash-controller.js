import { MediaModal } from "../model/mediaModal.js";
import { FolderModal } from "../model/folderModal.js";
import { UserModal } from "../model/UserSchema.js";

// Soft delete Media
export const softDeleteMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const MediaSchema = await MediaModal(req.dbName);
    
    // Find the media item
    const media = await MediaSchema.findOne({ _id: mediaId, isDeleted: false });
    if (!media) {
      return res.status(404).json({ success: false, message: "Media not found or already deleted" });
    }

    // Mark as deleted natively
    media.isDeleted = true;
    media.deletedAt = new Date();
    await media.save();

    // Reduce usedStorage
    const UserDb = await UserModal();
    await UserDb.findByIdAndUpdate(req.user._id, {
      $inc: { usedStorage: -(Number(media.size) || 0) }
    });

    return res.status(200).json({ success: true, message: "Media moved to trash successfully" });
  } catch (error) {
    console.error("Media soft delete error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Soft delete Folder recursively
export const softDeleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const FolderSchema = await FolderModal(req.dbName);
    const MediaSchema = await MediaModal(req.dbName);

    // Verify folder exists and isn't already deleted
    const targetFolder = await FolderSchema.findOne({ _id: folderId, isDeleted: false });
    if (!targetFolder) {
      return res.status(404).json({ success: false, message: "Folder not found or already deleted" });
    }

    // Helper to find all nested components recursively
    const allFolders = await FolderSchema.find({ isDeleted: false }).lean();
    const folderMap = new Map(allFolders.map(f => [f._id.toString(), f]));
    
    const foldersToProcess = [targetFolder._id];
    const findNestedFolders = (fId) => {
      const folder = folderMap.get(fId.toString());
      if (!folder || !folder.subFolders) return;
      folder.subFolders.forEach(subId => {
        foldersToProcess.push(subId);
        findNestedFolders(subId);
      });
    };
    findNestedFolders(targetFolder._id);

    const now = new Date();

    // Soft delete all matched folders natively
    await FolderSchema.updateMany(
      { _id: { $in: foldersToProcess }, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: now } }
    );

    // Find all active media residing in these folders to retrieve sizes
    const activeMediaInFolders = await MediaSchema.find({ 
      folderId: { $in: foldersToProcess }, 
      isDeleted: false 
    });

    if (activeMediaInFolders.length > 0) {
      const recoveredStorage = activeMediaInFolders.reduce((acc, file) => acc + (Number(file.size) || 0), 0);

      // Soft delete internal matched media
      await MediaSchema.updateMany(
        { folderId: { $in: foldersToProcess }, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: now } }
      );

      // Free user storage quota
      const UserDb = await UserModal();
      await UserDb.findByIdAndUpdate(req.user._id, {
        $inc: { usedStorage: -recoveredStorage }
      });
    }

    return res.status(200).json({ success: true, message: "Folder and all nested properties securely moved to trash" });

  } catch (error) {
    console.error("Folder soft delete error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

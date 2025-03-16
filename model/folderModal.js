import mongoose from "mongoose";
import { getDb } from "../connection/getDbConnection.js";

const FolderSchema = new mongoose.Schema(
  {
    folderName: {
      type: String,
      default: "untitled-folder",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const FolderModal = async (dbName) => {
  const masterDb = await getDb(dbName);
  return masterDb.model.Folder || masterDb.model("Folder", FolderSchema);
};

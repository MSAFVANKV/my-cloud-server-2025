import mongoose from "mongoose";
import { getDb } from "../connection/getDbConnection.js";

const FolderSchema = new mongoose.Schema(
  {
    folderName: {
      type: String,
      default: "untitled-folder",
    },
    size: {
      type: Number,
    },
    isDeleted:{
      type: Boolean,
      default: false,
    },
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    files: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
      default: null,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slug: { type: String, unique: true },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

FolderSchema.pre("validate", function (next) {
  if (this.isModified("folderName")) {
    this.slug = slugify(this.folderName, { lower: true, strict: true });
  }
  next();
});

export const FolderModal = async (dbName) => {
  const masterDb = await getDb(dbName);
  return masterDb.model.Folder || masterDb.model("Folder", FolderSchema);
};

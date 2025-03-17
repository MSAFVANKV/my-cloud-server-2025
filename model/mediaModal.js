import mongoose from "mongoose";
import { getDb } from "../connection/getDbConnection.js";

const mediaSchema = new mongoose.Schema({
  name: {
    type: String,
  },

  size: {
    type: Number,
  },
  isDeleted:{
    type: Boolean,
    default: false,
  },
  format: {
    type: String,
  },
  src: {
    type: String,
  },
  category: {
    type: String,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default:null,
  },
  width: {
    type: Number,
    default: null,
  },
  height: {
    type: Number,
    default: null,
  },
  uploadedAt: { type: Date, default: Date.now },
});

export const MediaModal = async (dbName) => {
  const masterDb = await getDb(dbName);
  return masterDb.model.Folder || masterDb.model("Media", mediaSchema);
};

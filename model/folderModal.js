import mongoose from "mongoose";
import { getDb } from "../connection/getDbConnection.js";
import slugify from 'slugify'

const FolderSchema = new mongoose.Schema(
  {
    name: {
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
    published:{
      type: Boolean,
      default: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    subFolders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
        default: [],
      },
    ],
    
    files: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
      default: [],
    }],

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
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// export const FolderModal = async (dbName) => {
//   const masterDb = await getDb(dbName);
//   return masterDb.model.Folder || masterDb.model("Folder", FolderSchema);
// };
export const FolderModal = async (userId) => {
  const masterDb = await getDb(); // Shared DB now
  const modelName = `Folder_${userId}`;

  if (masterDb.models[modelName]) return masterDb.models[modelName];

  return masterDb.model(modelName, FolderSchema, modelName); // 3rd param = collection name
};

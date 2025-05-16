import { Router } from "express";
import {
  getUploadedFiles,
  uploadFiles,
} from "../controllers/upload-controller.js";
import { authenticateUser } from "../middleware/authMidd.js";
import { mediaUpload } from "../config/multer.js";
import { checkStorageLimit } from "../config/storage.js";
import { createFolder, getFoldersWithSubFolders, renameFolderName } from "../controllers/folder-controller/controller.js";

const router = Router();

router.post(
  "/file",
  authenticateUser,
  mediaUpload,
  checkStorageLimit,
  uploadFiles
);

router.get("/file", authenticateUser, getUploadedFiles);

// folder creations

router.post(
  "/folder",
  authenticateUser,
  checkStorageLimit,
  createFolder
);

router.put(
  "/folder/:folderId",
  authenticateUser,
  checkStorageLimit,
  renameFolderName
);


router.get(
  "/folder",
  authenticateUser,
  checkStorageLimit,
  getFoldersWithSubFolders
);


export default router;

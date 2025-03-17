import { Router } from "express";
import {
  getUploadedFiles,
  uploadFiles,
} from "../controllers/upload-controller.js";
import { authenticateUser } from "../middleware/authMidd.js";
import { mediaUpload } from "../config/multer.js";
import { checkStorageLimit } from "../config/storage.js";

const router = Router();

router.post(
  "/file",
  authenticateUser,
  mediaUpload,
  checkStorageLimit,
  uploadFiles
);

router.get("/file", authenticateUser, getUploadedFiles);

export default router;

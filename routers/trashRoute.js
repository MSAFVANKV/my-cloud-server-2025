import { Router } from "express";
import { authenticateUser } from "../middleware/authMidd.js";
import { softDeleteMedia, softDeleteFolder } from "../controllers/trash-controller.js";

const router = Router();

router.delete("/media/:mediaId", authenticateUser, softDeleteMedia);
router.delete("/folder/:folderId", authenticateUser, softDeleteFolder);

export default router;

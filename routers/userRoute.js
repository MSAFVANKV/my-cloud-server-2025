import { Router } from 'express';
import { getCurrentUser, loginUser, registerUser } from '../controllers/UserController.js';
import { authenticateUser } from '../middleware/authMidd.js';



const router = Router();




router.post("/register", registerUser);
router.post("/login",loginUser);
router.get("/get-current-user",authenticateUser,getCurrentUser);











export default router;
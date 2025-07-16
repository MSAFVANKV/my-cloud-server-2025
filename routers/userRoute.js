import { Router } from 'express';
import { getCurrentUser, loginUser, registerUser } from '../controllers/UserController.js';
import { authenticateUser } from '../middleware/authMidd.js';
import { withdrawMyWallet } from '../controllers/wallet-controller/index.js';



const router = Router();




router.post("/register", registerUser);
router.post("/login",loginUser);
router.get("/get-current-user",authenticateUser,getCurrentUser);



router.post("/withdraw",withdrawMyWallet);








export default router;
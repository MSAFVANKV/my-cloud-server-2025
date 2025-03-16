import { UserModal } from "../model/UserSchema.js";
import { verifyToken } from "../util/auth.js";



export const authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies["cld_ath"] 
        if (!token) {
          return res.json(
            { success: false, message: "Unauthorized. No token found." },
            { status: 401 }
          );
        }
    
        // ✅ Verify the token
        const decoded = await verifyToken(token); // Ensure `verifyToken` is correctly implemented
        if (!decoded || !decoded.userId) {
          return res.json(
            { success: false, message: "Invalid or expired token." },
            { status: 401 }
          );
        }
        console.log('decoded token:',decoded);

    const UserDb = await UserModal();

        

        req.user = await UserDb.findById(decoded.userId).select("-password");
        req.dbName = decoded.dbName

        if (!req.user) {
            return res.status(401).json({
              success: false,
              message: "Not authorized, user not found.",
            });
          }

      next();
    } catch (error) {
      console.error("Error authenticating user:", error);
      res.status(500).json({ message: "Server error" });
    }
  
}
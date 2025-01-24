import { Router } from "express";
import { getUserDetails, searchUsers } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.get("/get-user-details", verifyToken, getUserDetails);
router.get("/search-users", verifyToken, searchUsers);
export default router;

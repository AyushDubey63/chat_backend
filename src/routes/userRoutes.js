import { Router } from "express";
import {
  getUserDetails,
  loginUser,
  registerUser,
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.get("/get-user-details", verifyToken, getUserDetails);
router.post("/register-user", registerUser);
router.post("/login-user", loginUser);
export default router;

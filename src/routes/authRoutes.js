import { Router } from "express";
import {
  authenicateUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.post("/authenticate", verifyToken, authenicateUser);
router.post("/register-user", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);
export default router;

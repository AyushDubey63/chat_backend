import { Router } from "express";
import {
  authenicateUser,
  loginUser,
  logoutUser,
  registerUser,
  sendVerifyPage,
  verifyOtp,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.post("/authenticate", verifyToken, authenicateUser);
router.post("/register-user", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);
router.get("/verify-user/:email/:token", sendVerifyPage);
router.post("/verify-otp/:token", verifyOtp);
export default router;

import { Router } from "express";
import {
  authenicateUser,
  loginUser,
  logoutUser,
  registerUser,
  resendOtp,
  sendVerifyPage,
  verifyOtp,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.post("/authenticate", verifyToken, authenicateUser);
router.post("/register-user", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);
router.get("/verify-user/:email/:token/:user_name", sendVerifyPage);
router.post("/verify-otp/:token", verifyOtp);
router.post("/resend-otp/:email/:user_name", resendOtp);
export default router;

import { Router } from "express";
import {
  authenicateUser,
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  resendOtp,
  sendResetPasswordPage,
  sendVerifyPage,
  verifyAndResetPassword,
  verifyOtp,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.post("/authenticate", verifyToken, authenicateUser);
router.post("/register-user", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);
router.get("/verify-user/:email/:token/:user_name", sendVerifyPage);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:email/:token", sendResetPasswordPage);
router.post("/verify-and-reset-password/:token", verifyAndResetPassword);
router.post("/verify-otp/:token", verifyOtp);
router.get("/resend-otp/:email/:user_name", resendOtp);
export default router;

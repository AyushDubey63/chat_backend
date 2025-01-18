import { Router } from "express";
import { loginUser, registerUser } from "../controllers/userController.js";

const router = Router();

router.post("/register-user", registerUser);
router.post("/login-user", loginUser);
export default router;

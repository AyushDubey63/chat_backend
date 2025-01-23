import { Router } from "express";
import { getUserDetails } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.get("/get-user-details", verifyToken, getUserDetails);
export default router;

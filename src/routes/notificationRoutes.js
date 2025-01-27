import { Router } from "express";
import { getAllUsersNotifications } from "../controllers/notificationController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.get("/get-all-notifications", verifyToken, getAllUsersNotifications);

export default router;

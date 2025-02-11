import { Router } from "express";
import {
  addUserStatus,
  getUserChatsStatus,
  getUserStatus,
} from "../controllers/userStatusController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { multerUpload } from "../config/multerConfig.js";

const router = Router();

router.get("/get-status", verifyToken, getUserStatus);

router.get("/get-all-chats-status", verifyToken, getUserChatsStatus);

router.post(
  "/add-status",
  verifyToken,
  multerUpload.fields([{ name: "data", maxCount: 1 }]),
  addUserStatus
);

export default router;

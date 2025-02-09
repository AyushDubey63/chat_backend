import { Router } from "express";
import {
  getChatMessagesByChatId,
  getUserAllChats,
  sendMediaInMessage,
} from "../controllers/chatController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { multerUpload } from "../config/multerConfig.js";

const router = Router();
router.get("/get-chats", verifyToken, getChatMessagesByChatId);
router.get("/get-all-chats", verifyToken, getUserAllChats);
router.post(
  "/send-media",
  multerUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 5 },
    { name: "audio", maxCount: 5 },
  ]),
  sendMediaInMessage
);
export default router;

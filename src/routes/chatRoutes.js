import { Router } from "express";
import {
  getChatMessagesByChatId,
  getUserAllChats,
} from "../controllers/chatController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();
router.get("/get-chats", verifyToken, getChatMessagesByChatId);
router.get("/get-all-chats", verifyToken, getUserAllChats);
export default router;

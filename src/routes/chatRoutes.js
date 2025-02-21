import { Router } from "express";
import {
  createGroupChat,
  getChatMessagesByChatId,
  getGroupDetails,
  getGroupParticipants,
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
  verifyToken,
  multerUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 5 },
    { name: "audio", maxCount: 5 },
  ]),
  sendMediaInMessage
);
router.post(
  "/create-group-chat",
  multerUpload.array("group_icon", 1),
  verifyToken,
  createGroupChat
);

router.get("/group-details", verifyToken, getGroupDetails);
router.get("/group-participants", verifyToken, getGroupParticipants);
export default router;

import { Router } from "express";
import {
  getAllUsersNotifications,
  getUnreadNotificationsCount,
  updateNotificationStatus,
} from "../controllers/notificationController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.get("/get-all-notifications", verifyToken, getAllUsersNotifications);

router.get(
  "/get-unread-notifications-count",
  verifyToken,
  getUnreadNotificationsCount
);

router.patch(
  "/update-notification-status",
  verifyToken,
  updateNotificationStatus
);

export default router;

import { db } from "../config/databaseConfig.js";
import APIResponse from "../utils/APIResponse.js";
import { ErrorHandler } from "../utils/errorHandler.js";

const getAllUsersNotifications = async (req, res, next) => {
  const userId = req.userId;
  try {
    console.log(req.userId, 8);
    const notifications = await db("notifications as n")
      .select(
        "n.notification_id",
        db.raw("CONCAT(n.message,' ',u.user_name ) as notification"),
        "n.type",
        "u.profile_pic",
        "n.is_read"
      )
      .where("n.receiver_id", userId)
      .leftJoin("users as u", "n.sender_id", "u.user_id")
      .orderBy("n.created_at", "desc")
      .debug(true);
    if (notifications.length === 0) {
      const apiResponse = new APIResponse({
        status_code: 200,
        message: "No notifications found",
        data: {
          notifications: [],
        },
      });
      return res.status(200).json(apiResponse);
    }
    const apiResponse = new APIResponse({
      status_code: 200,
      message: "Notifications fetched successfully",
      data: {
        notifications,
      },
    });
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

const getUnreadNotificationsCount = async (req, res, next) => {
  const userId = req.userId;
  try {
    const count = await db("notifications")
      .where("receiver_id", userId)
      .andWhere("is_read", false)
      .count("notification_id as unread_count")
      .first();
    const apiResponse = new APIResponse({
      status_code: 200,
      message: "Unread notifications count fetched successfully",
      data: {
        unread_count: count.unread_count,
      },
    });
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

const updateNotificationStatus = async (req, res, next) => {
  try {
    const { notification_ids } = req.body;
    console.log(notification_ids, 70);
    const updates = await db("notifications")
      .whereIn("notification_id", notification_ids)
      .update({ is_read: true })
      .debug(true);
    const apiResponse = new APIResponse({
      status_code: 200,
      message: "Notifications updated successfully",
    });
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};
export {
  getAllUsersNotifications,
  updateNotificationStatus,
  getUnreadNotificationsCount,
};

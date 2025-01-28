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
        db.raw("CONCAT(u.user_name ,' ',n.message) as notification"),
        "n.type",
        "u.profile_pic"
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

export { getAllUsersNotifications };

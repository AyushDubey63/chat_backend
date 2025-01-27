import { db } from "../config/databaseConfig.js";
import APIResponse from "../utils/APIResponse.js";

const getAllUsersNotifications = async (req, res) => {
  const userId = req.userId;
  try {
    const notifications = await db("notifications as n")
      .select(
        db.raw("CONCAT(u.user_name ,' ',n.message) as notifications"),
        "n.type"
      )
      .where("n.receiver_id", userId)
      .join("users as u", "n.sender_id", "u.user_id")
      .orderBy("n.created_at", "desc");
    if (notifications.length === 0) {
      const apiResponse = new APIResponse({
        status_code: 200,
        message: "No notifications found",
        data: [],
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

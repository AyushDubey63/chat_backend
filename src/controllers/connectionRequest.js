import { db } from "../config/databaseConfig.js";
import APIResponse from "../utils/APIResponse.js";
import { ErrorHandler } from "../utils/errorHandler.js";

const getAllConnectionRequestReceived = async (req, res, next) => {
  const userId = req.userId;
  try {
    const connectionRequests = await db("users as u")
      .select(
        "cr.request_id",
        "cr.sender_id",
        "cr.receiver_id",
        "cr.status",
        "u2.profile_pic",
        "u2.user_name as sender_name"
      )
      .join("connection_requests as cr", "u.user_id", "cr.receiver_id")
      .join("users as u2", "cr.sender_id", "u2.user_id")
      .where("u.user_id", userId)
      .andWhere("cr.status", "pending")
      .debug(true);
    if (connectionRequests.length === 0) {
      const apiResponse = new APIResponse({
        status_code: 200,
        message: "No connection requests found",
        data: {
          connection_requests: [],
        },
      });
      return res.status(200).json(apiResponse);
    }
    const apiResponse = new APIResponse({
      status_code: 200,
      message: "Connection requests fetched successfully",
      data: { connection_requests: connectionRequests },
    });
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

const getAllConnectionRequestSent = async (req, res, next) => {
  const userId = req.userId;
  try {
    const connectionRequests = await db("users as u")
      .select(
        "cr.request_id",
        "cr.receiver_id",
        "cr.status",
        "u2.user_name as sent_to",
        "u2.profile_pic"
      )
      .join("connection_requests as cr", "u.user_id", "cr.sender_id")
      .join("users as u2", "cr.receiver_id", "u2.user_id")
      .where("u.user_id", userId)
      .andWhere("cr.status", "pending")
      .debug(true);
    if (connectionRequests.length === 0) {
      const apiResponse = new APIResponse({
        status_code: 200,
        message: "No connection requests found",
        data: {
          connection_requests: [],
        },
      });
      return res.status(200).json(apiResponse);
    }
    const apiResponse = new APIResponse({
      status_code: 200,
      message: "Connection requests fetched successfully",
      data: { connection_requests: connectionRequests },
    });
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export { getAllConnectionRequestReceived, getAllConnectionRequestSent };

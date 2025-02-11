import { db } from "../config/databaseConfig.js";
import SocketHandler from "../helpers/socketExport.js";
import APIResponse from "../utils/APIResponse.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { getCountForQuery } from "../utils/helper.js";
import { uploadArrayOfImagesToCloudinary } from "../utils/uploadImageToClodinary.js";

const getChatMessagesByChatId = async (req, res, next) => {
  const { chat_id, page = 1, limit = 25 } = req.query;
  const skip = parseInt((page - 1) * limit);
  console.log(page, limit, skip, 9);
  try {
    // Query to count the total messages
    const countResult = await db("messages as m")
      .where("m.chat_id", chat_id)
      .count("m.id as total_messages")
      .first(); // Use first() to get the result as a single row

    // Query to fetch paginated messages
    const messages = await db("messages as m")
      .select("*")
      .where("m.chat_id", chat_id)
      .orderBy("m.created_at", "desc")
      .limit(limit)
      .offset(skip)
      .debug(true);

    if (!messages.length) {
      const apiResponse = new APIResponse({
        status_code: 200,
        message: "No chats messages found",
      });
    }

    const totalMessages = countResult ? countResult.total_messages : 0;
    const totalPages = Math.ceil(totalMessages / limit);

    return res.status(200).json({
      status_code: 200,
      message: "Messages fetched successfully",
      data: {
        messages: messages.reverse(),
        total_messages: totalMessages,
        total_pages: totalPages,
        current_page: page,
      },
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

const getUserAllChats = async (req, res, next) => {
  const userId = req.userId;
  const { page = 1, limit = 20 } = req.query;
  const skip = parseInt((page - 1) * limit);

  try {
    console.time("user_chats");

    // Base query for fetching chats (without limit and offset)
    const baseQuery = db("chat_participants as cp")
      .innerJoin("chats as c", "cp.chat_id", "c.id")
      .innerJoin("chat_participants as cp2", "c.id", "cp2.chat_id")
      .leftJoin("users as u", "cp2.user_id", "u.user_id")
      .where("cp.user_id", userId)
      .andWhere("cp2.user_id", "!=", userId);

    // Clone the query for counting to avoid the side effects of limit and offset
    const countQuery = baseQuery
      .clone()
      .count("cp.chat_id as total_chats")
      .first();

    // Get the chats data with limit and offset applied
    const result = await baseQuery
      .distinct("c.id as chat_id", "u.user_id", "u.user_name", "u.profile_pic")
      .limit(parseInt(limit))
      .offset(skip)
      .debug(true);

    // Get the total count using the cloned query (without limit and offset)
    const countResult = await countQuery;

    console.timeEnd("user_chats");

    if (!result.length) {
      const apiResponse = new APIResponse({
        status_code: 200,
        message: "No chats found",
        data: { chats: [], total_chats: 0, total_pages: 0, current_page: 1 },
      });

      return res.status(200).json(apiResponse);
    }

    // Prepare the final response object
    const responseData = {
      chats: result,
      total_chats: countResult ? countResult.total_chats : 0,
      total_pages: Math.ceil(countResult.total_chats / limit), // Calculate total pages based on total count and limit
      current_page: page,
    };

    const apiResponse = new APIResponse({
      status_code: 200,
      message: "User details fetched successfully",
      data: responseData,
    });

    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

const sendMediaInMessage = async (req, res, next) => {
  const userId = req.userId;
  console.log(userId, 120);
  try {
    const { chat_id, receiver_id } = req.body;
    if (!chat_id) {
      return next(new ErrorHandler("chat id is required", 400));
    }
    console.log(receiver_id, 127);

    let message_type = "";
    const files = req.files;
    let message = "";

    if (files.image && files.image.length > 0) {
      message_type = "image";
      message = await uploadArrayOfImagesToCloudinary({
        files: files.image,
      });
    } else if (files.video && files.video.length > 0) {
      message_type = "video";
      message = await uploadArrayOfImagesToCloudinary({
        files: files.video,
      });
    }

    console.log(message, 123);

    const addMedia = await db("messages").insert({
      chat_id,
      sender_id: userId,
      message_type,
      message: JSON.stringify(message[0]),
    });

    console.log(addMedia, 143);

    if (addMedia.rowCount > 0) {
      const apiResponse = new APIResponse({
        status_code: 200,
        message: "Media uploaded successfully",
      });

      // Use the singleton instance of SocketHandler
      const socketHandler = SocketHandler;
      console.log("SocketHandler instance:", SocketHandler);
      console.log("SocketHandler socket:", SocketHandler.socket);
      console.log(
        "SocketHandler socketIOMapping:",
        SocketHandler.socketIOMapping
      );

      // Check if the recipient is mapped
      const recipientSocketId = SocketHandler.socketIOMapping.get(
        parseInt(receiver_id)
      );
      console.log("Recipient Socket ID:", recipientSocketId);
      // Send the message to the recipient using the sendToUser method
      socketHandler.sendToUser(receiver_id, "message_event", {
        message: message[0],
        sender_id: userId,
        receiver_id: receiver_id,
        message_type: message_type,
      });

      return res.status(200).json(apiResponse);
    } else {
      const apiResponse = new APIResponse({
        status: "failure",
        status_code: 400,
        message: "Failed to upload media",
      });
      return res.status(400).json(apiResponse);
    }
  } catch (error) {
    console.log(error, 125);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export { getChatMessagesByChatId, getUserAllChats, sendMediaInMessage };

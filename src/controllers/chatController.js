import { db } from "../config/databaseConfig.js";
import SocketHandler from "../helpers/socketExport.js";
import APIResponse from "../utils/apiResponse.js";
import { ErrorHandler } from "../utils/errorHandler.js";
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
    const user = await db("users")
      .select("user_name", "email", "first_name", "last_name", "profile_pic")
      .where("user_id", userId)
      .first();
    console.log(user, 61);
    console.time("user_chats");

    // Base query with DISTINCT ON logic
    const baseQuery = db
      .select(
        db.raw(
          `DISTINCT ON (c.id) 
           c.id AS chat_id, 
           c.type, 
           COALESCE(gp.group_id, u.user_id) AS user_id, 
           COALESCE(gp.group_name, u.user_name) AS user_name, 
           COALESCE(gp.group_icon, u.profile_pic) AS profile_pic`
        )
      )
      .from("chat_participants as cp")
      .join("chats as c", "cp.chat_id", "c.id")
      .join("chat_participants as cp2", "c.id", "cp2.chat_id")
      .leftJoin("users as u", function () {
        this.on("cp2.user_id", "u.user_id").andOnVal("c.type", "direct");
      })
      .leftJoin("groups as gp", function () {
        this.on("c.id", "gp.chat_id").andOnVal("c.type", "group");
      })
      .where("cp.user_id", userId)
      .andWhere((builder) =>
        builder.where("c.type", "group").orWhere("cp2.user_id", "!=", userId)
      )
      .orderBy("c.id")
      .orderByRaw("u.user_id NULLS LAST");

    // Count query (without limit and offset)
    const countQuery = db("chat_participants as cp")
      .join("chats as c", "cp.chat_id", "c.id")
      .where("cp.user_id", userId)
      .andWhere((builder) =>
        builder.where("c.type", "group").orWhereExists(function () {
          this.select("cp2.chat_id")
            .from("chat_participants as cp2")
            .whereRaw("cp2.chat_id = c.id")
            .whereNot("cp2.user_id", userId);
        })
      )
      .countDistinct("c.id as total_chats")
      .first();

    // Get paginated results
    const result = await baseQuery
      .clone()
      .limit(parseInt(limit))
      .offset(skip)
      .debug(true);

    // Get total chat count
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

    // Prepare response data
    const responseData = {
      user: user,
      chats: result,
      total_chats: countResult ? countResult.total_chats : 0,
      total_pages: Math.ceil(countResult.total_chats / limit),
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

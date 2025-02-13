import { db } from "../config/databaseConfig.js";
import APIResponse from "../utils/apiResponse.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { uploadArrayOfImagesToCloudinary } from "../utils/uploadImageToClodinary.js";
import cron from "node-cron";

const addUserStatus = async (req, res, next) => {
  const user_id = req.userId;
  let { type, data } = req.body;
  console.log(type, 5);
  try {
    const files = req.files;
    if (!user_id || !type) {
      return next(new ErrorHandler("All fields are required", 400));
    }
    console.log(files, 15);
    // return;
    // let media = "";
    if (type === "image" || type === "video") {
      if (Object.keys(files).length === 0) {
        return next(
          new ErrorHandler(
            "Media file is required for image and video type",
            400
          )
        );
      }
    }
    if (type === "image" || type === "video") {
      const mediaSource = await uploadArrayOfImagesToCloudinary({
        files: files.data,
      });
      data = JSON.stringify(mediaSource[0]);
    }

    const insert = await db("user_status").insert({
      user_id,
      type,
      data,
    });
    console.log(insert, 38);
    if (insert.rowCount > 0) {
      const apiResponse = new APIResponse({
        status_code: 201,
        message: "Status added successfully",
      });
      return res.status(201).json(apiResponse);
    } else {
      const apiResponse = new APIResponse({
        status: "failure",
        status_code: 400,
        message: "Failed to add status",
      });
      return res.status(400).json(apiResponse);
    }
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

const getUserStatus = async (req, res, next) => {
  const user_id = req.userId;
  try {
    const status = await db("user_status as us")
      .where("us.user_id", user_id)
      .leftJoin("users as u", "us.user_id", "u.user_id")
      .select(
        "us.status_id",
        "us.type",
        "us.data",
        "us.created_at",
        "u.profile_pic"
      );
    if (status.length === 0) {
      const apiResponse = new APIResponse({
        status_code: 200,
        message: "No status found",
        data: [],
      });
      return res.status(200).json(apiResponse);
    }
    const finalData = status.map((data) => {
      if (data.type === "image" || data.type === "video") {
        data.data = JSON.parse(data.data);
      }
      return data;
    });
    const apiResponse = new APIResponse({
      status_code: 200,
      message: "Status fetched successfully",
      data: finalData,
    });
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

const getUserChatsStatus = async (req, res, next) => {
  const user_id = req.userId;
  try {
    const baseQuery = await db("chat_participants as cp")
      .innerJoin("chats as c", "cp.chat_id", "c.id")
      .innerJoin("chat_participants as cp2", "c.id", "cp2.chat_id")
      .leftJoin("users as u", "cp2.user_id", "u.user_id")
      .where("cp.user_id", user_id)
      .andWhere("cp2.user_id", "!=", user_id)
      .distinct("c.id as chat_id", "u.user_id", "u.user_name", "u.profile_pic")
      .debug(true);
    console.log(baseQuery, 85);
    const user_ids = baseQuery.map((chat) => chat.user_id);
    console.log(user_ids, 87);
    const allChatStatus = await db("user_status as us")
      .select(
        "us.user_id",
        "u.user_name",
        "u.profile_pic",
        db.raw(`jsonb_agg(
           jsonb_build_object(
               'data', CASE 
                          WHEN us.type = 'video' OR us.type = 'image' THEN us.data::jsonb
                          ELSE to_jsonb(us.data::VARCHAR) 
                       END,
               'type', us.type
           )
       ) AS status_data`)
      )
      .leftJoin("users as u", "us.user_id", "u.user_id")
      .whereIn("us.user_id", user_ids)
      .groupBy("us.user_id", "u.user_name", "u.profile_pic")
      .debug(true);
    console.log(allChatStatus, 94);
    const apiResponse = new APIResponse({
      status_code: 200,
      message: "Status fetched successfully",
      data: allChatStatus,
    });
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};
cron.schedule("*/15 * * * *", async () => {
  try {
    console.log("Running expired status cleanup...");
    const deletedCount = await db("user_status")
      .whereRaw("expires_at < NOW()")
      .del();

    if (deletedCount > 0) {
      console.log(`${deletedCount} expired status records deleted.`);
    } else {
      console.log("No expired status records found.");
    }
  } catch (error) {
    console.error("Error during expired status cleanup:", error);
  }
});

export { addUserStatus, getUserStatus, getUserChatsStatus };

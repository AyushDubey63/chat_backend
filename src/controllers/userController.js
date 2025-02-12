import { ErrorHandler } from "../utils/errorHandler.js";
import APIResponse from "../utils/apiResponse.js";
import { db } from "../config/databaseConfig.js";

const searchUsers = async (req, res, next) => {
  const { search } = req.query;
  const userId = req.userId;
  try {
    const result = await db("users as u")
      .select(
        "u.user_id",
        "u.user_name",
        "u.profile_pic",
        db.raw("CONCAT(u.first_name, ' ', u.last_name) as full_name"),
        "u.email"
      )
      .whereNot("u.user_id", userId) // Exclude the current user's own ID
      .andWhere(function () {
        // Group all the search conditions together
        this.whereRaw("CONCAT(u.first_name, ' ', u.last_name) LIKE ?", [
          `%${search}%`,
        ])
          .orWhereILike("u.email", `%${search}%`)
          .orWhereILike("u.phone_number", `%${search}%`)
          .orWhereILike("u.user_name", `%${search}%`);
      })
      .debug(true);

    if (result.length === 0) {
      const apiResponse = new APIResponse({
        status_code: 200,
        message: "No users found",
        data: [],
      });
      return res.status(200).json(apiResponse);
    }
    const apiResponse = new APIResponse({
      status_code: 200,
      message: "Users fetched successfully",
      data: result,
    });
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

const getUserDetails = async (req, res, next) => {
  const userId = req.userId;
  console.log(userId, 71);
  try {
    console.time("user_chats");
    const result = await db.raw(
      `SELECT DISTINCT u.user_id, u.user_name, u.profile_pic 
      FROM chat_participants cp
      INNER JOIN chats c ON cp.chat_id = c.id
      INNER JOIN chat_participants cp2 ON c.id = cp2.chat_id
      LEFT JOIN users u ON cp2.user_id = u.user_id
      WHERE cp.user_id = ? AND cp2.user_id != 1
      LIMIT 25 OFFSET 0`,
      [userId] // Parameterized userId to avoid SQL injection
    );

    console.timeEnd("user_chats");

    if (!result.rows.length) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Prepare the final response object
    const responseData = {
      chats: result.rows,
    };

    const apiResponse = new APIResponse({
      status_code: 200,
      message: "User details fetched successfully",
      data: responseData,
    });

    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error, 90);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export { getUserDetails, searchUsers };

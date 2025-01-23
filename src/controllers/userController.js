import { ErrorHandler } from "../utils/errorHandler.js";
import APIResponse from "../utils/APIResponse.js";

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

export { getUserDetails };

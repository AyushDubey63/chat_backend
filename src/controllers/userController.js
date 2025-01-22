import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import {
  userLoginSchema,
  userRegistrationSchema,
} from "../validators/userValidators.js";
import { formatZodErrors } from "../helpers/formatZodError.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { generateToken } from "../utils/auth.js";
import { encryptData } from "../utils/serializeData.js";
import { db } from "../config/databaseConfig.js";
import APIResponse from "../utils/APIResponse.js";

const registerUser = async (req, res, next) => {
  try {
    const userData = userRegistrationSchema.parse(req.body);
    userData.password = await bcrypt.hash(userData.password, 10);

    // Insert the new user into the 'users' table using Knex
    const [insertedUser] = await db("users")
      .insert({
        user_name: userData.user_name,
        email: userData.email,
        password: userData.password,
      })
      .returning("*"); // This will return the inserted user details

    console.log(insertedUser, 23);

    const apiResponse = new APIResponse({
      status_code: 201,
      message: "User created successfully",
      data: insertedUser,
    });

    return res.status(201).json(apiResponse);
  } catch (error) {
    console.log(error, 24);
    if (error instanceof ZodError) {
      return formatZodErrors(error, res);
    }
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = userLoginSchema.parse(req.body);
    console.log(password, 39);

    // Find the user by email using Knex
    const user = await db("users").where({ email }).first();

    if (!user) {
      return next(new ErrorHandler("Invalid Credentials", 401));
    }

    console.log(user, 44);

    // Compare the password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid Credentials", 401));
    }

    const apiResponse = new APIResponse({
      status_code: 200,
      message: "User logged in successfully",
      data: user,
    });

    const token = generateToken({ userId: user.user_id });

    return res
      .cookie("token", encryptData(token), {
        httpOnly: true,
        sameSite: false,
      })
      .set("user_id", encryptData(String(user.user_id)))
      .status(200)
      .json(apiResponse);
  } catch (error) {
    console.log(error, 63);
    if (error instanceof ZodError) {
      return formatZodErrors(error, res);
    }
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

export { registerUser, loginUser, getUserDetails };
// SELECT u.user_name, m.message,m.created_at
// FROM messages m
// left join users u on m.sender_id = u.user_id
// WHERE m.chat_id = (
//     SELECT c1.chat_id
//     FROM chat_participants c1
//     LEFT JOIN chat_participants c2 ON c1.chat_id = c2.chat_id
//     WHERE c1.user_id = 1 AND c2.user_id = 2
//     LIMIT 1
// )
// ORDER BY m.created_at;

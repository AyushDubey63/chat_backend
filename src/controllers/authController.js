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
import APIResponse from "../utils/apiResponse.js";

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
    const user = await db("users")
      .select(
        "user_id",
        "user_name",
        "email",
        "password",
        "first_name",
        "last_name",
        "profile_pic"
      )
      .where({ email })
      .first();

    if (!user) {
      return next(new ErrorHandler("Invalid Credentials", 401));
    }

    console.log(user, 44);

    // Compare the password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid Credentials", 401));
    }

    const token = generateToken({ userId: user.user_id });
    delete user.password;
    delete user.user_id;
    const apiResponse = new APIResponse({
      status_code: 200,
      message: "User logged in successfully",
      data: user,
    });
    return res
      .cookie("token", encryptData(token), {
        httpOnly: true,
        sameSite: "None",
        secure: true,
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

const logoutUser = async (req, res) => {
  const apiResponse = new APIResponse({
    status_code: 200,
    message: "User logged out successfully",
    data: {},
  });

  return res
    .cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "None",
      secure: true,
    })
    .status(200)
    .json(apiResponse);
};
const authenicateUser = async (req, res) => {
  const apiResponse = new APIResponse({
    status_code: 200,
    message: "User is authenticated ",
    data: {
      isAuthenticated: true,
    },
  });
  return res.status(200).json(apiResponse);
};
export { registerUser, authenicateUser, loginUser, logoutUser };

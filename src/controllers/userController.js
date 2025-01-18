import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import {
  userLoginSchema,
  userRegistrationSchema,
} from "../validators/userValidators.js";
import { formatZodErrors } from "../helpers/formatZodError.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import db from "../config/dbConfig.js";
import APIRespose from "../utils/apiRespose.js";
import { generateToken } from "../utils/auth.js";
import { encryptData } from "../utils/serializeData.js";

const registerUser = async (req, res, next) => {
  try {
    const userData = userRegistrationSchema.parse(req.body);
    userData.password = await bcrypt.hash(userData.password, 10);
    const insertedUser = await db.user.create({
      data: {
        user_name: userData.user_name,
        email: userData.email,
        password: userData.password,
      },
    });
    console.log(insertedUser, 23);
    const apiResponse = new APIRespose({
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
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return next(new ErrorHandler("Invalid Credentials", 401));
    }
    console.log(user, 44);
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid Credentials", 401));
    }
    const apiResponse = new APIRespose({
      status_code: 200,
      message: "User logged in successfully",
      data: user[0],
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

const fetchUserDetails = async (req, res, next) => {
  const userId = req.userId;
  console.log(userId, 71);
  try {
    const user = await db.user.findUnique({ where: { user_id: userId } });
    const contactIds = user.contacts;
    let contacts = [];
    if (user.contacts.length > 0) {
      contacts = await db.user.findMany({ where: { user_id: contactIds } });
    }
    const userDetails = {
      ...user,
      contacts: contacts,
    };
    const apiResponse = new APIRespose({
      status_code: 200,
      message: "User details fetched successfully",
      data: userDetails,
    });
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.log(error, 90);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};
export { registerUser, loginUser, fetchUserDetails };

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
import sendMail from "../utils/sendMail.js";
import jwt from "jsonwebtoken";
import ejs from "ejs";
import { verifyAccount } from "../utils/mailTemplates.js";

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
    console.log(insertedUser, 24);
    if (insertedUser) {
      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log(otp, 34);
      const token = jwt.sign(
        { email: userData.email, otp },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      );
      console.log(token, 40);
      const email = await sendMail({
        to: userData.email,
        subject: "Account Verification",
        text: `Hello ${userData.user_name},Thank you for signing up with us!To complete your registration and verify your account`,
        html: verifyAccount({ email: userData.email, token }),
      });
      console.log(email, 35);
    }

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
        "profile_pic",
        "is_verified"
      )
      .where({ email })
      .first();

    if (!user) {
      return next(new ErrorHandler("Invalid Credentials", 401));
    }
    if (user.is_verified === false) {
      return next(new ErrorHandler("User not verified", 401));
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

const sendVerifyPage = async (req, res, next) => {
  const { email, token } = req.params;

  if (!email || !token) {
    return next(new ErrorHandler("Invalid Request", 400));
  }

  try {
    ejs.renderFile("src/views/verify.ejs", { email, token }, (err, data) => {
      if (err) {
        return next(new ErrorHandler("Error rendering verification page", 500));
      }
      return res.sendFile(data);
    });
  } catch (error) {
    return next(new ErrorHandler("Something went wrong", 500));
  }
};

const verifyOtp = async (req, res, next) => {
  const { token } = req.params;
  const { email, otp } = req.body;
  if (!email || !otp) {
    return next(new ErrorHandler("Invalid Request", 400));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.otp !== otp) {
      return next(new ErrorHandler("Invalid OTP", 401));
    }
    const [updatedUser] = await db("users")
      .where({ email })
      .update({ is_verified: true });
    console.log(updatedUser, 182);
    return res.redirect("http://localhost:5173/login");
  } catch (error) {
    console.log(error, 185);
    return next(new ErrorHandler("Invalid Token", 401));
  }
};
export {
  registerUser,
  authenicateUser,
  loginUser,
  logoutUser,
  sendVerifyPage,
  verifyOtp,
};

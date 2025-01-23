import { ErrorHandler } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import { decryptData } from "../utils/serializeData.js";
function verifyToken(req, _, next) {
  console.log("hello");
  try {
    // console.time("token");
    const token = req.cookies.token;
    console.log(req.cookies, 11);
    console.log(token, 12);
    const decoded = jwt.verify(decryptData(token), process.env.JWT_SECRET);
    req.userId = decoded.userId;
    // console.timeEnd("token");
    next();
  } catch (error) {
    next(new ErrorHandler("Unauthorized Token", 401));
  }
}
export { verifyToken };

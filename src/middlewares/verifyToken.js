import { ErrorHandler } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
function verifyToken(req, _, next) {
  try {
    const token = req.headers["x-auth-token"];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(new ErrorHandler("Unauthorized", 401));
  }
}
export { verifyToken };

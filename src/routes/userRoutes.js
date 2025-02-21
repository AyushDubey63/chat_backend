import { Router } from "express";
import {
  getUserDetails,
  getUserDetailsById,
  searchUsers,
  updateUser,
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { multerUpload } from "../config/multerConfig.js";

const router = Router();

router.get("/get-user-details", verifyToken, getUserDetails);
router.get("/get-user-details-by-id", verifyToken, getUserDetailsById);
router.get("/search-users", verifyToken, searchUsers);
router.patch(
  "/update-user",
  verifyToken,
  multerUpload.array("files", 1),
  updateUser
);
export default router;

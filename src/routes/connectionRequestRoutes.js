import { Router } from "express";
import { getAllConnectionRequests } from "../controllers/connectionRequest.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();
router.get("/get-connection-requests", verifyToken, getAllConnectionRequests);
export default router;

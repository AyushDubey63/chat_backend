import { Router } from "express";
import {
  getAllConnectionRequestReceived,
  getAllConnectionRequestSent,
} from "../controllers/connectionRequest.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();
router.get(
  "/get-connection-requests-received",
  verifyToken,
  getAllConnectionRequestReceived
);

router.get(
  "/get-connection-requests-sent",
  verifyToken,
  getAllConnectionRequestSent
);
export default router;

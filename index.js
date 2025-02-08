import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";

import SocketHandler from "./src/helpers/socketExport.js";
import errorMiddleWare from "./src/middlewares/errorMiddleware.js";

import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import connectRequestRoutes from "./src/routes/connectionRequestRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.1.177"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});
const socketHandler = new SocketHandler();
socketHandler.setSocketInstance(io);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.1.177"],
    credentials: true,
    exposedHeaders: ["user_id"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/request", connectRequestRoutes);
app.use("/api/v1/notification", notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found", route: req.originalUrl });
});
app.use(errorMiddleWare);

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

import { decryptData } from "../utils/serializeData.js";
import jwt from "jsonwebtoken";
class SocketHandler {
  constructor() {
    this.socket = null;
    this.socketIOMapping = new Map(); // Maps user_id to socket ID
  }

  // Set the Socket.io instance
  setSocketInstance(io) {
    this.socket = io;

    this.socket.on("connection", (socket) => {
      console.log(socket?.handshake);

      const cookie = socket?.handshake?.headers?.cookie;
      if (!cookie) {
        console.error("No cookie found");
        return;
      }

      const token = cookie.split("=")[1];
      if (!token) {
        console.error("Token is missing in the cookie");
        return;
      }

      try {
        console.log(String(token), 28);
        console.log(decryptData(String(token)), 29);
        const userid = jwt.verify(decryptData(token), process.env.JWT_SECRET);
        console.log(userid);
        this.userMapping(userid.userId, socket.id);
      } catch (error) {
        console.error("Error verifying JWT:", error);
      }

      const user_id = decryptData(socket?.handshake?.auth?.user_id);
      if (!user_id) {
        console.error("No user_id found in handshake");
        return;
      }
      console.log("A user connected:", user_id);

      socket.on("send_message", ({ message, receiver_id }) => {
        console.log("Message received:", message, receiver_id);
        const socket_id = this.socketIOMapping.get(receiver_id);
        socket
          .to(socket_id)
          .emit("receive_message", { message, sender_id: user_id });
      });

      // Handle user disconnect
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        this.removeUserMapping(socket.id);
      });

      // Example of handling user mapping from the client side
      socket.on("user_connected", (user_id) => {
        this.userMapping(user_id, socket.id);
      });
    });
  }

  // Emit a message to all connected users
  emit(event, message) {
    this.socket.emit(event, message);
  }

  // Map user_id to the socket ID
  userMapping(user_id, socket_id) {
    // Save the mapping in the socketIOMapping map
    this.socketIOMapping.set(user_id, socket_id);
    console.log(`User ${user_id} mapped to socket ID ${socket_id}`);
  }

  // Remove the user mapping for a given socket ID
  removeUserMapping(socket_id) {
    // Find the user_id associated with this socket_id and remove the mapping
    for (let [user_id, id] of this.socketIOMapping.entries()) {
      if (id === socket_id) {
        this.socketIOMapping.delete(user_id);
        console.log(`Mapping for user ${user_id} removed.`);
        break;
      }
    }
  }

  // Emit an event/message to a specific user by user_id
  sendToUser(user_id, event, message) {
    const socket_id = this.socketIOMapping.get(user_id);
    if (socket_id) {
      this.socket.to(socket_id).emit(event, message);
      console.log(`Sent message to user ${user_id} via socket ID ${socket_id}`);
    } else {
      console.log(`User ${user_id} not connected.`);
    }
  }

  // Emit an event/message to all users (broadcast)
  broadcast(event, message) {
    this.socket.emit(event, message);
    console.log(`Broadcasting message: ${message}`);
  }
}

export default SocketHandler;

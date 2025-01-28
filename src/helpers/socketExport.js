import { db } from "../config/databaseConfig.js";
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
      let userid = null;
      try {
        console.log(String(token), 28);
        console.log(decryptData(String(token)), 29);
        userid = jwt.verify(decryptData(token), process.env.JWT_SECRET);
        console.log(userid);
        this.userMapping(userid.userId, socket.id);
      } catch (error) {
        console.error("Error verifying JWT:", error);
      }

      if (!userid) {
        console.error("No user_id found in handshake");
        return;
      }
      console.log("A user connected:", userid);

      socket.on("message_event", async ({ message, chat_data }) => {
        console.log("Message received:", message, chat_data);

        // Make sure to use the correct `userId` that should be the sender's ID
        // Assuming you have a userId available via some session or auth mechanism
        const senderId = userid.userId; // Or directly use the variable where userId is stored

        console.log("Sender User ID:", senderId);

        try {
          // Insert the new message into the database
          const [new_message] = await db("messages")
            .insert({
              chat_id: chat_data.chat_id,
              sender_id: senderId, // Sender is the authenticated user
              message,
            })
            .returning("*"); // Returning the inserted message object

          console.log("New message inserted with ID:", new_message.id);

          // Assuming chat_data contains the recipient user ID to send the message to
          const recipientSocketId = this.socketIOMapping.get(chat_data.user_id);

          if (recipientSocketId) {
            // Emit the message to the recipient's socket
            socket.to(recipientSocketId).emit("message_event", {
              message: new_message.message,
              sender_id: senderId,
              chat_id: chat_data.chat_id,
            });
          } else {
            console.log(
              "Recipient socket ID not found for user_id:",
              chat_data.user_id
            );
          }
        } catch (error) {
          console.error("Error handling send_message:", error);
        }
      });
      socket.on("notification", async ({ receiver_id, type, message }) => {
        const senderId = userid.userId;
        console.log("Notification received:", receiver_id, type, senderId);
        const recipientSocketId = this.socketIOMapping.get(
          message_data.receiver_id
        );
        if (message_data.type === "chat_request") {
          db("connection_requests")
            .insert({
              sender_id: senderId,
              receiver_id: message_data.receiver_id,
              status: message_data.status,
            })
            .returning("*");
        }
        db("notifications")
          .insert({
            sender_id: senderId,
            receiver_id: message_data.receiver_id,
            message: message_data.message,
            type: message_data.type,
          })
          .returning("*");
        if (recipientSocketId) {
          // Emit the message to the recipient's socket
          socket.to(recipientSocketId).emit("notification", {
            message: message_data.message,
            sender_id: senderId,
            chat_id: message_data.chat_id,
            type: message_data.type,
            status: message_data.status,
          });
        } else {
          console.log(
            "Recipient socket ID not found for user_id:",
            message_data.receiver_id
          );
        }
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

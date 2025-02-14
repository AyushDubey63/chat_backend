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

        const senderId = userid.userId; // Ensure you have the correct user ID

        console.log("Sender User ID:", senderId);

        try {
          // Insert the new message into the database
          const [new_message] = await db("messages")
            .insert({
              chat_id: chat_data.chat_id,
              sender_id: senderId,
              message,
            })
            .returning("*");

          console.log("New message inserted with ID:", new_message.id);

          // Get all chat members' user_ids
          const allChatMembers = await db("chat_participants")
            .where({ chat_id: chat_data.chat_id })
            .whereNot("user_id", senderId)
            .select("user_id");

          const recipientSocketIds = allChatMembers.map((member) =>
            this.socketIOMapping.get(member.user_id)
          );

          if (recipientSocketIds.length > 0) {
            // Use Promise.all to emit messages to all recipients concurrently
            await Promise.all(
              recipientSocketIds.map((id) => {
                socket.to(id).emit("message_event", {
                  message: new_message.message,
                  sender_id: senderId,
                  chat_id: chat_data.chat_id,
                });
              })
            );
          } else {
            console.log(
              "Recipient socket IDs not found for chat_id:",
              chat_data.chat_id
            );
          }
        } catch (error) {
          console.error("Error while handling message_event:", error);
        }
      });

      socket.on("notification", async ({ receiver_id, type, message_data }) => {
        console.log(receiver_id, type, message_data, 87);
        try {
          const senderId = userid.userId;
          console.log("Notification received:", receiver_id, type, senderId);

          // Validate required fields
          if (!receiver_id || !type || !message_data) {
            console.error("Invalid notification payload");
            return;
          }

          // Handle chat requests and acceptances
          if (type === "chat_request" || type === "chat_accept") {
            let request;
            let notification;

            try {
              // Insert or update connection request
              if (type === "chat_request") {
                // Create a new connection request
                [request] = await db("connection_requests")
                  .insert({
                    sender_id: senderId,
                    receiver_id: receiver_id,
                    status: message_data.status || "pending",
                  })
                  .returning("*");

                // Prepare notification message
                notification = {
                  sender_id: senderId,
                  receiver_id: receiver_id,
                  message: "You have a new chat request",
                  type: type,
                };
              } else {
                // Update existing connection request (accepting)
                [request] = await db("connection_requests")
                  .where({ request_id: message_data.request_id })
                  .update({ status: "accepted" })
                  .returning("*");

                const chat = await db("chats")
                  .insert({
                    type: "direct",
                  })
                  .returning("*");
                console.log(chat, 134);
                await db("chat_participants").insert({
                  chat_id: chat[0].id,
                  user_id: senderId,
                });

                await db("chat_participants").insert({
                  chat_id: chat[0].id,
                  user_id: receiver_id,
                });

                // Prepare notification message
                notification = {
                  sender_id: senderId,
                  receiver_id: receiver_id,
                  message: "Chat request accepted",
                  type: type,
                };
              }
              console.log(notification, 139);
              // Insert notification into the database
              const [notificationResult] = await db("notifications")
                .insert(notification)
                .returning("*");

              // Send real-time notification to the recipient if online
              const recipientSocketId = this.socketIOMapping.get(receiver_id);
              if (recipientSocketId) {
                socket.to(recipientSocketId).emit("notification", {
                  ...notificationResult,
                  sender_id: senderId,
                  receiver_id: receiver_id, // Include receiver ID
                });
              } else {
                console.log("Recipient offline:", receiver_id);
              }

              // Send confirmation to sender
              socket.to(this.userMapping(senderId)).emit("notification", {
                ...notification,
              });
            } catch (error) {
              console.error("Database operation failed:", error);

              // Send error notification to the sender if database operation fails
              socket.to(this.userMapping(senderId)).emit("notification", {
                success: false,
                error: "Failed to process notification. Please try again.",
              });
            }
          }
        } catch (error) {
          console.error("Notification error:", error);
          socket.emit("notification", {
            success: false,
            error: "Failed to process notification",
          });
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
    console.log(user_id, event, message, 233);
    const socket_id = this.socketIOMapping.get(parseInt(user_id));
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
  static getInstance() {
    if (!SocketHandler.instance) {
      SocketHandler.instance = new SocketHandler();
    }
    return SocketHandler.instance;
  }
}

export default SocketHandler.getInstance();

import { Server } from "socket.io";
import http from "http";
import express from "express";
import { markAsDelivered } from "./messageStatus.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST"]
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[String(userId)];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[String(userId)] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", { senderId: userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userStopTyping", { senderId: userId });
    }
  });

  socket.on("messageDelivered", async ({ messageId }) => {
    if (messageId && userId) {
      await markAsDelivered(messageId, userId);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[String(userId)];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
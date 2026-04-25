import { Server } from "socket.io";
import http from "http";
import express from "express";
import Group from "../models/groupModel.js";

const app = express();
const server = http.createServer(app);

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.CLIENT_URL] // Set CLIENT_URL in Render dashboard
    : ["http://localhost:5173", "http://localhost:3000"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;

    // Auto-join all group rooms the user belongs to
    try {
      const userGroups = await Group.find({ members: userId }).select("_id");
      userGroups.forEach((group) => {
        socket.join(`group:${group._id}`);
      });
      console.log(`User ${userId} joined ${userGroups.length} group rooms`);
    } catch (error) {
      console.error("Error joining group rooms:", error.message);
    }
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
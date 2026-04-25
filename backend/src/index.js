import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/authRoute.js";
import messageRoutes from "./routes/messageRoute.js";
import aiRoutes from "./routes/aiRoute.js";
import groupRoutes from "./routes/groupRoute.js";
import { app, server } from "./lib/socket.js";


// dotenv.config();

dotenv.config({ override: true });

 const PORT = process.env.PORT;
// const PORT = 5000;

const __dirname = path.resolve();

// this line causes limit error when sending large files, you can adjust the limit as needed or remove it if you don't need to handle large payloads so i replce it with the line below, you can uncomment it if you want to use it and adjust the limit as needed
// app.use(express.json());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));


app.use(cookieParser());
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );


const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.CLIENT_URL] // Set CLIENT_URL in Render dashboard
    : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);




app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/groups", groupRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log(`server is running on address http://localhost:${PORT}`);
  connectDB();
});
import express from "express";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import noteRoutes from "./routes/note.route.js";
import chatRoutes from "./routes/chat.route.js";
import http from "http";
import { Server } from "socket.io";

// Load Environment Variables
dotenv.config();

// Initialize Express App
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

//Configure Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
})); // Allows cross-origin requests (from our frontend)
app.use(express.json()); // Allows the server to accept JSON in request bodies
app.use("/api/notes", noteRoutes);
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("Cloudinary configured...");

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

io.on("connection", (socket) => {
  // console.log(`User Connected: ${socket.id}`);

  // Join a room based on user ID to allow private messaging
  socket.on("join_room", ({ userId, userName }) => {
    socket.join(userId);
    console.log(`User: ${userName} (${userId}) joined their personal room`);
  });

  socket.on("send_message", (data) => {
    // data should contain recipientId
    // Emit to the recipient's room
    io.to(data.recipientId).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});


//Connect to MongoDB and Start Server
console.log("Connecting to MongoDB...");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully.");
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });

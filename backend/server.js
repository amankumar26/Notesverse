import express from "express";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import noteRoutes from "./routes/note.route.js";
import chatRoutes from "./routes/chat.route.js";
import paymentRoutes from "./routes/payment.route.js";
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
app.use("/api/payments", paymentRoutes);

io.on("connection", (socket) => {
  // console.log(`New Connection: ${socket.id}`);

  // Join a room based on user ID to allow private messaging
  socket.on("join_room", ({ userId, userName }) => {
    socket.userId = userId;
    socket.userName = userName;
    socket.join(userId);
    console.log(`User Identified: ${userName} (ID: ${userId})`);
  });

  socket.on("send_message", (data) => {
    // data should contain recipientId
    // Emit to the recipient's room
    io.to(data.recipientId).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    const userIdentifier = socket.userName ? `${socket.userName} (ID: ${socket.userId})` : `Unknown User (${socket.id})`;
    console.log(`User Disconnected: ${userIdentifier}`);
  });
});


// Connect to MongoDB
console.log("Initializing database connection...");
if (!process.env.MONGO_URI) {
  console.error("CRITICAL ERROR: MONGO_URI is not defined in .env file.");
} else {
  mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    })
    .then(() => {
      console.log("✅ MongoDB connected successfully.");
    })
    .catch((error) => {
      console.error("❌ MongoDB connection failed:", error.message);
      console.log("Tip: Check if your IP is whitelisted in MongoDB Atlas or if your network blocks port 27017.");
      // We don't necessarily want to kill the whole server if we want independent 'services',
      // but without a DB, most of this monolith won't work.
      // process.exit(1); 
    });
}

// Start Server independently of DB status to allow 'service-up' checks
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 Service: Backend Gateway (Microservice Ready)`);
});


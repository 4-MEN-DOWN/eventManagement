import dotenv from "dotenv";
dotenv.config(); // Load environment variables

import { app } from "./app.js";
import { connectToDatabase } from "./db.js";
import { v2 as cloudinary } from "cloudinary";
import { removeUnverifiedAccounts } from "./services/removeUnverifiedAccounts.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupCronJobs } from "./utils/cronJobs.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

// Important: Use Render's dynamic PORT (default is 10000 on Render)
const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.io
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Optional: Good for production
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Store socket connections (you can improve this later with Redis if needed)
const userSockets = new Map(); // Better to use Map instead of object

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join", (userId) => {
    if (!userId) return;

    socket.join(userId);
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Clean up userSockets
    for (const [userId, sockId] of userSockets.entries()) {
      if (sockId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});

// Make io accessible in your routes/controllers
app.set("io", io);

// Run background jobs
removeUnverifiedAccounts(); // Uncomment notifyUsers() if needed

// Setup cron jobs
setupCronJobs();

// Connect to Database and Start Server
connectToDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(
        `Backend URL: https://${process.env.RENDER_EXTERNAL_HOSTNAME || "your-app"}.onrender.com`,
      );
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1); // Exit if DB fails
  });

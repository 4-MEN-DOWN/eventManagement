import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

// Routes
import authRouter from "./routes/authRoute.js";
import eventRouter from "./routes/eventRoute.js";
import userRouter from "./routes/userRoute.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import Adrouter from "./routes/adRoute.js";
import recommendRouter from "./routes/recommendRoute.js";
import messageRouter from "./routes/messageRoute.js";
import bannerRouter from "./routes/bannerRoute.js";

export const app = express();

// ✅ CORS setup for multiple frontend ports
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 🔑 API routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/event", eventRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/ads", Adrouter);
app.use("/recommend", recommendRouter);
app.use("/api/v1/banner", bannerRouter);
app.use("/api/messages", messageRouter);

// Error handling middleware (should always be last)
app.use(errorMiddleware);

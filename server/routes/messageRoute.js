import express from "express";
import { authMiddleWare } from "../middlewares/authMiddleWare.js";
import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUserMessages,
  getEventMessages,
  getAllUserMessages,
} from "../controllers/messageController.js";

const messageRouter = express.Router();
messageRouter.get("/user/all", authMiddleWare, getAllUserMessages);

// Get all messages for a user across all events
messageRouter.get("/user", authMiddleWare, getUserMessages);

// Get all messages for a specific event
messageRouter.get("/event/:eventId", authMiddleWare, getEventMessages);

// Get all messages for a conversation
messageRouter.get("/:eventId/:organizerId", authMiddleWare, getMessages);

// Send a message
messageRouter.post("/", authMiddleWare, sendMessage);

// Mark messages as read
messageRouter.patch(
  "/read/:eventId/:organizerId",
  authMiddleWare,
  markMessagesAsRead
);
export default messageRouter;

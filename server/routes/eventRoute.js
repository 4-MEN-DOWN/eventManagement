import express from "express";
import {
  addCommentToEvent,
  addEvent,
  addToEventsToAttend,
  addToWatchlist,
  cancelEventAttendance,
  completeEventPayment,
  deleteOrganizedEvent,
  editOrganizedEvent,
  geoCheckIn,
  getAllEvents,
  getEventWithSentimentStats,
  getLiveEvents,
  getOrganizedEvents,
  markEventAttendance,
  removeEvent,
  removeFromWatchlist,
  updateEvent,
  updateEventStatus,
  updateTicketQuantity,
  detectNearbyEvents,
  completeGeoCheckIn,
  cleanupAttendees,
  getEventOrganizerStats,
  getAvailableSeats,
  sendEventSummary,
  rateOrganizer,
  getOrganizerRatings,
  getOrganizerProfile, // Add this import
} from "../controllers/eventController.js";
import { authMiddleWare, isAuthorized } from "../middlewares/authMiddleWare.js";
import { uploadBanner } from "../middlewares/upload.js";

const eventRouter = express.Router();

// -------------------- Geo Check-In Routes --------------------
eventRouter.post("/detect-nearby", authMiddleWare, detectNearbyEvents);
eventRouter.post("/complete-checkin", authMiddleWare, completeGeoCheckIn);
eventRouter.post("/geo-checkin", authMiddleWare, geoCheckIn);

// -------------------- Admin Routes --------------------
eventRouter.post(
  "/add",
  authMiddleWare,
  uploadBanner.single("banner"),
  addEvent
);
eventRouter.delete("/remove/:id", authMiddleWare, removeEvent);
eventRouter.put("/update/:id", authMiddleWare, updateEvent);
eventRouter.put(
  "/update-status/:id",
  authMiddleWare,
  isAuthorized("admin"),
  updateEventStatus
);

// -------------------- Seat Selection Routes --------------------
eventRouter.get("/:eventId/available-seats", authMiddleWare, getAvailableSeats);

// -------------------- Public / Auth Routes --------------------
eventRouter.get("/all", getAllEvents);
eventRouter.get("/live", getLiveEvents);

// Watchlist
eventRouter.post("/watchlist/add/:eventId", authMiddleWare, addToWatchlist);
eventRouter.put(
  "/watchlist/remove/:eventId",
  authMiddleWare,
  removeFromWatchlist
);

// Attend event (purchase tickets) → generates QR codes
eventRouter.post("/attend", authMiddleWare, addToEventsToAttend);
eventRouter.delete("/attend/:eventId", authMiddleWare, cancelEventAttendance);
eventRouter.put("/tickets/:eventId", authMiddleWare, updateTicketQuantity);

// -------------------- Organized Events --------------------
eventRouter.get("/:id/organized-events", authMiddleWare, getOrganizedEvents);
// Update the organized event route to handle file uploads
eventRouter.put(
  "/organized/:eventId",
  authMiddleWare,
  uploadBanner.single("banner"), // Add this middleware
  editOrganizedEvent
);
eventRouter.delete("/organized/:eventId", authMiddleWare, deleteOrganizedEvent);

// -------------------- Comments & Sentiment --------------------
eventRouter.post("/:eventId/comment", authMiddleWare, addCommentToEvent);
eventRouter.get("/:eventId/sentiment", getEventWithSentimentStats);

// -------------------- QR Code Ticket Validation --------------------
eventRouter.post(
  "/attend/:eventId/complete-payment",
  authMiddleWare,
  completeEventPayment
);
eventRouter.put(
  "/tickets/update/:ticketId",
  authMiddleWare,
  updateTicketQuantity
);
eventRouter.delete(
  "/attend/ticket/:ticketId",
  authMiddleWare,
  cancelEventAttendance
);

// Event summary and rating routes
eventRouter.post("/:eventId/send-summary", authMiddleWare, sendEventSummary);
eventRouter.post("/:eventId/rate-organizer", authMiddleWare, rateOrganizer);
eventRouter.get("/:eventId/organizer-ratings", getOrganizerRatings);
eventRouter.get("/organizer/:organizerId/profile", getOrganizerProfile);
// In your eventRoutes.js
eventRouter.get(
  "/organizer-stats/:eventId",
  authMiddleWare,
  getEventOrganizerStats
);
eventRouter.post("/mark-attendance", authMiddleWare, markEventAttendance);

// -------------------- Cleanup Route (Temporary) --------------------
eventRouter.get("/cleanup-attendees", cleanupAttendees);

export default eventRouter;

// RecommendRoute.js
import express from "express";
import {
  getRecommendations,
  getSimilarEvents,
} from "../controllers/recommendController.js";

const recommendRouter = express.Router();

// Main recommendation route (based on attended events only)
recommendRouter.get("/:userId", getRecommendations);

// Similar events route for a specific event
recommendRouter.get("/similar/:eventId", getSimilarEvents);

export default recommendRouter;

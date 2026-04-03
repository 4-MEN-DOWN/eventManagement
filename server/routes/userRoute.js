import express from "express";
import { authMiddleWare, isAuthorized } from "../middlewares/authMiddleWare.js";
import {
  getAllUsers,
  registerTheNewAdmin,
  getMyEvents,
  verifySubscriptionPayment,
  getSubscriptionDetails,
  checkEventCreationEligibility,
  cancelSubscription,
  getSubscriptionAnalytics,
} from "../controllers/userController.js";

const userRouter = express.Router();

// 👤 Admin-only routes - CHANGED: "Admin" to "admin"
userRouter
  .route("/all")
  .get(authMiddleWare, isAuthorized("admin"), getAllUsers);

userRouter
  .route("/add/new-admin")
  .post(authMiddleWare, isAuthorized("admin"), registerTheNewAdmin);

// 👤 Subscription analytics (Admin only) - CHANGED: "Admin" to "admin"
userRouter
  .route("/subscription/analytics")
  .get(authMiddleWare, isAuthorized("admin"), getSubscriptionAnalytics);

// 👤 Logged-in user routes
userRouter.get("/me/events", authMiddleWare, getMyEvents);

// Subscription routes
userRouter.post(
  "/subscription/verify",
  authMiddleWare,
  verifySubscriptionPayment
);
userRouter.get("/subscription", authMiddleWare, getSubscriptionDetails);
userRouter.post(
  "/check-event-eligibility",
  authMiddleWare,
  checkEventCreationEligibility
);
userRouter.post("/subscription/cancel", authMiddleWare, cancelSubscription);

export default userRouter;

// import express from "express";
// import {
//   createAd,
//   getAds,
//   getUserAds,
//   getAllAds,
//   updateAdStatus,
//   deleteAd,
// } from "../controllers/AdController.js";
// import { uploadAdBanner } from "../middlewares/upload.js";
// import { authMiddleWare, isAuthorized } from "../middlewares/authMiddleware.js";

// const Adrouter = express.Router();

// // Create new ad (authenticated users only)
// Adrouter.post(
//   "/create",
//   authMiddleWare,
//   uploadAdBanner.single("banner"),
//   createAd
// );

// // Get user's ads (authenticated users only)
// Adrouter.get("/my-ads", authMiddleWare, getUserAds);

// // Get all ads (admin only) - Check for both "Admin" and "admin"
// Adrouter.get("/all", authMiddleWare, getAllAds);

// // Update ad status (admin only) - Check for both "Admin" and "admin"
// Adrouter.patch(
//   "/:id/status",
//   authMiddleWare,
//   (req, res, next) => {
//     if (req.user && (req.user.role === "admin" || req.user.role === "Admin")) {
//       next();
//     } else {
//       return res
//         .status(403)
//         .json({ message: "Access denied. Admin required." });
//     }
//   },
//   updateAdStatus
// );

// // Delete ad (owner or admin)
// Adrouter.delete("/:id", authMiddleWare, deleteAd);

// // Get approved ads (public)
// Adrouter.get("/", getAds);

// export default Adrouter;
import express from "express";
import {
  createAd,
  getAds,
  getUserAds,
  getAllAds,
  updateAdStatus,
  deleteAd,
  trackAdView,
  trackAdClick,
  getAdAnalytics,
} from "../controllers/AdController.js";
import { uploadAdBanner } from "../middlewares/upload.js";
import { authMiddleWare, isAuthorized } from "../middlewares/authMiddleware.js";

const Adrouter = express.Router();

// Create new ad (authenticated users only)
Adrouter.post(
  "/create",
  authMiddleWare,
  uploadAdBanner.single("banner"),
  createAd
);

// Get user's ads (authenticated users only)
Adrouter.get("/my-ads", authMiddleWare, getUserAds);

// Get all ads (admin only)
Adrouter.get("/all", authMiddleWare, getAllAds);

// Update ad status (admin only)
Adrouter.patch(
  "/:id/status",
  authMiddleWare,
  (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.role === "admin")) {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "Access denied. Admin required." });
    }
  },
  updateAdStatus
);

// Delete ad (owner or admin)
Adrouter.delete("/:id", authMiddleWare, deleteAd);

// Get approved ads (public)
Adrouter.get("/", getAds);

// Track ad view (public)
Adrouter.post("/:id/view", trackAdView);

// Track ad click and redirect (public)
Adrouter.get("/:id/click", trackAdClick);

// Get ad analytics (ad owner or admin)
Adrouter.get("/:id/analytics", authMiddleWare, getAdAnalytics);

export default Adrouter;

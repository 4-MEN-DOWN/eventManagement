// import Ad from "../models/Ad.js";
// import { sendAdStatusEmail } from "../utils/emailService.js"; // Add this import

// // Create ad
// export const createAd = async (req, res) => {
//   try {
//     const { title, link, adType } = req.body;
//     const banner = req.file ? `/uploads/ad-banners/${req.file.filename}` : null;

//     if (!banner) {
//       return res.status(400).json({ message: "Banner image is required" });
//     }

//     if (!adType || !["standard", "premium"].includes(adType)) {
//       return res.status(400).json({ message: "Valid ad type is required" });
//     }

//     // Set position automatically based on ad type
//     let position = adType === "premium" ? "homepage-top" : "homepage-sidebar";

//     // Get user info from request (set by your authMiddleware)
//     const user = req.user; // This is set by your authMiddleWare

//     const ad = await Ad.create({
//       title,
//       link,
//       banner,
//       adType,
//       position,
//       createdBy: user._id,
//       userEmail: user.email,
//       userName: user.name || user.username,
//     });

//     res.status(201).json(ad);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get approved ads (public endpoint)
// export const getAds = async (req, res) => {
//   try {
//     const ads = await Ad.find({ status: "approved" });
//     res.json(ads);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get ads for specific user (protected endpoint)
// export const getUserAds = async (req, res) => {
//   try {
//     const user = req.user; // From authMiddleware
//     const ads = await Ad.find({ createdBy: user._id });
//     res.json(ads);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get all ads for admin (protected endpoint)
// export const getAllAds = async (req, res) => {
//   try {
//     const ads = await Ad.find().populate("createdBy", "name email");
//     res.json(ads);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Update ad status (admin only)
// export const updateAdStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, rejectionReason } = req.body; // Add rejectionReason

//     if (!["pending", "approved", "rejected"].includes(status)) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     const ad = await Ad.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     ).populate("createdBy", "name email");

//     if (!ad) {
//       return res.status(404).json({ message: "Ad not found" });
//     }

//     // Send email notification for approved/rejected ads
//     if (status === "approved" || status === "rejected") {
//       // Send email asynchronously (don't await to avoid blocking response)
//       sendAdStatusEmail(ad, status, rejectionReason)
//         .then((success) => {
//           if (success) {
//             console.log(
//               `Ad status email sent successfully for ad: ${ad.title}`
//             );
//           } else {
//             console.error(`Failed to send ad status email for ad: ${ad.title}`);
//           }
//         })
//         .catch((err) => {
//           console.error("Error in email sending process:", err);
//         });
//     }

//     res.json(ad);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Delete ad (owner or admin)
// export const deleteAd = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = req.user;

//     const ad = await Ad.findById(id);

//     if (!ad) {
//       return res.status(404).json({ message: "Ad not found" });
//     }

//     // Check if user is owner or admin
//     if (
//       ad.createdBy.toString() !== user._id.toString() &&
//       user.role !== "admin"
//     ) {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to delete this ad" });
//     }

//     await Ad.findByIdAndDelete(id);
//     res.json({ message: "Ad deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
import Ad from "../models/Ad.js";
import { sendAdStatusEmail } from "../utils/emailService.js";

// Create ad
export const createAd = async (req, res) => {
  try {
    const { title, link, adType } = req.body;
    const banner = req.file ? `/uploads/ad-banners/${req.file.filename}` : null;

    if (!banner) {
      return res.status(400).json({ message: "Banner image is required" });
    }

    if (!adType || !["standard", "premium"].includes(adType)) {
      return res.status(400).json({ message: "Valid ad type is required" });
    }

    // Set position automatically based on ad type
    let position = adType === "premium" ? "homepage-top" : "homepage-sidebar";

    // Get user info from request (set by your authMiddleware)
    const user = req.user;

    const ad = await Ad.create({
      title,
      link,
      banner,
      adType,
      position,
      createdBy: user._id,
      userEmail: user.email,
      userName: user.name || user.username,
      views: 0,
      clicks: 0,
      clickEvents: [],
    });

    res.status(201).json(ad);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get approved ads (public endpoint)
export const getAds = async (req, res) => {
  try {
    const ads = await Ad.find({ status: "approved" });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get ads for specific user (protected endpoint)
export const getUserAds = async (req, res) => {
  try {
    const user = req.user;
    const ads = await Ad.find({ createdBy: user._id });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all ads for admin (protected endpoint)
export const getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find().populate("createdBy", "name email");
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update ad status (admin only)
export const updateAdStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const ad = await Ad.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("createdBy", "name email");

    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    // Send email notification for approved/rejected ads
    if (status === "approved" || status === "rejected") {
      sendAdStatusEmail(ad, status, rejectionReason)
        .then((success) => {
          if (success) {
            console.log(
              `Ad status email sent successfully for ad: ${ad.title}`
            );
          } else {
            console.error(`Failed to send ad status email for ad: ${ad.title}`);
          }
        })
        .catch((err) => {
          console.error("Error in email sending process:", err);
        });
    }

    res.json(ad);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete ad (owner or admin)
export const deleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const ad = await Ad.findById(id);

    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    // Check if user is owner or admin
    if (
      ad.createdBy.toString() !== user._id.toString() &&
      user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this ad" });
    }

    await Ad.findByIdAndDelete(id);
    res.json({ message: "Ad deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Track ad view (public endpoint)
export const trackAdView = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    // Increment view count
    ad.views += 1;
    await ad.save();

    res.json({ message: "View tracked successfully", views: ad.views });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Track ad click and redirect (public endpoint)
export const trackAdClick = async (req, res) => {
  try {
    const { id } = req.params;

    // Get client information for analytics
    const userAgent = req.get("User-Agent");
    const ipAddress = req.ip || req.connection.remoteAddress;
    const referrer = req.get("Referrer") || "Direct";

    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    // Increment click count and add click event
    ad.clicks += 1;
    ad.clickEvents.push({
      clickedAt: new Date(),
      userAgent,
      ipAddress,
      referrer,
    });

    await ad.save();

    // Redirect to the ad's target URL
    res.redirect(ad.link);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get ad analytics (protected - ad owner or admin)
export const getAdAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    // Check if user is owner or admin
    if (
      ad.createdBy.toString() !== user._id.toString() &&
      user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view analytics for this ad" });
    }

    // Calculate click-through rate (CTR)
    const ctr = ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(2) : 0;

    // Get recent click events (last 50)
    const recentClicks = ad.clickEvents
      .sort((a, b) => new Date(b.clickedAt) - new Date(a.clickedAt))
      .slice(0, 50);

    const analytics = {
      ad: {
        title: ad.title,
        status: ad.status,
        createdAt: ad.createdAt,
      },
      stats: {
        views: ad.views,
        clicks: ad.clicks,
        ctr: parseFloat(ctr),
      },
      recentClicks,
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// import mongoose from "mongoose";

// const adSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     link: { type: String, required: true }, // redirect URL
//     banner: { type: String, required: true }, // image path
//     adType: {
//       type: String,
//       enum: ["standard", "premium"],
//       required: true,
//     },
//     position: {
//       type: String,
//       enum: ["homepage-sidebar", "homepage-top"],
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "approved", "rejected"],
//       default: "pending",
//     },
//     // Add user reference to track who created the ad
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", // Reference to your User model
//       required: true,
//     },
//     // Optional: Add user details for easier querying
//     userEmail: {
//       type: String,
//       required: true,
//     },
//     userName: {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Ad", adSchema);
import mongoose from "mongoose";

const adSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String, required: true }, // redirect URL
    banner: { type: String, required: true }, // image path
    adType: {
      type: String,
      enum: ["standard", "premium"],
      required: true,
    },
    position: {
      type: String,
      enum: ["homepage-sidebar", "homepage-top"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Add user reference to track who created the ad
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to your User model
      required: true,
    },
    // Optional: Add user details for easier querying
    userEmail: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    // Track views and clicks
    views: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    // Track individual click events for analytics
    clickEvents: [
      {
        clickedAt: {
          type: Date,
          default: Date.now,
        },
        userAgent: String,
        ipAddress: String,
        referrer: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Ad", adSchema);

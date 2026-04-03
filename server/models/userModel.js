import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";

export const subscriptionTypes = {
  BASIC: "basic",
  PREMIUM: "premium",
  PLATINUM: "platinum",
};

export const subscriptionFeatures = {
  [subscriptionTypes.BASIC]: {
    maxEvents: 1,
    canCreatePaidEvents: false,
    maxAttendees: 50,
    analytics: false,
    customBranding: false,
    price: 0,
  },
  [subscriptionTypes.PREMIUM]: {
    maxEvents: 10,
    canCreatePaidEvents: true,
    maxAttendees: 200,
    analytics: true,
    customBranding: false,
    price: 1000,
  },
  [subscriptionTypes.PLATINUM]: {
    maxEvents: 999, // Unlimited
    canCreatePaidEvents: true,
    maxAttendees: 999, // Unlimited
    analytics: true,
    customBranding: true,
    price: 2000,
  },
};

// 🎟 Notification History Schema
const notificationHistorySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      "venue_checkin_reminder",
      "nearby_notification",
      "automatic_checkin",
    ],
  },
  time: {
    type: Date,
    default: Date.now,
  },
  notificationNumber: {
    type: Number,
    required: true,
  },
  distance: {
    type: Number,
    required: true,
  },
  sent: {
    type: Boolean,
    default: true,
  },
});

// 🎟 Check-in Notifications Schema
const checkInNotificationsSchema = new mongoose.Schema({
  count: {
    type: Number,
    default: 0,
    min: 0,
    max: 3,
  },
  lastNotificationTime: {
    type: Date,
    default: null,
  },
  notificationHistory: [notificationHistorySchema],
  autoCheckedIn: {
    type: Boolean,
    default: false,
  },
  notificationsEnabled: {
    type: Boolean,
    default: true,
  },
});

const ticketSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    ticketQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    transactionId: {
      type: String,
    },
    ticketIds: [
      {
        type: String,
        unique: true,
      },
    ],
    seatDetails: [
      {
        seatType: {
          type: String,
          enum: ["front", "middle", "last"],
          required: true,
        },
        seatNumber: {
          type: String,
          required: true,
        },
        seatPrice: {
          type: Number,
          required: true,
        },
        finalPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    attendanceStatus: {
      type: String,
      enum: ["not_attended", "attended"],
      default: "not_attended",
    },
    attendanceTime: {
      type: Date,
      default: null,
    },
    // Enhanced notification tracking
    checkInNotifications: checkInNotificationsSchema,
    // Legacy fields for backward compatibility
    geoCheckInNotified: {
      type: Boolean,
      default: false,
    },
    nearbyNotified: {
      type: Boolean,
      default: false,
    },
    venueNotified: {
      type: Boolean,
      default: false,
    },
    lastNearbyNotificationTime: Date,
    lastVenueNotificationTime: Date,
    // Rating field for organizer
    organizerRated: {
      type: Boolean,
      default: false,
    },
    organizerRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    organizerComment: String,
  },
  { _id: true }
);

// Subscription Statistics Schema
const subscriptionStatsSchema = new mongoose.Schema({
  plan: {
    type: String,
    enum: Object.values(subscriptionTypes),
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  durationMonths: {
    type: Number,
    default: 1,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["active", "cancelled", "expired"],
    default: "active",
  },
  cancelledAt: {
    type: Date,
  },
});

// 👤 User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "User name is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: [true, "Password is required"] },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    // Subscription fields
    subscription: {
      type: String,
      enum: Object.values(subscriptionTypes),
      default: subscriptionTypes.BASIC,
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "pending", "cancelled"],
      default: "inactive",
    },
    subscriptionExpiry: Date,

    paymentHistory: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        amount: {
          type: Number,
          required: true,
        },
        plan: {
          type: String,
          enum: Object.values(subscriptionTypes),
          required: true,
        },
        transactionId: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "completed", "failed", "refunded", "cancelled"],
          default: "pending",
        },
        durationMonths: {
          type: Number,
          default: 1,
        },
      },
    ],

    // Subscription statistics
    subscriptionStats: [subscriptionStatsSchema],

    accountVerified: { type: Boolean, default: false },

    verificationCode: Number,
    verificationCodeExpire: Date,

    resetPasswordToken: String,
    resetPasswordTokenExpire: Date,

    eventToOrganize: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    myEventWatchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],

    // Updated eventsToAttend with enhanced notifications
    eventsToAttend: [ticketSchema],

    warningCount: { type: Number, default: 0 },

    // Organizer rating stats
    organizerStats: {
      totalEvents: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// 🧠 Subscription methods
userSchema.methods.hasActiveSubscription = function () {
  return (
    this.subscriptionStatus === "active" &&
    (!this.subscriptionExpiry || this.subscriptionExpiry > new Date())
  );
};

userSchema.methods.getSubscriptionFeatures = function () {
  return (
    subscriptionFeatures[this.subscription] ||
    subscriptionFeatures[subscriptionTypes.BASIC]
  );
};

userSchema.methods.canCreateEvent = function (isPaidEvent = false) {
  const features = this.getSubscriptionFeatures();
  const hasReachedLimit = this.eventToOrganize.length >= features.maxEvents;
  const canCreatePaid = features.canCreatePaidEvents;
  const isSubscriptionActive = this.hasActiveSubscription();

  return {
    canCreate:
      isSubscriptionActive &&
      !hasReachedLimit &&
      (!isPaidEvent || canCreatePaid),
    reasons: {
      subscriptionActive: isSubscriptionActive,
      reachedEventLimit: hasReachedLimit,
      canCreatePaidEvents: canCreatePaid,
      isPaidEventRequested: isPaidEvent,
    },
    limits: {
      currentEvents: this.eventToOrganize.length,
      maxEvents: features.maxEvents,
      canCreatePaidEvents: canCreatePaid,
    },
  };
};

// 🎫 Ticket methods
userSchema.methods.getTicketForEvent = function (eventId) {
  return this.eventsToAttend.find(
    (ticket) => ticket.event.toString() === eventId.toString()
  );
};

userSchema.methods.updateTicketPaymentStatus = function (
  eventId,
  status,
  transactionId = null
) {
  const ticket = this.getTicketForEvent(eventId);
  if (ticket) {
    ticket.paymentStatus = status;
    if (transactionId) {
      ticket.transactionId = transactionId;
    }
    ticket.lastUpdated = new Date();
    return ticket;
  }
  return null;
};

// Subscription statistics methods
userSchema.methods.addSubscriptionPurchase = function (
  plan,
  transactionId,
  amount,
  durationMonths = 1
) {
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

  this.subscriptionStats.push({
    plan,
    transactionId,
    amount,
    durationMonths,
    purchaseDate: new Date(),
    expiryDate,
    status: "active",
  });
};

userSchema.methods.cancelSubscriptionStat = function (transactionId) {
  const subscriptionStat = this.subscriptionStats.find(
    (stat) => stat.transactionId === transactionId && stat.status === "active"
  );

  if (subscriptionStat) {
    subscriptionStat.status = "cancelled";
    subscriptionStat.cancelledAt = new Date();
    return true;
  }
  return false;
};

userSchema.methods.getActiveSubscriptionsCount = function () {
  return this.subscriptionStats.filter((stat) => stat.status === "active")
    .length;
};

userSchema.methods.getTotalRevenue = function () {
  return this.subscriptionStats.reduce((total, stat) => {
    return total + (stat.status === "active" ? stat.amount : 0);
  }, 0);
};

// Static methods for admin analytics
userSchema.statics.getSubscriptionAnalytics = async function () {
  const users = await this.find({}).select(
    "subscriptionStats name email subscription subscriptionStatus"
  );

  const analytics = {
    totalSubscriptions: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    planBreakdown: {
      [subscriptionTypes.BASIC]: { count: 0, revenue: 0 },
      [subscriptionTypes.PREMIUM]: { count: 0, revenue: 0 },
      [subscriptionTypes.PLATINUM]: { count: 0, revenue: 0 },
    },
    recentSubscriptions: [],
    userBreakdown: {
      totalUsers: users.length,
      activeSubscribers: 0,
      basicUsers: 0,
      premiumUsers: 0,
      platinumUsers: 0,
    },
  };

  users.forEach((user) => {
    // Count users by subscription type
    if (user.subscription === subscriptionTypes.BASIC) {
      analytics.userBreakdown.basicUsers++;
    } else if (user.subscription === subscriptionTypes.PREMIUM) {
      analytics.userBreakdown.premiumUsers++;
    } else if (user.subscription === subscriptionTypes.PLATINUM) {
      analytics.userBreakdown.platinumUsers++;
    }

    // Count active subscribers
    if (
      user.subscriptionStatus === "active" &&
      user.subscription !== subscriptionTypes.BASIC
    ) {
      analytics.userBreakdown.activeSubscribers++;
    }

    user.subscriptionStats.forEach((stat) => {
      analytics.totalSubscriptions++;

      if (stat.status === "active") {
        analytics.activeSubscriptions++;
        analytics.totalRevenue += stat.amount;

        // Plan breakdown
        if (analytics.planBreakdown[stat.plan]) {
          analytics.planBreakdown[stat.plan].count++;
          analytics.planBreakdown[stat.plan].revenue += stat.amount;
        }

        // Recent subscriptions (last 30 days)
        if (
          stat.purchaseDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ) {
          analytics.recentSubscriptions.push({
            userName: user.name,
            userEmail: user.email,
            plan: stat.plan,
            amount: stat.amount,
            purchaseDate: stat.purchaseDate,
            transactionId: stat.transactionId,
            status: stat.status,
          });
        }
      }
    });
  });

  // Sort recent subscriptions by date
  analytics.recentSubscriptions.sort(
    (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)
  );

  return analytics;
};

// 🔐 Password Hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔑 JWT Token
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      subscription: this.subscription,
      subscriptionStatus: this.subscriptionStatus,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "3d",
    }
  );
};

// 🔁 Password Reset Token
userSchema.methods.getThePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordTokenExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

  return resetToken;
};

// Add this method to userSchema methods in userModel.js
userSchema.methods.getMaxAttendees = function () {
  const features = this.getSubscriptionFeatures();
  return features.maxAttendees;
};

// Method to update organizer stats
userSchema.methods.updateOrganizerStats = async function () {
  const organizedEvents = await mongoose.model("Event").find({
    createdBy: this._id,
    status: "approved",
  });

  let totalRevenue = 0;
  let totalRatings = 0;
  let ratingSum = 0;

  for (const event of organizedEvents) {
    // Calculate revenue
    totalRevenue += event.attendees.reduce(
      (sum, attendee) => sum + (attendee.finalPrice || 0),
      0
    );

    // Calculate ratings
    if (event.organizerRatings && event.organizerRatings.length > 0) {
      totalRatings += event.organizerRatings.length;
      ratingSum += event.organizerRatings.reduce(
        (sum, rating) => sum + rating.rating,
        0
      );
    }
  }

  this.organizerStats = {
    totalEvents: organizedEvents.length,
    averageRating: totalRatings > 0 ? (ratingSum / totalRatings).toFixed(1) : 0,
    totalRatings: totalRatings,
    totalRevenue: totalRevenue,
  };

  await this.save();
};

export const User = mongoose.model("User", userSchema);

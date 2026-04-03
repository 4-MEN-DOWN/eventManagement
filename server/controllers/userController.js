import { User } from "../models/userModel.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import { subscriptionTypes } from "../models/userModel.js";

// ✅ Get all users (Admin only)
export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find().select(
    "name email role subscription subscriptionStatus subscriptionExpiry paymentHistory subscriptionStats organizerStats createdAt"
  );
  res.status(200).json({
    success: true,
    users,
  });
});

// ✅ Get subscription analytics (Admin only) - Enhanced to include user data
export const getSubscriptionAnalytics = catchAsyncError(
  async (req, res, next) => {
    const analytics = await User.getSubscriptionAnalytics();

    // Also return all users for detailed analytics
    const users = await User.find().select(
      "name email subscription subscriptionStatus subscriptionStats paymentHistory"
    );

    res.status(200).json({
      success: true,
      analytics: {
        ...analytics,
        users: users, // Include users data for detailed analytics
      },
    });
  }
);

// ✅ Register a new admin (Admin only)
export const registerTheNewAdmin = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("Please enter all required fields", 400));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorHandler("User already exists", 400));
  }

  const newAdmin = await User.create({
    name,
    email,
    password,
    role: "admin",
  });

  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    newAdmin,
  });
});

// In userController.js - update getMyEvents function
export const getMyEvents = catchAsyncError(async (req, res, next) => {
  if (!req.user?._id) {
    return next(new ErrorHandler("Unauthorized: User info missing", 401));
  }

  const user = await User.findById(req.user._id)
    .populate("eventToOrganize")
    .populate("myEventWatchlist")
    .populate({
      path: "eventsToAttend.event", // This is the key change - populate the event field inside eventsToAttend
      model: "Event",
    });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    eventsToOrganize: user.eventToOrganize,
    watchlist: user.myEventWatchlist,
    eventsToAttend: user.eventsToAttend, // This now contains populated events
  });
});

// ✅ Verify subscription payment and update user
// export const verifySubscriptionPayment = catchAsyncError(
//   async (req, res, next) => {
//     const { transactionId, plan, durationMonths = 1 } = req.body;

//     if (!transactionId || !plan) {
//       return next(
//         new ErrorHandler("Transaction ID and plan are required", 400)
//       );
//     }

//     // Find user by ID
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return next(new ErrorHandler("User not found", 404));
//     }

//     // Validate plan
//     if (!Object.values(subscriptionTypes).includes(plan)) {
//       return next(new ErrorHandler("Invalid subscription plan", 400));
//     }

//     // Calculate expiry date based on duration
//     let subscriptionExpiry = null;
//     if (plan !== subscriptionTypes.BASIC) {
//       const expiryDate = new Date();
//       expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
//       subscriptionExpiry = expiryDate;
//     }

//     // Update user subscription
//     user.subscription = plan;
//     user.subscriptionStatus = "active";
//     user.subscriptionExpiry = subscriptionExpiry;

//     // Add to payment history
//     const planPrice = {
//       [subscriptionTypes.BASIC]: 0,
//       [subscriptionTypes.PREMIUM]: 1000,
//       [subscriptionTypes.PLATINUM]: 2000,
//     }[plan];

//     const totalAmount = planPrice * durationMonths;

//     user.paymentHistory.push({
//       amount: totalAmount,
//       plan,
//       transactionId,
//       status: "completed",
//       durationMonths,
//     });

//     // Add to subscription statistics (only for paid plans)
//     if (plan !== subscriptionTypes.BASIC) {
//       user.addSubscriptionPurchase(
//         plan,
//         transactionId,
//         totalAmount,
//         durationMonths
//       );
//     }

//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Subscription updated successfully",
//       subscription: {
//         plan: user.subscription,
//         status: user.subscriptionStatus,
//         expiry: user.subscriptionExpiry,
//       },
//       paymentHistory: user.paymentHistory,
//       subscriptionStats: user.subscriptionStats,
//     });
//   }
// );

// ✅ Verify subscription payment and update user
export const verifySubscriptionPayment = catchAsyncError(
  async (req, res, next) => {
    const { transactionId, plan, durationMonths = 1 } = req.body;

    if (!transactionId || !plan) {
      return next(
        new ErrorHandler("Transaction ID and plan are required", 400)
      );
    }

    // Find user by ID
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Validate plan
    if (!Object.values(subscriptionTypes).includes(plan)) {
      return next(new ErrorHandler("Invalid subscription plan", 400));
    }

    // NEW: If switching to Basic plan, cancel all active subscriptions
    if (plan === subscriptionTypes.BASIC) {
      // Cancel all active subscription stats
      user.subscriptionStats.forEach((stat) => {
        if (stat.status === "active") {
          stat.status = "cancelled";
          stat.cancelledAt = new Date();
        }
      });

      // Update payment history for any active payments
      user.paymentHistory.forEach((payment) => {
        if (
          payment.status === "completed" &&
          payment.plan !== subscriptionTypes.BASIC
        ) {
          payment.status = "cancelled";
        }
      });

      // Update user subscription fields
      user.subscription = subscriptionTypes.BASIC;
      user.subscriptionStatus = "inactive";
      user.subscriptionExpiry = null;

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Subscription updated to Basic plan successfully",
        subscription: {
          plan: user.subscription,
          status: user.subscriptionStatus,
          expiry: user.subscriptionExpiry,
        },
        paymentHistory: user.paymentHistory,
        subscriptionStats: user.subscriptionStats,
      });
    }

    // For PREMIUM and PLATINUM plans (existing logic)
    // Calculate expiry date based on duration
    let subscriptionExpiry = null;
    if (plan !== subscriptionTypes.BASIC) {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
      subscriptionExpiry = expiryDate;
    }

    // NEW: Cancel any existing active subscriptions before adding new one
    user.subscriptionStats.forEach((stat) => {
      if (stat.status === "active") {
        stat.status = "cancelled";
        stat.cancelledAt = new Date();
      }
    });

    // Update user subscription
    user.subscription = plan;
    user.subscriptionStatus = "active";
    user.subscriptionExpiry = subscriptionExpiry;

    // Add to payment history
    const planPrice = {
      [subscriptionTypes.BASIC]: 0,
      [subscriptionTypes.PREMIUM]: 1000,
      [subscriptionTypes.PLATINUM]: 2000,
    }[plan];

    const totalAmount = planPrice * durationMonths;

    user.paymentHistory.push({
      amount: totalAmount,
      plan,
      transactionId,
      status: "completed",
      durationMonths,
    });

    // Add to subscription statistics (only for paid plans)
    if (plan !== subscriptionTypes.BASIC) {
      user.addSubscriptionPurchase(
        plan,
        transactionId,
        totalAmount,
        durationMonths
      );
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      subscription: {
        plan: user.subscription,
        status: user.subscriptionStatus,
        expiry: user.subscriptionExpiry,
      },
      paymentHistory: user.paymentHistory,
      subscriptionStats: user.subscriptionStats,
    });
  }
);

// ✅ Get subscription details
export const getSubscriptionDetails = catchAsyncError(
  async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
      success: true,
      subscription: {
        plan: user.subscription,
        status: user.subscriptionStatus,
        expiry: user.subscriptionExpiry,
      },
      paymentHistory: user.paymentHistory,
      subscriptionStats: user.subscriptionStats,
      analytics: {
        totalSubscriptions: user.subscriptionStats.length,
        activeSubscriptions: user.getActiveSubscriptionsCount(),
        totalRevenue: user.getTotalRevenue(),
      },
    });
  }
);

// ✅ Check event creation eligibility
export const checkEventCreationEligibility = catchAsyncError(
  async (req, res, next) => {
    const { isPaidEvent = false } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const eligibility = user.canCreateEvent(isPaidEvent);

    res.status(200).json({
      success: true,
      eligibility,
    });
  }
);

// ✅ Cancel subscription
export const cancelSubscription = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (!user.subscription || user.subscriptionStatus !== "active") {
    return next(new ErrorHandler("No active subscription to cancel", 400));
  }

  // Find the latest active subscription stat
  const activeSubscription = user.subscriptionStats
    .filter((stat) => stat.status === "active")
    .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))[0];

  // Mark subscription stat as cancelled
  if (activeSubscription) {
    user.cancelSubscriptionStat(activeSubscription.transactionId);
  }

  // Update payment history status
  const latestPayment = user.paymentHistory
    .filter((payment) => payment.status === "completed")
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  if (latestPayment) {
    latestPayment.status = "cancelled";
  }

  // Reset subscription fields
  user.subscription = "basic";
  user.subscriptionStatus = "inactive";
  user.subscriptionExpiry = null;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Subscription cancelled successfully",
    subscription: {
      plan: user.subscription,
      status: user.subscriptionStatus,
      expiry: user.subscriptionExpiry,
    },
    paymentHistory: user.paymentHistory,
    subscriptionStats: user.subscriptionStats,
  });
});

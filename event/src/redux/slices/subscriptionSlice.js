// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { toast } from "sonner";
// import axios from "axios";

// const BASE_URL = "http://localhost:5000/api/v1";

// // Async thunks
// export const verifySubscriptionPayment = createAsyncThunk(
//   "subscription/verifyPayment",
//   async (paymentData, { rejectWithValue, getState }) => {
//     try {
//       console.log("Verifying payment with data:", paymentData);

//       const response = await axios.post(
//         `${BASE_URL}/user/subscription/verify`,
//         paymentData,
//         {
//           withCredentials: true,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log("Payment verification response:", response.data);
//       return response.data;
//     } catch (error) {
//       console.error("Payment verification error:", error);
//       const errorMessage =
//         error.response?.data?.message || "Payment verification failed";
//       toast.error(errorMessage);
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// export const getSubscriptionDetails = createAsyncThunk(
//   "subscription/getDetails",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${BASE_URL}/user/subscription`, {
//         withCredentials: true,
//       });
//       return response.data;
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message || "Failed to fetch subscription details";
//       toast.error(errorMessage);
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// export const cancelSubscription = createAsyncThunk(
//   "subscription/cancel",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(
//         `${BASE_URL}/user/subscription/cancel`,
//         {},
//         { withCredentials: true }
//       );
//       return response.data;
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message || "Failed to cancel subscription";
//       toast.error(errorMessage);
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// export const checkEventCreationEligibility = createAsyncThunk(
//   "subscription/checkEligibility",
//   async (isPaidEvent = false, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(
//         `${BASE_URL}/user/check-event-eligibility`,
//         { isPaidEvent },
//         {
//           withCredentials: true,
//         }
//       );
//       return response.data;
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message || "Failed to check eligibility";
//       toast.error(errorMessage);
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// // Admin analytics thunk
// export const getSubscriptionAnalytics = createAsyncThunk(
//   "subscription/getAnalytics",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(
//         `${BASE_URL}/user/subscription/analytics`,
//         {
//           withCredentials: true,
//         }
//       );
//       return response.data;
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message || "Failed to fetch analytics";
//       toast.error(errorMessage);
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// // NEW: Get all users for admin dashboard - FIXED with proper auth header
// export const getAllUsersForAdmin = createAsyncThunk(
//   "subscription/getAllUsers",
//   async (_, { rejectWithValue, getState }) => {
//     try {
//       // Get the token from the auth state
//       const state = getState();
//       const token = state.auth.token || state.auth.user?.token;

//       console.log("Token for admin request:", token); // Debug log

//       const response = await axios.get(`${BASE_URL}/user/all`, {
//         withCredentials: true,
//         headers: {
//           "Content-Type": "application/json",
//           ...(token && { Authorization: `Bearer ${token}` }),
//         },
//       });
//       return response.data;
//     } catch (error) {
//       console.error(
//         "Error fetching users:",
//         error.response?.data || error.message
//       );
//       const errorMessage =
//         error.response?.data?.message || "Failed to fetch users";

//       // Show specific error message
//       if (error.response?.status === 401) {
//         toast.error("Authentication required");
//       } else if (error.response?.status === 403) {
//         toast.error("Admin access required");
//       } else {
//         toast.error(errorMessage);
//       }

//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// const initialState = {
//   myName: "Sameer karki",
//   loading: false,
//   subscription: null,
//   paymentHistory: [],
//   subscriptionStats: [],
//   analytics: null,
//   eligibility: null,
//   error: null,
//   paymentProcessing: false,
//   userAnalytics: {
//     totalSubscriptions: 0,
//     activeSubscriptions: 0,
//     totalRevenue: 0,
//   },
//   // NEW: Add users array to store all users data
//   allUsers: [],
//   usersLoading: false,
// };

// const subscriptionSlice = createSlice({
//   name: "subscriptions",
//   initialState,
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//     },
//     resetSubscriptionState: () => initialState,
//     clearEligibility: (state) => {
//       state.eligibility = null;
//     },
//     setPaymentProcessing: (state, action) => {
//       state.paymentProcessing = action.payload;
//     },
//     clearAnalytics: (state) => {
//       state.analytics = null;
//     },
//     // NEW: Clear users data
//     clearUsers: (state) => {
//       state.allUsers = [];
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Verify Payment
//       .addCase(verifySubscriptionPayment.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.paymentProcessing = true;
//       })
//       .addCase(verifySubscriptionPayment.fulfilled, (state, action) => {
//         state.loading = false;
//         state.paymentProcessing = false;
//         state.subscription = action.payload.subscription;
//         state.paymentHistory = action.payload.paymentHistory || [];
//         state.subscriptionStats = action.payload.subscriptionStats || [];
//         state.userAnalytics =
//           action.payload.analytics || initialState.userAnalytics;
//       })
//       .addCase(verifySubscriptionPayment.rejected, (state, action) => {
//         state.loading = false;
//         state.paymentProcessing = false;
//         state.error = action.payload;
//       })
//       // Get Subscription Details
//       .addCase(getSubscriptionDetails.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getSubscriptionDetails.fulfilled, (state, action) => {
//         console.log(action.payload);
//         state.loading = false;
//         state.subscription = action.payload.subscription;
//         state.paymentHistory = action.payload.paymentHistory || [];
//         state.subscriptionStats = action.payload.subscriptionStats || [];
//         state.userAnalytics =
//           action.payload.analytics || initialState.userAnalytics;
//       })
//       .addCase(getSubscriptionDetails.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       // Check Event Creation Eligibility
//       .addCase(checkEventCreationEligibility.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(checkEventCreationEligibility.fulfilled, (state, action) => {
//         state.loading = false;
//         state.eligibility = action.payload;
//       })
//       .addCase(checkEventCreationEligibility.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       // Cancel Subscription
//       .addCase(cancelSubscription.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(cancelSubscription.fulfilled, (state, action) => {
//         state.loading = false;
//         toast.success("Subscription canceled successfully!");
//         state.subscription = action.payload.subscription;
//         state.paymentHistory = action.payload.paymentHistory || [];
//         state.subscriptionStats = action.payload.subscriptionStats || [];
//       })
//       .addCase(cancelSubscription.rejected, (state, action) => {
//         state.loading = false;
//         toast.error(action.payload || "Failed to cancel subscription");
//         state.error = action.payload;
//       })
//       // Get Subscription Analytics (Admin)
//       .addCase(getSubscriptionAnalytics.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getSubscriptionAnalytics.fulfilled, (state, action) => {
//         console.log(action.payload.analytics);
//         state.loading = false;
//         state.analytics = action.payload.analytics;
//       })
//       .addCase(getSubscriptionAnalytics.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       // NEW: Get All Users for Admin
//       .addCase(getAllUsersForAdmin.pending, (state) => {
//         state.usersLoading = true;
//         state.error = null;
//       })
//       .addCase(getAllUsersForAdmin.fulfilled, (state, action) => {
//         state.usersLoading = false;
//         state.allUsers = action.payload.users || [];
//       })
//       .addCase(getAllUsersForAdmin.rejected, (state, action) => {
//         state.usersLoading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const {
//   clearError,
//   resetSubscriptionState,
//   clearEligibility,
//   setPaymentProcessing,
//   clearAnalytics,
//   clearUsers,
// } = subscriptionSlice.actions;
// export default subscriptionSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";
import axios from "axios";

// ✅ Dynamic Backend URL (Works in both Development & Production)
const BASE_URL = "https://eventmanagement-4-49d3.onrender.com/api/v1";

// Async thunks
export const verifySubscriptionPayment = createAsyncThunk(
  "subscription/verifyPayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      console.log("Verifying payment with data:", paymentData);

      const response = await axios.post(
        `${BASE_URL}/user/subscription/verify`,
        paymentData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Payment verification response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Payment verification error:", error);
      const errorMessage =
        error.response?.data?.message || "Payment verification failed";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  },
);

export const getSubscriptionDetails = createAsyncThunk(
  "subscription/getDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/user/subscription`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch subscription details";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  },
);

export const cancelSubscription = createAsyncThunk(
  "subscription/cancel",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/user/subscription/cancel`,
        {},
        { withCredentials: true },
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to cancel subscription";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  },
);

export const checkEventCreationEligibility = createAsyncThunk(
  "subscription/checkEligibility",
  async (isPaidEvent = false, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/user/check-event-eligibility`,
        { isPaidEvent },
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to check eligibility";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  },
);

// Admin analytics thunk
export const getSubscriptionAnalytics = createAsyncThunk(
  "subscription/getAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/user/subscription/analytics`,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch analytics";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  },
);

// Get all users for admin dashboard
export const getAllUsersForAdmin = createAsyncThunk(
  "subscription/getAllUsers",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const token = state.auth?.token || state.auth?.user?.token;

      console.log("Token for admin request:", token);

      const response = await axios.get(`${BASE_URL}/user/all`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching users:",
        error.response?.data || error.message,
      );
      const errorMessage =
        error.response?.data?.message || "Failed to fetch users";

      if (error.response?.status === 401) {
        toast.error("Authentication required");
      } else if (error.response?.status === 403) {
        toast.error("Admin access required");
      } else {
        toast.error(errorMessage);
      }

      return rejectWithValue(errorMessage);
    }
  },
);

const initialState = {
  myName: "Sameer karki",
  loading: false,
  subscription: null,
  paymentHistory: [],
  subscriptionStats: [],
  analytics: null,
  eligibility: null,
  error: null,
  paymentProcessing: false,
  userAnalytics: {
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
  },
  allUsers: [],
  usersLoading: false,
};

const subscriptionSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetSubscriptionState: () => initialState,
    clearEligibility: (state) => {
      state.eligibility = null;
    },
    setPaymentProcessing: (state, action) => {
      state.paymentProcessing = action.payload;
    },
    clearAnalytics: (state) => {
      state.analytics = null;
    },
    clearUsers: (state) => {
      state.allUsers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Verify Payment
      .addCase(verifySubscriptionPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.paymentProcessing = true;
      })
      .addCase(verifySubscriptionPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentProcessing = false;
        state.subscription = action.payload.subscription;
        state.paymentHistory = action.payload.paymentHistory || [];
        state.subscriptionStats = action.payload.subscriptionStats || [];
        state.userAnalytics =
          action.payload.analytics || initialState.userAnalytics;
      })
      .addCase(verifySubscriptionPayment.rejected, (state, action) => {
        state.loading = false;
        state.paymentProcessing = false;
        state.error = action.payload;
      })

      // Get Subscription Details
      .addCase(getSubscriptionDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubscriptionDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload.subscription;
        state.paymentHistory = action.payload.paymentHistory || [];
        state.subscriptionStats = action.payload.subscriptionStats || [];
        state.userAnalytics =
          action.payload.analytics || initialState.userAnalytics;
      })
      .addCase(getSubscriptionDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Check Event Creation Eligibility
      .addCase(checkEventCreationEligibility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkEventCreationEligibility.fulfilled, (state, action) => {
        state.loading = false;
        state.eligibility = action.payload;
      })
      .addCase(checkEventCreationEligibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel Subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.loading = false;
        toast.success("Subscription canceled successfully!");
        state.subscription = action.payload.subscription;
        state.paymentHistory = action.payload.paymentHistory || [];
        state.subscriptionStats = action.payload.subscriptionStats || [];
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload || "Failed to cancel subscription");
        state.error = action.payload;
      })

      // Get Subscription Analytics (Admin)
      .addCase(getSubscriptionAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubscriptionAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload.analytics;
      })
      .addCase(getSubscriptionAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Users for Admin
      .addCase(getAllUsersForAdmin.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(getAllUsersForAdmin.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.allUsers = action.payload.users || [];
      })
      .addCase(getAllUsersForAdmin.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  resetSubscriptionState,
  clearEligibility,
  setPaymentProcessing,
  clearAnalytics,
  clearUsers,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;

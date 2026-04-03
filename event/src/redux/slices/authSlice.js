// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
// import {
//   verifySubscriptionPayment,
//   cancelSubscription,
// } from "./subscriptionSlice";

// const BACKEND_URL = "http://localhost:5000/api/v1/auth";

// // Register user
// export const registerUser = createAsyncThunk(
//   "auth/registerUser",
//   async (formData, { rejectWithValue }) => {
//     try {
//       const res = await axios.post(`${BACKEND_URL}/register`, formData, {
//         withCredentials: true,
//       });
//       return res.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Registration failed"
//       );
//     }
//   }
// );

// // Verify OTP
// export const verifyOtp = createAsyncThunk(
//   "auth/verifyOtp",
//   async (formData, { rejectWithValue }) => {
//     try {
//       const res = await axios.post(`${BACKEND_URL}/send-token`, formData, {
//         withCredentials: true,
//       });
//       return res.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "OTP verification failed"
//       );
//     }
//   }
// );

// // Login user
// export const loginUser = createAsyncThunk(
//   "auth/loginUser",
//   async (formData, { rejectWithValue }) => {
//     try {
//       const res = await axios.post(`${BACKEND_URL}/login`, formData, {
//         withCredentials: true,
//       });
//       return res.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Login failed");
//     }
//   }
// );

// // Logout user
// export const logoutUser = createAsyncThunk(
//   "auth/logoutUser",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axios.get(`${BACKEND_URL}/logout`, {
//         withCredentials: true,
//       });
//       return res.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Logout failed");
//     }
//   }
// );

// // Forgot Password
// export const forgotPassword = createAsyncThunk(
//   "auth/forgotPassword",
//   async (email, { rejectWithValue }) => {
//     try {
//       const res = await axios.post(
//         `${BACKEND_URL}/forgot/password`,
//         { email },
//         {
//           withCredentials: true,
//         }
//       );
//       return res.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Password reset failed"
//       );
//     }
//   }
// );

// // Reset Password
// export const resetPassword = createAsyncThunk(
//   "auth/resetPassword",
//   async ({ token, passwordData }, { rejectWithValue }) => {
//     try {
//       const res = await axios.put(
//         `${BACKEND_URL}/password/reset/${token}`,
//         passwordData,
//         {
//           withCredentials: true,
//         }
//       );
//       return res.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Password reset failed"
//       );
//     }
//   }
// );

// // Update Password
// export const updatePassword = createAsyncThunk(
//   "auth/updatePassword",
//   async (passwordData, { rejectWithValue, getState }) => {
//     try {
//       const { auth } = getState();
//       const res = await axios.put(
//         `${BACKEND_URL}/password/update`,
//         passwordData,
//         {
//           headers: {
//             Authorization: `Bearer ${auth.user?.token}`,
//           },
//           withCredentials: true,
//         }
//       );
//       return res.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Password update failed"
//       );
//     }
//   }
// );

// const authSlice = createSlice({
//   name: "auth",
//   initialState: {
//     user: null,
//     loading: false,
//     error: null,
//     successMessage: null,
//     passwordReset: {
//       loading: false,
//       success: false,
//       error: null,
//     },
//   },
//   reducers: {
//     loadUserFromStorage: (state) => {
//       const user = localStorage.getItem("user");
//       if (user) state.user = JSON.parse(user);
//     },
//     clearError: (state) => {
//       state.error = null;
//       state.passwordReset.error = null;
//     },
//     clearSuccess: (state) => {
//       state.successMessage = null;
//     },
//     logout: (state) => {
//       state.user = null;
//       localStorage.removeItem("user");
//       localStorage.removeItem("token");
//     },
//     updateUserSubscription: (state, action) => {
//       if (state.user) {
//         state.user.subscription = action.payload.plan;
//         state.user.subscriptionStatus = action.payload.status;
//         state.user.subscriptionExpiry = action.payload.expiry;
//         localStorage.setItem("user", JSON.stringify(state.user));
//       }
//     },
//     resetPasswordState: (state) => {
//       state.passwordReset = {
//         loading: false,
//         success: false,
//         error: null,
//       };
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Register
//       .addCase(registerUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.successMessage = null;
//       })
//       .addCase(registerUser.fulfilled, (state, action) => {
//         state.loading = false;
//         state.successMessage =
//           action.payload.message ||
//           "Registration successful. Check your email for OTP.";
//       })
//       .addCase(registerUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Verify OTP
//       .addCase(verifyOtp.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.successMessage = null;
//       })
//       .addCase(verifyOtp.fulfilled, (state, action) => {
//         state.loading = false;
//         if (action.payload.user && action.payload.token) {
//           state.user = { ...action.payload.user, token: action.payload.token };
//           localStorage.setItem("user", JSON.stringify(state.user));
//           localStorage.setItem("token", action.payload.token);
//         }
//         state.successMessage =
//           action.payload.message || "Account verified successfully.";
//       })
//       .addCase(verifyOtp.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Login
//       .addCase(loginUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.successMessage = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.loading = false;
//         if (action.payload.user && action.payload.token) {
//           state.user = { ...action.payload.user, token: action.payload.token };
//           localStorage.setItem("user", JSON.stringify(state.user));
//           localStorage.setItem("token", action.payload.token);
//         }
//         state.successMessage = action.payload.message || "Login successful.";
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Logout
//       .addCase(logoutUser.fulfilled, (state, action) => {
//         state.user = null;
//         state.successMessage = action.payload.message || "Logged out";
//         localStorage.removeItem("user");
//         localStorage.removeItem("token");
//       })
//       .addCase(logoutUser.rejected, (state, action) => {
//         state.error = action.payload;
//       })

//       // Forgot Password
//       .addCase(forgotPassword.pending, (state) => {
//         state.passwordReset.loading = true;
//         state.passwordReset.error = null;
//         state.passwordReset.success = false;
//       })
//       .addCase(forgotPassword.fulfilled, (state, action) => {
//         state.passwordReset.loading = false;
//         state.passwordReset.success = true;
//         state.successMessage = action.payload.message;
//       })
//       .addCase(forgotPassword.rejected, (state, action) => {
//         state.passwordReset.loading = false;
//         state.passwordReset.error = action.payload;
//       })

//       // Reset Password
//       .addCase(resetPassword.pending, (state) => {
//         state.passwordReset.loading = true;
//         state.passwordReset.error = null;
//         state.passwordReset.success = false;
//       })
//       .addCase(resetPassword.fulfilled, (state, action) => {
//         state.passwordReset.loading = false;
//         state.passwordReset.success = true;
//         state.successMessage = action.payload.message;
//       })
//       .addCase(resetPassword.rejected, (state, action) => {
//         state.passwordReset.loading = false;
//         state.passwordReset.error = action.payload;
//       })

//       // Update Password
//       .addCase(updatePassword.pending, (state) => {
//         state.passwordReset.loading = true;
//         state.passwordReset.error = null;
//         state.passwordReset.success = false;
//       })
//       .addCase(updatePassword.fulfilled, (state, action) => {
//         state.passwordReset.loading = false;
//         state.passwordReset.success = true;
//         state.successMessage = action.payload.message;
//       })
//       .addCase(updatePassword.rejected, (state, action) => {
//         state.passwordReset.loading = false;
//         state.passwordReset.error = action.payload;
//       })

//       // Subscription updates
//       .addCase(verifySubscriptionPayment.fulfilled, (state, action) => {
//         if (action.payload.user && action.payload.token) {
//           state.user = { ...action.payload.user, token: action.payload.token };
//           localStorage.setItem("user", JSON.stringify(state.user));
//           localStorage.setItem("token", action.payload.token);
//         }
//       })
//       .addCase(cancelSubscription.fulfilled, (state, action) => {
//         if (action.payload.user && action.payload.token) {
//           state.user = { ...action.payload.user, token: action.payload.token };
//           localStorage.setItem("user", JSON.stringify(state.user));
//           localStorage.setItem("token", action.payload.token);
//         }
//       });
//   },
// });

// export const {
//   clearError,
//   clearSuccess,
//   logout,
//   loadUserFromStorage,
//   updateUserSubscription,
//   resetPasswordState,
// } = authSlice.actions;
// export default authSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  verifySubscriptionPayment,
  cancelSubscription,
} from "./subscriptionSlice";
import { toast } from "sonner";

const BACKEND_URL = "http://localhost:5000/api/v1/auth";

// Register user
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/register`, formData, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// Verify OTP
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/send-token`, formData, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "OTP verification failed"
      );
    }
  }
);

// Login user
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/login`, formData, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/logout`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

// Forgot Password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/forgot/password`,
        { email },
        {
          withCredentials: true,
        }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password reset failed"
      );
    }
  }
);

// Reset Password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, passwordData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${BACKEND_URL}/password/reset/${token}`,
        passwordData,
        {
          withCredentials: true,
        }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password reset failed"
      );
    }
  }
);

// Update Password
export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (passwordData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const res = await axios.put(
        `${BACKEND_URL}/password/update`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${auth.user?.token}`,
          },
          withCredentials: true,
        }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password update failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    successMessage: null,
    passwordReset: {
      loading: false,
      success: false,
      error: null,
    },
  },
  reducers: {
    loadUserFromStorage: (state) => {
      const user = localStorage.getItem("user");
      if (user) state.user = JSON.parse(user);
    },
    clearError: (state) => {
      state.error = null;
      state.passwordReset.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    updateUserSubscription: (state, action) => {
      if (state.user) {
        state.user.subscription = action.payload.plan;
        state.user.subscriptionStatus = action.payload.status;
        state.user.subscriptionExpiry = action.payload.expiry;
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    resetPasswordState: (state) => {
      state.passwordReset = {
        loading: false,
        success: false,
        error: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload.message ||
          "Registration successful. Check your email for OTP.";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.user && action.payload.token) {
          state.user = { ...action.payload.user, token: action.payload.token };
          localStorage.setItem("user", JSON.stringify(state.user));
          localStorage.setItem("token", action.payload.token);
        }
        state.successMessage =
          action.payload.message || "Account verified successfully.";
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.user && action.payload.token) {
          state.user = { ...action.payload.user, token: action.payload.token };
          localStorage.setItem("user", JSON.stringify(state.user));
          localStorage.setItem("token", action.payload.token);
        }
        state.successMessage = action.payload.message || "Login successful.";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.user = null;
        state.successMessage = action.payload.message || "Logged out";
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.passwordReset.loading = true;
        state.passwordReset.error = null;
        state.passwordReset.success = false;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.passwordReset.loading = false;
        state.passwordReset.success = true;
        state.successMessage = action.payload.message;
        // Show toast immediately when the action is fulfilled
        toast.success(action.payload.message);
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.passwordReset.loading = false;
        state.passwordReset.error = action.payload;
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.passwordReset.loading = true;
        state.passwordReset.error = null;
        state.passwordReset.success = false;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.passwordReset.loading = false;
        state.passwordReset.success = true;
        state.successMessage = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.passwordReset.loading = false;
        state.passwordReset.error = action.payload;
      })

      // Update Password
      .addCase(updatePassword.pending, (state) => {
        state.passwordReset.loading = true;
        state.passwordReset.error = null;
        state.passwordReset.success = false;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.passwordReset.loading = false;
        state.passwordReset.success = true;
        state.successMessage = action.payload.message;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.passwordReset.loading = false;
        state.passwordReset.error = action.payload;
      })

      // Subscription updates
      .addCase(verifySubscriptionPayment.fulfilled, (state, action) => {
        if (action.payload.user && action.payload.token) {
          state.user = { ...action.payload.user, token: action.payload.token };
          localStorage.setItem("user", JSON.stringify(state.user));
          localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        if (action.payload.user && action.payload.token) {
          state.user = { ...action.payload.user, token: action.payload.token };
          localStorage.setItem("user", JSON.stringify(state.user));
          localStorage.setItem("token", action.payload.token);
        }
      });
  },
});

export const {
  clearError,
  clearSuccess,
  logout,
  loadUserFromStorage,
  updateUserSubscription,
  resetPasswordState,
} = authSlice.actions;
export default authSlice.reducer;

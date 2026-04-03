import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Async thunk to create a new ad
export const createAd = createAsyncThunk(
  "ads/createAd",
  async (formData, { rejectWithValue }) => {
    try {
      console.log("Sending ad data to server:", {
        title: formData.get("title"),
        link: formData.get("link"),
        adType: formData.get("adType"),
        hasBanner: !!formData.get("banner"),
      });

      const response = await axios.post(
        "http://localhost:5000/api/v1/ads/create",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      console.log("Ad created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error creating ad:",
        error.response?.data || error.message
      );
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ✅ Async thunk to track ad view
export const trackAdView = createAsyncThunk(
  "ads/trackAdView",
  async (adId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/ads/${adId}/view`
      );
      return { adId, views: response.data.views };
    } catch (error) {
      console.error("Error tracking ad view:", error);
      // Don't reject the promise - we don't want view tracking failures to break the UI
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ✅ Async thunk to track ad click
export const trackAdClick = createAsyncThunk(
  "ads/trackAdClick",
  async (adId, { rejectWithValue }) => {
    try {
      // This will redirect the user, so we just need to open the tracking URL
      window.open(`http://localhost:5000/api/v1/ads/${adId}/click`, "_blank");
      return { adId };
    } catch (error) {
      console.error("Error tracking ad click:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ✅ Async thunk to get ad analytics
export const getAdAnalytics = createAsyncThunk(
  "ads/getAdAnalytics",
  async (adId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/ads/${adId}/analytics`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ✅ Async thunk to verify payment and create ad
export const verifyPaymentAndCreateAd = createAsyncThunk(
  "ads/verifyPaymentAndCreateAd",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/ads/verify-payment",
        paymentData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ✅ Async thunk to fetch approved ads
export const fetchAds = createAsyncThunk(
  "ads/fetchAds",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:5000/api/v1/ads/");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ✅ Async thunk to get user's ads
export const getUserAds = createAsyncThunk(
  "ads/getUserAds",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/ads/my-ads",
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ✅ Async thunk to get all ads (admin)
export const getAllAdsAdmin = createAsyncThunk(
  "ads/getAllAdsAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:5000/api/v1/ads/all", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ✅ Async thunk to update ad status
export const updateAdStatus = createAsyncThunk(
  "ads/updateAdStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/v1/ads/${id}/status`,
        { status },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ✅ Async thunk to delete ad
export const deleteAd = createAsyncThunk(
  "ads/deleteAd",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:5000/api/v1/ads/${id}`, {
        withCredentials: true,
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const adSlice = createSlice({
  name: "ads",
  initialState: {
    ads: [],
    userAds: [],
    allAds: [],
    analytics: {},
    loading: false,
    userAdsLoading: false,
    allAdsLoading: false,
    paymentLoading: false,
    updating: false,
    deleting: false,
    analyticsLoading: false,
    error: null,
    success: false,
    paymentData: null,
  },
  reducers: {
    resetAdState: (state) => {
      state.loading = false;
      state.userAdsLoading = false;
      state.allAdsLoading = false;
      state.paymentLoading = false;
      state.updating = false;
      state.deleting = false;
      state.analyticsLoading = false;
      state.error = null;
      state.success = false;
      state.paymentData = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Manual update for view tracking (optimistic update)
    incrementAdViews: (state, action) => {
      const { adId } = action.payload;
      const ad = state.ads.find((ad) => ad._id === adId);
      const userAd = state.userAds.find((ad) => ad._id === adId);
      const allAd = state.allAds.find((ad) => ad._id === adId);

      if (ad) ad.views += 1;
      if (userAd) userAd.views += 1;
      if (allAd) allAd.views += 1;
    },
    // Manual update for click tracking (optimistic update)
    incrementAdClicks: (state, action) => {
      const { adId } = action.payload;
      const ad = state.ads.find((ad) => ad._id === adId);
      const userAd = state.userAds.find((ad) => ad._id === adId);
      const allAd = state.allAds.find((ad) => ad._id === adId);

      if (ad) ad.clicks += 1;
      if (userAd) userAd.clicks += 1;
      if (allAd) allAd.clicks += 1;
    },
  },
  extraReducers: (builder) => {
    // Create Ad
    builder.addCase(createAd.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(createAd.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.ads.push(action.payload);
      state.userAds.push(action.payload);
    });
    builder.addCase(createAd.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Track Ad View
    builder.addCase(trackAdView.fulfilled, (state, action) => {
      const { adId, views } = action.payload;
      // Update views in all ad arrays
      [state.ads, state.userAds, state.allAds].forEach((adArray) => {
        const ad = adArray.find((ad) => ad._id === adId);
        if (ad) {
          ad.views = views;
        }
      });
    });

    // Get Ad Analytics
    builder.addCase(getAdAnalytics.pending, (state) => {
      state.analyticsLoading = true;
      state.error = null;
    });
    builder.addCase(getAdAnalytics.fulfilled, (state, action) => {
      state.analyticsLoading = false;
      state.analytics[action.payload.ad._id] = action.payload;
    });
    builder.addCase(getAdAnalytics.rejected, (state, action) => {
      state.analyticsLoading = false;
      state.error = action.payload;
    });

    // Verify Payment and Create Ad
    builder.addCase(verifyPaymentAndCreateAd.pending, (state) => {
      state.paymentLoading = true;
      state.error = null;
    });
    builder.addCase(verifyPaymentAndCreateAd.fulfilled, (state, action) => {
      state.paymentLoading = false;
      state.success = true;
      state.ads.push(action.payload);
      state.userAds.push(action.payload);
    });
    builder.addCase(verifyPaymentAndCreateAd.rejected, (state, action) => {
      state.paymentLoading = false;
      state.error = action.payload;
    });

    // Fetch Ads (public approved ads)
    builder.addCase(fetchAds.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAds.fulfilled, (state, action) => {
      state.loading = false;
      state.ads = action.payload;
    });
    builder.addCase(fetchAds.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get User Ads
    builder.addCase(getUserAds.pending, (state) => {
      state.userAdsLoading = true;
      state.error = null;
    });
    builder.addCase(getUserAds.fulfilled, (state, action) => {
      state.userAdsLoading = false;
      state.userAds = action.payload;
    });
    builder.addCase(getUserAds.rejected, (state, action) => {
      state.userAdsLoading = false;
      state.error = action.payload;
    });

    // Get All Ads (admin)
    builder.addCase(getAllAdsAdmin.pending, (state) => {
      state.allAdsLoading = true;
      state.error = null;
    });
    builder.addCase(getAllAdsAdmin.fulfilled, (state, action) => {
      state.allAdsLoading = false;
      state.allAds = action.payload;
    });
    builder.addCase(getAllAdsAdmin.rejected, (state, action) => {
      state.allAdsLoading = false;
      state.error = action.payload;
    });

    // Update Ad Status
    builder.addCase(updateAdStatus.pending, (state) => {
      state.updating = true;
      state.error = null;
    });
    builder.addCase(updateAdStatus.fulfilled, (state, action) => {
      state.updating = false;
      const index = state.allAds.findIndex(
        (ad) => ad._id === action.payload._id
      );
      if (index !== -1) {
        state.allAds[index] = action.payload;
      }
      const publicIndex = state.ads.findIndex(
        (ad) => ad._id === action.payload._id
      );
      if (action.payload.status === "approved" && publicIndex === -1) {
        state.ads.push(action.payload);
      } else if (action.payload.status !== "approved" && publicIndex !== -1) {
        state.ads.splice(publicIndex, 1);
      }
    });
    builder.addCase(updateAdStatus.rejected, (state, action) => {
      state.updating = false;
      state.error = action.payload;
    });

    // Delete Ad
    builder.addCase(deleteAd.pending, (state) => {
      state.deleting = true;
      state.error = null;
    });
    builder.addCase(deleteAd.fulfilled, (state, action) => {
      state.deleting = false;
      state.ads = state.ads.filter((ad) => ad._id !== action.payload);
      state.userAds = state.userAds.filter((ad) => ad._id !== action.payload);
      state.allAds = state.allAds.filter((ad) => ad._id !== action.payload);
    });
    builder.addCase(deleteAd.rejected, (state, action) => {
      state.deleting = false;
      state.error = action.payload;
    });
  },
});

export const { resetAdState, clearError, incrementAdViews, incrementAdClicks } =
  adSlice.actions;
export default adSlice.reducer;

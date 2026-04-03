import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch recommendations (collaborative + fallback)
export const fetchRecommendations = createAsyncThunk(
  "recommend/fetchRecommendations",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `https://eventmanagement-4-49d3.onrender.com/recommend/${userId}`,
      );
      return res.data; // { collaborative: [...], fallback: [...], userCategories: [...], stats: {...} }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch recommendations",
      );
    }
  },
);

const recommendSlice = createSlice({
  name: "recommend",
  initialState: {
    collaborative: [],
    fallback: [],
    userCategories: [],
    stats: {
      similarUsers: 0,
      collaborativeEvents: 0,
      fallbackEvents: 0,
      userPaidEventCount: 0,
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearRecommendations: (state) => {
      state.collaborative = [];
      state.fallback = [];
      state.userCategories = [];
      state.stats = {
        similarUsers: 0,
        collaborativeEvents: 0,
        fallbackEvents: 0,
        userPaidEventCount: 0,
      };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        console.log(action.payload);
        state.loading = false;
        state.collaborative = action.payload.collaborative || [];
        state.fallback = action.payload.fallback || [];
        state.userCategories = action.payload.userCategories || [];
        state.stats = action.payload.stats || {
          similarUsers: 0,
          collaborativeEvents: 0,
          fallbackEvents: 0,
          userPaidEventCount: 0,
        };
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRecommendations } = recommendSlice.actions;
export default recommendSlice.reducer;

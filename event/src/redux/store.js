// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import eventReducer from "./slices/eventSlice";
import authReducer from "./slices/authSlice";
import subscriptionReducer from "./slices/subscriptionSlice";
import recommendReducer from "./slices/recommendSlice";
import messageReducer from "./slices/messageSlice";
import adsReducer from "./slices/adSlice";
export const store = configureStore({
  reducer: {
    events: eventReducer,
    auth: authReducer,
    subscriptions: subscriptionReducer,
    ads: adsReducer,
    recommend: recommendReducer,
    messages: messageReducer,
  },
});

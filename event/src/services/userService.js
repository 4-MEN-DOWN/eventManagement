import api from "./api"; // Your axios instance

// User service functions
export const userService = {
  // Update user subscription
  updateSubscription: async (subscriptionData) => {
    const response = await api.put("/users/subscription", subscriptionData);
    return response.data;
  },

  // Get user details
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put("/users/profile", profileData);
    return response.data;
  },

  // Get subscription plans (could be static or from API)
  getSubscriptionPlans: async () => {
    // This could be a static config or fetched from the server
    return [
      {
        id: "basic",
        name: "Basic",
        price: 0,
        features: [
          "Create up to 3 events",
          "Basic event management",
          "Email support",
          "Up to 50 attendees per event",
        ],
      },
      {
        id: "premium",
        name: "Premium",
        price: 9.99,
        features: [
          "Create up to 10 events",
          "Advanced analytics",
          "Priority support",
          "Up to 200 attendees per event",
          "Custom registration forms",
        ],
      },
      {
        id: "platinum",
        name: "Platinum",
        price: 19.99,
        features: [
          "Unlimited events",
          "Full analytics dashboard",
          "24/7 dedicated support",
          "Unlimited attendees",
          "Custom branding",
          "Early access to new features",
        ],
      },
    ];
  },
};

export default userService;

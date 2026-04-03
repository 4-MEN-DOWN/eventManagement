import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const GeoCheckIn = ({ eventId, onCheckInSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported in your browser.");
      return;
    }

    setLoading(true);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      console.log("User location:", { latitude, longitude });

      const response = await axios.post(
        "http://localhost:5000/api/v1/event/checkin/geo",
        { eventId, latitude, longitude },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      const data = response.data;

      if (data.success) {
        toast.success(`✅ ${data.message} (${data.distance}m away)`);
        if (onCheckInSuccess) onCheckInSuccess();
      }
    } catch (error) {
      console.error("Check-in error:", error);

      if (error.response?.data?.message) {
        // Server error with message
        toast.error(`❌ ${error.response.data.message}`);
      } else if (error.code === error.PERMISSION_DENIED) {
        toast.error(
          "📍 Location access denied. Please enable location services."
        );
      } else if (error.code === error.TIMEOUT) {
        toast.error("⏰ Location request timeout. Please try again.");
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        toast.error("📍 Location information unavailable.");
      } else {
        toast.error("❌ Something went wrong during check-in!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md w-full max-w-sm">
      <h2 className="text-lg font-semibold mb-3">Event Check-In</h2>
      <button
        onClick={handleCheckIn}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg w-full disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Checking location..." : "Check In Now 📍"}
      </button>
      <p className="text-xs text-gray-500 mt-2 text-center">
        You must be within 100m of the event location
      </p>
    </div>
  );
};

export default GeoCheckIn;

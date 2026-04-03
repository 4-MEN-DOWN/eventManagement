import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner"; // Changed from react-toastify
import axios from "axios";
import { useSelector } from "react-redux";

const AutoCheckInDetector = () => {
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [checkingIn, setCheckingIn] = useState(false);
  const [watchingLocation, setWatchingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const dragRef = useRef(null);
  const allEvents = useSelector((state) => state.events.allEvents);

  // Create event map for quick lookup
  const eventsMap = useRef({});

  // Update events map whenever allEvents changes
  useEffect(() => {
    if (allEvents && allEvents.length > 0) {
      eventsMap.current = {};
      allEvents.forEach((event) => {
        if (event && event._id) {
          eventsMap.current[event._id] = event;
        }
      });
    }
  }, [allEvents]);

  // Enhanced function to get event details quickly
  const getEventDetails = (eventId) => {
    if (!eventId) return null;

    // Direct lookup from events map
    const eventDetails = eventsMap.current[eventId];

    if (eventDetails) {
      return {
        title: eventDetails.title,
        location: eventDetails.location,
        date: eventDetails.date,
        startTime: eventDetails.startTime,
        endTime: eventDetails.endTime,
        category: eventDetails.category,
        image: eventDetails.banner || eventDetails.image,
        coordinates: eventDetails.coordinates,
      };
    }

    return null;
  };

  // Draggable functionality with strict boundary restrictions
  const handleMouseDown = (e) => {
    setIsDragging(true);
    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    e.preventDefault();
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    const touch = e.touches[0];
    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      setPosition({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
    }
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragRef.current) return;

    const element = dragRef.current;
    const elementRect = element.getBoundingClientRect();

    const newX = e.clientX - position.x;
    const newY = e.clientY - position.y;

    // Strict boundary checks with viewport dimensions
    const boundedX = Math.max(
      0, // Minimum from left
      Math.min(newX, window.innerWidth - elementRect.width) // Maximum from right
    );
    const boundedY = Math.max(
      0, // Minimum from top
      Math.min(newY, window.innerHeight - elementRect.height) // Maximum from bottom
    );

    element.style.left = `${boundedX}px`;
    element.style.top = `${boundedY}px`;
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !dragRef.current) return;

    const touch = e.touches[0];
    const element = dragRef.current;
    const elementRect = element.getBoundingClientRect();

    const newX = touch.clientX - position.x;
    const newY = touch.clientY - position.y;

    // Strict boundary checks
    const boundedX = Math.max(
      0,
      Math.min(newX, window.innerWidth - elementRect.width)
    );
    const boundedY = Math.max(
      0,
      Math.min(newY, window.innerHeight - elementRect.height)
    );

    element.style.left = `${boundedX}px`;
    element.style.top = `${boundedY}px`;

    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Enhanced location watch with better error handling
  const startLocationWatch = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported", {
        description: "Your browser doesn't support location tracking",
      });
      setLocationError("GEOLOCATION_NOT_SUPPORTED");
      return null;
    }

    setLocationError(null);
    setWatchingLocation(true);

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setLocationError(null);

        try {
          await checkNearbyEvents(latitude, longitude);
        } catch (error) {
          console.error("Error checking nearby events:", error);
        }
      },
      (error) => {
        console.error("Location watch error:", error);
        handleLocationError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );

    setWatchId(id);
    toast.info("Started monitoring your location", {
      description: "Looking for nearby events...",
      duration: 3000,
    });
    return id;
  };

  // Enhanced error handling
  const handleLocationError = (error) => {
    let errorMessage = "Unable to track location";
    let description = "Please check your location settings";

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "Location access denied";
        description = "Please enable location permissions in your browser";
        setLocationError("PERMISSION_DENIED");
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location information unavailable";
        description = "Please check your device location settings";
        setLocationError("POSITION_UNAVAILABLE");
        break;
      case error.TIMEOUT:
        errorMessage = "Location request timeout";
        description = "Trying again in 5 seconds...";
        setLocationError("TIMEOUT");
        setTimeout(() => {
          if (watchingLocation) {
            const newWatchId = startLocationWatch();
            if (watchId) navigator.geolocation.clearWatch(watchId);
            setWatchId(newWatchId);
          }
        }, 5000);
        break;
      default:
        errorMessage = "An unknown error occurred";
        description = "Please try again later";
        setLocationError("UNKNOWN_ERROR");
    }

    toast.error(errorMessage, { description });
    setWatchingLocation(false);
  };

  // Stop watching location
  const stopLocationWatch = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setWatchingLocation(false);
    setNearbyEvents([]);
    setLocationError(null);
    toast.info("Stopped location monitoring", {
      description: "No longer tracking nearby events",
      duration: 3000,
    });
  };

  // Enhanced check for nearby events with immediate event details
  const checkNearbyEvents = async (latitude, longitude) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/event/detect-nearby",
        { latitude, longitude },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
          timeout: 10000,
        }
      );

      const data = response.data;

      if (data.success && data.nearbyEvents.length > 0) {
        // Enhanced nearby events with immediate event details
        const enhancedEvents = data.nearbyEvents.map((nearbyEvent) => {
          const eventDetails = getEventDetails(nearbyEvent.eventId);

          return {
            ...nearbyEvent,
            eventDetails: eventDetails,
            alreadyNotified: nearbyEvent.alreadyNotified || false,
          };
        });

        setNearbyEvents(enhancedEvents);

        // Show enhanced notifications with event details
        enhancedEvents.forEach((event) => {
          if (!event.alreadyNotified) {
            const eventDetails = event.eventDetails;
            const notificationMessage = eventDetails
              ? `You're near "${event.eventTitle}"!`
              : `You're near "${event.eventTitle}"!`;

            toast.info(notificationMessage, {
              description: eventDetails
                ? `${eventDetails.location} • ${new Date(
                    eventDetails.date
                  ).toLocaleDateString()} ${eventDetails.startTime}`
                : "Click to check in",
              duration: 8000,
              action: {
                label: "Check In",
                onClick: () =>
                  handleCheckIn(
                    event.eventId,
                    event.ticketId,
                    event.eventTitle
                  ),
              },
            });

            // Mark as notified
            event.alreadyNotified = true;
          }
        });
      } else {
        setNearbyEvents([]);
      }
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        console.warn("API request timeout");
      } else {
        console.error("Error detecting nearby events:", error);
      }
    }
  };

  // Handle manual check-in with enhanced success toast
  const handleCheckIn = async (eventId, ticketId, eventTitle) => {
    setCheckingIn(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/event/complete-checkin",
        { eventId, ticketId },
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
        // Show enhanced success toast with event details
        toast.success("Successfully Checked In!", {
          description: `You're now checked in for "${eventTitle}"`,
          duration: 5000,
          icon: "✅",
        });

        // Remove from nearby events list
        setNearbyEvents((prev) =>
          prev.filter((event) => event.eventId !== eventId)
        );
      }
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error("Check-in failed", {
        description: error.response?.data?.message || "Please try again",
        duration: 5000,
      });
    } finally {
      setCheckingIn(false);
    }
  };

  // Manual location refresh
  const refreshLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setLocationError(null);
        checkNearbyEvents(latitude, longitude);
        toast.success("Location refreshed", {
          description: "Updated nearby events list",
          duration: 3000,
        });
      },
      (error) => {
        handleLocationError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Calculate component height for proper positioning
  const getComponentHeight = () => {
    if (!dragRef.current) return 0;
    return dragRef.current.offsetHeight;
  };

  // Toggle minimize/maximize with smart positioning
  const toggleMinimize = () => {
    if (!dragRef.current) return;

    const element = dragRef.current;
    const componentHeight = getComponentHeight();

    if (!isMinimized) {
      // Minimizing - move to bottom of screen (show only header)
      const bottomPosition = window.innerHeight - 80; // Height of minimized header
      element.style.top = `${bottomPosition}px`;
      setIsMinimized(true);
    } else {
      // Maximizing - move upward to show ALL content
      const upwardPosition = Math.max(
        50,
        window.innerHeight - componentHeight - 50
      );
      element.style.top = `${upwardPosition}px`;
      setIsMinimized(false);
    }
  };

  // Auto-start location watch when component mounts
  useEffect(() => {
    const id = startLocationWatch();

    return () => {
      if (id) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, []);

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  // Initialize position on mount and handle resize
  useEffect(() => {
    const updatePosition = () => {
      if (dragRef.current) {
        const element = dragRef.current;
        const componentHeight = getComponentHeight();

        if (isMinimized) {
          // Position minimized at bottom
          element.style.left = `${
            window.innerWidth - element.offsetWidth - 20
          }px`;
          element.style.top = `${window.innerHeight - 80}px`;
        } else {
          // Position maximized upward to show content
          element.style.left = `${
            window.innerWidth - element.offsetWidth - 20
          }px`;
          element.style.top = `${window.innerHeight - componentHeight - 50}px`;
        }
      }
    };

    // Initial position
    updatePosition();

    // Update on window resize
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [isMinimized]);

  // Update position when nearbyEvents change (height changes)
  useEffect(() => {
    if (!isMinimized && dragRef.current) {
      const element = dragRef.current;
      const componentHeight = getComponentHeight();
      const upwardPosition = Math.max(
        50,
        window.innerHeight - componentHeight - 50
      );
      element.style.top = `${upwardPosition}px`;
    }
  }, [nearbyEvents, isMinimized]);

  // Get status message based on current state
  const getStatusMessage = () => {
    if (locationError) {
      switch (locationError) {
        case "PERMISSION_DENIED":
          return "Location permission denied";
        case "POSITION_UNAVAILABLE":
          return "Location unavailable";
        case "TIMEOUT":
          return "Location timeout - retrying...";
        case "GEOLOCATION_NOT_SUPPORTED":
          return "Geolocation not supported";
        default:
          return "Location error";
      }
    }

    if (watchingLocation) {
      return nearbyEvents.length > 0
        ? `${nearbyEvents.length} event(s) nearby`
        : "Monitoring location for events";
    }

    return "Location monitoring paused";
  };

  // Get image URL for event
  const getEventImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  // Minimized view - only show header
  if (isMinimized) {
    return (
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div
          ref={dragRef}
          className="absolute max-w-sm pointer-events-auto bg-white rounded-lg shadow-lg border border-gray-200"
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
            touchAction: "none",
            left: `${window.innerWidth - 320 - 20}px`,
            top: `${window.innerHeight - 80}px`,
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    watchingLocation && !locationError
                      ? "bg-green-500"
                      : locationError === "TIMEOUT"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs font-medium text-gray-700">
                  Event Check-In
                </span>
                {nearbyEvents.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {nearbyEvents.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleMinimize}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                  title="Maximize"
                >
                  ⬆️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full expanded view
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        ref={dragRef}
        className="absolute max-w-sm pointer-events-auto"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          touchAction: "none",
          left: `${window.innerWidth - 384 - 20}px`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Location Status Indicator */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <span>🎯</span>
              Event Check-In
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Drag me</span>
              <button
                onClick={toggleMinimize}
                className="text-gray-500 hover:text-gray-700 text-sm"
                title="Minimize"
              >
                ➖
              </button>
              <div
                className={`w-3 h-3 rounded-full ${
                  watchingLocation && !locationError
                    ? "bg-green-500"
                    : locationError === "TIMEOUT"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              ></div>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-3">{getStatusMessage()}</p>

          {currentLocation && (
            <p className="text-xs text-gray-500 mb-2">
              📍 {currentLocation.latitude.toFixed(4)},{" "}
              {currentLocation.longitude.toFixed(4)}
            </p>
          )}

          <div className="flex gap-2 flex-wrap">
            {!watchingLocation ? (
              <button
                onClick={startLocationWatch}
                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <span>📍</span> Start Monitoring
              </button>
            ) : (
              <button
                onClick={stopLocationWatch}
                className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors flex items-center gap-1"
              >
                <span>⏹️</span> Stop
              </button>
            )}

            {watchingLocation && (
              <button
                onClick={refreshLocation}
                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center gap-1"
              >
                <span>🔄</span> Refresh
              </button>
            )}

            {locationError === "PERMISSION_DENIED" && (
              <button
                onClick={() => window.location.reload()}
                className="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 transition-colors flex items-center gap-1"
              >
                <span>🔒</span> Grant Permission
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Nearby Events List */}
        {nearbyEvents.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <span>🎉</span>
                Nearby Events ({nearbyEvents.length})
              </h4>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {nearbyEvents.map((event) => (
                <div
                  key={`${event.eventId}-${event.ticketId}`}
                  className="border border-green-200 rounded-lg p-3 bg-green-50"
                >
                  <h5 className="font-medium text-gray-800 text-sm mb-1">
                    {event.eventTitle}
                  </h5>

                  {event.eventDetails ? (
                    <div className="text-xs text-gray-600 space-y-1 mb-2">
                      <p className="flex items-center gap-1">
                        <span>📍</span>
                        {event.eventDetails.location?.split(",")[0] ||
                          "Location not available"}
                      </p>
                      <p className="flex items-center gap-1">
                        <span>🗓️</span>
                        {event.eventDetails.date
                          ? new Date(
                              event.eventDetails.date
                            ).toLocaleDateString()
                          : "Date not available"}
                      </p>
                      <p className="flex items-center gap-1">
                        <span>🕒</span>
                        {event.eventDetails.startTime || "N/A"} -{" "}
                        {event.eventDetails.endTime || "N/A"}
                      </p>
                      <p className="flex items-center gap-1">
                        <span>🎫</span>
                        {event.eventDetails.category || "General"}
                      </p>
                      {event.eventDetails.image && (
                        <div className="mt-2">
                          <img
                            src={getEventImageUrl(event.eventDetails.image)}
                            alt={event.eventTitle}
                            className="w-full h-20 object-cover rounded border"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic mb-2">
                      Event details loading...
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mb-2">
                    <span>📏</span> {event.distance}m away • Ready to check in
                  </p>

                  <button
                    onClick={() =>
                      handleCheckIn(
                        event.eventId,
                        event.ticketId,
                        event.eventTitle
                      )
                    }
                    disabled={checkingIn}
                    className="mt-1 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:bg-gray-400 w-full transition-colors flex items-center justify-center gap-1"
                  >
                    <span>✅</span>
                    {checkingIn ? "Checking In..." : "Check In Now"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoCheckInDetector;

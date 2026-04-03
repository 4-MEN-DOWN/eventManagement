import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  X,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Tag,
  DollarSign,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  Crown,
  Zap,
  Search,
  Building,
  Users,
  Map,
  Armchair,
  IndianRupee,
} from "lucide-react";
import {
  addEventAsync,
  getMyEventsAsync,
  resetEventState,
} from "../redux/slices/eventSlice";
import ReactDOM from "react-dom";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Famous venues in Nepal with coordinates, images, and capacities
const NEPAL_VENUES = [
  {
    id: 1,
    name: "Bhat Bhateni Supermarket",
    address: "Bhat Bhateni, Kathmandu",
    coordinates: [27.7172, 85.324],
    image:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
    capacity: 200,
    type: "Shopping Mall",
  },
  {
    id: 2,
    name: "Civil Mall",
    address: "Sundhara, Kathmandu",
    coordinates: [27.7058, 85.3143],
    image:
      "https://images.unsplash.com/photo-1556740772-1a741babac2a?w=400&h=300&fit=crop",
    capacity: 300,
    type: "Shopping Mall",
  },
  {
    id: 3,
    name: "Boudhanath Stupa",
    address: "Boudha, Kathmandu",
    coordinates: [27.7218, 85.3621],
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
    capacity: 1000,
    type: "Heritage Site",
  },
  {
    id: 4,
    name: "Garden of Dreams",
    address: "Keshar Mahal, Kathmandu",
    coordinates: [27.7139, 85.3164],
    image:
      "https://images.unsplash.com/photo-1578558422230-6d1d3d7c0b4a?w=400&h=300&fit=crop",
    capacity: 500,
    type: "Garden",
  },
  {
    id: 5,
    name: "Hotel Yak & Yeti",
    address: "Durbar Marg, Kathmandu",
    coordinates: [27.7128, 85.3174],
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    capacity: 400,
    type: "Hotel",
  },
  {
    id: 6,
    name: "Radisson Hotel Kathmandu",
    address: "Lazimpat, Kathmandu",
    coordinates: [27.7201, 85.3186],
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop",
    capacity: 350,
    type: "Hotel",
  },
  {
    id: 7,
    name: "Bhrikuti Mandap Exhibition Hall",
    address: "Bhrikuti Mandap, Kathmandu",
    coordinates: [27.6986, 85.3125],
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop",
    capacity: 800,
    type: "Exhibition Hall",
  },
  {
    id: 8,
    name: "International Convention Centre",
    address: "New Baneshwor, Kathmandu",
    coordinates: [27.6895, 85.3394],
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop",
    capacity: 1500,
    type: "Convention Center",
  },
];

// Map component for searching locations
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

export const CreateEventModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const { loading, error, eventToOrganize, success, message, eventCount } =
    useSelector((state) => state.events);

  const authState = useSelector((state) => state.auth);
  const user = authState.user || {};

  const userPlan = useSelector(
    (state) => state.subscriptions.subscription?.plan
  );
  console.log(userPlan);
  // Plan limits configuration
  const planLimits = {
    basic: { events: 1, aiEvents: 0, maxAttendees: 50 },
    premium: { events: 5, aiEvents: 2, maxAttendees: 200 },
    platinum: { events: 10, aiEvents: 5, maxAttendees: 999 },
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    category: "",
    basePrice: "", // Changed from price to basePrice
    coordinates: null,
  });

  // Seat configuration state
  const [seatConfig, setSeatConfig] = useState({
    front: {
      count: 0,
      price: 0,
    },
    middle: {
      count: 0,
      price: 0,
    },
    last: {
      count: 0,
      price: 0,
    },
  });

  // Image states
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBannerUrl, setAiBannerUrl] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Track AI events count locally using localStorage
  const [aiEventsCount, setAiEventsCount] = useState(0);

  // Location states
  const [position, setPosition] = useState([27.7172, 85.324]); // Default Kathmandu
  const [venue, setVenue] = useState("");
  const [coordinatesSelected, setCoordinatesSelected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showVenues, setShowVenues] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedVenueType, setSelectedVenueType] = useState("all");

  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  // Get AI events count from localStorage
  useEffect(() => {
    const storedAiCount = localStorage.getItem(`aiEventsCount_${user._id}`);
    if (storedAiCount) {
      setAiEventsCount(parseInt(storedAiCount, 10));
    } else {
      const count = countAiEventsFromExistingEvents();
      setAiEventsCount(count);
      localStorage.setItem(`aiEventsCount_${user._id}`, count.toString());
    }
  }, [user._id]);

  // Count AI events from existing events (for migration)
  const countAiEventsFromExistingEvents = () => {
    return 0;
  };

  const maxEventsAllowed = planLimits[userPlan]?.events || 0;
  const maxAiEventsAllowed = planLimits[userPlan]?.aiEvents || 0;
  const maxAttendeesAllowed = planLimits[userPlan]?.maxAttendees || 50;
  const eventLimitReached = eventCount >= maxEventsAllowed;
  const aiEventLimitReached = aiEventsCount >= maxAiEventsAllowed;
  const isEditing = !!eventToOrganize?._id;
  const canCreateEvent = isEditing || !eventLimitReached;
  const canGenerateAi =
    !isEditing && !aiEventLimitReached && maxAiEventsAllowed > 0;

  // Calculate total seats
  const totalSeats =
    seatConfig.front.count + seatConfig.middle.count + seatConfig.last.count;
  const seatsExceedLimit = totalSeats > maxAttendeesAllowed;

  // Calculate available seats for each type
  const getAvailableSeats = (currentSeatType) => {
    const currentSeatCount = seatConfig[currentSeatType].count;
    const otherSeatsTotal = Object.entries(seatConfig)
      .filter(([type]) => type !== currentSeatType)
      .reduce((total, [_, config]) => total + config.count, 0);

    return maxAttendeesAllowed - otherSeatsTotal;
  };

  // Filter venues based on user's max attendees and selected type
  const filteredVenues = NEPAL_VENUES.filter((venue) => {
    const capacityMatch = venue.capacity <= maxAttendeesAllowed;
    const typeMatch =
      selectedVenueType === "all" || venue.type === selectedVenueType;
    return capacityMatch && typeMatch;
  });

  // Get unique venue types
  const venueTypes = [
    "all",
    ...new Set(NEPAL_VENUES.map((venue) => venue.type)),
  ];

  // Fetch user events when modal mounts
  useEffect(() => {
    dispatch(getMyEventsAsync());
  }, [dispatch]);

  // Reset form and coordinates when modal opens
  useEffect(() => {
    if (eventToOrganize && eventToOrganize._id) {
      // Editing existing event
      setFormData({
        title: eventToOrganize.title || "",
        description: eventToOrganize.description || "",
        date: eventToOrganize.date
          ? new Date(eventToOrganize.date).toISOString().split("T")[0]
          : "",
        startTime: eventToOrganize.startTime || "",
        endTime: eventToOrganize.endTime || "",
        location: eventToOrganize.location || "",
        category: eventToOrganize.category || "",
        basePrice: eventToOrganize.basePrice || "", // Updated to basePrice
        coordinates: eventToOrganize.coordinates || null,
      });

      // Set seat configuration if editing
      if (eventToOrganize.seatConfig) {
        setSeatConfig({
          front: {
            count: eventToOrganize.seatConfig.front?.count || 0,
            price: eventToOrganize.seatConfig.front?.price || 0,
          },
          middle: {
            count: eventToOrganize.seatConfig.middle?.count || 0,
            price: eventToOrganize.seatConfig.middle?.price || 0,
          },
          last: {
            count: eventToOrganize.seatConfig.last?.count || 0,
            price: eventToOrganize.seatConfig.last?.price || 0,
          },
        });
      }

      if (eventToOrganize.coordinates) {
        setPosition([
          eventToOrganize.coordinates.lat,
          eventToOrganize.coordinates.lng,
        ]);
        setCoordinatesSelected(true);
      }

      if (eventToOrganize.location) {
        setVenue(eventToOrganize.location);
      }

      if (eventToOrganize.banner) {
        setFileName("Existing image");
      }
    } else {
      // Creating new event - reset everything
      setFormData({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        category: "",
        basePrice: "", // Updated to basePrice
        coordinates: null,
      });
      setSeatConfig({
        front: { count: 0, price: 0 },
        middle: { count: 0, price: 0 },
        last: { count: 0, price: 0 },
      });
      setPosition([27.7172, 85.324]);
      setVenue("");
      setCoordinatesSelected(false);
      setImage(null);
      setFileName("");
      setAiBannerUrl(null);
      setAiPrompt("");
      setSearchQuery("");
      setSearchResults([]);
      setSelectedVenueType("all");
    }
  }, [eventToOrganize]);

  useEffect(() => {
    if (success && message) {
      toast.success(message);
      dispatch(resetEventState());
      onClose();
    }
    if (error) {
      toast.error(error);
      dispatch(resetEventState());
    }
  }, [success, message, error, dispatch, onClose]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle seat configuration changes with proper number handling
  const handleSeatConfigChange = (seatType, field, value) => {
    const numValue = parseInt(value) || 0;

    // For seat counts, validate against available seats
    if (field === "count") {
      const availableSeats = getAvailableSeats(seatType);
      if (numValue > availableSeats) {
        toast.error(
          `Cannot exceed available seats limit of ${availableSeats} for ${seatType} seats`
        );
        return;
      }
    }

    setSeatConfig((prev) => ({
      ...prev,
      [seatType]: {
        ...prev[seatType],
        [field]: numValue,
      },
    }));
  };

  // Calculate final price for each seat type
  const getFinalPrice = (seatType) => {
    const basePrice = Number(formData.basePrice) || 0;
    const seatPrice = seatConfig[seatType]?.price || 0;
    return basePrice + seatPrice;
  };

  // Handle manual upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit.");
        return;
      }
      setImage(file);
      setFileName(file.name);
      setAiBannerUrl(null);
    }
  };

  // Handle AI banner generation
  const generateAiBanner = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt to generate banner.");
      return;
    }

    if (!canGenerateAi) {
      if (userPlan === "basic") {
        toast.error(
          "AI image generation is not available for Basic plans. Upgrade to Premium or Platinum."
        );
      } else {
        toast.error(
          `You've reached your AI image generation limit (${maxAiEventsAllowed}) for your ${userPlan} plan.`
        );
      }
      return;
    }

    setAiGenerating(true);
    try {
      // Simulate API call with a loading effect
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        aiPrompt
      )}`;
      setAiBannerUrl(url);
      setImage(null);
      setFileName("AI Generated Banner");
      toast.success("AI banner generated!");
    } catch (err) {
      toast.error("Failed to generate AI banner.");
    } finally {
      setAiGenerating(false);
    }
  };

  // Search for locations using OpenStreetMap Nominatim with debounce
  const searchLocation = async (query) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=8&countrycodes=np&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();

      if (data.length === 0) {
        setSearchResults([]);
        // Don't show toast for no results to avoid interruption
      } else {
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      // Don't show error toast for better UX
    } finally {
      setSearching(false);
    }
  };

  // Handle search input with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search (only if query has at least 3 characters)
    if (query.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocation(query);
      }, 300); // 300ms debounce for better responsiveness
    } else {
      setSearchResults([]);
    }
  };

  // Select a venue from famous venues list
  const selectVenue = (venue) => {
    setPosition(venue.coordinates);
    setVenue(venue.name);
    setFormData((prev) => ({
      ...prev,
      location: venue.name,
      coordinates: { lat: venue.coordinates[0], lng: venue.coordinates[1] },
    }));
    setCoordinatesSelected(true);
    setShowVenues(false);
    setSearchResults([]);
    setSearchQuery("");
    toast.success(`Selected venue: ${venue.name}`);
  };

  // Select a location from search results
  const selectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    setPosition([lat, lng]);

    // Create a better display name from the result
    const displayName =
      result.display_name ||
      [result.name, result.address?.city, result.address?.country]
        .filter(Boolean)
        .join(", ");

    setVenue(displayName);
    setFormData((prev) => ({
      ...prev,
      location: displayName,
      coordinates: { lat, lng },
    }));
    setCoordinatesSelected(true);
    setSearchResults([]);
    setSearchQuery("");
    toast.success("📍 Location selected successfully!");
  };

  // Clear search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate coordinates are selected
    if (!coordinatesSelected && !isEditing) {
      toast.error(
        "Please select a location on the map by clicking on the venue or using the search."
      );
      return;
    }

    if (!isEditing && eventLimitReached) {
      toast.warn(
        `You've reached the maximum events allowed for your ${userPlan} plan.`
      );
      return;
    }

    // Validate seat configuration
    if (totalSeats === 0) {
      toast.error("Please configure at least one seat type.");
      return;
    }

    if (seatsExceedLimit) {
      toast.error(
        `Total seats (${totalSeats}) exceed your plan limit of ${maxAttendeesAllowed}. Please reduce seat counts.`
      );
      return;
    }

    if (!isEditing && !image && !aiBannerUrl) {
      toast.error("Please upload or generate a banner.");
      return;
    }

    // Check AI event limit before submitting if using AI banner
    if (aiBannerUrl && !isEditing && aiEventLimitReached) {
      toast.error(
        `You've reached your AI image generation limit for your ${userPlan} plan.`
      );
      return;
    }

    const submissionData = new FormData();

    // Append all form data with proper coordinate handling
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "coordinates" && formData.coordinates) {
        // Stringify coordinates for FormData
        submissionData.append(
          "coordinates",
          JSON.stringify(formData.coordinates)
        );
      } else {
        submissionData.append(key, value);
      }
    });

    // Append seat configuration
    submissionData.append("seatConfig", JSON.stringify(seatConfig));

    // If AI banner was used, fetch it as a Blob and append like a file
    if (aiBannerUrl) {
      submissionData.append("bannerSource", "ai");
      const res = await fetch(aiBannerUrl);
      const blob = await res.blob();
      submissionData.append("banner", blob, "ai-banner.png");

      // Increment AI events count in localStorage
      if (!isEditing) {
        const newCount = aiEventsCount + 1;
        setAiEventsCount(newCount);
        localStorage.setItem(`aiEventsCount_${user._id}`, newCount.toString());
      }
    } else if (image) {
      submissionData.append("bannerSource", "manual");
      submissionData.append("banner", image);
    }

    if (eventToOrganize?._id) {
      submissionData.append("eventId", eventToOrganize._id);
    }

    // DEBUG: Log what's being sent
    console.log("📤 Submitting event data:", {
      title: formData.title,
      basePrice: formData.basePrice,
      seatConfig: seatConfig,
      totalSeats: totalSeats,
      coordinates: formData.coordinates,
      location: formData.location,
      hasCoordinates: !!formData.coordinates,
      coordinatesSelected,
      userPlan,
      maxAttendees: maxAttendeesAllowed,
    });

    try {
      await dispatch(addEventAsync(submissionData)).unwrap();
    } catch (err) {
      // handled by useEffect
    }
  };

  const inputClass =
    "mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 transition px-4 py-3";

  // Helper function to format time
  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${String(minutes).padStart(2, "0")} ${ampm}`;
  };

  // Get plan color
  const getPlanColor = () => {
    switch (userPlan) {
      case "basic":
        return "bg-blue-500";
      case "premium":
        return "bg-purple-500";
      case "platinum":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get plan gradient
  const getPlanGradient = () => {
    switch (userPlan) {
      case "basic":
        return "from-blue-500 to-blue-600";
      case "premium":
        return "from-purple-500 to-purple-600";
      case "platinum":
        return "from-yellow-500 to-orange-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  // Format search result display name
  const formatDisplayName = (result) => {
    // Use display_name if available, otherwise build from components
    if (result.display_name) {
      // Shorten very long display names
      const name = result.display_name;
      if (name.length > 80) {
        return name.substring(0, 80) + "...";
      }
      return name;
    }

    // Build from address components
    const components = [];
    if (result.name) components.push(result.name);
    if (result.address?.city) components.push(result.address.city);
    if (result.address?.state) components.push(result.address.state);
    if (result.address?.country) components.push(result.address.country);

    return components.join(", ") || "Unknown location";
  };

  // LocationPicker component
  function LocationPicker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;

        // Round coordinates to 6 decimal places for precision
        const roundedLat = parseFloat(lat.toFixed(6));
        const roundedLng = parseFloat(lng.toFixed(6));

        setPosition([roundedLat, roundedLng]);
        setCoordinatesSelected(true);

        console.log("📍 Map clicked - coordinates:", {
          lat: roundedLat,
          lng: roundedLng,
        });

        // Fetch location name from coordinates
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${roundedLat}&lon=${roundedLng}`
        )
          .then((res) => res.json())
          .then((data) => {
            const displayName = data.display_name || "Location selected";
            setVenue(displayName);

            // Update both location and coordinates in formData
            setFormData((prev) => ({
              ...prev,
              location: displayName,
              coordinates: { lat: roundedLat, lng: roundedLng },
            }));

            console.log("✅ Coordinates and location updated:", {
              coordinates: { lat: roundedLat, lng: roundedLng },
              location: displayName,
            });

            toast.success("📍 Location selected successfully!");
          })
          .catch((error) => {
            console.error("Error fetching location name:", error);
            // Still set coordinates even if reverse geocoding fails
            setFormData((prev) => ({
              ...prev,
              coordinates: { lat: roundedLat, lng: roundedLng },
            }));
            toast.success(
              "📍 Location selected! Please enter venue name manually."
            );
          });
      },
    });
    return <Marker position={position} />;
  }
  console.log("🔍 Submit Button Debug:", {
    loading,
    canCreateEvent,
    coordinatesSelected,
    isEditing,
    totalSeats,
    seatsExceedLimit,
    disabled:
      loading ||
      !canCreateEvent ||
      (!coordinatesSelected && !isEditing) ||
      totalSeats === 0 ||
      seatsExceedLimit,
  });
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-purple-100 max-w-6xl w-full mx-4 my-auto animate-fadeInUp overflow-hidden"
        style={{ zIndex: 60, maxHeight: "90vh" }}
      >
        {/* Header */}
        <div
          className={`bg-gradient-to-r ${getPlanGradient()} px-8 py-6 text-white`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {isEditing ? "Edit Event" : "Create a New Event"}
              </h2>
              <p className="text-white/90 text-base mt-1">
                {isEditing
                  ? "Update your event details"
                  : "Fill in the details below to publish your event"}
              </p>
              <p className="text-white/80 text-sm mt-2 flex items-center gap-1">
                <span>Your plan:</span>
                <span className="font-bold capitalize flex items-center gap-1">
                  {userPlan === "platinum" && (
                    <Crown className="h-4 w-4 text-yellow-300" />
                  )}
                  {userPlan === "premium" && (
                    <Zap className="h-4 w-4 text-yellow-300" />
                  )}
                  {userPlan}
                </span>
                {!isEditing && (
                  <span>
                    {" "}
                    ({eventCount}/{maxEventsAllowed} events)
                  </span>
                )}
                {maxAiEventsAllowed > 0 && !isEditing && (
                  <span>
                    , AI: {aiEventsCount}/{maxAiEventsAllowed}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="px-8 py-6 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 140px)" }}
        >
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Plan Limits */}
              {!isEditing && eventLimitReached && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-700 font-medium">
                    You've reached your event creation limit!
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Your <strong className="capitalize">{userPlan}</strong> plan
                    allows up to {maxEventsAllowed} events. You currently have{" "}
                    {eventCount} events.
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Please upgrade your plan to create more events.
                  </p>
                </div>
              )}

              {!isEditing && !eventLimitReached && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-700 font-medium">
                    You can create {maxEventsAllowed - eventCount} more events
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Your <strong className="capitalize">{userPlan}</strong> plan
                    allows {maxEventsAllowed} events total.
                  </p>
                  {maxAiEventsAllowed > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      You can create {maxAiEventsAllowed - aiEventsCount} more
                      events with AI images.
                    </p>
                  )}
                  {maxAiEventsAllowed === 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      Upgrade to Premium or Platinum to use AI image generation.
                    </p>
                  )}
                </div>
              )}

              {/* Enhanced Max Attendees Display */}
              <div
                className={`p-5 rounded-xl border-2 ${getPlanColor().replace(
                  "bg-",
                  "border-"
                )} bg-gradient-to-r ${getPlanGradient()
                  .replace("from-", "from-")
                  .replace("to-", "to-")}/10`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${getPlanColor()} text-white`}
                    >
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        Attendee Limit
                      </h3>
                      <p className="text-sm text-gray-600">
                        Based on your{" "}
                        <span className="font-semibold capitalize">
                          {userPlan}
                        </span>{" "}
                        plan
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800">
                      {maxAttendeesAllowed}
                    </div>
                    <div className="text-sm text-gray-600">
                      Maximum attendees
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex gap-4">
                    <span
                      className={`px-3 py-1 rounded ${
                        userPlan === "basic"
                          ? "bg-blue-100 text-blue-800 font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      Basic: 50
                    </span>
                    <span
                      className={`px-3 py-1 rounded ${
                        userPlan === "premium"
                          ? "bg-purple-100 text-purple-800 font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      Premium: 200
                    </span>
                    <span
                      className={`px-3 py-1 rounded ${
                        userPlan === "platinum"
                          ? "bg-yellow-100 text-yellow-800 font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      Platinum: Unlimited
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  Event Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      disabled={!canCreateEvent}
                      className={`${inputClass} h-12 ${
                        !canCreateEvent ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      placeholder="Enter event title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      disabled={!canCreateEvent}
                      className={`${inputClass} resize-none ${
                        !canCreateEvent ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      placeholder="Write a short description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        disabled={!canCreateEvent}
                        className={`${inputClass} h-12 ${
                          !canCreateEvent
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <IndianRupee className="h-4 w-4" /> Base Price
                      </label>
                      <input
                        type="number"
                        id="basePrice"
                        value={formData.basePrice}
                        onChange={handleChange}
                        placeholder="0"
                        disabled={!canCreateEvent}
                        className={`${inputClass} h-12 ${
                          !canCreateEvent
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                        min={0}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Start Time
                      </label>
                      <input
                        type="time"
                        id="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                        disabled={!canCreateEvent}
                        className={`${inputClass} h-12 ${
                          !canCreateEvent
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(formData.startTime)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Clock className="h-4 w-4" /> End Time
                      </label>
                      <input
                        type="time"
                        id="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                        disabled={!canCreateEvent}
                        className={`${inputClass} h-12 ${
                          !canCreateEvent
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(formData.endTime)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-purple-600" />
                  Location
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location{" "}
                      {!isEditing && <span className="text-red-500">*</span>}
                    </label>

                    {/* Location Selection Options */}
                    <div className="space-y-3 mb-4">
                      {/* Famous Venues Button */}
                      <button
                        type="button"
                        onClick={() => setShowVenues(!showVenues)}
                        className="flex items-center gap-3 px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors w-full"
                      >
                        <Building className="h-5 w-5" />
                        <span className="flex-1 text-left">
                          Choose from Famous Venues in Nepal
                        </span>
                        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                          {filteredVenues.length} available
                        </span>
                      </button>

                      {/* Famous Venues List */}
                      {showVenues && (
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-gray-700">
                              Select a venue ({filteredVenues.length}{" "}
                              available):
                            </p>
                            <select
                              value={selectedVenueType}
                              onChange={(e) =>
                                setSelectedVenueType(e.target.value)
                              }
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              {venueTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type === "all" ? "All Types" : type}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                            {filteredVenues.map((venue) => (
                              <button
                                key={venue.id}
                                type="button"
                                onClick={() => selectVenue(venue)}
                                className="text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-white transition-all bg-white"
                              >
                                <div className="flex gap-3">
                                  <img
                                    src={venue.image}
                                    alt={venue.name}
                                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-900 truncate">
                                      {venue.name}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      {venue.address}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                        {venue.type}
                                      </span>
                                      <span
                                        className={`text-xs px-2 py-1 rounded ${
                                          venue.capacity <= 100
                                            ? "bg-green-100 text-green-800"
                                            : venue.capacity <= 500
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                      >
                                        Capacity: {venue.capacity}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                          {filteredVenues.length === 0 && (
                            <p className="text-center text-gray-500 text-sm py-4">
                              No venues available for your {userPlan} plan.
                              Upgrade to access more venues.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Search Location */}
                      <div
                        className="relative"
                        ref={searchInputRef}
                        style={{ zIndex: 1000 }}
                      >
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={handleSearchChange}
                              placeholder="Search for any location in Nepal..."
                              className={`${inputClass} h-12 pl-10 relative z-10`}
                              ref={searchInputRef}
                            />
                            {searching && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                          <div
                            className="absolute top-full left-0 right-0 mt-2 border border-gray-300 rounded-lg bg-white shadow-xl z-[10000] max-h-80 overflow-y-auto"
                            style={{
                              zIndex: 10000,
                              position: "absolute",
                            }}
                          >
                            <div className="p-3">
                              <p className="text-sm font-semibold text-gray-700 mb-3 px-2 border-b pb-2">
                                📍 Search Results ({searchResults.length})
                              </p>
                              <div className="space-y-2">
                                {searchResults.map((result, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => selectSearchResult(result)}
                                    className="w-full text-left p-4 rounded-lg hover:bg-purple-50 hover:border-purple-200 border border-transparent transition-all duration-200 text-sm group"
                                  >
                                    <div className="font-medium text-gray-900 group-hover:text-purple-700">
                                      {formatDisplayName(result)}
                                    </div>
                                    {result.type && (
                                      <div className="text-xs text-gray-500 mt-1 capitalize group-hover:text-purple-600">
                                        {result.type.replace("_", " ")}
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-400 mt-1">
                                      Lat: {parseFloat(result.lat).toFixed(4)},
                                      Lng: {parseFloat(result.lon).toFixed(4)}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Search hint */}
                        {searchQuery.length > 0 && searchQuery.length < 3 && (
                          <p className="text-xs text-gray-500 mt-2 ml-1">
                            Type at least 3 characters to search...
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Click on the map to select your event venue location
                        {!coordinatesSelected && !isEditing && (
                          <span className="text-red-500 font-medium">
                            {" "}
                            (Required)
                          </span>
                        )}
                      </p>
                    </div>

                    <MapContainer
                      center={position}
                      zoom={14}
                      style={{
                        height: "200px",
                        width: "100%",
                        borderRadius: "12px",
                      }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationPicker />
                      <MapUpdater center={position} />
                    </MapContainer>

                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-gray-600">
                        📍 <strong>Venue:</strong>{" "}
                        {venue || "Click on the map to select location"}
                      </p>
                      {coordinatesSelected && (
                        <p className="text-xs text-green-600">
                          ✅ Location selected: {position[0].toFixed(6)},{" "}
                          {position[1].toFixed(6)}
                        </p>
                      )}
                      {!coordinatesSelected && !isEditing && (
                        <p className="text-xs text-red-600">
                          ⚠️ Please click on the map to select your event
                          location
                        </p>
                      )}
                    </div>

                    <input
                      type="text"
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      disabled={!canCreateEvent}
                      className={`${inputClass} h-12 mt-4 ${
                        !canCreateEvent ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      placeholder="Venue name will be filled automatically when you select a location"
                    />
                  </div>
                </div>
              </div>

              {/* Category Section */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <Tag className="h-6 w-6 text-purple-600" />
                  Category
                </h3>

                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <select
                    id="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={!canCreateEvent}
                    className={`${inputClass} pl-10 pr-8 h-12 appearance-none ${
                      !canCreateEvent ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="technology">Technology</option>
                    <option value="music">Music</option>
                    <option value="food">Food & Drink</option>
                    <option value="arts">Arts</option>
                    <option value="business">Business</option>
                    <option value="wellness">Wellness</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Seat Configuration */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <Armchair className="h-6 w-6 text-purple-600" />
                  Seat Configuration
                </h3>

                <div className="space-y-6">
                  {/* Front Seats */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <h4 className="font-semibold text-green-800 text-lg">
                        Front Seats
                      </h4>
                      <span className="text-sm bg-green-200 text-green-800 px-3 py-1 rounded-full font-medium">
                        Premium
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
                          Number of Seats
                        </label>
                        <input
                          type="number"
                          value={
                            seatConfig.front.count === 0
                              ? ""
                              : seatConfig.front.count
                          }
                          onChange={(e) =>
                            handleSeatConfigChange(
                              "front",
                              "count",
                              e.target.value
                            )
                          }
                          min={0}
                          max={getAvailableSeats("front")}
                          className="w-full rounded-lg border border-green-300 bg-white px-4 py-3 text-green-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                          placeholder="0"
                        />
                        <p className="text-xs text-green-600 mt-1">
                          Available: {getAvailableSeats("front")} seats
                        </p>
                      </div>
                      <div>
                        <label className="flex items-center  text-sm font-medium text-green-700 mb-2">
                          Premium Price <IndianRupee size={10} />
                        </label>
                        <input
                          type="number"
                          value={
                            seatConfig.front.price === 0
                              ? ""
                              : seatConfig.front.price
                          }
                          onChange={(e) =>
                            handleSeatConfigChange(
                              "front",
                              "price",
                              e.target.value
                            )
                          }
                          min={0}
                          className="w-full rounded-lg border border-green-300 bg-white px-4 py-3 text-green-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                          placeholder="0"
                        />
                        <p className="text-xs text-green-600 mt-1">
                          Extra charge per seat
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-green-600 mb-1">
                            Final Price
                          </div>
                          <div className="flex items-center justify-center text-2xl font-bold text-green-700">
                            <IndianRupee size={15} />
                            {getFinalPrice("front")}
                          </div>
                          <div className="text-xs text-green-500 mt-1">
                            Base + Premium
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Seats */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <h4 className="font-semibold text-blue-800 text-lg">
                        Middle Seats
                      </h4>
                      <span className="text-sm bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-medium">
                        Standard
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">
                          Number of Seats
                        </label>
                        <input
                          type="number"
                          value={
                            seatConfig.middle.count === 0
                              ? ""
                              : seatConfig.middle.count
                          }
                          onChange={(e) =>
                            handleSeatConfigChange(
                              "middle",
                              "count",
                              e.target.value
                            )
                          }
                          min={0}
                          max={getAvailableSeats("middle")}
                          className="w-full rounded-lg border border-blue-300 bg-white px-4 py-3 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="0"
                        />
                        <p className="text-xs text-blue-600 mt-1">
                          Available: {getAvailableSeats("middle")} seats
                        </p>
                      </div>
                      <div>
                        <label className="fllex items-center justify-center text-sm font-medium text-blue-700 mb-2">
                          Premium Price
                        </label>
                        <input
                          type="number"
                          value={
                            seatConfig.middle.price === 0
                              ? ""
                              : seatConfig.middle.price
                          }
                          onChange={(e) =>
                            handleSeatConfigChange(
                              "middle",
                              "price",
                              e.target.value
                            )
                          }
                          min={0}
                          className="w-full rounded-lg border border-blue-300 bg-white px-4 py-3 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="0"
                        />
                        <p className="text-xs text-blue-600 mt-1">
                          Extra charge per seat
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-blue-600 mb-1">
                            Final Price
                          </div>
                          <div className=" flex items-center justify-center text-2xl font-bold text-blue-700">
                            <IndianRupee size={15} />
                            {getFinalPrice("middle")}
                          </div>
                          <div className="text-xs text-blue-500 mt-1">
                            Base + Premium
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Last Seats */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                      <h4 className="font-semibold text-gray-800 text-lg">
                        Last Seats
                      </h4>
                      <span className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded-full font-medium">
                        Economy
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Seats
                        </label>
                        <input
                          type="number"
                          value={
                            seatConfig.last.count === 0
                              ? ""
                              : seatConfig.last.count
                          }
                          onChange={(e) =>
                            handleSeatConfigChange(
                              "last",
                              "count",
                              e.target.value
                            )
                          }
                          min={0}
                          max={getAvailableSeats("last")}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Available: {getAvailableSeats("last")} seats
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Premium Price
                        </label>
                        <input
                          type="number"
                          value={
                            seatConfig.last.price === 0
                              ? ""
                              : seatConfig.last.price
                          }
                          onChange={(e) =>
                            handleSeatConfigChange(
                              "last",
                              "price",
                              e.target.value
                            )
                          }
                          min={0}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Extra charge per seat
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-600 mb-1">
                            Final Price
                          </div>
                          <div className="flex items-center justify-center text-2xl font-bold text-gray-700">
                            <IndianRupee size={15} />
                            {getFinalPrice("last")}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Base + Premium
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Seats Summary */}
                  <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="text-center">
                        <div className="text-sm font-medium text-purple-700">
                          Total Seats
                        </div>
                        <div
                          className={`text-3xl font-bold ${
                            seatsExceedLimit
                              ? "text-red-600"
                              : "text-purple-600"
                          }`}
                        >
                          {totalSeats}
                        </div>
                        <div className="text-xs text-purple-600">
                          of {maxAttendeesAllowed} max
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm font-medium text-purple-700">
                          Seat Distribution
                        </div>
                        <div className="flex justify-center gap-4 mt-2">
                          <div className="text-center">
                            <div className="text-sm font-semibold text-green-600">
                              {seatConfig.front.count}
                            </div>
                            <div className="text-xs text-green-500">Front</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold text-blue-600">
                              {seatConfig.middle.count}
                            </div>
                            <div className="text-xs text-blue-500">Middle</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold text-gray-600">
                              {seatConfig.last.count}
                            </div>
                            <div className="text-xs text-gray-500">Last</div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm font-medium text-purple-700">
                          Remaining
                        </div>
                        <div
                          className={`text-2xl font-bold ${
                            maxAttendeesAllowed - totalSeats < 10
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {maxAttendeesAllowed - totalSeats}
                        </div>
                        <div className="text-xs text-purple-600">
                          seats available
                        </div>
                      </div>
                    </div>

                    {/* Validation Messages */}
                    {seatsExceedLimit && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-700">
                            Total seats ({totalSeats}) exceed your plan limit of{" "}
                            {maxAttendeesAllowed}
                          </span>
                        </div>
                        <p className="text-xs text-red-600 mt-1 ml-6">
                          Please reduce seat counts to continue.
                        </p>
                      </div>
                    )}

                    {totalSeats === 0 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-700">
                            No seats configured
                          </span>
                        </div>
                        <p className="text-xs text-yellow-600 mt-1 ml-6">
                          Please configure at least one seat type to create your
                          event.
                        </p>
                      </div>
                    )}

                    {totalSeats > 0 && !seatsExceedLimit && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-700">
                            Seat configuration is valid
                          </span>
                        </div>
                        <p className="text-xs text-green-600 mt-1 ml-4">
                          You have {maxAttendeesAllowed - totalSeats} seats
                          remaining in your plan.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Banner */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <ImageIcon className="h-6 w-6 text-purple-600" />
                  Event Banner
                </h3>

                <div className="space-y-4">
                  {/* Manual upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Banner{" "}
                      {!isEditing && <span className="text-red-500">*</span>}
                    </label>
                    <div className="flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-8">
                      <div className="text-center">
                        <Upload
                          className="mx-auto h-12 w-12 text-gray-400"
                          strokeWidth={1.5}
                        />
                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-white font-semibold text-purple-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-600 focus-within:ring-offset-2 hover:text-purple-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={handleImageChange}
                              accept="image/*"
                              disabled={!canCreateEvent}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">
                          PNG, JPG, GIF up to 5MB
                        </p>
                        {fileName && !aiBannerUrl && (
                          <p className="text-sm mt-2 font-medium text-gray-800">
                            Selected file: {fileName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Generator */}
                  <div className="mt-4 p-4 border rounded-xl bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />{" "}
                        Generate with AI
                      </label>
                      {!canGenerateAi && (
                        <div className="flex items-center text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {userPlan === "basic"
                            ? "Not available on Basic plan"
                            : `AI limit reached (${maxAiEventsAllowed})`}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Describe your event banner..."
                        className={`${inputClass} flex-1 ${
                          !canGenerateAi ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                        disabled={!canGenerateAi}
                      />
                      <button
                        type="button"
                        onClick={generateAiBanner}
                        disabled={aiGenerating || !canGenerateAi}
                        className="px-4 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center min-w-[120px]"
                      >
                        {aiGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          "Generate"
                        )}
                      </button>
                    </div>

                    {/* AI Image Loading State */}
                    {aiGenerating && (
                      <div className="mt-4 p-6 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p className="text-purple-700 font-medium">
                            Generating your AI banner...
                          </p>
                          <p className="text-purple-600 text-sm mt-2">
                            This may take a few seconds. Please wait while we
                            create your custom banner.
                          </p>
                        </div>
                      </div>
                    )}

                    {aiBannerUrl && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700 font-medium mb-2">
                          Preview (AI generated):
                        </p>
                        <img
                          src={aiBannerUrl}
                          alt="AI Generated Banner"
                          className="mt-2 rounded-lg shadow-md w-full"
                        />
                      </div>
                    )}

                    {/* AI Generation Limits Info */}
                    <div className="mt-3 text-xs text-gray-500">
                      <p className="font-medium">
                        AI Generation Limits by Plan:
                      </p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li className="flex items-center">
                          <span className="bg-gray-200 px-2 py-1 rounded mr-2 text-xs">
                            Basic
                          </span>
                          <span>No AI generation</span>
                        </li>
                        <li className="flex items-center">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded mr-2 text-xs">
                            Premium
                          </span>
                          <span>Up to 2 events with AI images</span>
                        </li>
                        <li className="flex items-center">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded mr-2 text-xs">
                            Platinum
                          </span>
                          <span>Up to 5 events with AI images</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error message and buttons */}
          <div className="mt-8 grid grid-cols-2 gap-8">
            <div className="col-span-2">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {!coordinatesSelected && !isEditing && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Please select a location on the map by clicking on the
                    venue.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !canCreateEvent ||
                    (!coordinatesSelected && !isEditing) ||
                    totalSeats === 0 ||
                    seatsExceedLimit
                  }
                  className={`px-6 py-3 rounded-lg text-white transition-colors shadow font-medium ${
                    !canCreateEvent ||
                    (!coordinatesSelected && !isEditing) ||
                    totalSeats === 0 ||
                    seatsExceedLimit
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Update Event"
                    : "Create Event"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

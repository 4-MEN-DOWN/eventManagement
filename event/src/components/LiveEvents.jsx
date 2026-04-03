import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLiveEventsAsync } from "../redux/slices/eventSlice";
import { Link } from "react-router-dom";
import {
  Clock,
  MapPin,
  Users,
  Calendar,
  Eye,
  MessageCircle,
  TrendingUp,
  IndianRupee,
  Ticket,
  CheckCircle,
  XCircle,
  Search,
  Filter,
} from "lucide-react";

export const LiveEvents = () => {
  const dispatch = useDispatch();
  const { liveEvents, loading } = useSelector((state) => state.events);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getLiveEventsAsync());
  }, [dispatch]);

  useEffect(() => {
    let filtered = liveEvents;

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (event) => event.category === selectedCategory
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [liveEvents, selectedCategory, searchTerm]);

  // Get unique categories for filter
  const categories = [
    "all",
    ...new Set(liveEvents.map((event) => event.category)),
  ];

  // Calculate total attendees
  const calculateTotalAttendees = (event) => {
    if (!event?.attendees || !Array.isArray(event.attendees)) return 0;
    return event.attendees.length;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      technology: "bg-blue-100 text-blue-800 border-blue-200",
      music: "bg-purple-100 text-purple-800 border-purple-200",
      food: "bg-amber-100 text-amber-800 border-amber-200",
      arts: "bg-pink-100 text-pink-800 border-pink-200",
      business: "bg-indigo-100 text-indigo-800 border-indigo-200",
      wellness: "bg-emerald-100 text-emerald-800 border-emerald-200",
      uncategorized: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (time) => {
    if (!time) return "";
    try {
      const [hours, minutes] = time.split(":").map(Number);
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${String(minutes).padStart(2, "0")} ${ampm}`;
    } catch (error) {
      return "Invalid time";
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800">
            Loading live events...
          </h2>
          <p className="text-gray-600 mt-2">
            Fetching the latest events for you
          </p>
        </div>
      </div>
    );
  }

  if (!liveEvents.length) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
          <TrendingUp className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            No Live Events Right Now
          </h1>
          <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
            Check back later for upcoming events or explore other events
            happening soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Live Events
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover events happening right now with real-time engagement
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Ticket className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            {liveEvents.length}
          </h3>
          <p className="text-gray-600">Total Live Events</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            {liveEvents.filter((event) => event.status === "approved").length}
          </h3>
          <p className="text-gray-600">Approved Events</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            {liveEvents.reduce(
              (total, event) => total + calculateTotalAttendees(event),
              0
            )}
          </h3>
          <p className="text-gray-600">Total Attendees</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            {liveEvents.reduce(
              (total, event) => total + (event.comments?.length || 0),
              0
            )}
          </h3>
          <p className="text-gray-600">Total Comments</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search live events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="all">All Categories</option>
              {categories
                .filter((cat) => cat !== "all")
                .map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No Live Events Found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== "all"
              ? "Try adjusting your search filters to find live events."
              : "There are no live events matching your criteria."}
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
            }}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              {/* Event Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={`http://localhost:5000/uploads/event-banners/${event.banner}`}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                    Live Now
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 bg-white text-gray-700 text-xs font-medium rounded-full shadow-sm border ${getCategoryColor(
                      event.category
                    )}`}
                  >
                    {event.category.charAt(0).toUpperCase() +
                      event.category.slice(1)}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span
                    className={`px-3 py-1 text-white text-xs font-medium rounded-full ${getStatusColor(
                      event.status
                    )
                      .replace("bg-", "bg-")
                      .replace("text-", "text-")}`}
                  >
                    {event.status.charAt(0).toUpperCase() +
                      event.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-5">
                <h2 className="font-bold text-xl text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {event.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{formatDate(event.date)}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    <span>
                      {formatTime(event.startTime)} -{" "}
                      {formatTime(event.endTime)}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>

                {/* Event Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{calculateTotalAttendees(event)} attending</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>{event.comments?.length || 0} comments</span>
                  </div>
                  <div className="flex items-center">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    <span>{event.basePrice || "Free"}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/events/${event._id}`}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Link>

                  <Link
                    to={`/events/${event._id}/comment`}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Comments
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results for filter */}
      {filteredEvents.length === 0 &&
        (searchTerm || selectedCategory !== "all") && (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No live events found
              </h3>
              <p className="text-gray-600 mb-4">
                Try selecting a different category or check your search terms
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Show All Live Events
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

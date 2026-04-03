import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Search,
  Heart,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Star,
  Filter,
  X,
  Image as ImageIcon,
  ExternalLink,
  Grid,
  List,
  Download,
  Share,
  MoreVertical,
  ChevronDown,
  Trash2,
  Loader,
  CheckCircle,
  BarChart3,
  Plus,
  IndianRupee,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeFromWatchlistAsync } from "../../redux/slices/eventSlice";
import { toast } from "sonner";

// Helper functions for colors
const getStatusColor = (status) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getCategoryColor = (category) => {
  const colors = {
    technology: "bg-blue-100 text-blue-800 border-blue-200",
    business: "bg-purple-100 text-purple-800 border-purple-200",
    entertainment: "bg-pink-100 text-pink-800 border-pink-200",
    education: "bg-indigo-100 text-indigo-800 border-indigo-200",
    sports: "bg-orange-100 text-orange-800 border-orange-200",
    food: "bg-emerald-100 text-emerald-800 border-emerald-200",
    default: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return colors[category] || colors.default;
};

const EventWatchlist = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [removingEventId, setRemovingEventId] = useState(null);
  const [expandedFilters, setExpandedFilters] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const watchlist = useSelector((state) => state.events.watchlist);
  const flatWatchlist = watchlist?.flat() || [];

  const handleImageError = (eventId) => {
    setImageErrors((prev) => ({ ...prev, [eventId]: true }));
  };

  // Handle remove from watchlist
  const handleRemoveFromWatchlist = async (eventId) => {
    try {
      setRemovingEventId(eventId);
      const result = await dispatch(removeFromWatchlistAsync(eventId));

      if (result.error) {
        throw new Error(result.payload);
      }

      toast.success("Event removed from watchlist");
    } catch (error) {
      console.error("Remove from watchlist error:", error);
      toast.error("Failed to remove event from watchlist");
    } finally {
      setRemovingEventId(null);
    }
  };

  // Handle view event details
  const handleViewDetails = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const filteredEvents = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return flatWatchlist.filter((event) => {
      const matchesSearch = [
        event.title,
        event.description,
        event.location,
      ].some((field) => field && field.toLowerCase().includes(term));
      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || event.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [flatWatchlist, searchTerm, statusFilter, categoryFilter]);

  // Get unique categories for filter dropdown
  const uniqueCategories = [
    ...new Set(flatWatchlist.map((event) => event.category).filter(Boolean)),
  ];

  // Pagination Logic - more events per page for grid view
  const eventsPerPage = viewMode === "grid" ? 6 : 4;
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));

  const clearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const h = parseInt(hours);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Watchlist
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Keep track of your favorite events and never miss what matters to
            you
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md">
                <Bookmark className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {flatWatchlist.length}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-700">
              Total Saved
            </h3>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg shadow-md">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                {flatWatchlist.filter((e) => e.status === "approved").length}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-700">Approved</h3>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-md">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {flatWatchlist.filter((e) => e.status === "pending").length}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-700">Pending</h3>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {flatWatchlist.reduce(
                  (total, event) => total + (event?.attendees?.length || 0),
                  0
                )}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-700">
              Total Attendees
            </h3>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/90 backdrop-blur-xl rounded-xl p-5 border border-white/20 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your saved events..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 text-black"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpandedFilters(!expandedFilters)}
                className="flex items-center px-3 py-2 bg-white/80 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Filter className="w-4 h-4 mr-1" />
                Filters
                {expandedFilters ? (
                  <ChevronDown className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1 transform rotate-180" />
                )}
              </button>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-white/80 text-slate-500 hover:bg-slate-100"
                }`}
              >
                <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-white/80 text-slate-500 hover:bg-slate-100"
                }`}
              >
                <div className="flex flex-col gap-0.5 w-4 h-4">
                  <div className="bg-current rounded-sm h-1"></div>
                  <div className="bg-current rounded-sm h-1"></div>
                  <div className="bg-current rounded-sm h-1"></div>
                </div>
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {expandedFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-black"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Events Grid/List View */}
        {currentEvents.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-xl p-8 border border-white/20 shadow-lg text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                ? "No events match your filters"
                : "Your watchlist is empty"}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Start saving events to see them here!"}
            </p>
            {(searchTerm ||
              statusFilter !== "all" ||
              categoryFilter !== "all") && (
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentEvents.map((event, index) => {
              const hasImage = event.banner && !imageErrors[event._id];

              return (
                <div
                  key={event._id}
                  className="group bg-white/90 backdrop-blur-xl rounded-xl overflow-hidden border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Event Image */}
                  <div className="relative h-40 overflow-hidden">
                    {hasImage ? (
                      <img
                        src={`http://localhost:5000/uploads/event-banners/${event.banner}`}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() => handleImageError(event._id)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-indigo-300" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex flex-col gap-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          event.status
                        )}`}
                      >
                        {event.status?.charAt(0).toUpperCase() +
                          event.status?.slice(1) || "Unknown"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                          event.category
                        )}`}
                      >
                        {event.category?.charAt(0).toUpperCase() +
                          event.category?.slice(1) || "Uncategorized"}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                      <h3 className="text-base font-bold truncate">
                        {event.title || "Untitled Event"}
                      </h3>
                      <p className="text-xs opacity-90 truncate">
                        {event.location || "No location"}
                      </p>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 p-4 space-y-3">
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {event.description || "No description available."}
                    </p>

                    {/* Event Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center text-slate-600">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                        <span>{formatTime(event.startTime) || "N/A"}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                        <span className="truncate">
                          {event.location
                            ? event.location.split(",")[0]
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <IndianRupee className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                        <span>{event.price || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3">
                      <button
                        onClick={() => handleViewDetails(event._id)}
                        className="flex-1 flex items-center justify-center px-2 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        Details
                      </button>
                      <button
                        onClick={() => handleRemoveFromWatchlist(event._id)}
                        disabled={removingEventId === event._id}
                        className="flex-1 flex items-center justify-center px-2 py-1.5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg hover:from-rose-600 hover:to-red-600 transition-all duration-300 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {removingEventId === event._id ? (
                          <Loader className="w-3.5 h-3.5 animate-spin mr-1" />
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Remove
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {currentEvents.map((event, index) => {
              const hasImage = event.banner && !imageErrors[event._id];

              return (
                <div
                  key={event._id}
                  className="group bg-white/90 backdrop-blur-xl rounded-xl overflow-hidden border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Event Image */}
                    <div className="md:w-48 h-40 md:h-auto relative overflow-hidden">
                      {hasImage ? (
                        <img
                          src={`http://localhost:5000/uploads/event-banners/${event.banner}`}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={() => handleImageError(event._id)}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-indigo-300" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            event.status
                          )}`}
                        >
                          {event.status?.charAt(0).toUpperCase() +
                            event.status?.slice(1) || "Unknown"}
                        </span>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-300">
                            {event.title || "Untitled Event"}
                          </h3>
                          <div className="flex items-center mt-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                                event.category
                              )}`}
                            >
                              {event.category?.charAt(0).toUpperCase() +
                                event.category?.slice(1) || "Uncategorized"}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                            {event.description || "No description available."}
                          </p>
                        </div>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 ml-2">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Event Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="flex items-center text-slate-600">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                          <span>{formatTime(event.startTime) || "N/A"}</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                          <span className="truncate">
                            {event.location
                              ? event.location.split(",")[0]
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <Users className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
                          <span>{event.attendees?.length || 0} attendees</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleViewDetails(event._id)}
                          className="flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleRemoveFromWatchlist(event._id)}
                          disabled={removingEventId === event._id}
                          className="flex items-center px-3 py-1.5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg hover:from-rose-600 hover:to-red-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {removingEventId === event._id ? (
                            <Loader className="w-3.5 h-3.5 animate-spin mr-1.5" />
                          ) : (
                            <>
                              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                              Remove
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {filteredEvents.length > eventsPerPage && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
            <div className="text-sm text-slate-600">
              Showing {(currentPage - 1) * eventsPerPage + 1} to{" "}
              {Math.min(currentPage * eventsPerPage, filteredEvents.length)} of{" "}
              {filteredEvents.length} events
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-sm"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-sm"
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventWatchlist;

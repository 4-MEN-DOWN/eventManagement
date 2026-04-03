import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateEventStatusAsync } from "../../redux/slices/eventSlice";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  Sparkles,
  X,
  AlertTriangle,
  ThumbsUp,
  Shield,
  User,
  Image as ImageIcon,
  Eye,
  Users,
  Tag,
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  IndianRupee,
} from "lucide-react";

export function VerifyEvents() {
  const dispatch = useDispatch();
  const reduxEvents = useSelector((state) => state.events.allEvents);
  const [localEvents, setLocalEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [expandedFilters, setExpandedFilters] = useState(false);

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem("eventsData");
    if (savedEvents) {
      try {
        setLocalEvents(JSON.parse(savedEvents));
      } catch (error) {
        console.error("Error parsing events from localStorage:", error);
        setLocalEvents(reduxEvents);
      }
    } else {
      setLocalEvents(reduxEvents);
    }
  }, []);

  // Sync Redux events to localStorage
  useEffect(() => {
    if (reduxEvents && reduxEvents.length > 0) {
      localStorage.setItem("eventsData", JSON.stringify(reduxEvents));
      setLocalEvents(reduxEvents);
    }
  }, [reduxEvents]);

  // Use local events or Redux events
  const events = localEvents.length > 0 ? localEvents : reduxEvents;

  // Filter events based on search and status
  const filteredEvents = events.filter((event) => {
    if (!event) return false;

    const matchesSearch =
      searchTerm === "" ||
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingEvents = filteredEvents.filter(
    (event) => event.status === "pending"
  );

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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      const [hours, minutes] = timeString.split(":");
      const h = parseInt(hours);
      const period = h >= 12 ? "PM" : "AM";
      const hour12 = h % 12 || 12;
      return `${hour12}:${minutes} ${period}`;
    } catch (error) {
      return "Invalid time";
    }
  };

  const handleApprove = async () => {
    if (!currentEvent) return;

    setLoading(true);
    try {
      await dispatch(
        updateEventStatusAsync({ id: currentEvent._id, status: "approved" })
      ).unwrap();

      toast.success(`"${currentEvent.title}" has been approved successfully.`, {
        description: "The event is now live and visible to users.",
        duration: 4000,
      });
      setShowApproveModal(false);

      const updatedEvents = events.map((event) =>
        event._id === currentEvent._id
          ? { ...event, status: "approved" }
          : event
      );
      localStorage.setItem("eventsData", JSON.stringify(updatedEvents));
      setLocalEvents(updatedEvents);
    } catch (err) {
      toast.error("Failed to approve event", {
        description: err,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!currentEvent) return;

    setLoading(true);
    try {
      await dispatch(
        updateEventStatusAsync({ id: currentEvent._id, status: "rejected" })
      ).unwrap();

      toast.error(`"${currentEvent.title}" has been rejected.`, {
        description: "The event has been removed from public view.",
        duration: 5000,
      });
      setShowRejectModal(false);

      const updatedEvents = events.map((event) =>
        event._id === currentEvent._id
          ? { ...event, status: "rejected" }
          : event
      );
      localStorage.setItem("eventsData", JSON.stringify(updatedEvents));
      setLocalEvents(updatedEvents);
    } catch (err) {
      toast.error(err || "Failed to reject event");
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (event) => {
    setCurrentEvent(event);
    setShowApproveModal(true);
  };

  const openRejectModal = (event) => {
    setCurrentEvent(event);
    setShowRejectModal(true);
  };

  const getBannerUrl = (banner) =>
    `http://localhost:5000/uploads/event-banners/${banner}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Event Verification
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Review and approve pending event submissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {events.length}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-700">
              Total Events
            </h3>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-md">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {pendingEvents.length}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-700">
              Pending Review
            </h3>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg shadow-md">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                {events.filter((e) => e.status === "approved").length}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-700">Approved</h3>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {events.reduce(
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
                placeholder="Search events by title, description or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
          </div>

          {/* Expanded Filters */}
          {expandedFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loader */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white/90 backdrop-blur-xl rounded-xl p-6 shadow-lg flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <p className="text-lg text-slate-700">Processing...</p>
            </div>
          </div>
        )}

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-xl p-12 border border-white/20 shadow-lg text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              {statusFilter === "pending" && pendingEvents.length === 0
                ? "All caught up!"
                : "No events found"}
            </h3>
            <p className="text-slate-500 mb-6">
              {statusFilter === "pending" && pendingEvents.length === 0
                ? "No events pending verification. Everything is approved and ready to go!"
                : "Try adjusting your search or filters"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => (
              <div
                key={event._id}
                className="group bg-white/90 backdrop-blur-xl rounded-xl overflow-hidden border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Event Image */}
                  <div className="md:w-48 h-40 md:h-auto relative overflow-hidden">
                    {event?.banner ? (
                      <img
                        src={getBannerUrl(event.banner)}
                        alt={event?.title || "Event image"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-indigo-300" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          event?.status
                        )}`}
                      >
                        {(event?.status || "unknown").charAt(0).toUpperCase() +
                          (event?.status || "unknown").slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-300">
                          {event?.title || "Untitled Event"}
                        </h3>
                        <div className="flex items-center mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                              event?.category
                            )}`}
                          >
                            {(event?.category || "uncategorized")
                              .charAt(0)
                              .toUpperCase() +
                              (event?.category || "uncategorized").slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                          {event?.description || "No description available"}
                        </p>
                      </div>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 ml-2">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="flex items-center text-slate-600">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                        <span>{formatDate(event?.date)}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                        <span>{formatTime(event?.startTime) || "N/A"}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                        <span className="truncate">
                          {event?.location
                            ? event.location.split(",")[0]
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <IndianRupee className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                        <span>{event?.price || 0}</span>
                      </div>
                    </div>

                    {/* Organizer Info */}
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center text-slate-600">
                          <User className="w-3.5 h-3.5 mr-1.5" />
                          <span>
                            Organizer: {event.createdBy?.name || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <Users className="w-3.5 h-3.5 mr-1.5" />
                          <span>{event?.attendees?.length || 0} attendees</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions - Only show for pending events */}
                    {event.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => openRejectModal(event)}
                          disabled={loading}
                          className="flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1.5" />
                          Reject
                        </button>
                        <button
                          onClick={() => openApproveModal(event)}
                          disabled={loading}
                          className="flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approve Modal */}
        {showApproveModal && currentEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-bold text-white">
                      Confirm Approval
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="text-white hover:text-gray-200 transition-colors cursor-pointer p-1 hover:bg-white/10 rounded-full"
                    disabled={loading}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ThumbsUp className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-slate-600">
                    Approve this event? It will be visible to all users.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-800 text-center mb-3">
                    {currentEvent.title}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-slate-600">
                      <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                      <span>{formatDate(currentEvent.date)}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <MapPin className="w-4 h-4 mr-2 text-green-500" />
                      <span className="truncate">{currentEvent.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && currentEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
              <div className="bg-gradient-to-r from-rose-500 to-red-600 p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-bold text-white">
                      Confirm Rejection
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="text-white hover:text-gray-200 transition-colors cursor-pointer p-1 hover:bg-white/10 rounded-full"
                    disabled={loading}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-slate-600">
                    Reject this event? This cannot be undone.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 text-center">
                    {currentEvent.title}
                  </h4>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg font-medium hover:from-rose-600 hover:to-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

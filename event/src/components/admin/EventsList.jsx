import { useSelector } from "react-redux";
import { useState, useMemo, useEffect } from "react";
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Frown,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Eye,
  User,
  Tag,
  BarChart3,
  IndianRupee,
  ChevronDown,
  Image as ImageIcon,
  MoreVertical,
} from "lucide-react";
import * as XLSX from "xlsx";

export function EventsList() {
  const reduxEvents = useSelector((state) => state.events.allEvents);
  const [localEvents, setLocalEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedFilters, setExpandedFilters] = useState(false);

  // Load events from localStorage on component mount
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

  // Save events to localStorage whenever reduxEvents changes
  useEffect(() => {
    if (reduxEvents && reduxEvents.length > 0) {
      localStorage.setItem("eventsData", JSON.stringify(reduxEvents));
      setLocalEvents(reduxEvents);
    }
  }, [reduxEvents]);

  // Use either localStorage events or Redux events
  const events = localEvents.length > 0 ? localEvents : reduxEvents;

  // Get unique categories from events
  const categories = useMemo(() => {
    const uniqueCategories = new Set();
    events.forEach((event) => {
      if (event && event.category) {
        uniqueCategories.add(event.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (!event) return false;

      const matchesSearch =
        (event.title &&
          event.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.description &&
          event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.location &&
          event.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || event.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [events, searchTerm, statusFilter, categoryFilter]);

  // Pagination logic
  const eventsPerPage = 6;
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
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

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredEvents);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Events");
    XLSX.writeFile(wb, "events.xlsx");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Events Dashboard
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Manage and explore all events in one beautiful dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md">
                <BarChart3 className="w-5 h-5 text-white" />
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
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg shadow-md">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                {
                  filteredEvents.filter((e) => e && e.status === "approved")
                    .length
                }
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
                {
                  filteredEvents.filter((e) => e && e.status === "pending")
                    .length
                }
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

              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Download className="w-4 h-4" />
                Export Excel
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
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
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
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-black"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Events Grid */}
        {currentEvents.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-xl p-12 border border-white/20 shadow-lg text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              No events found
            </h3>
            <p className="text-slate-500 mb-6">
              Try adjusting your search or filters to find events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentEvents.map((event, index) =>
              event ? (
                <div
                  key={event._id}
                  className="group bg-white/90 backdrop-blur-xl rounded-xl overflow-hidden border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-40 overflow-hidden">
                    {event?.banner ? (
                      <img
                        src={`http://localhost:5000/uploads/event-banners/${event.banner}`}
                        alt={event?.title || "Event image"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-indigo-300" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex flex-col gap-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          event?.status
                        )}`}
                      >
                        {(event?.status || "unknown").charAt(0).toUpperCase() +
                          (event?.status || "unknown").slice(1)}
                      </span>
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
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                      <h3 className="text-base font-bold truncate">
                        {event?.title || "Untitled Event"}
                      </h3>
                      <p className="text-xs opacity-90 truncate">
                        {event?.location || "No location"}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 p-4 space-y-3">
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {event?.description || "No description available"}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center text-slate-600">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                        <span>{formatDate(event?.date)}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                        <span>{formatTime(event?.time) || "N/A"}</span>
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

                    <div className="flex justify-between items-center pt-3 border-t border-slate-200/50 text-xs">
                      <div className="flex items-center text-slate-600">
                        <Users className="w-3.5 h-3.5 mr-1.5" />
                        <span>{event?.attendees?.length || 0} attendees</span>
                      </div>
                      {event.createdBy && (
                        <div className="flex items-center text-slate-600">
                          <User className="w-3.5 h-3.5 mr-1.5" />
                          <span className="truncate max-w-[80px]">
                            {event.createdBy.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
            <div className="text-sm text-slate-600">
              Showing {indexOfFirstEvent + 1} to{" "}
              {Math.min(indexOfLastEvent, filteredEvents.length)} of{" "}
              {filteredEvents.length} events
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
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
}

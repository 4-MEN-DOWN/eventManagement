import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Eye,
  Edit2,
  Trash2,
  Search,
  Link,
} from "lucide-react";
import {
  getAllEventsAsync,
  getEventsToOrganizeAsync,
  deleteOrganizedEventAsync,
  editOrganizedEventAsync,
} from "../redux/slices/eventSlice";
import { useNavigate } from "react-router-dom";

export function MyEvents() {
  const navigate = useNavigate();

  const handleViewClick = () => {
    navigate(`/singleEvent/${event._id}`);
  };
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const eventToOrganize = useSelector(
    (state) => state.events.eventsToOrganize || []
  );
  const {
    allEvents: events = [],
    loading,
    error,
  } = useSelector((state) => state.events);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingEventId, setEditingEventId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    dispatch(getAllEventsAsync());
  }, [dispatch]);

  useEffect(() => {
    if (user?._id) {
      dispatch(getEventsToOrganizeAsync(user._id));
    }
  }, [dispatch, user?._id]);

  const filteredEvents = useMemo(() => {
    return eventToOrganize.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || event.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [eventToOrganize, searchTerm, statusFilter, categoryFilter]);

  const uniqueCategories = [...new Set(eventToOrganize.map((e) => e.category))];

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "border-green-500 text-green-700";
      case "pending":
        return "border-yellow-500 text-yellow-700";
      case "rejected":
        return "border-red-500 text-red-700";
      default:
        return "border-gray-300 text-gray-700";
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      technology: "border-blue-500 text-blue-700",
      music: "border-purple-500 text-purple-700",
      food: "border-amber-500 text-amber-700",
      arts: "border-pink-500 text-pink-700",
      business: "border-indigo-500 text-indigo-700",
      wellness: "border-emerald-500 text-emerald-700",
    };
    return colors[category] || "border-gray-300 text-gray-700";
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      dispatch(deleteOrganizedEventAsync(id));
    }
  };

  const handleEditClick = (event) => {
    setEditingEventId(event._id);
    setEditFormData({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().slice(0, 10),
      time: event.time,
      location: event.location,
      category: event.category,
      price: event.price,
    });
  };

  const handleEditChange = (e) => {
    setEditFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEditSubmit = (id) => {
    dispatch(
      editOrganizedEventAsync({ eventId: id, updatedData: editFormData })
    );
    setEditingEventId(null);
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Events
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Manage and track all your created events in one beautiful dashboard
          </p>
        </div>

        {loading && (
          <div className="text-center text-lg text-indigo-600 font-semibold">
            Loading events...
          </div>
        )}
        {error && (
          <div className="text-center text-red-600 font-semibold">
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="group bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {eventToOrganize.length}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-700">
                  Total Events
                </h3>
              </div>

              <div className="group bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl shadow-lg">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {
                      eventToOrganize.filter((e) => e.status === "approved")
                        .length
                    }
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-700">
                  Published
                </h3>
              </div>

              <div className="group bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {
                      eventToOrganize.filter((e) => e.status === "pending")
                        .length
                    }
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-700">
                  Pending
                </h3>
              </div>

              <div className="group bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {eventToOrganize.reduce(
                      (total, event) => total + event.attendees.length,
                      0
                    )}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-700">
                  Attendees
                </h3>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search your events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
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
          </>
        )}

        {filteredEvents.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-12 border border-white/20 shadow-xl text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">
              No Events Found
            </h3>
            <p className="text-slate-500">
              Try adjusting your search filters to find your events.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredEvents.map((event, index) => (
              <div
                key={event._id}
                className="group bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-80 h-64 lg:h-auto relative overflow-hidden">
                    <img
                      src={`${"http://localhost:5000"}/uploads/event-banners/${
                        event.banner
                      }`}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                  </div>

                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        {editingEventId === event._id ? (
                          <>
                            <input
                              type="text"
                              name="title"
                              value={editFormData.title}
                              onChange={handleEditChange}
                              className="mb-2 p-2 border rounded w-full"
                            />
                            <textarea
                              name="description"
                              value={editFormData.description}
                              onChange={handleEditChange}
                              className="mb-2 p-2 border rounded w-full"
                              rows={3}
                            />
                            <input
                              type="date"
                              name="date"
                              value={editFormData.date}
                              onChange={handleEditChange}
                              className="mb-2 p-2 border rounded"
                            />
                            <input
                              type="time"
                              name="time"
                              value={editFormData.time}
                              onChange={handleEditChange}
                              className="mb-2 p-2 border rounded"
                            />
                            <input
                              type="text"
                              name="location"
                              value={editFormData.location}
                              onChange={handleEditChange}
                              className="mb-2 p-2 border rounded"
                            />
                            <select
                              name="category"
                              value={editFormData.category}
                              onChange={handleEditChange}
                              className="mb-2 p-2 border rounded"
                            >
                              {uniqueCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              name="price"
                              min="0"
                              value={editFormData.price}
                              onChange={handleEditChange}
                              className="mb-2 p-2 border rounded"
                            />
                          </>
                        ) : (
                          <>
                            <h3 className="text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-300">
                              {event.title}
                            </h3>
                            <p className="text-slate-600 mt-2 leading-relaxed">
                              {event.description}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            event.status
                          )}`}
                        >
                          {event.status.charAt(0).toUpperCase() +
                            event.status.slice(1)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(
                            event.category
                          )}`}
                        >
                          {event.category.charAt(0).toUpperCase() +
                            event.category.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center text-slate-600">
                        <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                        <span className="text-sm">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-sm">{event.time}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <MapPin className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <DollarSign className="w-4 h-4 mr-2 text-emerald-500" />
                        <span className="text-sm font-semibold">
                          ${event.price}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      {editingEventId === event._id ? (
                        <>
                          <button
                            onClick={() => handleEditSubmit(event._id)}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-xl hover:from-rose-600 hover:to-red-600 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <Link to={`/singleEvent/${event._id}`}>
                            <button className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </button>
                          </Link>
                          <button
                            onClick={() => handleEditClick(event)}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(event._id)}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-xl hover:from-rose-600 hover:to-red-600 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 text-sm text-slate-500">
                      <span>
                        Created:{" "}
                        {new Date(event.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{event.attendees.length} attendees</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

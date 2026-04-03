import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecommendations } from "../../redux/slices/recommendSlice";
import { NavLink } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  IndianRupee,
  Image as ImageIcon,
  TrendingUp,
  Heart,
  Sparkles,
  BarChart3,
} from "lucide-react";

const Recommendations = ({ userId }) => {
  const dispatch = useDispatch();
  const { collaborative, fallback, userCategories, stats, loading, error } =
    useSelector((state) => state.recommend);

  useEffect(() => {
    if (userId) {
      dispatch(fetchRecommendations(userId));
    }
  }, [userId, dispatch]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      const [hours, minutes] = timeString.split(":").map(Number);
      const ampm = hours >= 12 ? "PM" : "AM";
      const hour12 = hours % 12 || 12;
      return `${hour12}:${String(minutes).padStart(2, "0")} ${ampm}`;
    } catch (error) {
      return "Invalid time";
    }
  };

  // Format time range for display (startTime to endTime)
  const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return "Time not specified";

    try {
      const formattedStart = formatTime(startTime);
      const formattedEnd = formatTime(endTime);
      return `${formattedStart} - ${formattedEnd}`;
    } catch (error) {
      return "Invalid time range";
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

  // Stats card component
  const StatsCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  );

  // Event card component
  const EventCard = ({ event }) => {
    return (
      <div
        className="group bg-white/90 backdrop-blur-xl rounded-xl overflow-hidden border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
        style={{ animationDelay: `${Math.random() * 300}ms` }}
      >
        <div className="relative h-40 overflow-hidden">
          {event.banner ? (
            <img
              src={`http://localhost:5000/uploads/event-banners/${event.banner}`}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-indigo-300" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                event.category
              )}`}
            >
              {(event.category || "uncategorized").charAt(0).toUpperCase() +
                (event.category || "uncategorized").slice(1)}
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

        <div className="flex-1 p-4 space-y-3">
          <p className="text-sm text-slate-600 line-clamp-2">
            {event.description || "No description available"}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center text-slate-600">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
              <span>{formatTimeRange(event.startTime, event.endTime)}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-green-500" />
              <span className="truncate">
                {event.location ? event.location.split(",")[0] : "N/A"}
              </span>
            </div>
            <div className="flex items-center text-slate-600">
              <IndianRupee className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
              <span>{event.price || 0}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <NavLink
              to={`/events/${event._id}`}
              className="flex-1 flex items-center justify-center px-2 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 text-xs"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              View Details
            </NavLink>
          </div>
        </div>
      </div>
    );
  };

  // Determine if we should show popular events
  const shouldShowPopularEvents =
    collaborative.length === 0 && fallback.length > 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Event Recommendations
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              Discovering events tailored just for you
            </p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Event Recommendations
            </h1>
          </div>
          <div className="bg-white/90 backdrop-blur-xl rounded-xl p-8 border border-white/20 shadow-lg text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              Something went wrong
            </h3>
            <p className="text-slate-500 mb-6">{error}</p>
            <button
              onClick={() => dispatch(fetchRecommendations(userId))}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Event Recommendations
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Discover events tailored just for you based on your interests and
            preferences
          </p>
        </div>

        {/* Stats Section */}
        {stats && (stats.userPaidEventCount > 0 || stats.similarUsers > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            <StatsCard
              icon={Heart}
              label="Events Attended"
              value={stats.userPaidEventCount || 0}
              color="bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600"
            />
            <StatsCard
              icon={Users}
              label="Similar Users"
              value={stats.similarUsers || 0}
              color="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600"
            />
            <StatsCard
              icon={Sparkles}
              label="Personalized Picks"
              value={stats.collaborativeEvents || 0}
              color="bg-gradient-to-br from-purple-100 to-violet-100 text-purple-600"
            />
            <StatsCard
              icon={TrendingUp}
              label="Popular Events"
              value={stats.fallbackEvents || 0}
              color="bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600"
            />
          </div>
        )}

        {/* User Categories Section */}
        {userCategories && userCategories.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Your Top Interests
                </h3>
                <p className="text-sm text-slate-600">
                  We're recommending events based on these categories
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {userCategories.map((category, index) => (
                <span
                  key={index}
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${getCategoryColor(
                    category
                  )} animate-fade-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Collaborative Recommendations */}
        {collaborative.length > 0 && (
          <section className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Personalized For You
                </h2>
                <p className="text-slate-600">
                  Based on {stats?.similarUsers || 0} users with similar tastes
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {collaborative.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Fallback Recommendations - Only show if NO collaborative recommendations */}
        {shouldShowPopularEvents && (
          <section className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Trending Events
                </h2>
                <p className="text-slate-600">
                  Popular events others are attending right now
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {fallback.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {collaborative.length === 0 && fallback.length === 0 && (
          <div className="bg-white/90 backdrop-blur-xl rounded-xl p-12 border border-white/20 shadow-lg text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎭</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">
              No recommendations yet
            </h3>
            <p className="text-slate-500 mb-2">
              We need more information about your preferences to suggest events.
            </p>
            <p className="text-slate-500 mb-6">
              Start by purchasing tickets to events you're interested in to get
              personalized recommendations.
            </p>
            <NavLink
              to="/events"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all inline-block shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Browse All Events
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;

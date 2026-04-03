import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { loadUserFromStorage } from "../redux/slices/authSlice";
import { addCommentAsync } from "../redux/slices/eventSlice";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import {
  Wifi,
  Search,
  Send,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  Users,
  MessageCircle,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Calendar,
  Map,
  AlertTriangle,
  Shield,
  Clock,
  Tag,
} from "lucide-react";
import { toast } from "react-toastify";

const COLORS = ["#10B981", "#F59E0B", "#EF4444"]; // Positive, Neutral, Negative

export default function EventComments() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [commentWarningCount, setCommentWarningCount] = useState(0);
  const [commentDisabled, setCommentDisabled] = useState(false);
  const [event, setEvent] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [liveIndicator, setLiveIndicator] = useState(true);
  const [activeChart, setActiveChart] = useState("pie");
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const pollRef = useRef(null);

  // Load user from localStorage
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  // Load warning count from localStorage after user is loaded
  useEffect(() => {
    if (user && user._id && id && !isInitialized) {
      const warningKey = `commentWarnings_${user._id}_${id}`;
      const saved = localStorage.getItem(warningKey);
      const warningCount = saved ? parseInt(saved) : 0;

      console.log("Loading warnings from localStorage:", warningCount);
      setCommentWarningCount(warningCount);
      setCommentDisabled(warningCount >= 3);
      setIsInitialized(true);
    }
  }, [user, id, isInitialized]);

  // Update localStorage when warning count changes
  useEffect(() => {
    if (user && user._id && id && isInitialized) {
      const warningKey = `commentWarnings_${user._id}_${id}`;
      localStorage.setItem(warningKey, commentWarningCount.toString());
      setCommentDisabled(commentWarningCount >= 3);

      console.log("Updated warnings in localStorage:", commentWarningCount);
    }
  }, [commentWarningCount, user, id, isInitialized]);

  // Fetch event with comments
  const fetchEvent = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/v1/event/${id}/sentiment`
      );
      setEvent(data.event);
    } catch (error) {
      console.error(error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchEvent();
    // Live update every 5 sec
    pollRef.current = setInterval(fetchEvent, 5000);
    return () => {
      clearInterval(pollRef.current);
    };
  }, [id]);

  // Show warning if user has toxic comment warnings
  useEffect(() => {
    if (commentWarningCount > 0 && isInitialized) {
      toast.warn(
        `You have ${commentWarningCount}/3 warnings for toxic comments`
      );
    }

    if (commentDisabled && isInitialized) {
      toast.error(
        "Commenting disabled! You've reached the toxic comment limit."
      );
    }
  }, [commentWarningCount, commentDisabled, isInitialized]);

  // Blink live indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveIndicator((prev) => !prev);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  // Post a new comment using Redux thunk
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user?.token || commentDisabled) return;

    try {
      setLoading(true);
      const result = await dispatch(
        addCommentAsync({ eventId: id, text: newComment })
      ).unwrap();

      // Check if the comment was toxic and update warning count
      if (result.isToxic) {
        const newWarningCount = commentWarningCount + 1;
        setCommentWarningCount(newWarningCount);

        if (newWarningCount >= 3) {
          toast.error(
            "Commenting disabled! You've reached the toxic comment limit."
          );
        } else {
          toast.warn(`Warning! Toxic comment detected (${newWarningCount}/3)`);
        }
      } else {
        toast.success("Comment added successfully!");
      }

      setNewComment("");

      // Refresh event data to get the latest comments
      fetchEvent();
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset warnings for testing purposes
  const resetWarnings = () => {
    if (user && user._id && id) {
      const warningKey = `commentWarnings_${user._id}_${id}`;
      localStorage.removeItem(warningKey);
      setCommentWarningCount(0);
      setCommentDisabled(false);
      toast.info("Comment warnings have been reset");
    }
  };

  const comments = event?.comments || [];

  // Sentiment stats
  const sentimentData = useMemo(() => {
    const pos = comments.filter((c) => c.sentimentScore > 0.2).length;
    const neu = comments.filter(
      (c) => c.sentimentScore <= 0.2 && c.sentimentScore >= -0.2
    ).length;
    const neg = comments.filter((c) => c.sentimentScore < -0.2).length;
    return [
      { name: "Positive", value: pos, color: COLORS[0] },
      { name: "Neutral", value: neu, color: COLORS[1] },
      { name: "Negative", value: neg, color: COLORS[2] },
    ];
  }, [comments]);

  // Toxic comments analysis
  const toxicCommentsData = useMemo(() => {
    const toxicComments = comments.filter(
      (comment) => comment.isToxic || comment.sentimentScore < -0.5
    );

    const nonToxicComments = comments.filter(
      (comment) => !comment.isToxic && comment.sentimentScore >= -0.5
    );

    return [
      { name: "Toxic", value: toxicComments.length, color: "#EF4444" },
      { name: "Non-Toxic", value: nonToxicComments.length, color: "#10B981" },
    ];
  }, [comments]);

  // Scatter plot data for toxicity visualization
  const toxicityScatterData = useMemo(() => {
    return comments.map((comment) => ({
      x: comment.sentimentScore,
      y: comment.isToxic ? 1 : 0,
      z: comment.text.length,
      name: comment.userId?.name || "Anonymous",
      toxic: comment.isToxic,
    }));
  }, [comments]);

  // Prepare data for line chart (sentiment over time)
  const sentimentOverTime = useMemo(() => {
    return comments
      .slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((comment, index) => ({
        name: `#${index + 1}`,
        sentiment: comment.sentimentScore,
        date: new Date(comment.createdAt).toLocaleTimeString(),
        toxic: comment.isToxic,
      }));
  }, [comments]);

  // Calculate sentiment percentages
  const totalComments = comments.length;
  const sentimentPercentages = sentimentData.map((item) => ({
    name: item.name,
    percentage:
      totalComments > 0 ? ((item.value / totalComments) * 100).toFixed(1) : 0,
    value: item.value,
    color: item.color,
  }));

  // Helpers
  const sentimentLabel = (s) =>
    s > 0.2 ? "Positive" : s < -0.2 ? "Negative" : "Neutral";
  const sentimentBadgeClass = (s) =>
    s > 0.2
      ? "bg-emerald-100 text-emerald-800"
      : s < -0.2
      ? "bg-rose-100 text-rose-800"
      : "bg-amber-100 text-amber-800";

  // Skeleton while event/user not ready
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="animate-pulse">
          <div className="h-[25vh] bg-gray-800" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-3">
              <div className="h-7 w-40 bg-gray-800 rounded" />
              <div className="h-48 bg-gray-800 rounded-xl" />
            </div>
            <div className="space-y-3">
              <div className="h-20 bg-gray-800 rounded-xl" />
              <div className="h-20 bg-gray-800 rounded-xl" />
              <div className="h-20 bg-gray-800 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header Section with Live Status */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-red-600 text-white px-3 py-1">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      liveIndicator ? "bg-white" : "bg-red-300"
                    }`}
                  />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Live
                  </span>
                  <Wifi size={14} className="opacity-90" />
                </div>
                <h1 className="text-2xl font-bold text-white">{event.title}</h1>
              </div>
              <p className="text-sm text-gray-400 mt-1">{event.description}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1 text-xs font-medium text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full">
                <Users size={14} />
                <span>1247 Viewers</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-900/30 px-3 py-1 rounded-full">
                <MessageCircle size={14} />
                <span>{comments.length} Comments</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full">
                <Zap size={14} />
                <span>Active Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Comments Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Banner with Enhanced Display */}
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl border border-gray-700">
            <img
              src={`http://localhost:5000/uploads/event-banners/${event.banner}`}
              alt={event.title}
              className={`w-full h-full object-cover transition-opacity duration-700 ${
                bannerLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="eager"
              decoding="async"
              onLoad={() => setBannerLoaded(true)}
            />
            {!bannerLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-blue-500 animate-spin" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-2xl font-bold drop-shadow-md">
                {event.title}
              </h2>
              <p className="text-sm text-gray-200 max-w-2xl drop-shadow-md">
                {event.description}
              </p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Live Comments
                </h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-2.5 top-2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search comments..."
                      className="pl-9 pr-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {/* Reset warnings button (for testing) */}
                  {process.env.NODE_ENV === "development" &&
                    commentWarningCount > 0 && (
                      <button
                        onClick={resetWarnings}
                        className="text-xs text-gray-400 hover:text-white px-2 py-1 bg-gray-700 rounded"
                        title="Reset warnings (development only)"
                      >
                        Reset Warnings
                      </button>
                    )}
                </div>
              </div>
            </div>

            <div className="p-4 max-h-[500px] overflow-y-auto">
              {comments.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <div className="mx-auto h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center mb-3">
                    <MessageCircle size={24} className="text-gray-500" />
                  </div>
                  <p className="text-sm font-medium">No comments yet</p>
                  <p className="text-xs mt-1">
                    Be the first to share your thoughts!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <div
                      key={comment._id || index}
                      className={`bg-gray-750 rounded-lg p-4 border ${
                        comment.isToxic
                          ? "border-red-500/50 bg-red-900/10"
                          : "border-gray-700 hover:border-gray-600"
                      } transition-colors`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex items-center min-w-0">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3 text-white font-semibold text-xs">
                            {comment?.userId?.name
                              ? comment.userId.name.charAt(0).toUpperCase()
                              : "A"}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {comment?.userId?.name || "Anonymous"}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {comment.isToxic && (
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                              <AlertTriangle size={12} className="mr-1" />
                              Toxic
                            </div>
                          )}
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${sentimentBadgeClass(
                              comment.sentimentScore
                            )}`}
                          >
                            {comment.sentimentScore > 0.2 ? (
                              <ThumbsUp size={12} className="mr-1" />
                            ) : comment.sentimentScore < -0.2 ? (
                              <ThumbsDown size={12} className="mr-1" />
                            ) : (
                              <Minus size={12} className="mr-1" />
                            )}
                            {sentimentLabel(comment.sentimentScore)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">
                        {comment.text}
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        Score: {Number(comment.sentimentScore).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Comment Input */}
            <div className="px-4 py-3 bg-gray-750 border-t border-gray-700">
              {commentDisabled ? (
                <div className="flex items-center justify-center gap-2 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
                  <Shield size={18} className="text-red-400" />
                  <p className="text-sm text-red-300 font-medium">
                    Commenting disabled due to multiple toxic comments
                  </p>
                  <button
                    onClick={resetWarnings}
                    className="text-xs text-red-200 hover:text-white underline ml-2"
                  >
                    Learn more
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this event…"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !newComment.trim() || commentDisabled}
                    className="inline-flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-all"
                  >
                    <Send size={16} />
                    {loading ? "Posting…" : "Post"}
                  </button>
                </form>
              )}
              {commentWarningCount > 0 && !commentDisabled && (
                <div className="mt-2 flex items-center gap-2 text-xs text-amber-400">
                  <AlertTriangle size={14} />
                  <span>
                    You have {commentWarningCount}/3 warnings for toxic comments
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Analytics & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details Card */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <h3 className="text-lg font-semibold text-white mb-4">
              Event Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-750 rounded-lg">
                <div className="p-2 bg-blue-900/30 rounded-lg">
                  <Calendar size={20} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Date</div>
                  <div className="text-sm font-medium text-white">
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-750 rounded-lg">
                <div className="p-2 bg-purple-900/30 rounded-lg">
                  <Clock size={20} className="text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Time</div>
                  <div className="text-sm font-medium text-white">
                    {event.startTime} - {event.endTime}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-750 rounded-lg">
                <div className="p-2 bg-green-900/30 rounded-lg">
                  <Map size={20} className="text-green-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Location</div>
                  <div className="text-sm font-medium text-white">
                    {event.location}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-750 rounded-lg">
                <div className="p-2 bg-yellow-900/30 rounded-lg">
                  <Tag size={20} className="text-yellow-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Category</div>
                  <div className="text-sm font-medium text-white capitalize">
                    {event.category}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment Analytics Card */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">
                Sentiment Analytics
              </h3>
              <div className="flex bg-gray-700 p-1 rounded-lg">
                <button
                  onClick={() => setActiveChart("pie")}
                  className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-medium transition ${
                    activeChart === "pie"
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <PieChartIcon size={14} />
                  Pie
                </button>
                <button
                  onClick={() => setActiveChart("bar")}
                  className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-medium transition ${
                    activeChart === "bar"
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <BarChart3 size={14} />
                  Bar
                </button>
                <button
                  onClick={() => setActiveChart("line")}
                  className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-medium transition ${
                    activeChart === "line"
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <TrendingUp size={14} />
                  Trend
                </button>
                <button
                  onClick={() => setActiveChart("scatter")}
                  className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-medium transition ${
                    activeChart === "scatter"
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Activity size={14} />
                  Toxicity
                </button>
              </div>
            </div>

            {/* Charts */}
            <div className="h-64 mb-5">
              {activeChart === "pie" && (
                <div className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} comments`, name]}
                      />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{
                          paddingTop: 10,
                          fontSize: 12,
                          color: "#fff",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeChart === "bar" && (
                <div className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={toxicCommentsData}
                      margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="2 2" stroke="#4B5563" />
                      <XAxis dataKey="name" fontSize={12} stroke="#9CA3AF" />
                      <YAxis
                        fontSize={12}
                        allowDecimals={false}
                        stroke="#9CA3AF"
                      />
                      <Tooltip
                        formatter={(value) => [`${value} comments`, "Count"]}
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "6px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, color: "#fff" }} />
                      <Bar
                        dataKey="value"
                        name="Comments"
                        fill="#6366F1"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeChart === "line" && (
                <div className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sentimentOverTime}
                      margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="2 2" stroke="#4B5563" />
                      <XAxis dataKey="date" fontSize={12} stroke="#9CA3AF" />
                      <YAxis domain={[-1, 1]} fontSize={12} stroke="#9CA3AF" />
                      <Tooltip
                        formatter={(value) => [
                          Number(value).toFixed(2),
                          "Sentiment Score",
                        ]}
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "6px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, color: "#fff" }} />
                      <Line
                        type="monotone"
                        dataKey="sentiment"
                        stroke="#6366F1"
                        activeDot={{ r: 4 }}
                        name="Sentiment Score"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeChart === "scatter" && (
                <div className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="2 2" stroke="#4B5563" />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name="Sentiment Score"
                        domain={[-1, 1]}
                        fontSize={12}
                        stroke="#9CA3AF"
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="Toxicity"
                        tick={false}
                        domain={[-0.5, 1.5]}
                        label={{
                          value: "Toxicity",
                          angle: -90,
                          position: "insideLeft",
                          fontSize: 12,
                        }}
                      />
                      <ZAxis
                        type="number"
                        dataKey="z"
                        range={[50, 300]}
                        name="Comment Length"
                      />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        formatter={(value, name, props) => {
                          if (name === "x")
                            return [
                              Number(value).toFixed(2),
                              "Sentiment Score",
                            ];
                          if (name === "y")
                            return [
                              value === 1 ? "Toxic" : "Non-Toxic",
                              "Toxicity",
                            ];
                          if (name === "z") return [value, "Length"];
                          return [value, name];
                        }}
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "6px",
                        }}
                      />
                      <Scatter
                        name="Comments"
                        data={toxicityScatterData}
                        fill="#8884d8"
                        shape={(props) => {
                          const { cx, cy, payload } = props;
                          return (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={6}
                              fill={payload.toxic ? "#EF4444" : "#10B981"}
                              stroke={payload.toxic ? "#DC2626" : "#059669"}
                              strokeWidth={1}
                            />
                          );
                        }}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Sentiment Stats */}
            <div className="grid grid-cols-3 gap-3">
              {sentimentPercentages.map((item) => (
                <div
                  key={item.name}
                  className="bg-gray-750 p-3 rounded-lg flex flex-col items-center border border-gray-700"
                >
                  <div
                    className="w-3 h-3 rounded-full mb-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="text-xs font-medium text-gray-400">
                    {item.name}
                  </div>
                  <div
                    className="text-lg font-bold"
                    style={{ color: item.color }}
                  >
                    {item.percentage}%
                  </div>
                  <div className="text-xs text-gray-500">
                    ({item.value} comments)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Toxicity Overview Card - Only show if there are comments */}
          {comments.length > 0 && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-4">
                Toxicity Overview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-900/20 p-4 rounded-lg border border-red-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={18} className="text-red-400" />
                    <h4 className="text-sm font-semibold text-white">
                      Toxic Comments
                    </h4>
                  </div>
                  <div className="text-2xl font-bold text-red-400">
                    {toxicCommentsData[0].value}
                  </div>
                  <div className="text-xs text-red-300">
                    {totalComments > 0
                      ? `${(
                          (toxicCommentsData[0].value / totalComments) *
                          100
                        ).toFixed(1)}% of all comments`
                      : "No comments yet"}
                  </div>
                </div>
                <div className="bg-green-900/20 p-4 rounded-lg border border-green-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={18} className="text-green-400" />
                    <h4 className="text-sm font-semibold text-white">
                      Clean Comments
                    </h4>
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    {toxicCommentsData[1].value}
                  </div>
                  <div className="text-xs text-green-300">
                    {totalComments > 0
                      ? `${(
                          (toxicCommentsData[1].value / totalComments) *
                          100
                        ).toFixed(1)}% of all comments`
                      : "No comments yet"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

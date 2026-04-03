// import { useEffect, useState, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { NavLink } from "react-router-dom";
// import {
//   Calendar,
//   Clock,
//   MapPin,
//   Users,
//   Eye,
//   Edit2,
//   Trash2,
//   Search,
//   CheckCircle,
//   X,
//   Image as ImageIcon,
//   Filter,
//   BarChart3,
//   Plus,
//   IndianRupee,
//   ChevronDown,
//   Download,
//   Share,
//   MoreVertical,
//   UserCheck,
//   UserX,
//   DollarSign,
//   QrCode,
//   TrendingUp,
// } from "lucide-react";
// import {
//   getEventsToOrganizeAsync,
//   deleteOrganizedEventAsync,
//   editOrganizedEventAsync,
//   getMyEventsAsync,
//   resetEventState,
// } from "../../redux/slices/eventSlice";
// import { toast } from "sonner";
// import "react-toastify/dist/ReactToastify.css";
// import Modal from "react-modal";
// import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import axios from "axios";

// // Recharts imports
// import {
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   AreaChart,
//   Area,
// } from "recharts";

// Modal.setAppElement("#root");

// // Location Picker Component
// function LocationPicker({ onLocationSelect, initialPosition }) {
//   const [position, setPosition] = useState(
//     initialPosition || [27.7172, 85.324]
//   );

//   useMapEvents({
//     click(e) {
//       const { lat, lng } = e.latlng;
//       setPosition([lat, lng]);

//       fetch(
//         `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
//       )
//         .then((res) => res.json())
//         .then((data) => {
//           onLocationSelect(data.display_name, { lat, lng });
//         });
//     },
//   });

//   return position ? <Marker position={position} /> : null;
// }

// // Stats Modal Component
// function EventStatsModal({ isOpen, onClose, event }) {
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [attendees, setAttendees] = useState([]);
//   const [activeTab, setActiveTab] = useState("overview");
//   const [revenueData, setRevenueData] = useState([]);
//   const [eventDetails, setEventDetails] = useState(null);

//   useEffect(() => {
//     if (isOpen && event?._id) {
//       fetchEventStats();
//     }
//   }, [isOpen, event?._id]);

//   const fetchEventStats = async () => {
//     if (!event?._id) return;

//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");

//       const response = await axios.get(
//         `http://localhost:5000/api/v1/event/organizer-stats/${event._id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.data.success) {
//         setStats(response.data.stats);
//         setAttendees(response.data.attendees || []);
//         setEventDetails(response.data.eventDetails);

//         // Generate revenue trend data based on actual purchase data
//         if (response.data.attendees && response.data.attendees.length > 0) {
//           generateRevenueTrendData(
//             response.data.attendees,
//             response.data.eventDetails
//           );
//         }
//       } else {
//         throw new Error(response.data.message || "Failed to fetch stats");
//       }
//     } catch (error) {
//       console.error("Error fetching event stats:", error);

//       // Set default empty stats
//       setStats({
//         paidTickets: 0,
//         pendingTickets: 0,
//         checkedInUsers: 0,
//         attendedUsers: 0,
//         totalTickets: 0,
//         revenue: 0,
//         totalAttendees: 0,
//         seatStats: {
//           front: { booked: 0, revenue: 0 },
//           middle: { booked: 0, revenue: 0 },
//           last: { booked: 0, revenue: 0 },
//         },
//       });
//       setAttendees([]);
//       setRevenueData([]);
//       setEventDetails(event);

//       toast.error("Failed to load event statistics", {
//         description: "Please try again later",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Generate revenue trend data based on actual purchase dates and seat prices
//   const generateRevenueTrendData = (attendeesList, eventDetails) => {
//     if (!attendeesList || attendeesList.length === 0) {
//       setRevenueData([]);
//       return;
//     }

//     // Group purchases by date
//     const purchasesByDate = {};

//     attendeesList.forEach((attendee) => {
//       if (attendee.paymentStatus === "completed" && attendee.purchaseDate) {
//         const purchaseDate = new Date(attendee.purchaseDate);
//         const dateKey = purchaseDate.toISOString().split("T")[0];

//         if (!purchasesByDate[dateKey]) {
//           purchasesByDate[dateKey] = {
//             date: dateKey,
//             revenue: 0,
//             tickets: 0,
//             displayDate: purchaseDate.toLocaleDateString("en-US", {
//               month: "short",
//               day: "numeric",
//             }),
//           };
//         }

//         // Calculate revenue based on actual finalPrice or seat price
//         const ticketRevenue =
//           attendee.finalPrice ||
//           attendee.ticketQuantity *
//             getSeatPrice(eventDetails, attendee.seatType);

//         purchasesByDate[dateKey].revenue += ticketRevenue;
//         purchasesByDate[dateKey].tickets += attendee.ticketQuantity || 1;
//       }
//     });

//     // Convert to array and sort by date
//     const dailyData = Object.values(purchasesByDate).sort(
//       (a, b) => new Date(a.date) - new Date(b.date)
//     );

//     // Calculate cumulative revenue
//     let cumulativeRevenue = 0;
//     const cumulativeData = dailyData.map((day) => {
//       cumulativeRevenue += day.revenue;
//       return {
//         ...day,
//         cumulativeRevenue,
//         day: day.displayDate,
//       };
//     });

//     setRevenueData(cumulativeData);
//   };

//   // Helper function to get seat price
//   const getSeatPrice = (eventDetails, seatType) => {
//     if (!eventDetails?.seatConfig || !seatType)
//       return eventDetails?.basePrice || 0;
//     return (
//       eventDetails.seatConfig[seatType]?.price || eventDetails.basePrice || 0
//     );
//   };

//   // Chart Data Preparation - UPDATED for new stats structure
//   const paymentDistributionData = [
//     { name: "Paid Tickets", value: stats?.paidTickets || 0, color: "#10b981" },
//     {
//       name: "Pending Payments",
//       value: stats?.pendingTickets || 0,
//       color: "#f59e0b",
//     },
//   ];

//   const attendanceData = [
//     { name: "Checked In", value: stats?.checkedInUsers || 0, color: "#8b5cf6" },
//     {
//       name: "Not Checked In",
//       value: (stats?.paidTickets || 0) - (stats?.checkedInUsers || 0),
//       color: "#d1d5db",
//     },
//   ];

//   const ticketSalesData = [
//     { category: "Total", tickets: stats?.totalTickets || 0 },
//     { category: "Paid", tickets: stats?.paidTickets || 0 },
//     { category: "Pending", tickets: stats?.pendingTickets || 0 },
//     { category: "Checked In", tickets: stats?.checkedInUsers || 0 },
//   ];

//   // Seat distribution data for pie chart
//   const seatDistributionData = stats?.seatStats
//     ? [
//         {
//           name: "Front Row",
//           value: stats.seatStats.front.booked || 0,
//           color: "#3b82f6",
//         },
//         {
//           name: "Middle Row",
//           value: stats.seatStats.middle.booked || 0,
//           color: "#10b981",
//         },
//         {
//           name: "Last Row",
//           value: stats.seatStats.last.booked || 0,
//           color: "#f59e0b",
//         },
//       ]
//     : [];

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const formatTime = (dateString) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const getPaymentStatusColor = (status) => {
//     switch (status) {
//       case "completed":
//         return "bg-green-100 text-green-800";
//       case "pending":
//         return "bg-yellow-100 text-yellow-800";
//       case "failed":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getAttendanceStatusColor = (status) => {
//     switch (status) {
//       case "attended":
//         return "bg-green-100 text-green-800";
//       case "checked-in":
//         return "bg-blue-100 text-blue-800";
//       case "not_attended":
//         return "bg-gray-100 text-gray-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   // Custom Tooltip for charts
//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
//           <p className="font-medium text-gray-900">{label}</p>
//           {payload.map((entry, index) => (
//             <p key={index} style={{ color: entry.color }}>
//               {entry.name}:{" "}
//               {entry.name.includes("Revenue") ? `₹${entry.value}` : entry.value}
//             </p>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };

//   if (!event) return null;

//   return (
//     <Modal
//       isOpen={isOpen}
//       onRequestClose={onClose}
//       style={{
//         content: {
//           top: "50%",
//           left: "50%",
//           right: "auto",
//           bottom: "auto",
//           transform: "translate(-50%, -50%)",
//           maxWidth: "1200px",
//           width: "95%",
//           maxHeight: "90vh",
//           padding: "0",
//           border: "none",
//           borderRadius: "16px",
//           overflow: "hidden",
//           backgroundColor: "rgba(255, 255, 255, 0.95)",
//           backdropFilter: "blur(12px)",
//           boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
//         },
//         overlay: {
//           backgroundColor: "rgba(0, 0, 0, 0.6)",
//           backdropFilter: "blur(4px)",
//           zIndex: 1000,
//         },
//       }}
//       contentLabel="Event Statistics"
//     >
//       <div className="relative">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h2 className="text-2xl font-bold text-white">Event Analytics</h2>
//               <p className="text-indigo-100 mt-1">{event.title}</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-white hover:text-gray-200 transition-colors"
//             >
//               <X size={24} />
//             </button>
//           </div>
//         </div>

//         {/* Tab Navigation */}
//         <div className="border-b border-gray-200">
//           <div className="px-6 flex space-x-8">
//             <button
//               onClick={() => setActiveTab("overview")}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                 activeTab === "overview"
//                   ? "border-indigo-500 text-indigo-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//             >
//               Overview
//             </button>
//             <button
//               onClick={() => setActiveTab("charts")}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                 activeTab === "charts"
//                   ? "border-indigo-500 text-indigo-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//             >
//               Charts & Analytics
//             </button>
//             <button
//               onClick={() => setActiveTab("attendees")}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                 activeTab === "attendees"
//                   ? "border-indigo-500 text-indigo-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//             >
//               Attendee Details
//             </button>
//           </div>
//         </div>

//         <div
//           className="p-6 space-y-6 overflow-y-auto"
//           style={{ maxHeight: "calc(90vh - 120px)" }}
//         >
//           {loading ? (
//             <div className="flex justify-center items-center h-40">
//               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
//               <span className="ml-3 text-gray-600">Loading statistics...</span>
//             </div>
//           ) : (
//             <>
//               {activeTab === "overview" && (
//                 <div className="space-y-6">
//                   {/* Stats Overview - UPDATED for new stats structure */}
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className="text-sm font-medium text-gray-600">
//                             Total Tickets
//                           </p>
//                           <p className="text-2xl font-bold text-gray-900 mt-1">
//                             {stats?.totalTickets || 0}
//                           </p>
//                         </div>
//                         <div className="p-2 bg-blue-100 rounded-lg">
//                           <QrCode className="w-5 h-5 text-blue-600" />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className="text-sm font-medium text-gray-600">
//                             Paid Tickets
//                           </p>
//                           <p className="text-2xl font-bold text-green-600 mt-1">
//                             {stats?.paidTickets || 0}
//                           </p>
//                         </div>
//                         <div className="p-2 bg-green-100 rounded-lg">
//                           <UserCheck className="w-5 h-5 text-green-600" />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className="text-sm font-medium text-gray-600">
//                             Pending Payments
//                           </p>
//                           <p className="text-2xl font-bold text-yellow-600 mt-1">
//                             {stats?.pendingTickets || 0}
//                           </p>
//                         </div>
//                         <div className="p-2 bg-yellow-100 rounded-lg">
//                           <UserX className="w-5 h-5 text-yellow-600" />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className="text-sm font-medium text-gray-600">
//                             Checked In
//                           </p>
//                           <p className="text-2xl font-bold text-purple-600 mt-1">
//                             {stats?.checkedInUsers || 0}
//                           </p>
//                         </div>
//                         <div className="p-2 bg-purple-100 rounded-lg">
//                           <TrendingUp className="w-5 h-5 text-purple-600" />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Revenue Card - UPDATED to use actual revenue from stats */}
//                   <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-5 text-white">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm font-medium text-green-100">
//                           Total Revenue
//                         </p>
//                         <p className="text-3xl font-bold mt-1">
//                           ₹{stats?.revenue || 0}
//                         </p>
//                         <p className="text-green-100 text-sm mt-1">
//                           From {stats?.paidTickets || 0} paid tickets
//                         </p>
//                       </div>
//                       <div className="p-3 bg-white/20 rounded-lg">
//                         <DollarSign className="w-8 h-8" />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Seat Statistics - NEW SECTION */}
//                   {stats?.seatStats && (
//                     <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                         Seat Distribution
//                       </h3>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div className="text-center p-3 bg-blue-50 rounded-lg">
//                           <p className="text-sm font-medium text-blue-700">
//                             Front Row
//                           </p>
//                           <p className="text-xl font-bold text-blue-900">
//                             {stats.seatStats.front.booked || 0} booked
//                           </p>
//                           <p className="text-sm text-blue-600">
//                             ₹{stats.seatStats.front.revenue || 0} revenue
//                           </p>
//                         </div>
//                         <div className="text-center p-3 bg-green-50 rounded-lg">
//                           <p className="text-sm font-medium text-green-700">
//                             Middle Row
//                           </p>
//                           <p className="text-xl font-bold text-green-900">
//                             {stats.seatStats.middle.booked || 0} booked
//                           </p>
//                           <p className="text-sm text-green-600">
//                             ₹{stats.seatStats.middle.revenue || 0} revenue
//                           </p>
//                         </div>
//                         <div className="text-center p-3 bg-amber-50 rounded-lg">
//                           <p className="text-sm font-medium text-amber-700">
//                             Last Row
//                           </p>
//                           <p className="text-xl font-bold text-amber-900">
//                             {stats.seatStats.last.booked || 0} booked
//                           </p>
//                           <p className="text-sm text-amber-600">
//                             ₹{stats.seatStats.last.revenue || 0} revenue
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Progress Bars - UPDATED for new stats structure */}
//                   <div className="space-y-4">
//                     <div>
//                       <div className="flex justify-between text-sm text-gray-600 mb-2">
//                         <span>Payment Completion</span>
//                         <span>
//                           {stats?.paidTickets || 0}/{stats?.totalTickets || 0}
//                         </span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div
//                           className="bg-green-500 h-2 rounded-full transition-all duration-500"
//                           style={{
//                             width: stats?.totalTickets
//                               ? `${
//                                   (stats.paidTickets / stats.totalTickets) * 100
//                                 }%`
//                               : "0%",
//                           }}
//                         ></div>
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex justify-between text-sm text-gray-600 mb-2">
//                         <span>Check-in Rate</span>
//                         <span>
//                           {stats?.checkedInUsers || 0}/{stats?.paidTickets || 0}
//                         </span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div
//                           className="bg-purple-500 h-2 rounded-full transition-all duration-500"
//                           style={{
//                             width: stats?.paidTickets
//                               ? `${
//                                   (stats.checkedInUsers / stats.paidTickets) *
//                                   100
//                                 }%`
//                               : "0%",
//                           }}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Quick Charts Preview */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                         Payment Distribution
//                       </h3>
//                       <ResponsiveContainer width="100%" height={200}>
//                         <PieChart>
//                           <Pie
//                             data={paymentDistributionData}
//                             cx="50%"
//                             cy="50%"
//                             labelLine={false}
//                             label={({ name, percent }) =>
//                               `${name} (${(percent * 100).toFixed(0)}%)`
//                             }
//                             outerRadius={80}
//                             fill="#8884d8"
//                             dataKey="value"
//                           >
//                             {paymentDistributionData.map((entry, index) => (
//                               <Cell key={`cell-${index}`} fill={entry.color} />
//                             ))}
//                           </Pie>
//                           <Tooltip />
//                         </PieChart>
//                       </ResponsiveContainer>
//                     </div>

//                     <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                         Revenue Trend
//                       </h3>
//                       <ResponsiveContainer width="100%" height={200}>
//                         {revenueData.length > 0 ? (
//                           <AreaChart data={revenueData}>
//                             <CartesianGrid strokeDasharray="3 3" />
//                             <XAxis dataKey="day" />
//                             <YAxis />
//                             <Tooltip />
//                             <Area
//                               type="monotone"
//                               dataKey="cumulativeRevenue"
//                               stroke="#10b981"
//                               fill="#10b981"
//                               fillOpacity={0.3}
//                               name="Revenue (₹)"
//                             />
//                           </AreaChart>
//                         ) : (
//                           <div className="flex items-center justify-center h-full text-gray-500">
//                             No revenue data available
//                           </div>
//                         )}
//                       </ResponsiveContainer>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {activeTab === "charts" && (
//                 <div className="space-y-6">
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                     {/* Payment Distribution Pie Chart */}
//                     <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                         Payment Distribution
//                       </h3>
//                       <ResponsiveContainer width="100%" height={300}>
//                         <PieChart>
//                           <Pie
//                             data={paymentDistributionData}
//                             cx="50%"
//                             cy="50%"
//                             labelLine={false}
//                             label={({ name, percent }) =>
//                               `${name} (${(percent * 100).toFixed(0)}%)`
//                             }
//                             outerRadius={100}
//                             fill="#8884d8"
//                             dataKey="value"
//                           >
//                             {paymentDistributionData.map((entry, index) => (
//                               <Cell key={`cell-${index}`} fill={entry.color} />
//                             ))}
//                           </Pie>
//                           <Tooltip />
//                           <Legend />
//                         </PieChart>
//                       </ResponsiveContainer>
//                     </div>

//                     {/* Seat Distribution Pie Chart - NEW */}
//                     <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                         Seat Distribution
//                       </h3>
//                       <ResponsiveContainer width="100%" height={300}>
//                         {seatDistributionData.length > 0 ? (
//                           <PieChart>
//                             <Pie
//                               data={seatDistributionData}
//                               cx="50%"
//                               cy="50%"
//                               labelLine={false}
//                               label={({ name, percent }) =>
//                                 `${name} (${(percent * 100).toFixed(0)}%)`
//                               }
//                               outerRadius={100}
//                               fill="#8884d8"
//                               dataKey="value"
//                             >
//                               {seatDistributionData.map((entry, index) => (
//                                 <Cell
//                                   key={`cell-${index}`}
//                                   fill={entry.color}
//                                 />
//                               ))}
//                             </Pie>
//                             <Tooltip />
//                             <Legend />
//                           </PieChart>
//                         ) : (
//                           <div className="flex items-center justify-center h-full text-gray-500">
//                             No seat data available
//                           </div>
//                         )}
//                       </ResponsiveContainer>
//                     </div>
//                   </div>

//                   {/* Real Revenue Trend Area Chart */}
//                   {revenueData.length > 0 && (
//                     <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                         Revenue Trend (Real Data)
//                       </h3>
//                       <ResponsiveContainer width="100%" height={300}>
//                         <AreaChart data={revenueData}>
//                           <CartesianGrid strokeDasharray="3 3" />
//                           <XAxis dataKey="day" />
//                           <YAxis />
//                           <Tooltip
//                             formatter={(value) => [`₹${value}`, "Revenue"]}
//                           />
//                           <Legend />
//                           <Area
//                             type="monotone"
//                             dataKey="cumulativeRevenue"
//                             stroke="#10b981"
//                             fill="#10b981"
//                             fillOpacity={0.3}
//                             name="Cumulative Revenue (₹)"
//                           />
//                           <Line
//                             type="monotone"
//                             dataKey="revenue"
//                             stroke="#3b82f6"
//                             name="Daily Revenue (₹)"
//                             strokeWidth={2}
//                           />
//                         </AreaChart>
//                       </ResponsiveContainer>
//                       <p className="text-sm text-gray-500 mt-2">
//                         Based on actual ticket purchases over time
//                       </p>
//                     </div>
//                   )}

//                   {/* Ticket Sales Bar Chart */}
//                   <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
//                     <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                       Ticket Sales Breakdown
//                     </h3>
//                     <ResponsiveContainer width="100%" height={300}>
//                       <BarChart data={ticketSalesData}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="category" />
//                         <YAxis />
//                         <Tooltip />
//                         <Legend />
//                         <Bar
//                           dataKey="tickets"
//                           name="Number of Tickets"
//                           fill="#3b82f6"
//                         />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </div>
//               )}

//               {activeTab === "attendees" && (
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                     Attendee Details ({attendees.length})
//                   </h3>
//                   {attendees.length === 0 ? (
//                     <div className="text-center py-8 text-gray-500">
//                       <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
//                       <p>No attendees yet</p>
//                       <p className="text-sm mt-1">
//                         Attendees will appear here once they purchase tickets
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="space-y-3 max-h-96 overflow-y-auto">
//                       {attendees.map((attendee, index) => (
//                         <div
//                           key={index}
//                           className="bg-white border border-gray-200 rounded-lg p-4"
//                         >
//                           <div className="flex justify-between items-start">
//                             <div className="flex-1">
//                               <div className="flex items-center gap-3 mb-2">
//                                 <h4 className="font-medium text-gray-900">
//                                   {attendee.userName || "Unknown User"}
//                                 </h4>
//                                 <span className="text-sm text-gray-500">
//                                   {attendee.userEmail || "No email"}
//                                 </span>
//                               </div>
//                               <div className="flex flex-wrap gap-2 text-xs">
//                                 <span
//                                   className={`px-2 py-1 rounded-full ${getPaymentStatusColor(
//                                     attendee.paymentStatus
//                                   )}`}
//                                 >
//                                   Payment: {attendee.paymentStatus || "unknown"}
//                                 </span>
//                                 <span
//                                   className={`px-2 py-1 rounded-full ${getAttendanceStatusColor(
//                                     attendee.attendanceStatus
//                                   )}`}
//                                 >
//                                   Attendance:{" "}
//                                   {attendee.attendanceStatus || "not_attended"}
//                                 </span>
//                                 <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
//                                   Tickets: {attendee.ticketQuantity || 1}
//                                 </span>
//                                 {attendee.seatType && (
//                                   <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
//                                     Seat: {attendee.seatType} -{" "}
//                                     {attendee.seatNumber}
//                                   </span>
//                                 )}
//                                 {attendee.finalPrice > 0 && (
//                                   <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
//                                     Paid: ₹{attendee.finalPrice}
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                             <div className="text-right text-xs text-gray-500">
//                               <div>
//                                 Purchased: {formatDate(attendee.purchaseDate)}
//                               </div>
//                               {attendee.attendanceTime && (
//                                 <div>
//                                   Checked in:{" "}
//                                   {formatTime(attendee.attendanceTime)}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                           {attendee.ticketIds &&
//                             attendee.ticketIds.length > 0 && (
//                               <div className="mt-2 text-xs text-gray-600">
//                                 <span className="font-medium">
//                                   Ticket IDs:{" "}
//                                 </span>
//                                 {attendee.ticketIds.join(", ")}
//                               </div>
//                             )}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Event Details Summary - UPDATED for seat configuration */}
//               <div className="bg-gray-50 rounded-xl p-4">
//                 <h4 className="font-medium text-gray-900 mb-3">
//                   Event Information
//                 </h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                   <div className="flex items-center text-gray-600">
//                     <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
//                     <span>{formatDate(eventDetails?.date || event.date)}</span>
//                   </div>
//                   <div className="flex items-center text-gray-600">
//                     <Clock className="w-4 h-4 mr-2 text-blue-500" />
//                     <span>
//                       {eventDetails?.startTime || event.startTime} -{" "}
//                       {eventDetails?.endTime || event.endTime}
//                     </span>
//                   </div>
//                   <div className="flex items-center text-gray-600">
//                     <MapPin className="w-4 h-4 mr-2 text-green-500" />
//                     <span className="truncate">
//                       {eventDetails?.location || event.location}
//                     </span>
//                   </div>
//                   <div className="flex items-center text-gray-600">
//                     <IndianRupee className="w-4 h-4 mr-2 text-amber-500" />
//                     <span>
//                       Base: ₹
//                       {eventDetails?.basePrice || event.basePrice || "Free"}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Seat Configuration - NEW */}
//                 {eventDetails?.seatConfig && (
//                   <div className="mt-4 pt-4 border-t border-gray-200">
//                     <h5 className="font-medium text-gray-900 mb-2">
//                       Seat Configuration
//                     </h5>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
//                       <div className="bg-blue-50 p-2 rounded">
//                         <span className="font-medium text-blue-700">
//                           Front Row:
//                         </span>
//                         <span className="text-blue-600 ml-1">
//                           {eventDetails.seatConfig.front?.booked || 0}/
//                           {eventDetails.seatConfig.front?.count || 0} booked (₹
//                           {eventDetails.seatConfig.front?.price || 0})
//                         </span>
//                       </div>
//                       <div className="bg-green-50 p-2 rounded">
//                         <span className="font-medium text-green-700">
//                           Middle Row:
//                         </span>
//                         <span className="text-green-600 ml-1">
//                           {eventDetails.seatConfig.middle?.booked || 0}/
//                           {eventDetails.seatConfig.middle?.count || 0} booked (₹
//                           {eventDetails.seatConfig.middle?.price || 0})
//                         </span>
//                       </div>
//                       <div className="bg-amber-50 p-2 rounded">
//                         <span className="font-medium text-amber-700">
//                           Last Row:
//                         </span>
//                         <span className="text-amber-600 ml-1">
//                           {eventDetails.seatConfig.last?.booked || 0}/
//                           {eventDetails.seatConfig.last?.count || 0} booked (₹
//                           {eventDetails.seatConfig.last?.price || 0})
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </Modal>
//   );
// }

// // ... Rest of your existing component (OrganizeEvents function) remains exactly the same ...
// // The main OrganizeEvents function below remains unchanged from your original code

// export function OrganizeEvents() {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const { eventToOrganize, loading, error, message, success } = useSelector(
//     (state) => state.events
//   );

//   useEffect(() => {
//     if (user?._id) {
//       dispatch(getMyEventsAsync());
//     }
//   }, [dispatch, user?._id]);

//   useEffect(() => {
//     if (success && message) {
//       toast.success(message);
//       dispatch(resetEventState());
//     }
//     if (error) {
//       toast.error(error);
//       dispatch(resetEventState());
//     }
//   }, [success, message, error, dispatch]);

//   const organizedEvents =
//     Array.isArray(eventToOrganize) && eventToOrganize.length > 0
//       ? Array.isArray(eventToOrganize[0])
//         ? eventToOrganize[0]
//         : eventToOrganize
//       : [];

//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [categoryFilter, setCategoryFilter] = useState("all");
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
//   const [currentEvent, setCurrentEvent] = useState(null);
//   const [editFormData, setEditFormData] = useState({});
//   const [viewMode, setViewMode] = useState("grid");
//   const [venue, setVenue] = useState("");
//   const [coordinates, setCoordinates] = useState(null);
//   const [expandedFilters, setExpandedFilters] = useState(false);

//   const customStyles = {
//     content: {
//       top: "50%",
//       left: "50%",
//       right: "auto",
//       bottom: "auto",
//       transform: "translate(-50%, -50%)",
//       maxWidth: "600px",
//       width: "90%",
//       padding: "0",
//       border: "none",
//       borderRadius: "16px",
//       overflow: "hidden",
//       backgroundColor: "rgba(255, 255, 255, 0.95)",
//       backdropFilter: "blur(12px)",
//       boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
//     },
//     overlay: {
//       backgroundColor: "rgba(0, 0, 0, 0.6)",
//       backdropFilter: "blur(4px)",
//       zIndex: 1000,
//     },
//   };

//   const filteredEvents = useMemo(() => {
//     return organizedEvents.filter((event) => {
//       const title = event?.title || "";
//       const description = event?.description || "";
//       const location = event?.location || "";
//       const status = event?.status || "";
//       const category = event?.category || "";

//       const matchesSearch =
//         title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         location.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesStatus = statusFilter === "all" || status === statusFilter;
//       const matchesCategory =
//         categoryFilter === "all" || category === categoryFilter;

//       return matchesSearch && matchesStatus && matchesCategory;
//     });
//   }, [organizedEvents, searchTerm, statusFilter, categoryFilter]);

//   const uniqueCategories = [
//     ...new Set(
//       organizedEvents
//         .map((e) => e?.category || "uncategorized")
//         .filter((category) => category)
//     ),
//   ];

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "approved":
//         return "bg-green-100 text-green-800 border-green-200";
//       case "pending":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       case "rejected":
//         return "bg-red-100 text-red-800 border-red-200";
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   const getCategoryColor = (category) => {
//     const colors = {
//       technology: "bg-blue-100 text-blue-800 border-blue-200",
//       music: "bg-purple-100 text-purple-800 border-purple-200",
//       food: "bg-amber-100 text-amber-800 border-amber-200",
//       arts: "bg-pink-100 text-pink-800 border-pink-200",
//       business: "bg-indigo-100 text-indigo-800 border-indigo-200",
//       wellness: "bg-emerald-100 text-emerald-800 border-emerald-200",
//       uncategorized: "bg-gray-100 text-gray-800 border-gray-200",
//     };
//     return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "No date";
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return "";
//     const [hours, minutes] = timeString.split(":");
//     const h = parseInt(hours);
//     const period = h >= 12 ? "PM" : "AM";
//     const hour12 = h % 12 || 12;
//     return `${hour12}:${minutes} ${period}`;
//   };

//   const handleEditClick = (event) => {
//     setCurrentEvent(event);
//     setEditFormData({
//       title: event.title || "",
//       description: event.description || "",
//       date: event.date ? new Date(event.date).toISOString().slice(0, 10) : "",
//       startTime: event.startTime || "",
//       endTime: event.endTime || "",
//       location: event.location || "",
//       category: event.category || "",
//       price: event.price || 0,
//       coordinates: event.coordinates || null,
//     });

//     setVenue(event.location || "");
//     setCoordinates(event.coordinates || null);
//     setIsEditModalOpen(true);
//   };

//   const handleStatsClick = (event) => {
//     setCurrentEvent(event);
//     setIsStatsModalOpen(true);
//   };

//   const handleEditChange = (e) => {
//     setEditFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleLocationSelect = (location, coords) => {
//     setVenue(location);
//     setCoordinates(coords);
//     setEditFormData((prev) => ({
//       ...prev,
//       location: location,
//       coordinates: coords,
//     }));
//   };

//   const handleEditSubmit = async () => {
//     try {
//       await dispatch(
//         editOrganizedEventAsync({
//           eventId: currentEvent._id,
//           updatedData: editFormData,
//         })
//       ).unwrap();

//       setIsEditModalOpen(false);
//       dispatch(getMyEventsAsync());
//     } catch (error) {
//       console.error("Error updating event:", error);
//     }
//   };

//   const handleDeleteClick = (event) => {
//     setCurrentEvent(event);
//     setIsDeleteModalOpen(true);
//   };

//   const handleDeleteConfirm = async () => {
//     try {
//       await dispatch(deleteOrganizedEventAsync(currentEvent._id)).unwrap();
//       setIsDeleteModalOpen(false);
//       dispatch(getMyEventsAsync());
//     } catch (error) {
//       console.error("Error deleting event:", error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
//       {/* Edit Modal */}
//       <Modal
//         isOpen={isEditModalOpen}
//         onRequestClose={() => setIsEditModalOpen(false)}
//         style={customStyles}
//         contentLabel="Edit Event"
//       >
//         <div className="relative">
//           <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
//             <div className="flex justify-between items-center">
//               <h2 className="text-2xl font-bold text-white">Edit Event</h2>
//               <button
//                 onClick={() => setIsEditModalOpen(false)}
//                 className="text-white hover:text-gray-200 transition-colors"
//               >
//                 <X size={24} />
//               </button>
//             </div>
//           </div>

//           <div
//             className="p-6 space-y-6 overflow-y-auto"
//             style={{ maxHeight: "calc(90vh - 120px)" }}
//           >
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Title
//                 </label>
//                 <input
//                   type="text"
//                   name="title"
//                   value={editFormData.title}
//                   onChange={handleEditChange}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Description
//                 </label>
//                 <textarea
//                   name="description"
//                   value={editFormData.description}
//                   onChange={handleEditChange}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
//                   rows={3}
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Date
//                   </label>
//                   <input
//                     type="date"
//                     name="date"
//                     value={editFormData.date}
//                     onChange={handleEditChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Time
//                   </label>
//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <label className="block text-xs text-gray-500 mb-1">
//                         Start Time
//                       </label>
//                       <input
//                         type="time"
//                         name="startTime"
//                         value={editFormData.startTime}
//                         onChange={handleEditChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs text-gray-500 mb-1">
//                         End Time
//                       </label>
//                       <input
//                         type="time"
//                         name="endTime"
//                         value={editFormData.endTime}
//                         onChange={handleEditChange}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <MapPin className="inline h-4 w-4 mr-1" /> Location
//                 </label>

//                 <div
//                   className="mb-3 rounded-lg overflow-hidden"
//                   style={{ height: "200px" }}
//                 >
//                   <MapContainer
//                     center={coordinates || [27.7172, 85.324]}
//                     zoom={13}
//                     style={{ height: "100%", width: "100%" }}
//                   >
//                     <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                     <LocationPicker
//                       onLocationSelect={handleLocationSelect}
//                       initialPosition={coordinates}
//                     />
//                   </MapContainer>
//                 </div>

//                 <p className="text-sm text-gray-600 mb-2">
//                   📍 Selected Venue:{" "}
//                   {venue || "Click on the map to select location"}
//                 </p>

//                 <input
//                   type="text"
//                   name="location"
//                   value={editFormData.location}
//                   onChange={handleEditChange}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
//                   placeholder="Or enter location manually"
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Category
//                   </label>
//                   <select
//                     name="category"
//                     value={editFormData.category}
//                     onChange={handleEditChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
//                   >
//                     <option value="">Select category</option>
//                     {uniqueCategories.map((cat) => (
//                       <option key={cat} value={cat}>
//                         {(cat || "Uncategorized").charAt(0).toUpperCase() +
//                           (cat || "Uncategorized").slice(1)}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Price ($)
//                   </label>
//                   <input
//                     type="number"
//                     name="price"
//                     min="0"
//                     value={editFormData.price}
//                     onChange={handleEditChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-end space-x-4 pt-4">
//               <button
//                 onClick={() => setIsEditModalOpen(false)}
//                 className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleEditSubmit}
//                 className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
//               >
//                 Save Changes
//               </button>
//             </div>
//           </div>
//         </div>
//       </Modal>

//       {/* Stats Modal */}
//       <EventStatsModal
//         isOpen={isStatsModalOpen}
//         onClose={() => setIsStatsModalOpen(false)}
//         event={currentEvent}
//       />

//       {/* Delete Confirmation Modal */}
//       <Modal
//         isOpen={isDeleteModalOpen}
//         onRequestClose={() => setIsDeleteModalOpen(false)}
//         style={customStyles}
//         contentLabel="Delete Confirmation"
//       >
//         <div className="relative">
//           <div className="bg-gradient-to-r from-rose-600 to-red-600 p-6">
//             <div className="flex justify-between items-center">
//               <h2 className="text-2xl font-bold text-white">
//                 Confirm Deletion
//               </h2>
//               <button
//                 onClick={() => setIsDeleteModalOpen(false)}
//                 className="text-white hover:text-gray-200 transition-colors"
//               >
//                 <X size={24} />
//               </button>
//             </div>
//           </div>

//           <div className="p-6 space-y-6">
//             <div className="text-center">
//               <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
//                 <Trash2 className="h-6 w-6 text-red-600" />
//               </div>
//               <h3 className="text-lg font-medium text-gray-900 mb-2">
//                 Delete "{currentEvent?.title}"?
//               </h3>
//               <p className="text-sm text-gray-500">
//                 This action cannot be undone. All event data will be permanently
//                 removed.
//               </p>
//             </div>

//             <div className="flex justify-center space-x-4 pt-4">
//               <button
//                 onClick={() => setIsDeleteModalOpen(false)}
//                 className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDeleteConfirm}
//                 className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 rounded-lg text-white hover:from-rose-700 hover:to-red-700 transition-all shadow-md"
//               >
//                 Delete Event
//               </button>
//             </div>
//           </div>
//         </div>
//       </Modal>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto space-y-8">
//         {/* Header Section */}
//         <div className="text-center space-y-4 animate-fade-in">
//           <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//             My Events
//           </h1>
//           <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
//             Manage and track all your created events in one beautiful dashboard
//           </p>
//         </div>

//         {loading && (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
//           </div>
//         )}

//         {error && (
//           <div className="text-center text-red-600 font-semibold p-4 bg-red-50 rounded-xl">
//             Error: {error}
//           </div>
//         )}

//         {!loading && !error && (
//           <>
//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md">
//                     <Calendar className="w-5 h-5 text-white" />
//                   </div>
//                   <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
//                     {organizedEvents.length}
//                   </span>
//                 </div>
//                 <h3 className="text-base font-semibold text-slate-700">
//                   Total Events
//                 </h3>
//               </div>

//               <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg shadow-md">
//                     <CheckCircle className="w-5 h-5 text-white" />
//                   </div>
//                   <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
//                     {
//                       organizedEvents.filter((e) => e?.status === "approved")
//                         .length
//                     }
//                   </span>
//                 </div>
//                 <h3 className="text-base font-semibold text-slate-700">
//                   Approved
//                 </h3>
//               </div>

//               <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-md">
//                     <Clock className="w-5 h-5 text-white" />
//                   </div>
//                   <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
//                     {
//                       organizedEvents.filter((e) => e?.status === "pending")
//                         .length
//                     }
//                   </span>
//                 </div>
//                 <h3 className="text-base font-semibold text-slate-700">
//                   Pending
//                 </h3>
//               </div>

//               <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md">
//                     <Users className="w-5 h-5 text-white" />
//                   </div>
//                   <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//                     {organizedEvents.reduce(
//                       (total, event) => total + (event?.attendees?.length || 0),
//                       0
//                     )}
//                   </span>
//                 </div>
//                 <h3 className="text-base font-semibold text-slate-700">
//                   Attendees
//                 </h3>
//               </div>
//             </div>

//             {/* Search and Filter Section */}
//             <div className="bg-white/90 backdrop-blur-xl rounded-xl p-5 border border-white/20 shadow-lg">
//               <div className="flex flex-col lg:flex-row gap-4 items-center">
//                 <div className="relative flex-1">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
//                   <input
//                     type="text"
//                     placeholder="Search your events..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 text-black"
//                   />
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => setExpandedFilters(!expandedFilters)}
//                     className="flex items-center px-3 py-2 bg-white/80 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
//                   >
//                     <Filter className="w-4 h-4 mr-1" />
//                     Filters
//                     {expandedFilters ? (
//                       <ChevronDown className="w-4 h-4 ml-1" />
//                     ) : (
//                       <ChevronDown className="w-4 h-4 ml-1 transform rotate-180" />
//                     )}
//                   </button>
//                 </div>

//                 <div className="flex gap-1">
//                   <button
//                     onClick={() => setViewMode("grid")}
//                     className={`p-2 rounded-lg transition-all ${
//                       viewMode === "grid"
//                         ? "bg-indigo-100 text-indigo-600"
//                         : "bg-white/80 text-slate-500 hover:bg-slate-100"
//                     }`}
//                   >
//                     <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
//                       <div className="bg-current rounded-sm"></div>
//                       <div className="bg-current rounded-sm"></div>
//                       <div className="bg-current rounded-sm"></div>
//                       <div className="bg-current rounded-sm"></div>
//                     </div>
//                   </button>
//                   <button
//                     onClick={() => setViewMode("list")}
//                     className={`p-2 rounded-lg transition-all ${
//                       viewMode === "list"
//                         ? "bg-indigo-100 text-indigo-600"
//                         : "bg-white/80 text-slate-500 hover:bg-slate-100"
//                     }`}
//                   >
//                     <div className="flex flex-col gap-0.5 w-4 h-4">
//                       <div className="bg-current rounded-sm h-1"></div>
//                       <div className="bg-current rounded-sm h-1"></div>
//                       <div className="bg-current rounded-sm h-1"></div>
//                     </div>
//                   </button>
//                 </div>
//               </div>

//               {/* Expanded Filters */}
//               {expandedFilters && (
//                 <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Status
//                     </label>
//                     <select
//                       value={statusFilter}
//                       onChange={(e) => setStatusFilter(e.target.value)}
//                       className="w-full px-3 py-2 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
//                     >
//                       <option value="all">All Status</option>
//                       <option value="approved">Approved</option>
//                       <option value="pending">Pending</option>
//                       <option value="rejected">Rejected</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Category
//                     </label>
//                     <select
//                       value={categoryFilter}
//                       onChange={(e) => setCategoryFilter(e.target.value)}
//                       className="w-full px-3 py-2 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-black"
//                     >
//                       <option value="all">All Categories</option>
//                       {uniqueCategories.map((category) => (
//                         <option key={category} value={category}>
//                           {(category || "Uncategorized")
//                             .charAt(0)
//                             .toUpperCase() +
//                             (category || "Uncategorized").slice(1)}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Events Grid View */}
//             {filteredEvents.length === 0 ? (
//               <div className="bg-white/90 backdrop-blur-xl rounded-xl p-8 border border-white/20 shadow-lg text-center">
//                 <div className="w-20 h-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <Search className="w-8 h-8 text-slate-500" />
//                 </div>
//                 <h3 className="text-xl font-bold text-slate-700 mb-2">
//                   No Events Found
//                 </h3>
//                 <p className="text-slate-500 mb-6">
//                   Try adjusting your search filters to find your events.
//                 </p>
//                 <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center mx-auto">
//                   <Plus className="w-4 h-4 mr-2" />
//                   Create New Event
//                 </button>
//               </div>
//             ) : viewMode === "grid" ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//                 {filteredEvents.map((event, index) => (
//                   <div
//                     key={event._id}
//                     className="group bg-white/90 backdrop-blur-xl rounded-xl overflow-hidden border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
//                     style={{ animationDelay: `${index * 100}ms` }}
//                   >
//                     <div className="relative h-40 overflow-hidden">
//                       {event?.banner ? (
//                         <img
//                           src={`http://localhost:5000/uploads/event-banners/${event.banner}`}
//                           alt={event?.title || "Event image"}
//                           className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                           onError={(e) => {
//                             e.target.style.display = "none";
//                             e.target.nextSibling.style.display = "flex";
//                           }}
//                         />
//                       ) : null}
//                       <div
//                         className={`absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ${
//                           event?.banner ? "hidden" : "flex"
//                         }`}
//                       >
//                         <ImageIcon className="w-10 h-10 text-indigo-300" />
//                       </div>
//                       <div className="absolute top-3 right-3 flex flex-col gap-1">
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
//                             event?.status
//                           )}`}
//                         >
//                           {(event?.status || "unknown")
//                             .charAt(0)
//                             .toUpperCase() +
//                             (event?.status || "unknown").slice(1)}
//                         </span>
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
//                             event?.category
//                           )}`}
//                         >
//                           {(event?.category || "uncategorized")
//                             .charAt(0)
//                             .toUpperCase() +
//                             (event?.category || "uncategorized").slice(1)}
//                         </span>
//                       </div>
//                       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
//                         <h3 className="text-base font-bold truncate">
//                           {event?.title || "Untitled Event"}
//                         </h3>
//                         <p className="text-xs opacity-90 truncate">
//                           {event?.location || "No location"}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex-1 p-4 space-y-3">
//                       <p className="text-sm text-slate-600 line-clamp-2">
//                         {event?.description || "No description available"}
//                       </p>

//                       <div className="grid grid-cols-2 gap-2 text-xs">
//                         <div className="flex items-center text-slate-600">
//                           <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
//                           <span>{formatDate(event?.date)}</span>
//                         </div>
//                         <div className="flex items-center text-slate-600">
//                           <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
//                           <span>{formatTime(event?.startTime) || "N/A"}</span>
//                         </div>
//                         <div className="flex items-center text-slate-600">
//                           <MapPin className="w-3.5 h-3.5 mr-1.5 text-green-500" />
//                           <span className="truncate">
//                             {event?.location
//                               ? event.location.split(",")[0]
//                               : "N/A"}
//                           </span>
//                         </div>
//                         <div className="flex items-center text-slate-600">
//                           <IndianRupee className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
//                           <span>{event?.basePrice || event?.price || 0}</span>
//                         </div>
//                       </div>

//                       <div className="flex gap-2 pt-3">
//                         <NavLink to={`/events/${event._id}`}>
//                           <button className="flex-1 flex items-center justify-center px-2 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 text-xs">
//                             <Eye className="w-3.5 h-3.5 mr-1" />
//                             View
//                           </button>
//                         </NavLink>

//                         <button
//                           onClick={() => handleStatsClick(event)}
//                           className="flex-1 flex items-center justify-center px-2 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 text-xs"
//                         >
//                           <BarChart3 className="w-3.5 h-3.5 mr-1" />
//                           Stats
//                         </button>

//                         <button
//                           onClick={() => handleEditClick(event)}
//                           className="flex-1 flex items-center justify-center px-2 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 text-xs"
//                         >
//                           <Edit2 className="w-3.5 h-3.5 mr-1" />
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleDeleteClick(event)}
//                           className="flex-1 flex items-center justify-center px-2 py-1.5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg hover:from-rose-600 hover:to-red-600 transition-all duration-300 text-xs"
//                         >
//                           <Trash2 className="w-3.5 h-3.5 mr-1" />
//                           Delete
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               /* List View */
//               <div className="space-y-4">
//                 {filteredEvents.map((event, index) => (
//                   <div
//                     key={event._id}
//                     className="group bg-white/90 backdrop-blur-xl rounded-xl overflow-hidden border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
//                     style={{ animationDelay: `${index * 100}ms` }}
//                   >
//                     <div className="flex flex-col md:flex-row">
//                       <div className="md:w-48 h-40 md:h-auto relative overflow-hidden">
//                         {event?.banner ? (
//                           <img
//                             src={`http://localhost:5000/uploads/event-banners/${event.banner}`}
//                             alt={event?.title || "Event image"}
//                             className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                             onError={(e) => {
//                               e.target.style.display = "none";
//                               e.target.nextSibling.style.display = "flex";
//                             }}
//                           />
//                         ) : null}
//                         <div
//                           className={`absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ${
//                             event?.banner ? "hidden" : "flex"
//                           }`}
//                         >
//                           <ImageIcon className="w-10 h-10 text-indigo-300" />
//                         </div>
//                         <div className="absolute top-3 right-3">
//                           <span
//                             className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
//                               event?.status
//                             )}`}
//                           >
//                             {(event?.status || "unknown")
//                               .charAt(0)
//                               .toUpperCase() +
//                               (event?.status || "unknown").slice(1)}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="flex-1 p-4 space-y-3">
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1">
//                             <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-300">
//                               {event?.title || "Untitled Event"}
//                             </h3>
//                             <div className="flex items-center mt-1">
//                               <span
//                                 className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
//                                   event?.category
//                                 )}`}
//                               >
//                                 {(event?.category || "uncategorized")
//                                   .charAt(0)
//                                   .toUpperCase() +
//                                   (event?.category || "uncategorized").slice(1)}
//                               </span>
//                             </div>
//                             <p className="text-sm text-slate-600 mt-2 line-clamp-2">
//                               {event?.description || "No description available"}
//                             </p>
//                           </div>
//                           <button
//                             onClick={() => handleStatsClick(event)}
//                             className="p-1.5 text-blue-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 ml-2 transition-colors"
//                             title="View Statistics"
//                           >
//                             <BarChart3 className="w-4 h-4" />
//                           </button>
//                         </div>

//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
//                           <div className="flex items-center text-slate-600">
//                             <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
//                             <span>{formatDate(event?.date)}</span>
//                           </div>
//                           <div className="flex items-center text-slate-600">
//                             <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
//                             <span>{formatTime(event?.startTime) || "N/A"}</span>
//                           </div>
//                           <div className="flex items-center text-slate-600">
//                             <MapPin className="w-3.5 h-3.5 mr-1.5 text-green-500" />
//                             <span className="truncate">
//                               {event?.location
//                                 ? event.location.split(",")[0]
//                                 : "N/A"}
//                             </span>
//                           </div>
//                           <div className="flex items-center text-slate-600">
//                             <Users className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
//                             <span>
//                               {event?.attendees?.length || 0} attendees
//                             </span>
//                           </div>
//                         </div>

//                         <div className="flex gap-2 pt-2">
//                           <button className="flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg">
//                             <Eye className="w-3.5 h-3.5 mr-1.5" />
//                             View
//                           </button>
//                           <button
//                             onClick={() => handleStatsClick(event)}
//                             className="flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg"
//                           >
//                             <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
//                             Stats
//                           </button>
//                           <button
//                             onClick={() => handleEditClick(event)}
//                             className="flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg"
//                           >
//                             <Edit2 className="w-3.5 h-3.5 mr-1.5" />
//                             Edit
//                           </button>
//                           <button
//                             onClick={() => handleDeleteClick(event)}
//                             className="flex items-center px-3 py-1.5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg hover:from-rose-600 hover:to-red-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg"
//                           >
//                             <Trash2 className="w-3.5 h-3.5 mr-1.5" />
//                             Delete
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  X,
  Image as ImageIcon,
  Filter,
  BarChart3,
  Plus,
  IndianRupee,
  ChevronDown,
  Download,
  Share,
  MoreVertical,
  UserCheck,
  UserX,
  DollarSign,
  QrCode,
  TrendingUp,
  Upload,
  Sparkles,
  AlertCircle,
  Building,
  Armchair,
} from "lucide-react";
import {
  getEventsToOrganizeAsync,
  deleteOrganizedEventAsync,
  editOrganizedEventAsync,
  getMyEventsAsync,
  resetEventState,
} from "../../redux/slices/eventSlice";
import { toast } from "sonner";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Recharts imports
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

Modal.setAppElement("#root");

// Location Picker Component
function LocationPicker({ onLocationSelect, initialPosition }) {
  const [position, setPosition] = useState(
    initialPosition || [27.7172, 85.324]
  );

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
        .then((res) => res.json())
        .then((data) => {
          onLocationSelect(data.display_name, { lat, lng });
        });
    },
  });

  return position ? <Marker position={position} /> : null;
}

// Stats Modal Component
function EventStatsModal({ isOpen, onClose, event }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [revenueData, setRevenueData] = useState([]);
  const [eventDetails, setEventDetails] = useState(null);

  useEffect(() => {
    if (isOpen && event?._id) {
      fetchEventStats();
    }
  }, [isOpen, event?._id]);

  const fetchEventStats = async () => {
    if (!event?._id) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/v1/event/organizer-stats/${event._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setStats(response.data.stats);
        setAttendees(response.data.attendees || []);
        setEventDetails(response.data.eventDetails);

        // Generate revenue trend data based on actual purchase data
        if (response.data.attendees && response.data.attendees.length > 0) {
          generateRevenueTrendData(
            response.data.attendees,
            response.data.eventDetails
          );
        }
      } else {
        throw new Error(response.data.message || "Failed to fetch stats");
      }
    } catch (error) {
      console.error("Error fetching event stats:", error);

      // Set default empty stats
      setStats({
        paidTickets: 0,
        pendingTickets: 0,
        checkedInUsers: 0,
        attendedUsers: 0,
        totalTickets: 0,
        revenue: 0,
        totalAttendees: 0,
        seatStats: {
          front: { booked: 0, revenue: 0 },
          middle: { booked: 0, revenue: 0 },
          last: { booked: 0, revenue: 0 },
        },
      });
      setAttendees([]);
      setRevenueData([]);
      setEventDetails(event);

      toast.error("Failed to load event statistics", {
        description: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate revenue trend data based on actual purchase dates and seat prices
  const generateRevenueTrendData = (attendeesList, eventDetails) => {
    if (!attendeesList || attendeesList.length === 0) {
      setRevenueData([]);
      return;
    }

    // Group purchases by date
    const purchasesByDate = {};

    attendeesList.forEach((attendee) => {
      if (attendee.paymentStatus === "completed" && attendee.purchaseDate) {
        const purchaseDate = new Date(attendee.purchaseDate);
        const dateKey = purchaseDate.toISOString().split("T")[0];

        if (!purchasesByDate[dateKey]) {
          purchasesByDate[dateKey] = {
            date: dateKey,
            revenue: 0,
            tickets: 0,
            displayDate: purchaseDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          };
        }

        // Calculate revenue based on actual finalPrice or seat price
        const ticketRevenue =
          attendee.finalPrice ||
          attendee.ticketQuantity *
            getSeatPrice(eventDetails, attendee.seatType);

        purchasesByDate[dateKey].revenue += ticketRevenue;
        purchasesByDate[dateKey].tickets += attendee.ticketQuantity || 1;
      }
    });

    // Convert to array and sort by date
    const dailyData = Object.values(purchasesByDate).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Calculate cumulative revenue
    let cumulativeRevenue = 0;
    const cumulativeData = dailyData.map((day) => {
      cumulativeRevenue += day.revenue;
      return {
        ...day,
        cumulativeRevenue,
        day: day.displayDate,
      };
    });

    setRevenueData(cumulativeData);
  };

  // Helper function to get seat price
  const getSeatPrice = (eventDetails, seatType) => {
    if (!eventDetails?.seatConfig || !seatType)
      return eventDetails?.basePrice || 0;
    return (
      eventDetails.seatConfig[seatType]?.price || eventDetails.basePrice || 0
    );
  };

  // Chart Data Preparation - UPDATED for new stats structure
  const paymentDistributionData = [
    { name: "Paid Tickets", value: stats?.paidTickets || 0, color: "#10b981" },
    {
      name: "Pending Payments",
      value: stats?.pendingTickets || 0,
      color: "#f59e0b",
    },
  ];

  const attendanceData = [
    { name: "Checked In", value: stats?.checkedInUsers || 0, color: "#8b5cf6" },
    {
      name: "Not Checked In",
      value: (stats?.paidTickets || 0) - (stats?.checkedInUsers || 0),
      color: "#d1d5db",
    },
  ];

  const ticketSalesData = [
    { category: "Total", tickets: stats?.totalTickets || 0 },
    { category: "Paid", tickets: stats?.paidTickets || 0 },
    { category: "Pending", tickets: stats?.pendingTickets || 0 },
    { category: "Checked In", tickets: stats?.checkedInUsers || 0 },
  ];

  // Seat distribution data for pie chart
  const seatDistributionData = stats?.seatStats
    ? [
        {
          name: "Front Row",
          value: stats.seatStats.front.booked || 0,
          color: "#3b82f6",
        },
        {
          name: "Middle Row",
          value: stats.seatStats.middle.booked || 0,
          color: "#10b981",
        },
        {
          name: "Last Row",
          value: stats.seatStats.last.booked || 0,
          color: "#f59e0b",
        },
      ]
    : [];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAttendanceStatusColor = (status) => {
    switch (status) {
      case "attended":
        return "bg-green-100 text-green-800";
      case "checked-in":
        return "bg-blue-100 text-blue-800";
      case "not_attended":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.name.includes("Revenue") ? `₹${entry.value}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          transform: "translate(-50%, -50%)",
          maxWidth: "1200px",
          width: "95%",
          maxHeight: "90vh",
          padding: "0",
          border: "none",
          borderRadius: "16px",
          overflow: "hidden",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
        },
      }}
      contentLabel="Event Statistics"
    >
      <div className="relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Event Analytics</h2>
              <p className="text-indigo-100 mt-1">{event.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="px-6 flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("charts")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "charts"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Charts & Analytics
            </button>
            <button
              onClick={() => setActiveTab("attendees")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "attendees"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Attendee Details
            </button>
          </div>
        </div>

        <div
          className="p-6 space-y-6 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 120px)" }}
        >
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Loading statistics...</span>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Stats Overview - UPDATED for new stats structure */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Total Tickets
                          </p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {stats?.totalTickets || 0}
                          </p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <QrCode className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Paid Tickets
                          </p>
                          <p className="text-2xl font-bold text-green-600 mt-1">
                            {stats?.paidTickets || 0}
                          </p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                          <UserCheck className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Pending Payments
                          </p>
                          <p className="text-2xl font-bold text-yellow-600 mt-1">
                            {stats?.pendingTickets || 0}
                          </p>
                        </div>
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <UserX className="w-5 h-5 text-yellow-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Checked In
                          </p>
                          <p className="text-2xl font-bold text-purple-600 mt-1">
                            {stats?.checkedInUsers || 0}
                          </p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Card - UPDATED to use actual revenue from stats */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-100">
                          Total Revenue
                        </p>
                        <p className="text-3xl font-bold mt-1">
                          ₹{stats?.revenue || 0}
                        </p>
                        <p className="text-green-100 text-sm mt-1">
                          From {stats?.paidTickets || 0} paid tickets
                        </p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-lg">
                        <DollarSign className="w-8 h-8" />
                      </div>
                    </div>
                  </div>

                  {/* Seat Statistics - NEW SECTION */}
                  {stats?.seatStats && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Seat Distribution
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-700">
                            Front Row
                          </p>
                          <p className="text-xl font-bold text-blue-900">
                            {stats.seatStats.front.booked || 0} booked
                          </p>
                          <p className="text-sm text-blue-600">
                            ₹{stats.seatStats.front.revenue || 0} revenue
                          </p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-700">
                            Middle Row
                          </p>
                          <p className="text-xl font-bold text-green-900">
                            {stats.seatStats.middle.booked || 0} booked
                          </p>
                          <p className="text-sm text-green-600">
                            ₹{stats.seatStats.middle.revenue || 0} revenue
                          </p>
                        </div>
                        <div className="text-center p-3 bg-amber-50 rounded-lg">
                          <p className="text-sm font-medium text-amber-700">
                            Last Row
                          </p>
                          <p className="text-xl font-bold text-amber-900">
                            {stats.seatStats.last.booked || 0} booked
                          </p>
                          <p className="text-sm text-amber-600">
                            ₹{stats.seatStats.last.revenue || 0} revenue
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Progress Bars - UPDATED for new stats structure */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Payment Completion</span>
                        <span>
                          {stats?.paidTickets || 0}/{stats?.totalTickets || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: stats?.totalTickets
                              ? `${
                                  (stats.paidTickets / stats.totalTickets) * 100
                                }%`
                              : "0%",
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Check-in Rate</span>
                        <span>
                          {stats?.checkedInUsers || 0}/{stats?.paidTickets || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: stats?.paidTickets
                              ? `${
                                  (stats.checkedInUsers / stats.paidTickets) *
                                  100
                                }%`
                              : "0%",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Charts Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Payment Distribution
                      </h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={paymentDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name} (${(percent * 100).toFixed(0)}%)`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {paymentDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Revenue Trend
                      </h3>
                      <ResponsiveContainer width="100%" height={200}>
                        {revenueData.length > 0 ? (
                          <AreaChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Area
                              type="monotone"
                              dataKey="cumulativeRevenue"
                              stroke="#10b981"
                              fill="#10b981"
                              fillOpacity={0.3}
                              name="Revenue (₹)"
                            />
                          </AreaChart>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            No revenue data available
                          </div>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "charts" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Payment Distribution Pie Chart */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Payment Distribution
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={paymentDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name} (${(percent * 100).toFixed(0)}%)`
                            }
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {paymentDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Seat Distribution Pie Chart - NEW */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Seat Distribution
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        {seatDistributionData.length > 0 ? (
                          <PieChart>
                            <Pie
                              data={seatDistributionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) =>
                                `${name} (${(percent * 100).toFixed(0)}%)`
                              }
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {seatDistributionData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            No seat data available
                          </div>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Real Revenue Trend Area Chart */}
                  {revenueData.length > 0 && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Revenue Trend (Real Data)
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => [`₹${value}`, "Revenue"]}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="cumulativeRevenue"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.3}
                            name="Cumulative Revenue (₹)"
                          />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            name="Daily Revenue (₹)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                      <p className="text-sm text-gray-500 mt-2">
                        Based on actual ticket purchases over time
                      </p>
                    </div>
                  )}

                  {/* Ticket Sales Bar Chart */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Ticket Sales Breakdown
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={ticketSalesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="tickets"
                          name="Number of Tickets"
                          fill="#3b82f6"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeTab === "attendees" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Attendee Details ({attendees.length})
                  </h3>
                  {attendees.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p>No attendees yet</p>
                      <p className="text-sm mt-1">
                        Attendees will appear here once they purchase tickets
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {attendees.map((attendee, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-gray-900">
                                  {attendee.userName || "Unknown User"}
                                </h4>
                                <span className="text-sm text-gray-500">
                                  {attendee.userEmail || "No email"}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span
                                  className={`px-2 py-1 rounded-full ${getPaymentStatusColor(
                                    attendee.paymentStatus
                                  )}`}
                                >
                                  Payment: {attendee.paymentStatus || "unknown"}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full ${getAttendanceStatusColor(
                                    attendee.attendanceStatus
                                  )}`}
                                >
                                  Attendance:{" "}
                                  {attendee.attendanceStatus || "not_attended"}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                  Tickets: {attendee.ticketQuantity || 1}
                                </span>
                                {attendee.seatType && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                    Seat: {attendee.seatType} -{" "}
                                    {attendee.seatNumber}
                                  </span>
                                )}
                                {attendee.finalPrice > 0 && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                    Paid: ₹{attendee.finalPrice}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              <div>
                                Purchased: {formatDate(attendee.purchaseDate)}
                              </div>
                              {attendee.attendanceTime && (
                                <div>
                                  Checked in:{" "}
                                  {formatTime(attendee.attendanceTime)}
                                </div>
                              )}
                            </div>
                          </div>
                          {attendee.ticketIds &&
                            attendee.ticketIds.length > 0 && (
                              <div className="mt-2 text-xs text-gray-600">
                                <span className="font-medium">
                                  Ticket IDs:{" "}
                                </span>
                                {attendee.ticketIds.join(", ")}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Event Details Summary - UPDATED for seat configuration */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Event Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                    <span>{formatDate(eventDetails?.date || event.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                    <span>
                      {eventDetails?.startTime || event.startTime} -{" "}
                      {eventDetails?.endTime || event.endTime}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-green-500" />
                    <span className="truncate">
                      {eventDetails?.location || event.location}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <IndianRupee className="w-4 h-4 mr-2 text-amber-500" />
                    <span>
                      Base: ₹
                      {eventDetails?.basePrice || event.basePrice || "Free"}
                    </span>
                  </div>
                </div>

                {/* Seat Configuration - NEW */}
                {eventDetails?.seatConfig && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">
                      Seat Configuration
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-blue-50 p-2 rounded">
                        <span className="font-medium text-blue-700">
                          Front Row:
                        </span>
                        <span className="text-blue-600 ml-1">
                          {eventDetails.seatConfig.front?.booked || 0}/
                          {eventDetails.seatConfig.front?.count || 0} booked (₹
                          {eventDetails.seatConfig.front?.price || 0})
                        </span>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <span className="font-medium text-green-700">
                          Middle Row:
                        </span>
                        <span className="text-green-600 ml-1">
                          {eventDetails.seatConfig.middle?.booked || 0}/
                          {eventDetails.seatConfig.middle?.count || 0} booked (₹
                          {eventDetails.seatConfig.middle?.price || 0})
                        </span>
                      </div>
                      <div className="bg-amber-50 p-2 rounded">
                        <span className="font-medium text-amber-700">
                          Last Row:
                        </span>
                        <span className="text-amber-600 ml-1">
                          {eventDetails.seatConfig.last?.booked || 0}/
                          {eventDetails.seatConfig.last?.count || 0} booked (₹
                          {eventDetails.seatConfig.last?.price || 0})
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function OrganizeEvents() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { eventToOrganize, loading, error, message, success } = useSelector(
    (state) => state.events
  );

  useEffect(() => {
    if (user?._id) {
      dispatch(getMyEventsAsync());
    }
  }, [dispatch, user?._id]);

  useEffect(() => {
    if (success && message) {
      toast.success(message);
      dispatch(resetEventState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetEventState());
    }
  }, [success, message, error, dispatch]);

  const organizedEvents =
    Array.isArray(eventToOrganize) && eventToOrganize.length > 0
      ? Array.isArray(eventToOrganize[0])
        ? eventToOrganize[0]
        : eventToOrganize
      : [];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    category: "",
    basePrice: "",
    coordinates: null,
    seatConfig: {
      front: { count: 0, price: 0 },
      middle: { count: 0, price: 0 },
      last: { count: 0, price: 0 },
    },
  });
  const [editImage, setEditImage] = useState(null);
  const [editFileName, setEditFileName] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [venue, setVenue] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [expandedFilters, setExpandedFilters] = useState(false);

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      maxWidth: "1000px",
      width: "95%",
      maxHeight: "90vh",
      padding: "0",
      border: "none",
      borderRadius: "16px",
      overflow: "hidden",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(4px)",
      zIndex: 1000,
    },
  };

  const filteredEvents = useMemo(() => {
    return organizedEvents.filter((event) => {
      const title = event?.title || "";
      const description = event?.description || "";
      const location = event?.location || "";
      const status = event?.status || "";
      const category = event?.category || "";

      const matchesSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [organizedEvents, searchTerm, statusFilter, categoryFilter]);

  const uniqueCategories = [
    ...new Set(
      organizedEvents
        .map((e) => e?.category || "uncategorized")
        .filter((category) => category)
    ),
  ];

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
    const [hours, minutes] = timeString.split(":");
    const h = parseInt(hours);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  const handleEditClick = (event) => {
    setCurrentEvent(event);

    // Parse seat configuration from event
    const seatConfig = event.seatConfig || {
      front: { count: 0, price: 0 },
      middle: { count: 0, price: 0 },
      last: { count: 0, price: 0 },
    };

    setEditFormData({
      title: event.title || "",
      description: event.description || "",
      date: event.date ? new Date(event.date).toISOString().slice(0, 10) : "",
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      location: event.location || "",
      category: event.category || "",
      basePrice: event.basePrice || event.price || 0,
      coordinates: event.coordinates || null,
      seatConfig: seatConfig,
    });

    setVenue(event.location || "");
    setCoordinates(event.coordinates || null);

    // Reset image states
    setEditImage(null);
    setEditFileName(event.banner ? "Current banner" : "");

    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    // Handle seat configuration changes
    if (name.startsWith("seatConfig.")) {
      const [_, seatType, field] = name.split(".");
      setEditFormData((prev) => ({
        ...prev,
        seatConfig: {
          ...prev.seatConfig,
          [seatType]: {
            ...prev.seatConfig[seatType],
            [field]:
              field === "count" || field === "price" ? Number(value) : value,
          },
        },
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: name === "basePrice" ? Number(value) : value,
      }));
    }
  };

  const handleLocationSelect = (location, coords) => {
    setVenue(location);
    setCoordinates(coords);
    setEditFormData((prev) => ({
      ...prev,
      location: location,
      coordinates: coords,
    }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit.");
        return;
      }
      setEditImage(file);
      setEditFileName(file.name);
    }
  };

  const getEditFinalPrice = (seatType) => {
    const basePrice = Number(editFormData.basePrice) || 0;
    const seatPrice = editFormData.seatConfig[seatType]?.price || 0;
    return basePrice + seatPrice;
  };

  const handleEditSubmit = async () => {
    try {
      const formData = new FormData();

      // Prepare seat configuration with proper structure
      const seatConfigData = {
        front: {
          count: editFormData.seatConfig.front.count,
          price: editFormData.seatConfig.front.price,
          // available and booked will be calculated by backend
        },
        middle: {
          count: editFormData.seatConfig.middle.count,
          price: editFormData.seatConfig.middle.price,
        },
        last: {
          count: editFormData.seatConfig.last.count,
          price: editFormData.seatConfig.last.price,
        },
      };

      // Append all form data
      Object.entries(editFormData).forEach(([key, value]) => {
        if (key === "coordinates" && value) {
          formData.append(key, JSON.stringify(value));
        } else if (key === "seatConfig") {
          // Use the properly structured seatConfigData
          formData.append(key, JSON.stringify(seatConfigData));
        } else if (key === "basePrice") {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value);
        }
      });

      // Append image if changed
      if (editImage) {
        formData.append("banner", editImage);
      }

      console.log("🔄 Sending edit request with seat config:", seatConfigData);

      await dispatch(
        editOrganizedEventAsync({
          eventId: currentEvent._id,
          updatedData: formData,
        })
      ).unwrap();

      setIsEditModalOpen(false);
      dispatch(getMyEventsAsync());
      toast.success("Event updated successfully!");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error(error.message || "Failed to update event");
    }
  };

  const handleStatsClick = (event) => {
    setCurrentEvent(event);
    setIsStatsModalOpen(true);
  };

  const handleDeleteClick = (event) => {
    setCurrentEvent(event);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteOrganizedEventAsync(currentEvent._id)).unwrap();
      setIsDeleteModalOpen(false);
      dispatch(getMyEventsAsync());
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        style={customStyles}
        contentLabel="Edit Event"
      >
        <div className="relative">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Edit Event</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div
            className="p-6 space-y-6 overflow-y-auto"
            style={{ maxHeight: "calc(90vh - 120px)" }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
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
                        name="title"
                        value={editFormData.title}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={editFormData.date}
                          onChange={handleEditChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Base Price (₹)
                        </label>
                        <input
                          type="number"
                          name="basePrice"
                          value={editFormData.basePrice}
                          onChange={handleEditChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time
                        </label>
                        <input
                          type="time"
                          name="startTime"
                          value={editFormData.startTime}
                          onChange={handleEditChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Time
                        </label>
                        <input
                          type="time"
                          name="endTime"
                          value={editFormData.endTime}
                          onChange={handleEditChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={editFormData.category}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
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

                {/* Location Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-purple-600" />
                    Location
                  </h3>

                  <div className="space-y-4">
                    <div
                      className="mb-3 rounded-lg overflow-hidden"
                      style={{ height: "200px" }}
                    >
                      <MapContainer
                        center={coordinates || [27.7172, 85.324]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationPicker
                          onLocationSelect={handleLocationSelect}
                          initialPosition={coordinates}
                        />
                      </MapContainer>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      📍 Selected Venue:{" "}
                      {venue || "Click on the map to select location"}
                    </p>

                    <input
                      type="text"
                      name="location"
                      value={editFormData.location}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Or enter location manually"
                    />
                  </div>
                </div>

                {/* Banner Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <ImageIcon className="h-6 w-6 text-purple-600" />
                    Event Banner
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-8">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                          <label
                            htmlFor="edit-file-upload"
                            className="relative cursor-pointer rounded-md bg-white font-semibold text-purple-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-600 focus-within:ring-offset-2 hover:text-purple-500"
                          >
                            <span>Upload a new banner</span>
                            <input
                              id="edit-file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={handleEditImageChange}
                              accept="image/*"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">
                          PNG, JPG, GIF up to 5MB
                        </p>
                        {editFileName && (
                          <p className="text-sm mt-2 font-medium text-gray-800">
                            Selected file: {editFileName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Seat Configuration */}
              <div className="space-y-6">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-2">
                            Number of Seats
                          </label>
                          <input
                            type="number"
                            name="seatConfig.front.count"
                            value={editFormData.seatConfig.front.count}
                            onChange={handleEditChange}
                            min="0"
                            className="w-full rounded-lg border border-green-300 bg-white px-4 py-3 text-green-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="flex items-center text-sm font-medium text-green-700 mb-2">
                            Premium Price <IndianRupee size={10} />
                          </label>
                          <input
                            type="number"
                            name="seatConfig.front.price"
                            value={editFormData.seatConfig.front.price}
                            onChange={handleEditChange}
                            min="0"
                            className="w-full rounded-lg border border-green-300 bg-white px-4 py-3 text-green-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="mt-4 bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-green-600 mb-1">
                            Final Price
                          </div>
                          <div className="flex items-center justify-center text-2xl font-bold text-green-700">
                            <IndianRupee size={15} />
                            {getEditFinalPrice("front")}
                          </div>
                          <div className="text-xs text-green-500 mt-1">
                            Base + Premium
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">
                            Number of Seats
                          </label>
                          <input
                            type="number"
                            name="seatConfig.middle.count"
                            value={editFormData.seatConfig.middle.count}
                            onChange={handleEditChange}
                            min="0"
                            className="w-full rounded-lg border border-blue-300 bg-white px-4 py-3 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="flex items-center text-sm font-medium text-blue-700 mb-2">
                            Premium Price
                          </label>
                          <input
                            type="number"
                            name="seatConfig.middle.price"
                            value={editFormData.seatConfig.middle.price}
                            onChange={handleEditChange}
                            min="0"
                            className="w-full rounded-lg border border-blue-300 bg-white px-4 py-3 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-blue-600 mb-1">
                            Final Price
                          </div>
                          <div className="flex items-center justify-center text-2xl font-bold text-blue-700">
                            <IndianRupee size={15} />
                            {getEditFinalPrice("middle")}
                          </div>
                          <div className="text-xs text-blue-500 mt-1">
                            Base + Premium
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of Seats
                          </label>
                          <input
                            type="number"
                            name="seatConfig.last.count"
                            value={editFormData.seatConfig.last.count}
                            onChange={handleEditChange}
                            min="0"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Premium Price
                          </label>
                          <input
                            type="number"
                            name="seatConfig.last.price"
                            value={editFormData.seatConfig.last.price}
                            onChange={handleEditChange}
                            min="0"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-600 mb-1">
                            Final Price
                          </div>
                          <div className="flex items-center justify-center text-2xl font-bold text-gray-700">
                            <IndianRupee size={15} />
                            {getEditFinalPrice("last")}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Base + Premium
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Stats Modal */}
      <EventStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        event={currentEvent}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        style={customStyles}
        contentLabel="Delete Confirmation"
      >
        <div className="relative">
          <div className="bg-gradient-to-r from-rose-600 to-red-600 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                Confirm Deletion
              </h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete "{currentEvent?.title}"?
              </h3>
              <p className="text-sm text-gray-500">
                This action cannot be undone. All event data will be permanently
                removed.
              </p>
            </div>

            <div className="flex justify-center space-x-4 pt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 rounded-lg text-white hover:from-rose-700 hover:to-red-700 transition-all shadow-md"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Events
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Manage and track all your created events in one beautiful dashboard
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 font-semibold p-4 bg-red-50 rounded-xl">
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {organizedEvents.length}
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
                      organizedEvents.filter((e) => e?.status === "approved")
                        .length
                    }
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-700">
                  Approved
                </h3>
              </div>

              <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-md">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {
                      organizedEvents.filter((e) => e?.status === "pending")
                        .length
                    }
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-700">
                  Pending
                </h3>
              </div>

              <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {organizedEvents.reduce(
                      (total, event) => total + (event?.attendees?.length || 0),
                      0
                    )}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-700">
                  Attendees
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
                    placeholder="Search your events..."
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
                          {(category || "Uncategorized")
                            .charAt(0)
                            .toUpperCase() +
                            (category || "Uncategorized").slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Events Grid View */}
            {filteredEvents.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-xl p-8 border border-white/20 shadow-lg text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">
                  No Events Found
                </h3>
                <p className="text-slate-500 mb-6">
                  Try adjusting your search filters to find your events.
                </p>
                <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center mx-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Event
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredEvents.map((event, index) => (
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
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ${
                          event?.banner ? "hidden" : "flex"
                        }`}
                      >
                        <ImageIcon className="w-10 h-10 text-indigo-300" />
                      </div>
                      <div className="absolute top-3 right-3 flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            event?.status
                          )}`}
                        >
                          {(event?.status || "unknown")
                            .charAt(0)
                            .toUpperCase() +
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
                          <span>{event?.basePrice || event?.price || 0}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3">
                        <NavLink to={`/events/${event._id}`}>
                          <button className="flex-1 flex items-center justify-center px-2 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 text-xs">
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View
                          </button>
                        </NavLink>

                        <button
                          onClick={() => handleStatsClick(event)}
                          className="flex-1 flex items-center justify-center px-2 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 text-xs"
                        >
                          <BarChart3 className="w-3.5 h-3.5 mr-1" />
                          Stats
                        </button>

                        <button
                          onClick={() => handleEditClick(event)}
                          className="flex-1 flex items-center justify-center px-2 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(event)}
                          className="flex-1 flex items-center justify-center px-2 py-1.5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg hover:from-rose-600 hover:to-red-600 transition-all duration-300 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredEvents.map((event, index) => (
                  <div
                    key={event._id}
                    className="group bg-white/90 backdrop-blur-xl rounded-xl overflow-hidden border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 h-40 md:h-auto relative overflow-hidden">
                        {event?.banner ? (
                          <img
                            src={`http://localhost:5000/uploads/event-banners/${event.banner}`}
                            alt={event?.title || "Event image"}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ${
                            event?.banner ? "hidden" : "flex"
                          }`}
                        >
                          <ImageIcon className="w-10 h-10 text-indigo-300" />
                        </div>
                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              event?.status
                            )}`}
                          >
                            {(event?.status || "unknown")
                              .charAt(0)
                              .toUpperCase() +
                              (event?.status || "unknown").slice(1)}
                          </span>
                        </div>
                      </div>

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
                          <button
                            onClick={() => handleStatsClick(event)}
                            className="p-1.5 text-blue-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 ml-2 transition-colors"
                            title="View Statistics"
                          >
                            <BarChart3 className="w-4 h-4" />
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
                            <Users className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
                            <span>
                              {event?.attendees?.length || 0} attendees
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button className="flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg">
                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                            View
                          </button>
                          <button
                            onClick={() => handleStatsClick(event)}
                            className="flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg"
                          >
                            <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                            Stats
                          </button>
                          <button
                            onClick={() => handleEditClick(event)}
                            className="flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(event)}
                            className="flex items-center px-3 py-1.5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg hover:from-rose-600 hover:to-red-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

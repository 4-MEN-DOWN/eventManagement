// import { useSelector, useDispatch } from "react-redux";
// import { useState, useEffect, useCallback, useMemo } from "react";
// import { getAllAdsAdmin } from "../../redux/slices/adSlice";
// import { getAllUsersForAdmin } from "../../redux/slices/subscriptionSlice";
// import {
//   FileText,
//   Users,
//   Clock,
//   CheckCircle,
//   XCircle,
//   Calendar,
//   MapPin,
//   IndianRupee,
//   User,
//   Sparkles,
//   ChevronRight,
//   Megaphone,
//   BarChart3,
//   Eye,
//   Target,
//   Filter,
//   RefreshCw,
//   MousePointer,
//   Zap,
//   UserCheck,
//   UserX,
//   CreditCard,
//   Package,
//   Activity,
// } from "lucide-react";
// import { NavLink } from "react-router-dom";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";

// /* ──────────────────────  BUSINESS REVENUE CHART ────────────────────── */
// const BusinessRevenueChart = ({ data, title }) => {
//   const total = data.reduce((s, d) => s + d.value, 0);

//   const chartData = data.map((d) => ({
//     name: d.label.split(" ")[1],
//     value: d.value,
//     fullLabel: d.label,
//   }));

//   const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload[0]) {
//       return (
//         <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm text-sm">
//           <p className="font-medium">{payload[0].payload.fullLabel}</p>
//           <p className="text-green-600 font-bold">
//             ₹{payload[0].value.toLocaleString()}
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5">
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//           <p className="text-sm text-gray-500">Revenue Overview</p>
//         </div>
//         <div className="text-right">
//           <p className="text-2xl font-bold text-green-600">
//             ₹{total.toLocaleString()}
//           </p>
//           <p className="text-xs text-gray-500">Total Revenue</p>
//         </div>
//       </div>

//       <div className="h-64">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart
//             data={chartData}
//             margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
//           >
//             <defs>
//               <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
//                 <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid
//               strokeDasharray="3 3"
//               stroke="#f1f5f9"
//               horizontal={true}
//               vertical={false}
//             />
//             <XAxis
//               dataKey="name"
//               tick={{ fontSize: 12, fill: "#64748b" }}
//               axisLine={false}
//               tickLine={false}
//             />
//             <YAxis
//               tick={{ fontSize: 12, fill: "#64748b" }}
//               axisLine={false}
//               tickLine={false}
//             />
//             <Tooltip
//               content={<CustomTooltip />}
//               cursor={{ stroke: "#10b981", strokeWidth: 1 }}
//             />
//             <Area
//               type="monotone"
//               dataKey="value"
//               stroke="#10b981"
//               strokeWidth={2.5}
//               fillOpacity={1}
//               fill="url(#revGradient)"
//               dot={{ fill: "#fff", stroke: "#10b981", strokeWidth: 2, r: 4 }}
//               activeDot={{ r: 6 }}
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>

//       <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 text-center text-sm">
//         <div>
//           <p className="text-2xl font-bold text-gray-900">{data.length}</p>
//           <p className="text-xs text-gray-500">Days</p>
//         </div>
//         <div>
//           <p className="text-2xl font-bold text-blue-600">
//             ₹{Math.max(...data.map((d) => d.value)).toLocaleString()}
//           </p>
//           <p className="text-xs text-gray-500">Peak</p>
//         </div>
//         <div>
//           <p className="text-2xl font-bold text-green-600">
//             ₹{Math.round(total / data.length).toLocaleString()}
//           </p>
//           <p className="text-xs text-gray-500">Avg/Day</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ──────────────────────  AD PERFORMANCE CHART (from reduxAds) ────────────────────── */
// const AdPerformanceChart = ({ ads, timeRange }) => {
//   const getDateRange = useCallback((range) => {
//     const now = new Date();
//     const start = new Date();
//     switch (range) {
//       case "week":
//         start.setDate(now.getDate() - 7);
//         break;
//       case "month":
//         start.setDate(now.getDate() - 30);
//         break;
//       case "all":
//         start.setTime(0);
//         break;
//       default:
//         start.setDate(now.getDate() - 7);
//     }
//     return { start, end: now };
//   }, []);

//   const adDataByDay = useMemo(() => {
//     const { start } = getDateRange(timeRange);
//     const days = [];
//     const current = new Date(start);
//     while (current <= new Date()) {
//       days.push(new Date(current));
//       current.setDate(current.getDate() + 1);
//     }

//     return days.map((day) => {
//       const dayStr = day.toDateString();
//       const dayAds = ads.filter((ad) => {
//         const adDate = new Date(ad.createdAt).toDateString();
//         return adDate === dayStr;
//       });

//       const clicks = dayAds.reduce((sum, ad) => {
//         return (
//           sum +
//           (ad.clickEvents?.filter(
//             (c) => new Date(c.clickedAt).toDateString() === dayStr
//           ).length || 0)
//         );
//       }, 0);

//       const views = dayAds.reduce((sum, ad) => sum + (ad.views || 0), 0);

//       const label = day.toLocaleDateString("en-US", {
//         weekday: "short",
//         month: "short",
//         day: "numeric",
//       });

//       return { label, clicks, views, fullLabel: label };
//     });
//   }, [ads, timeRange, getDateRange]);

//   const totalClicks = adDataByDay.reduce((s, d) => s + d.clicks, 0);
//   const totalViews = adDataByDay.reduce((s, d) => s + d.views, 0);
//   const ctr =
//     totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : 0;

//   const chartData = adDataByDay.map((d) => ({
//     name: d.label.split(" ")[1],
//     clicks: d.clicks,
//     views: d.views,
//     fullLabel: d.fullLabel,
//   }));

//   const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm text-sm">
//           <p className="font-medium mb-1">{payload[0].payload.fullLabel}</p>
//           <p className="text-purple-600">
//             Clicks: <strong>{payload[0].value}</strong>
//           </p>
//           <p className="text-blue-600">
//             Views: <strong>{payload[1].value}</strong>
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5">
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//             <Megaphone className="w-5 h-5 text-purple-600" />
//             Ad Performance
//           </h3>
//           <p className="text-sm text-gray-500">Clicks & Views Over Time</p>
//         </div>
//         <div className="text-right">
//           <p className="text-xs text-gray-500">CTR</p>
//           <p className="text-2xl font-bold text-purple-600">{ctr}%</p>
//         </div>
//       </div>

//       <div className="h-64">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart
//             data={chartData}
//             margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
//           >
//             <defs>
//               <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
//                 <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
//               </linearGradient>
//               <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
//                 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid
//               strokeDasharray="3 3"
//               stroke="#f1f5f9"
//               horizontal={true}
//               vertical={false}
//             />
//             <XAxis
//               dataKey="name"
//               tick={{ fontSize: 12, fill: "#64748b" }}
//               axisLine={false}
//               tickLine={false}
//             />
//             <YAxis
//               tick={{ fontSize: 12, fill: "#64748b" }}
//               axisLine={false}
//               tickLine={false}
//             />
//             <Tooltip content={<CustomTooltip />} />
//             <Legend
//               verticalAlign="top"
//               height={36}
//               iconType="circle"
//               formatter={(value) => <span className="text-xs">{value}</span>}
//             />
//             <Area
//               type="monotone"
//               dataKey="clicks"
//               stroke="#a855f7"
//               strokeWidth={2.5}
//               fillOpacity={1}
//               fill="url(#clickGradient)"
//               dot={{ fill: "#fff", stroke: "#a855f7", strokeWidth: 2, r: 4 }}
//               name="Clicks"
//             />
//             <Area
//               type="monotone"
//               dataKey="views"
//               stroke="#3b82f6"
//               strokeWidth={2.5}
//               fillOpacity={1}
//               fill="url(#viewGradient)"
//               dot={{ fill: "#fff", stroke: "#3b82f6", strokeWidth: 2, r: 4 }}
//               name="Views"
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>

//       <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 text-center text-sm">
//         <div>
//           <p className="text-2xl font-bold text-purple-600">{totalClicks}</p>
//           <p className="text-xs text-gray-500">Total Clicks</p>
//         </div>
//         <div>
//           <p className="text-2xl font-bold text-blue-600">{totalViews}</p>
//           <p className="text-xs text-gray-500">Total Views</p>
//         </div>
//         <div>
//           <p className="text-2xl font-bold text-green-600">
//             {ads.filter((a) => a.status === "approved").length}
//           </p>
//           <p className="text-xs text-gray-500">Active Ads</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ──────────────────────  COMPACT SUBSCRIPTION CARD ────────────────────── */
// const SubscriptionAnalytics = ({ users }) => {
//   const stats = useMemo(() => {
//     let active = 0,
//       revenue = 0;
//     const plans = { basic: 0, premium: 0, platinum: 0 };
//     const breakdown = {
//       total: users.length,
//       basic: 0,
//       premium: 0,
//       platinum: 0,
//       active: 0,
//     };

//     users.forEach((u) => {
//       if (u.subscription === "basic") breakdown.basic++;
//       else if (u.subscription === "premium") breakdown.premium++;
//       else if (u.subscription === "platinum") breakdown.platinum++;

//       if (u.subscriptionStatus === "active" && u.subscription !== "basic")
//         breakdown.active++;

//       u.subscriptionStats?.forEach((s) => {
//         if (s.status === "active") {
//           active++;
//           revenue += s.amount;
//           if (plans[s.plan] !== undefined) plans[s.plan]++;
//         }
//       });
//     });

//     return { active, revenue, plans, breakdown };
//   }, [users]);

//   return (
//     <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-5">
//       <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
//         <CreditCard className="w-5 h-5 text-purple-600" />
//         Subscription Analytics
//       </h3>

//       <div className="grid grid-cols-2 gap-4">
//         <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
//           <p className="text-xs font-medium text-purple-700">Active</p>
//           <p className="text-xl font-bold text-purple-900">{stats.active}</p>
//         </div>
//         <div className="bg-green-50 p-3 rounded-lg border border-green-200">
//           <p className="text-xs font-medium text-green-700">Revenue</p>
//           <p className="text-xl font-bold text-green-900 flex items-center">
//             <IndianRupee className="w-4 h-4 mr-1" />
//             {stats.revenue.toFixed(0)}
//           </p>
//         </div>
//       </div>

//       <div className="space-y-2 text-xs">
//         <p className="font-medium text-gray-700">Plan Distribution</p>
//         {Object.entries(stats.plans).map(([plan, count]) => (
//           <div key={plan} className="flex justify-between">
//             <span className="capitalize text-gray-600">{plan}</span>
//             <span className="font-medium">{count}</span>
//           </div>
//         ))}
//       </div>

//       <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
//         {stats.breakdown.total} users • {stats.breakdown.active} paying
//       </div>
//     </div>
//   );
// };

// /* ──────────────────────  MAIN DASHBOARD ────────────────────── */
// export function AdminDashboard() {
//   const dispatch = useDispatch();
//   const reduxEvents = useSelector((state) => state.events.allEvents) || [];
//   const reduxAds = useSelector((state) => state.ads.allAds) || [];
//   const users = useSelector((state) => state.subscriptions.allUsers) || [];
//   const usersLoading = useSelector((state) => state.subscriptions.usersLoading);
//   console.log(reduxAds);
//   const [timeRange, setTimeRange] = useState("week");
//   const [loading, setLoading] = useState(true);

//   const getDateRange = useCallback((range) => {
//     const now = new Date();
//     const start = new Date();
//     switch (range) {
//       case "week":
//         start.setDate(now.getDate() - 7);
//         break;
//       case "month":
//         start.setDate(now.getDate() - 30);
//         break;
//       case "all":
//         start.setTime(0);
//         break;
//       default:
//         start.setDate(now.getDate() - 7);
//     }
//     return { start, end: now };
//   }, []);

//   const filterEventsByDateRange = useCallback(
//     (events, range) => {
//       const { start, end } = getDateRange(range);
//       return events.filter((e) => {
//         const d = new Date(e.createdAt || e.date);
//         return d >= start && d <= end;
//       });
//     },
//     [getDateRange]
//   );

//   const filterAdsByDateRange = useCallback(
//     (ads, range) => {
//       const { start, end } = getDateRange(range);
//       return ads.filter(
//         (a) => new Date(a.createdAt) >= start && new Date(a.createdAt) <= end
//       );
//     },
//     [getDateRange]
//   );

//   const calculateRevenueByDay = useCallback(
//     (events, range) => {
//       const { start } = getDateRange(range);
//       const days = [];
//       const current = new Date(start);
//       while (current <= new Date()) {
//         days.push(new Date(current));
//         current.setDate(current.getDate() + 1);
//       }
//       return days.map((day) => {
//         const dayEvents = events.filter(
//           (e) =>
//             new Date(e.createdAt || e.date).toDateString() ===
//             day.toDateString()
//         );
//         const dailyRevenue = dayEvents.reduce((sum, e) => {
//           return (
//             sum +
//             (e.attendees?.reduce((s, a) => s + (a.finalPrice || 0), 0) || 0)
//           );
//         }, 0);
//         const label = day.toLocaleDateString("en-US", {
//           weekday: "short",
//           month: "short",
//           day: "numeric",
//         });
//         return { label, value: dailyRevenue };
//       });
//     },
//     [getDateRange]
//   );

//   const calculateAdRevenue = useCallback((ads) => {
//     const premium = ads.filter(
//       (a) => a.adType === "premium" && a.status === "approved"
//     ).length;
//     const standard = ads.filter(
//       (a) => a.adType === "standard" && a.status === "approved"
//     ).length;
//     const clicks = ads.reduce(
//       (s, a) => s + (a.clickEvents?.length || a.clicks || 0),
//       0
//     );
//     const views = ads.reduce((s, a) => s + (a.views || 0), 0);
//     const revenue = premium * 1500 + standard * 500;
//     const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : 0;
//     return {
//       totalRevenue: revenue,
//       totalClicks: clicks,
//       totalViews: views,
//       ctr,
//     };
//   }, []);

//   const processedData = useMemo(() => {
//     const filteredEvents = filterEventsByDateRange(reduxEvents, timeRange);
//     const filteredAds = filterAdsByDateRange(reduxAds, timeRange);

//     const totalEvents = filteredEvents.length;
//     const approvedEvents = filteredEvents.filter(
//       (e) => e.status === "approved"
//     ).length;
//     const pendingEvents = filteredEvents.filter(
//       (e) => e.status === "pending"
//     ).length;
//     const rejectedEvents = filteredEvents.filter(
//       (e) => e.status === "rejected"
//     ).length;
//     const totalAuthors = new Set(
//       filteredEvents.map((e) => e.createdBy?._id).filter(Boolean)
//     ).size;

//     const totalAttendees = filteredEvents.reduce(
//       (s, e) => s + (e.attendees?.length || 0),
//       0
//     );
//     const attendedCount = filteredEvents.reduce(
//       (s, e) => s + (e.attendees?.filter((a) => a.attended).length || 0),
//       0
//     );

//     const adStats = calculateAdRevenue(filteredAds);
//     const revenueByDay = calculateRevenueByDay(filteredEvents, timeRange);

//     const topEvents = [...filteredEvents]
//       .map((e) => ({
//         ...e,
//         revenue: e.attendees?.reduce((s, a) => s + (a.finalPrice || 0), 0) || 0,
//       }))
//       .sort((a, b) => b.revenue - a.revenue)
//       .slice(0, 5);

//     const recentEvents = [...filteredEvents]
//       .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//       .slice(0, 5);

//     return {
//       stats: {
//         totalEvents,
//         approvedEvents,
//         pendingEvents,
//         rejectedEvents,
//         totalAuthors,
//         totalAttendees,
//         attendedCount,
//         ...adStats,
//       },
//       topEvents,
//       recentEvents,
//       revenueByDay,
//       filteredAds,
//     };
//   }, [
//     reduxEvents,
//     reduxAds,
//     timeRange,
//     filterEventsByDateRange,
//     filterAdsByDateRange,
//     calculateAdRevenue,
//     calculateRevenueByDay,
//   ]);

//   useEffect(() => {
//     const fetch = async () => {
//       setLoading(true);
//       await Promise.all([
//         dispatch(getAllAdsAdmin()),
//         dispatch(getAllUsersForAdmin()),
//       ]);
//       setLoading(false);
//     };
//     fetch();
//   }, [dispatch]);

//   const isLoading = loading || usersLoading;

//   const getStatusBadge = (status) => {
//     const config =
//       {
//         approved: {
//           color: "bg-emerald-100 text-emerald-800 border-emerald-200",
//           icon: CheckCircle,
//         },
//         pending: {
//           color: "bg-amber-100 text-amber-800 border-amber-200",
//           icon: Clock,
//         },
//         rejected: {
//           color: "bg-rose-100 text-rose-800 border-rose-200",
//           icon: XCircle,
//         },
//       }[status] || config.pending;
//     const Icon = config.icon;
//     return (
//       <span
//         className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}
//       >
//         <Icon className="w-3 h-3" /> {status}
//       </span>
//     );
//   };

//   const getBannerUrl = (b) =>
//     `http://localhost:5000/uploads/event-banners/${b}`;
//   const getAdBannerUrl = (b) => (b ? `http://localhost:5000${b}` : null);
//   const formatDate = (d) =>
//     new Date(d).toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   const getAdPrice = (t) => (t === "premium" ? "₹1500" : "₹500");

//   const TopEventItem = ({ event, rank }) => {
//     const revenue = event.revenue || 0;
//     const attended = event.attendees?.filter((a) => a.attended).length || 0;
//     const total = event.attendees?.length || 0;
//     return (
//       <div
//         className={`flex items-center gap-3 p-3 rounded-lg ${
//           rank <= 3
//             ? "bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"
//             : "bg-gray-50"
//         }`}
//       >
//         <div className="w-10 h-10 rounded-full bg-white border shadow-sm overflow-hidden">
//           {event.banner ? (
//             <img
//               src={getBannerUrl(event.banner)}
//               alt=""
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <FileText className="w-5 h-5 text-gray-400 m-2.5" />
//           )}
//         </div>
//         <div className="flex-1">
//           <h4 className="font-medium text-sm line-clamp-1">{event.title}</h4>
//           <p className="text-xs text-gray-500">
//             {event.createdBy?.name || "Unknown"}
//           </p>
//         </div>
//         <div className="text-right">
//           <p className="font-bold text-green-600 text-sm">
//             ₹{revenue.toLocaleString()}
//           </p>
//           <p className="text-xs text-gray-500">
//             {attended}/{total} attended
//           </p>
//         </div>
//       </div>
//     );
//   };

//   const UpcomingEventItem = ({ event }) => {
//     const revenue =
//       event.attendees?.reduce((s, a) => s + (a.finalPrice || 0), 0) || 0;
//     const attended = event.attendees?.filter((a) => a.attended).length || 0;
//     return (
//       <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
//         <div className="flex items-center gap-3 flex-1">
//           <div className="w-10 h-10 rounded bg-gray-100 border overflow-hidden">
//             {event.banner ? (
//               <img
//                 src={getBannerUrl(event.banner)}
//                 alt=""
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <Calendar className="w-5 h-5 text-gray-400 m-2.5" />
//             )}
//           </div>
//           <div>
//             <p className="text-sm font-medium line-clamp-1">{event.title}</p>
//             <p className="text-xs text-gray-500">
//               {formatDate(event.eventDate || event.createdAt)}
//             </p>
//           </div>
//         </div>
//         <div className="text-right text-xs">
//           <p className="font-medium text-green-600">
//             ₹{revenue.toLocaleString()}
//           </p>
//           <p className="text-gray-500">{attended} attended</p>
//         </div>
//       </div>
//     );
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
//               <BarChart3 className="w-7 h-7 text-blue-600" />
//               Admin Dashboard
//             </h1>
//             <p className="text-gray-600 mt-1">
//               Track events, ads, and revenue in real-time
//             </p>
//           </div>
//           <div className="flex gap-3">
//             <select
//               value={timeRange}
//               onChange={(e) => setTimeRange(e.target.value)}
//               className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
//             >
//               <option value="week">Last 7 Days</option>
//               <option value="month">Last 30 Days</option>
//               <option value="all">All Time</option>
//             </select>
//             <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
//               <Sparkles className="w-5 h-5 text-blue-600" />
//               <span className="text-sm font-medium">
//                 {new Date().toLocaleDateString("en-US", {
//                   weekday: "long",
//                   month: "long",
//                   day: "numeric",
//                 })}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Main Charts Row */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <BusinessRevenueChart
//             data={processedData.revenueByDay}
//             title="Business Revenue"
//           />
//           <AdPerformanceChart ads={reduxAds} timeRange={timeRange} />
//         </div>

//         {/* Subscription + Other Cards */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-1">
//             <SubscriptionAnalytics users={users} />
//           </div>
//           <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Recent Events */}
//             <div className="bg-white rounded-xl border border-gray-200 p-5">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="font-semibold flex items-center gap-2">
//                   <Clock className="w-5 h-5 text-blue-600" /> Recent Events
//                 </h3>
//                 <NavLink
//                   to="/admin/events"
//                   className="text-xs text-blue-600 hover:underline"
//                 >
//                   View all
//                 </NavLink>
//               </div>
//               <div className="space-y-2 max-h-60 overflow-y-auto">
//                 {processedData.recentEvents.map((e) => (
//                   <UpcomingEventItem key={e._id} event={e} />
//                 ))}
//               </div>
//             </div>

//             {/* Event Status */}
//             <div className="bg-white rounded-xl border border-gray-200 p-5">
//               <h3 className="font-semibold mb-3">Event Status</h3>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="flex items-center gap-2">
//                     <CheckCircle className="w-4 h-4 text-green-500" /> Approved
//                   </span>{" "}
//                   <strong>{processedData.stats.approvedEvents}</strong>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="flex items-center gap-2">
//                     <Clock className="w-4 h-4 text-amber-500" /> Pending
//                   </span>{" "}
//                   <strong>{processedData.stats.pendingEvents}</strong>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="flex items-center gap-2">
//                     <XCircle className="w-4 h-4 text-red-500" /> Rejected
//                   </span>{" "}
//                   <strong>{processedData.stats.rejectedEvents}</strong>
//                 </div>
//                 <div className="pt-2 border-t flex justify-between text-sm">
//                   <span className="font-medium">Total</span>{" "}
//                   <strong className="text-blue-600">
//                     {processedData.stats.totalEvents}
//                   </strong>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Row */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <div className="bg-white rounded-xl border border-gray-200 p-5">
//             <h3 className="font-semibold mb-4 flex items-center gap-2">
//               <Target className="w-5 h-5 text-red-600" /> Top Events
//             </h3>
//             <div className="space-y-3">
//               {processedData.topEvents.map((e, i) => (
//                 <TopEventItem key={e._id} event={e} rank={i + 1} />
//               ))}
//             </div>
//           </div>

//           <div className="bg-white rounded-xl border border-gray-200 p-5">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="font-semibold flex items-center gap-2">
//                 <Megaphone className="w-5 h-5 text-purple-600" /> Recent Ads
//               </h3>
//               <NavLink
//                 to="/admin/ads"
//                 className="text-xs text-purple-600 hover:underline"
//               >
//                 View All
//               </NavLink>
//             </div>
//             <div className="space-y-3 max-h-64 overflow-y-auto">
//               {processedData.filteredAds.slice(0, 5).map((ad) => (
//                 <div
//                   key={ad._id}
//                   className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
//                 >
//                   <div className="w-12 h-12 rounded bg-gray-100 border overflow-hidden">
//                     {ad.banner ? (
//                       <img
//                         src={getAdBannerUrl(ad.banner)}
//                         alt=""
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <Megaphone className="w-6 h-6 text-gray-400 m-3" />
//                     )}
//                   </div>
//                   <div className="flex-1">
//                     <p className="font-medium text-sm line-clamp-1">
//                       {ad.title}
//                     </p>
//                     <div className="flex items-center gap-2 mt-1 text-xs">
//                       {getStatusBadge(ad.status)}
//                       <span className="text-gray-500 capitalize">
//                         {ad.adType}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="text-right text-xs">
//                     <p className="font-bold text-green-600">
//                       {getAdPrice(ad.adType)}
//                     </p>
//                     <p className="text-gray-500">{formatDate(ad.createdAt)}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getAllAdsAdmin } from "../../redux/slices/adSlice";
import { getAllUsersForAdmin } from "../../redux/slices/subscriptionSlice";
import {
  FileText,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  IndianRupee,
  User,
  Sparkles,
  ChevronRight,
  Megaphone,
  BarChart3,
  Eye,
  Target,
  Filter,
  RefreshCw,
  MousePointer,
  Zap,
  UserCheck,
  UserX,
  CreditCard,
  Package,
  Activity,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ──────────────────────  BUSINESS REVENUE CHART ────────────────────── */
const BusinessRevenueChart = ({ data, title }) => {
  const total = data.reduce((s, d) => s + d.value, 0);

  const chartData = data.map((d) => ({
    name: d.label.split(" ")[1],
    value: d.value,
    fullLabel: d.label,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm text-sm">
          <p className="font-medium">{payload[0].payload.fullLabel}</p>
          <p className="text-green-600 font-bold">
            ₹{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">Revenue Overview</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">
            ₹{total.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">Total Revenue</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#10b981", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revGradient)"
              dot={{ fill: "#fff", stroke: "#10b981", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 text-center text-sm">
        <div>
          <p className="text-2xl font-bold text-gray-900">{data.length}</p>
          <p className="text-xs text-gray-500">Days</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">
            ₹{Math.max(...data.map((d) => d.value)).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">Peak</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-600">
            ₹{Math.round(total / data.length).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">Avg/Day</p>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────  AD PERFORMANCE CHART (from reduxAds) ────────────────────── */
const AdPerformanceChart = ({ ads, timeRange }) => {
  const getDateRange = useCallback((range) => {
    const now = new Date();
    const start = new Date();
    switch (range) {
      case "day":
        start.setDate(now.getDate() - 1);
        break;
      case "week":
        start.setDate(now.getDate() - 7);
        break;
      case "month":
        start.setDate(now.getDate() - 30);
        break;
      case "all":
        start.setTime(0);
        break;
      default:
        start.setDate(now.getDate() - 7);
    }
    return { start, end: now };
  }, []);

  const adDataByDay = useMemo(() => {
    const { start } = getDateRange(timeRange);
    const days = [];
    const current = new Date(start);
    while (current <= new Date()) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days.map((day) => {
      const dayStr = day.toDateString();
      const dayAds = ads.filter((ad) => {
        const adDate = new Date(ad.createdAt).toDateString();
        return adDate === dayStr;
      });

      const clicks = dayAds.reduce((sum, ad) => {
        return (
          sum +
          (ad.clickEvents?.filter(
            (c) => new Date(c.clickedAt).toDateString() === dayStr
          ).length || 0)
        );
      }, 0);

      const views = dayAds.reduce((sum, ad) => sum + (ad.views || 0), 0);

      const label = day.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      return { label, clicks, views, fullLabel: label };
    });
  }, [ads, timeRange, getDateRange]);

  const totalClicks = adDataByDay.reduce((s, d) => s + d.clicks, 0);
  const totalViews = adDataByDay.reduce((s, d) => s + d.views, 0);
  const ctr =
    totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : 0;

  const chartData = adDataByDay.map((d) => ({
    name: d.label.split(" ")[1],
    clicks: d.clicks,
    views: d.views,
    fullLabel: d.fullLabel,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm text-sm">
          <p className="font-medium mb-1">{payload[0].payload.fullLabel}</p>
          <p className="text-purple-600">
            Clicks: <strong>{payload[0].value}</strong>
          </p>
          <p className="text-blue-600">
            Views: <strong>{payload[1].value}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-600" />
            Ad Performance
          </h3>
          <p className="text-sm text-gray-500">Clicks & Views Over Time</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">CTR</p>
          <p className="text-2xl font-bold text-purple-600">{ctr}%</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-xs">{value}</span>}
            />
            <Area
              type="monotone"
              dataKey="clicks"
              stroke="#a855f7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#clickGradient)"
              dot={{ fill: "#fff", stroke: "#a855f7", strokeWidth: 2, r: 4 }}
              name="Clicks"
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#viewGradient)"
              dot={{ fill: "#fff", stroke: "#3b82f6", strokeWidth: 2, r: 4 }}
              name="Views"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 text-center text-sm">
        <div>
          <p className="text-2xl font-bold text-purple-600">{totalClicks}</p>
          <p className="text-xs text-gray-500">Total Clicks</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">{totalViews}</p>
          <p className="text-xs text-gray-500">Total Views</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-600">
            {ads.filter((a) => a.status === "approved").length}
          </p>
          <p className="text-xs text-gray-500">Active Ads</p>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────  COMPACT SUBSCRIPTION CARD ────────────────────── */
const SubscriptionAnalytics = ({ users }) => {
  // Calculate total subscription revenue from all time (not just active subscriptions)
  const calculateTotalSubscriptionRevenue = useCallback((users) => {
    let totalRevenue = 0;

    users.forEach((user) => {
      // Check if user has subscription stats
      if (user.subscriptionStats && user.subscriptionStats.length > 0) {
        user.subscriptionStats.forEach((stat) => {
          // Include all completed payments regardless of current status
          if (stat.status === "completed" || stat.status === "active") {
            totalRevenue += stat.amount || 0;
          }
        });
      }

      // Also check for legacy subscription data
      if (user.subscription && user.subscription !== "basic") {
        const planAmounts = {
          premium: 1000,
          platinum: 2000,
        };
        // Add amount if this is a paid plan and we don't have stats
        if (!user.subscriptionStats || user.subscriptionStats.length === 0) {
          totalRevenue += planAmounts[user.subscription] || 0;
        }
      }
    });

    return totalRevenue;
  }, []);

  const stats = useMemo(() => {
    let active = 0,
      currentRevenue = 0;
    const plans = { basic: 0, premium: 0, platinum: 0 };
    const breakdown = {
      total: users.length,
      basic: 0,
      premium: 0,
      platinum: 0,
      active: 0,
    };

    users.forEach((u) => {
      if (u.subscription === "basic") breakdown.basic++;
      else if (u.subscription === "premium") breakdown.premium++;
      else if (u.subscription === "platinum") breakdown.platinum++;

      if (u.subscriptionStatus === "active" && u.subscription !== "basic")
        breakdown.active++;

      u.subscriptionStats?.forEach((s) => {
        if (s.status === "active") {
          active++;
          currentRevenue += s.amount;
          if (plans[s.plan] !== undefined) plans[s.plan]++;
        }
      });
    });

    const totalRevenue = calculateTotalSubscriptionRevenue(users);

    return {
      active,
      currentRevenue,
      totalRevenue,
      plans,
      breakdown,
    };
  }, [users, calculateTotalSubscriptionRevenue]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-5">
      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-purple-600" />
        Subscription Analytics
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <p className="text-xs font-medium text-purple-700">Active</p>
          <p className="text-xl font-bold text-purple-900">{stats.active}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-xs font-medium text-green-700">Total Revenue</p>
          <p className="text-xl font-bold text-green-900 flex items-center">
            <IndianRupee className="w-4 h-4 mr-1" />
            {stats.totalRevenue.toFixed(0)}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <p className="font-medium text-gray-700">Current Plan Distribution</p>
        {Object.entries(stats.plans).map(([plan, count]) => (
          <div key={plan} className="flex justify-between">
            <span className="capitalize text-gray-600">{plan}</span>
            <span className="font-medium">{count}</span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
        {stats.breakdown.total} users • {stats.breakdown.active} paying
      </div>
    </div>
  );
};

/* ──────────────────────  MAIN DASHBOARD ────────────────────── */
export function AdminDashboard() {
  const dispatch = useDispatch();
  const reduxEvents = useSelector((state) => state.events.allEvents) || [];
  const reduxAds = useSelector((state) => state.ads.allAds) || [];
  const users = useSelector((state) => state.subscriptions.allUsers) || [];
  const usersLoading = useSelector((state) => state.subscriptions.usersLoading);
  console.log(reduxAds);
  const [timeRange, setTimeRange] = useState("day"); // Default to 1 day
  const [loading, setLoading] = useState(true);

  const getDateRange = useCallback((range) => {
    const now = new Date();
    const start = new Date();
    switch (range) {
      case "day":
        start.setDate(now.getDate() - 1);
        break;
      case "week":
        start.setDate(now.getDate() - 7);
        break;
      case "month":
        start.setDate(now.getDate() - 30);
        break;
      case "all":
        start.setTime(0);
        break;
      default:
        start.setDate(now.getDate() - 1);
    }
    return { start, end: now };
  }, []);

  const filterEventsByDateRange = useCallback(
    (events, range) => {
      const { start, end } = getDateRange(range);
      return events.filter((e) => {
        const d = new Date(e.createdAt || e.date);
        return d >= start && d <= end;
      });
    },
    [getDateRange]
  );

  const filterAdsByDateRange = useCallback(
    (ads, range) => {
      const { start, end } = getDateRange(range);
      return ads.filter(
        (a) => new Date(a.createdAt) >= start && new Date(a.createdAt) <= end
      );
    },
    [getDateRange]
  );

  const calculateRevenueByDay = useCallback(
    (events, range) => {
      const { start } = getDateRange(range);
      const days = [];
      const current = new Date(start);
      while (current <= new Date()) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      return days.map((day) => {
        const dayEvents = events.filter(
          (e) =>
            new Date(e.createdAt || e.date).toDateString() ===
            day.toDateString()
        );
        const dailyRevenue = dayEvents.reduce((sum, e) => {
          return (
            sum +
            (e.attendees?.reduce((s, a) => s + (a.finalPrice || 0), 0) || 0)
          );
        }, 0);
        const label = day.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        return { label, value: dailyRevenue };
      });
    },
    [getDateRange]
  );

  const calculateAdRevenue = useCallback((ads) => {
    const premium = ads.filter(
      (a) => a.adType === "premium" && a.status === "approved"
    ).length;
    const standard = ads.filter(
      (a) => a.adType === "standard" && a.status === "approved"
    ).length;
    const clicks = ads.reduce(
      (s, a) => s + (a.clickEvents?.length || a.clicks || 0),
      0
    );
    const views = ads.reduce((s, a) => s + (a.views || 0), 0);
    const revenue = premium * 1500 + standard * 500;
    const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : 0;
    return {
      totalRevenue: revenue,
      totalClicks: clicks,
      totalViews: views,
      ctr,
    };
  }, []);

  const processedData = useMemo(() => {
    const filteredEvents = filterEventsByDateRange(reduxEvents, timeRange);
    const filteredAds = filterAdsByDateRange(reduxAds, timeRange);

    const totalEvents = filteredEvents.length;
    const approvedEvents = filteredEvents.filter(
      (e) => e.status === "approved"
    ).length;
    const pendingEvents = filteredEvents.filter(
      (e) => e.status === "pending"
    ).length;
    const rejectedEvents = filteredEvents.filter(
      (e) => e.status === "rejected"
    ).length;
    const totalAuthors = new Set(
      filteredEvents.map((e) => e.createdBy?._id).filter(Boolean)
    ).size;

    const totalAttendees = filteredEvents.reduce(
      (s, e) => s + (e.attendees?.length || 0),
      0
    );
    const attendedCount = filteredEvents.reduce(
      (s, e) => s + (e.attendees?.filter((a) => a.attended).length || 0),
      0
    );

    const adStats = calculateAdRevenue(filteredAds);
    const revenueByDay = calculateRevenueByDay(filteredEvents, timeRange);

    const topEvents = [...filteredEvents]
      .map((e) => ({
        ...e,
        revenue: e.attendees?.reduce((s, a) => s + (a.finalPrice || 0), 0) || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const recentEvents = [...filteredEvents]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return {
      stats: {
        totalEvents,
        approvedEvents,
        pendingEvents,
        rejectedEvents,
        totalAuthors,
        totalAttendees,
        attendedCount,
        ...adStats,
      },
      topEvents,
      recentEvents,
      revenueByDay,
      filteredAds,
    };
  }, [
    reduxEvents,
    reduxAds,
    timeRange,
    filterEventsByDateRange,
    filterAdsByDateRange,
    calculateAdRevenue,
    calculateRevenueByDay,
  ]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      await Promise.all([
        dispatch(getAllAdsAdmin()),
        dispatch(getAllUsersForAdmin()),
      ]);
      setLoading(false);
    };
    fetch();
  }, [dispatch]);

  const isLoading = loading || usersLoading;

  const getStatusBadge = (status) => {
    const config =
      {
        approved: {
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: CheckCircle,
        },
        pending: {
          color: "bg-amber-100 text-amber-800 border-amber-200",
          icon: Clock,
        },
        rejected: {
          color: "bg-rose-100 text-rose-800 border-rose-200",
          icon: XCircle,
        },
      }[status] || config.pending;
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}
      >
        <Icon className="w-3 h-3" /> {status}
      </span>
    );
  };

  const getBannerUrl = (b) =>
    `http://localhost:5000/uploads/event-banners/${b}`;
  const getAdBannerUrl = (b) => (b ? `http://localhost:5000${b}` : null);
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const getAdPrice = (t) => (t === "premium" ? "₹1500" : "₹500");

  const TopEventItem = ({ event, rank }) => {
    const revenue = event.revenue || 0;
    const attended = event.attendees?.filter((a) => a.attended).length || 0;
    const total = event.attendees?.length || 0;
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg ${
          rank <= 3
            ? "bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"
            : "bg-gray-50"
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-white border shadow-sm overflow-hidden">
          {event.banner ? (
            <img
              src={getBannerUrl(event.banner)}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <FileText className="w-5 h-5 text-gray-400 m-2.5" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm line-clamp-1">{event.title}</h4>
          <p className="text-xs text-gray-500">
            {event.createdBy?.name || "Unknown"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-green-600 text-sm">
            ₹{revenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            {attended}/{total} attended
          </p>
        </div>
      </div>
    );
  };

  const UpcomingEventItem = ({ event }) => {
    const revenue =
      event.attendees?.reduce((s, a) => s + (a.finalPrice || 0), 0) || 0;
    const attended = event.attendees?.filter((a) => a.attended).length || 0;
    return (
      <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded bg-gray-100 border overflow-hidden">
            {event.banner ? (
              <img
                src={getBannerUrl(event.banner)}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Calendar className="w-5 h-5 text-gray-400 m-2.5" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium line-clamp-1">{event.title}</p>
            <p className="text-xs text-gray-500">
              {formatDate(event.eventDate || event.createdAt)}
            </p>
          </div>
        </div>
        <div className="text-right text-xs">
          <p className="font-medium text-green-600">
            ₹{revenue.toLocaleString()}
          </p>
          <p className="text-gray-500">{attended} attended</p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-blue-600" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Track events, ads, and revenue in real-time
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="day">Last 1 Day</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BusinessRevenueChart
            data={processedData.revenueByDay}
            title="Business Revenue"
          />
          <AdPerformanceChart ads={reduxAds} timeRange={timeRange} />
        </div>

        {/* Subscription + Other Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <SubscriptionAnalytics users={users} />
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Events */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" /> Recent Events
                </h3>
                <NavLink
                  to="/admin/events"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View all
                </NavLink>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {processedData.recentEvents.map((e) => (
                  <UpcomingEventItem key={e._id} event={e} />
                ))}
              </div>
            </div>

            {/* Event Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold mb-3">Event Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Approved
                  </span>{" "}
                  <strong>{processedData.stats.approvedEvents}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" /> Pending
                  </span>{" "}
                  <strong>{processedData.stats.pendingEvents}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" /> Rejected
                  </span>{" "}
                  <strong>{processedData.stats.rejectedEvents}</strong>
                </div>
                <div className="pt-2 border-t flex justify-between text-sm">
                  <span className="font-medium">Total</span>{" "}
                  <strong className="text-blue-600">
                    {processedData.stats.totalEvents}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-red-600" /> Top Events
            </h3>
            <div className="space-y-3">
              {processedData.topEvents.map((e, i) => (
                <TopEventItem key={e._id} event={e} rank={i + 1} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-purple-600" /> Recent Ads
              </h3>
              <NavLink
                to="/admin/ads"
                className="text-xs text-purple-600 hover:underline"
              >
                View All
              </NavLink>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {processedData.filteredAds.slice(0, 5).map((ad) => (
                <div
                  key={ad._id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="w-12 h-12 rounded bg-gray-100 border overflow-hidden">
                    {ad.banner ? (
                      <img
                        src={getAdBannerUrl(ad.banner)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Megaphone className="w-6 h-6 text-gray-400 m-3" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">
                      {ad.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      {getStatusBadge(ad.status)}
                      <span className="text-gray-500 capitalize">
                        {ad.adType}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold text-green-600">
                      {getAdPrice(ad.adType)}
                    </p>
                    <p className="text-gray-500">{formatDate(ad.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

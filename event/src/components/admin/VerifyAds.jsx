// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   CheckCircle,
//   XCircle,
//   Clock,
//   Shield,
//   AlertTriangle,
//   X,
//   Image as ImageIcon,
//   Megaphone,
//   Search,
//   Filter,
//   User,
//   Calendar,
//   ExternalLink,
//   ThumbsUp,
//   Eye,
//   BarChart3,
//   ChevronDown,
//   MoreVertical,
//   IndianRupee,
// } from "lucide-react";
// import {
//   getAllAdsAdmin,
//   updateAdStatus,
//   resetAdState,
// } from "../../redux/slices/adSlice";
// import { toast } from "react-toastify";

// export function VerifyAds() {
//   const [currentAd, setCurrentAd] = useState(null);
//   const [showApproveModal, setShowApproveModal] = useState(false);
//   const [showRejectModal, setShowRejectModal] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("pending");
//   const [rejectionReason, setRejectionReason] = useState("");
//   const [expandedFilters, setExpandedFilters] = useState(false);

//   const dispatch = useDispatch();
//   const { allAds, allAdsLoading, updating, error } = useSelector(
//     (state) => state.ads
//   );

//   // Filter ads based on search term and status filter
//   const filteredAds = allAds.filter((ad) => {
//     const matchesSearch =
//       ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       ad.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       ad.userName?.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesStatus = statusFilter === "all" || ad.status === statusFilter;

//     return matchesSearch && matchesStatus;
//   });

//   const pendingAds = filteredAds.filter((ad) => ad.status === "pending");
//   const approvedAds = filteredAds.filter((ad) => ad.status === "approved");
//   const rejectedAds = filteredAds.filter((ad) => ad.status === "rejected");

//   useEffect(() => {
//     dispatch(getAllAdsAdmin());
//   }, [dispatch]);

//   useEffect(() => {
//     if (error) {
//       toast.error(error);
//       dispatch(resetAdState());
//     }
//   }, [error, dispatch]);

//   const openApproveModal = (ad) => {
//     setCurrentAd(ad);
//     setShowApproveModal(true);
//   };

//   const openRejectModal = (ad) => {
//     setCurrentAd(ad);
//     setRejectionReason("");
//     setShowRejectModal(true);
//   };

//   const handleApprove = () => {
//     if (currentAd) {
//       dispatch(updateAdStatus({ id: currentAd._id, status: "approved" }))
//         .unwrap()
//         .then(() => {
//           toast.success(`Ad "${currentAd.title}" approved successfully!`);
//           setShowApproveModal(false);
//           setCurrentAd(null);
//         })
//         .catch((error) => {
//           toast.error(`Failed to approve ad: ${error}`);
//         });
//     }
//   };

//   const handleReject = () => {
//     if (currentAd) {
//       dispatch(updateAdStatus({ id: currentAd._id, status: "rejected" }))
//         .unwrap()
//         .then(() => {
//           toast.success(`Ad "${currentAd.title}" rejected successfully!`);
//           setShowRejectModal(false);
//           setCurrentAd(null);
//           setRejectionReason("");
//         })
//         .catch((error) => {
//           toast.error(`Failed to reject ad: ${error}`);
//         });
//     }
//   };

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

//   const getAdTypeColor = (adType) => {
//     switch (adType) {
//       case "premium":
//         return "bg-purple-100 text-purple-800 border-purple-200";
//       case "standard":
//         return "bg-blue-100 text-blue-800 border-blue-200";
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const getBannerUrl = (banner) => {
//     return banner ? `http://localhost:5000${banner}` : null;
//   };

//   if (allAdsLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-slate-700">Loading ads...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
//       <div className="max-w-7xl mx-auto space-y-8">
//         {/* Header Section */}
//         <div className="text-center space-y-4 animate-fade-in">
//           <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//             Ad Verification
//           </h1>
//           <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
//             Review and manage advertisement submissions
//           </p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
//             <div className="flex items-center justify-between mb-4">
//               <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md">
//                 <Megaphone className="w-5 h-5 text-white" />
//               </div>
//               <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
//                 {allAds.length}
//               </span>
//             </div>
//             <h3 className="text-base font-semibold text-slate-700">
//               Total Ads
//             </h3>
//           </div>

//           <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
//             <div className="flex items-center justify-between mb-4">
//               <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-md">
//                 <Clock className="w-5 h-5 text-white" />
//               </div>
//               <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
//                 {pendingAds.length}
//               </span>
//             </div>
//             <h3 className="text-base font-semibold text-slate-700">
//               Pending Review
//             </h3>
//           </div>

//           <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
//             <div className="flex items-center justify-between mb-4">
//               <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg shadow-md">
//                 <CheckCircle className="w-5 h-5 text-white" />
//               </div>
//               <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
//                 {approvedAds.length}
//               </span>
//             </div>
//             <h3 className="text-base font-semibold text-slate-700">Approved</h3>
//           </div>

//           <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
//             <div className="flex items-center justify-between mb-4">
//               <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md">
//                 <BarChart3 className="w-5 h-5 text-white" />
//               </div>
//               <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//                 {allAds.reduce((sum, ad) => sum + (ad.views || 0), 0)}
//               </span>
//             </div>
//             <h3 className="text-base font-semibold text-slate-700">
//               Total Views
//             </h3>
//           </div>
//         </div>

//         {/* Search and Filter Section */}
//         <div className="bg-white/90 backdrop-blur-xl rounded-xl p-5 border border-white/20 shadow-lg">
//           <div className="flex flex-col lg:flex-row gap-4 items-center">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Search ads by title, user name, or email..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 text-black"
//               />
//             </div>

//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setExpandedFilters(!expandedFilters)}
//                 className="flex items-center px-3 py-2 bg-white/80 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
//               >
//                 <Filter className="w-4 h-4 mr-1" />
//                 Filters
//                 {expandedFilters ? (
//                   <ChevronDown className="w-4 h-4 ml-1" />
//                 ) : (
//                   <ChevronDown className="w-4 h-4 ml-1 transform rotate-180" />
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Expanded Filters */}
//           {expandedFilters && (
//             <div className="mt-4 pt-4 border-t border-slate-100">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Status
//                   </label>
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="w-full px-3 py-2 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
//                   >
//                     <option value="all">All Status</option>
//                     <option value="pending">Pending</option>
//                     <option value="approved">Approved</option>
//                     <option value="rejected">Rejected</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* All Caught Up - No pending ads */}
//         {pendingAds.length === 0 && statusFilter === "pending" && (
//           <div className="bg-white/90 backdrop-blur-xl rounded-xl p-12 border border-white/20 shadow-lg text-center">
//             <div className="w-20 h-20 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <CheckCircle className="w-8 h-8 text-green-600" />
//             </div>
//             <h3 className="text-xl font-bold text-slate-700 mb-2">
//               All caught up!
//             </h3>
//             <p className="text-slate-500">
//               No ads pending verification. Everything is approved and ready to
//               go!
//             </p>
//           </div>
//         )}

//         {/* Ads List */}
//         {filteredAds.length > 0 && (
//           <div className="space-y-4">
//             {filteredAds.map((ad, index) => (
//               <div
//                 key={ad._id}
//                 className="group bg-white/90 backdrop-blur-xl rounded-xl overflow-hidden border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
//                 style={{ animationDelay: `${index * 100}ms` }}
//               >
//                 <div className="flex flex-col md:flex-row">
//                   {/* Banner */}
//                   <div className="md:w-48 h-40 md:h-auto relative overflow-hidden">
//                     {getBannerUrl(ad.banner) ? (
//                       <img
//                         src={getBannerUrl(ad.banner)}
//                         alt={ad.title}
//                         className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                       />
//                     ) : (
//                       <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
//                         <ImageIcon className="w-10 h-10 text-indigo-300" />
//                       </div>
//                     )}
//                     <div className="absolute top-3 right-3">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
//                           ad.status
//                         )}`}
//                       >
//                         {(ad.status || "unknown").charAt(0).toUpperCase() +
//                           (ad.status || "unknown").slice(1)}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Content */}
//                   <div className="flex-1 p-4 space-y-3">
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-300">
//                           {ad.title}
//                         </h3>
//                         <div className="flex items-center mt-1">
//                           <span
//                             className={`px-2 py-1 rounded-full text-xs font-medium border ${getAdTypeColor(
//                               ad.adType
//                             )}`}
//                           >
//                             {(ad.adType || "standard").charAt(0).toUpperCase() +
//                               (ad.adType || "standard").slice(1)}
//                           </span>
//                         </div>
//                         <a
//                           href={ad.link}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm mt-2 group/link"
//                         >
//                           {ad.link.replace(/^https?:\/\//, "")}
//                           <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition" />
//                         </a>
//                       </div>
//                       <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 ml-2">
//                         <MoreVertical className="w-4 h-4" />
//                       </button>
//                     </div>

//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
//                       <div className="flex items-center text-slate-600">
//                         <User className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
//                         <span className="truncate">{ad.userName}</span>
//                       </div>
//                       <div className="flex items-center text-slate-600">
//                         <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
//                         <span>{formatDate(ad.createdAt)}</span>
//                       </div>
//                       <div className="flex items-center text-slate-600">
//                         <Megaphone className="w-3.5 h-3.5 mr-1.5 text-green-500" />
//                         <span className="capitalize">
//                           {ad.position?.replace("homepage-", "")}
//                         </span>
//                       </div>
//                       <div className="flex items-center text-slate-600">
//                         <IndianRupee className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
//                         <span>{ad.adType === "premium" ? "500" : "200"}</span>
//                       </div>
//                     </div>

//                     {/* Actions */}
//                     {ad.status === "pending" && (
//                       <div className="flex gap-2 pt-2">
//                         <button
//                           onClick={() => openRejectModal(ad)}
//                           disabled={updating}
//                           className="flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg disabled:opacity-50"
//                         >
//                           <XCircle className="w-3.5 h-3.5 mr-1.5" />
//                           Reject
//                         </button>
//                         <button
//                           onClick={() => openApproveModal(ad)}
//                           disabled={updating}
//                           className="flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg disabled:opacity-50"
//                         >
//                           <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
//                           Approve
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* No results message */}
//         {filteredAds.length === 0 && statusFilter !== "pending" && (
//           <div className="bg-white/90 backdrop-blur-xl rounded-xl p-12 border border-white/20 shadow-lg text-center">
//             <div className="w-20 h-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Search className="w-8 h-8 text-slate-500" />
//             </div>
//             <h3 className="text-xl font-bold text-slate-700 mb-2">
//               No ads found
//             </h3>
//             <p className="text-slate-500">
//               {searchTerm || statusFilter !== "all"
//                 ? "Try adjusting your search or filters"
//                 : "No ads have been submitted yet"}
//             </p>
//           </div>
//         )}

//         {/* Approve Modal */}
//         {showApproveModal && currentAd && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
//               <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6">
//                 <div className="flex justify-between items-center">
//                   <div className="flex items-center gap-3">
//                     <Shield className="w-6 h-6 text-white" />
//                     <h3 className="text-xl font-bold text-white">
//                       Confirm Approval
//                     </h3>
//                   </div>
//                   <button
//                     onClick={() => setShowApproveModal(false)}
//                     className="text-white hover:text-gray-200 transition-colors cursor-pointer p-1 hover:bg-white/10 rounded-full"
//                   >
//                     <X className="w-6 h-6" />
//                   </button>
//                 </div>
//               </div>
//               <div className="p-6 space-y-6">
//                 <div className="text-center">
//                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <ThumbsUp className="w-8 h-8 text-green-600" />
//                   </div>
//                   <p className="text-slate-600">
//                     Are you sure you want to approve{" "}
//                     <strong>"{currentAd.title}"</strong>?
//                   </p>
//                   <p className="text-sm text-slate-500 mt-2">
//                     This ad will be visible to all users on the website.
//                   </p>
//                 </div>
//                 <div className="flex gap-3 pt-4">
//                   <button
//                     onClick={() => setShowApproveModal(false)}
//                     className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
//                     disabled={updating}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleApprove}
//                     className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
//                     disabled={updating}
//                   >
//                     {updating ? (
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                     ) : (
//                       <CheckCircle className="w-5 h-5" />
//                     )}
//                     Confirm Approval
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Reject Modal */}
//         {showRejectModal && currentAd && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
//               <div className="bg-gradient-to-r from-rose-500 to-red-600 p-6">
//                 <div className="flex justify-between items-center">
//                   <div className="flex items-center gap-3">
//                     <AlertTriangle className="w-6 h-6 text-white" />
//                     <h3 className="text-xl font-bold text-white">
//                       Confirm Rejection
//                     </h3>
//                   </div>
//                   <button
//                     onClick={() => setShowRejectModal(false)}
//                     className="text-white hover:text-gray-200 transition-colors cursor-pointer p-1 hover:bg-white/10 rounded-full"
//                   >
//                     <X className="w-6 h-6" />
//                   </button>
//                 </div>
//               </div>
//               <div className="p-6 space-y-6">
//                 <div className="text-center">
//                   <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <XCircle className="w-8 h-8 text-red-600" />
//                   </div>
//                   <p className="text-slate-600">
//                     Are you sure you want to reject{" "}
//                     <strong>"{currentAd.title}"</strong>?
//                   </p>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Reason for rejection (optional):
//                   </label>
//                   <textarea
//                     value={rejectionReason}
//                     onChange={(e) => setRejectionReason(e.target.value)}
//                     placeholder="Provide reason for rejection..."
//                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-white/80"
//                     rows="3"
//                   />
//                 </div>

//                 <div className="flex gap-3 pt-4">
//                   <button
//                     onClick={() => setShowRejectModal(false)}
//                     className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
//                     disabled={updating}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleReject}
//                     className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg font-medium hover:from-rose-600 hover:to-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
//                     disabled={updating}
//                   >
//                     {updating ? (
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                     ) : (
//                       <XCircle className="w-5 h-5" />
//                     )}
//                     Confirm Rejection
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner"; // Changed from react-toastify
import {
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  AlertTriangle,
  X,
  Image as ImageIcon,
  Megaphone,
  Search,
  Filter,
  User,
  Calendar,
  ExternalLink,
  ThumbsUp,
  Eye,
  BarChart3,
  ChevronDown,
  MoreVertical,
  IndianRupee,
} from "lucide-react";
import {
  getAllAdsAdmin,
  updateAdStatus,
  resetAdState,
} from "../../redux/slices/adSlice";

export function VerifyAds() {
  const [currentAd, setCurrentAd] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [expandedFilters, setExpandedFilters] = useState(false);

  const dispatch = useDispatch();
  const { allAds, allAdsLoading, updating, error } = useSelector(
    (state) => state.ads
  );

  // Filter ads based on search term and status filter
  const filteredAds = allAds.filter((ad) => {
    const matchesSearch =
      ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.userName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || ad.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingAds = filteredAds.filter((ad) => ad.status === "pending");
  const approvedAds = filteredAds.filter((ad) => ad.status === "approved");
  const rejectedAds = filteredAds.filter((ad) => ad.status === "rejected");

  useEffect(() => {
    dispatch(getAllAdsAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetAdState());
    }
  }, [error, dispatch]);

  const openApproveModal = (ad) => {
    setCurrentAd(ad);
    setShowApproveModal(true);
  };

  const openRejectModal = (ad) => {
    setCurrentAd(ad);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleApprove = () => {
    if (currentAd) {
      dispatch(updateAdStatus({ id: currentAd._id, status: "approved" }))
        .unwrap()
        .then(() => {
          toast.success(`Ad "${currentAd.title}" approved successfully!`, {
            description: "The ad is now live and visible to users.",
            duration: 4000,
          });
          setShowApproveModal(false);
          setCurrentAd(null);
        })
        .catch((error) => {
          toast.error(`Failed to approve ad`, {
            description: error,
            duration: 5000,
          });
        });
    }
  };

  const handleReject = () => {
    if (currentAd) {
      dispatch(updateAdStatus({ id: currentAd._id, status: "rejected" }))
        .unwrap()
        .then(() => {
          toast.success(`Ad "${currentAd.title}" rejected successfully!`, {
            description: rejectionReason || "Ad has been rejected.",
            duration: 4000,
          });
          setShowRejectModal(false);
          setCurrentAd(null);
          setRejectionReason("");
        })
        .catch((error) => {
          toast.error(`Failed to reject ad`, {
            description: error,
            duration: 5000,
          });
        });
    }
  };

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

  const getAdTypeColor = (adType) => {
    switch (adType) {
      case "premium":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "standard":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getBannerUrl = (banner) => {
    return banner ? `http://localhost:5000${banner}` : null;
  };

  if (allAdsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-700">Loading ads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Ad Verification
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Review and manage advertisement submissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {allAds.length}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-700">
              Total Ads
            </h3>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-md">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {pendingAds.length}
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
                {approvedAds.length}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-700">Approved</h3>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {allAds.reduce((sum, ad) => sum + (ad.views || 0), 0)}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-700">
              Total Views
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
                placeholder="Search ads by title, user name, or email..."
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

        {/* All Caught Up - No pending ads */}
        {pendingAds.length === 0 && statusFilter === "pending" && (
          <div className="bg-white/90 backdrop-blur-xl rounded-xl p-12 border border-white/20 shadow-lg text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              All caught up!
            </h3>
            <p className="text-slate-500">
              No ads pending verification. Everything is approved and ready to
              go!
            </p>
          </div>
        )}

        {/* Ads List */}
        {filteredAds.length > 0 && (
          <div className="space-y-4">
            {filteredAds.map((ad, index) => (
              <div
                key={ad._id}
                className="group bg-white/90 backdrop-blur-xl rounded-xl overflow-hidden border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Banner */}
                  <div className="md:w-48 h-40 md:h-auto relative overflow-hidden">
                    {getBannerUrl(ad.banner) ? (
                      <img
                        src={getBannerUrl(ad.banner)}
                        alt={ad.title}
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
                          ad.status
                        )}`}
                      >
                        {(ad.status || "unknown").charAt(0).toUpperCase() +
                          (ad.status || "unknown").slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-300">
                          {ad.title}
                        </h3>
                        <div className="flex items-center mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getAdTypeColor(
                              ad.adType
                            )}`}
                          >
                            {(ad.adType || "standard").charAt(0).toUpperCase() +
                              (ad.adType || "standard").slice(1)}
                          </span>
                        </div>
                        <a
                          href={ad.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm mt-2 group/link"
                        >
                          {ad.link.replace(/^https?:\/\//, "")}
                          <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition" />
                        </a>
                      </div>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 ml-2">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="flex items-center text-slate-600">
                        <User className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                        <span className="truncate">{ad.userName}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                        <span>{formatDate(ad.createdAt)}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Megaphone className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                        <span className="capitalize">
                          {ad.position?.replace("homepage-", "")}
                        </span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <IndianRupee className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                        <span>{ad.adType === "premium" ? "500" : "200"}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {ad.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => openRejectModal(ad)}
                          disabled={updating}
                          className="flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1.5" />
                          Reject
                        </button>
                        <button
                          onClick={() => openApproveModal(ad)}
                          disabled={updating}
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

        {/* No results message */}
        {filteredAds.length === 0 && statusFilter !== "pending" && (
          <div className="bg-white/90 backdrop-blur-xl rounded-xl p-12 border border-white/20 shadow-lg text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              No ads found
            </h3>
            <p className="text-slate-500">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No ads have been submitted yet"}
            </p>
          </div>
        )}

        {/* Approve Modal */}
        {showApproveModal && currentAd && (
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
                    Are you sure you want to approve{" "}
                    <strong>"{currentAd.title}"</strong>?
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    This ad will be visible to all users on the website.
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={updating}
                  >
                    {updating ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Confirm Approval
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && currentAd && (
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
                    Are you sure you want to reject{" "}
                    <strong>"{currentAd.title}"</strong>?
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for rejection (optional):
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide reason for rejection..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-white/80"
                    rows="3"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg font-medium hover:from-rose-600 hover:to-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={updating}
                  >
                    {updating ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    Confirm Rejection
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

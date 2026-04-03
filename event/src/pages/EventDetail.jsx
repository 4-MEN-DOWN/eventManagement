// import { useParams, useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { format } from "date-fns";
// import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import {
//   Calendar,
//   MapPin,
//   DollarSign,
//   Users,
//   Tag,
//   Clock,
//   ArrowLeft,
//   Image,
//   ZoomIn,
//   X,
//   CreditCard,
//   Plus,
//   Minus,
//   Ticket,
//   Check,
//   Shield,
//   Heart,
//   Share2,
//   Bookmark,
//   Edit3,
//   User,
//   Info,
//   Lock,
//   Star,
//   MessageCircle,
//   Phone,
//   Mail,
//   IndianRupee,
//   ChevronRight,
//   Eye,
//   Map,
//   Navigation,
//   CalendarDays,
//   Sparkles,
//   BadgeCheck,
//   Crown,
//   UserPlus,
//   AlertCircle,
//   Zap,
//   ArrowUpRight,
// } from "lucide-react";
// import { useState, useEffect, useRef } from "react";
// import CryptoJS from "crypto-js";
// import { toast } from "react-toastify";
// import {
//   addToEventsToAttendAsync,
//   getMyEventsAsync,
//   addToWatchlistAsync,
//   removeFromWatchlistAsync,
//   getAvailableSeatsAsync,
// } from "../redux/slices/eventSlice";
// import { getSubscriptionDetails } from "../redux/slices/subscriptionSlice";
// import { MessageDialog } from "../components/MessageDialogue";
// import GeoCheckIn from "../components/GeoCheckIn";

// export function EventDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [eventData, setEventData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [showZoomModal, setShowZoomModal] = useState(false);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [showSeatSelectionModal, setShowSeatSelectionModal] = useState(false);
//   const [paymentProcessing, setPaymentProcessing] = useState(false);
//   const [ticketQuantity, setTicketQuantity] = useState(1);
//   const [activeTab, setActiveTab] = useState("details");
//   const [showMessageDialog, setShowMessageDialog] = useState(false);
//   const [selectedSeats, setSelectedSeats] = useState([]);
//   const [availableSeats, setAvailableSeats] = useState(null);
//   const [seatPricing, setSeatPricing] = useState(null);
//   const [loadingSeats, setLoadingSeats] = useState(false);
//   const [lastTransactionId, setLastTransactionId] = useState(null);
//   const [eventLimitExceeded, setEventLimitExceeded] = useState(false);
//   const [userEventLimit, setUserEventLimit] = useState(0);
//   const [usedEventSlots, setUsedEventSlots] = useState(0);

//   const registrationRef = useRef(null);

//   // Redux state
//   const events = useSelector((state) => state.events.allEvents);
//   const user = useSelector((state) => state.auth.user);
//   const eventsToAttend = useSelector((state) => state.events.eventsToAttend);
//   const watchlist = useSelector((state) => state.events.watchlist);
//   const loadingEvents = useSelector((state) => state.events.loadingEvents);
//   const subscription = useSelector((state) => state.subscriptions.subscription);
//   console.log(subscription);
//   // Check if user is already registered for this event
//   const isRegistered = eventsToAttend?.some(
//     (ticket) => ticket.event?._id === id
//   );

//   const isEventInWatchlist = watchlist.some((event) => event._id === id);
//   const [checkedIn, setCheckedIn] = useState(false);

//   const handleCheckInSuccess = () => setCheckedIn(true);

//   const esewaConfig = {
//     merchantId: "EPAYTEST",
//     baseUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
//     successUrl: `${
//       window.location.origin
//     }/payment-success?action=addToEventsToAttend&eventId=${id}&quantity=${ticketQuantity}&selectedSeats=${encodeURIComponent(
//       JSON.stringify(selectedSeats)
//     )}`,
//     failureUrl: `${window.location.origin}/payment-failure?action=addToEventsToAttend`,
//     secretKey: "8gBm/:&EnhH.1/q",
//   };

//   const formatTime = (time) => {
//     if (!time) return "";
//     const [hours, minutes] = time.split(":").map(Number);
//     const ampm = hours >= 12 ? "PM" : "AM";
//     const formattedHours = hours % 12 || 12;
//     return `${formattedHours}:${String(minutes).padStart(2, "0")} ${ampm}`;
//   };

//   // Calculate user's event limit based on subscription
//   useEffect(() => {
//     if (subscription) {
//       const planLimits = {
//         basic: 1,
//         premium: 3,
//         platinum: 5,
//       };

//       const userPlan = subscription.plan?.toLowerCase() || "basic";
//       const limit = planLimits[userPlan] || 1;
//       setUserEventLimit(limit);

//       // Calculate used event slots
//       const usedSlots = eventsToAttend?.length || 0;
//       setUsedEventSlots(usedSlots);

//       // Check if user has reached their event limit
//       if (usedSlots >= limit && !isRegistered) {
//         setEventLimitExceeded(true);
//       } else {
//         setEventLimitExceeded(false);
//       }
//     } else {
//       // Default to basic plan if no subscription
//       setUserEventLimit(1);
//       const usedSlots = eventsToAttend?.length || 0;
//       setUsedEventSlots(usedSlots);

//       if (usedSlots >= 1 && !isRegistered) {
//         setEventLimitExceeded(true);
//       } else {
//         setEventLimitExceeded(false);
//       }
//     }
//   }, [subscription, eventsToAttend, isRegistered]);

//   useEffect(() => {
//     if (user) {
//       dispatch(getMyEventsAsync());
//       dispatch(getSubscriptionDetails());
//     }
//   }, [dispatch, user]);

//   useEffect(() => {
//     if (events && events.length > 0) {
//       const foundEvent = events.find((event) => event._id === id);
//       if (foundEvent) {
//         setEventData(foundEvent);
//         if (foundEvent.seatPricing) {
//           setSeatPricing({
//             front: foundEvent.price + (foundEvent.seatPricing.front || 0),
//             middle: foundEvent.price + (foundEvent.seatPricing.middle || 0),
//             last: foundEvent.price + (foundEvent.seatPricing.last || 0),
//           });
//         } else {
//           setSeatPricing({
//             front: foundEvent.price,
//             middle: foundEvent.price,
//             last: foundEvent.price,
//           });
//         }
//       }
//       setLoading(false);
//     }
//   }, [events, id]);

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "approved":
//         return "bg-gradient-to-r from-emerald-500 to-green-500 text-white";
//       case "pending":
//         return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
//       case "rejected":
//         return "bg-gradient-to-r from-rose-500 to-pink-500 text-white";
//       default:
//         return "bg-gradient-to-r from-slate-500 to-gray-500 text-white";
//     }
//   };

//   const getCategoryColor = (category) => {
//     const colors = {
//       technology: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
//       music: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
//       food: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
//       arts: "bg-gradient-to-r from-pink-500 to-rose-500 text-white",
//       business: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white",
//       wellness: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
//     };
//     return (
//       colors[category] ||
//       "bg-gradient-to-r from-slate-500 to-gray-500 text-white"
//     );
//   };

//   const getCategoryIcon = (category) => {
//     const icons = {
//       technology: "💻",
//       music: "🎵",
//       food: "🍕",
//       arts: "🎨",
//       business: "💼",
//       wellness: "🧘",
//     };
//     return icons[category] || "🎯";
//   };

//   const calculateTotalAmount = () => {
//     if (!selectedSeats || !Array.isArray(selectedSeats)) return 0;

//     const total = selectedSeats.reduce((total, seat) => {
//       const seatPrice = Number(seat.seatPrice) || 0;
//       return total + seatPrice;
//     }, 0);

//     return Math.max(0, total);
//   };

//   const calculateTotalAttendees = (attendees) =>
//     attendees && Array.isArray(attendees) ? attendees.length : 0;

//   // Get subscription plan info
//   const getSubscriptionPlanInfo = () => {
//     if (!subscription) {
//       return {
//         name: "Basic",
//         icon: Star,
//         color: "from-gray-500 to-gray-700",
//         limit: 1,
//         used: eventsToAttend?.length || 0,
//       };
//     }

//     const plan = subscription.plan?.toLowerCase();
//     const usedEvents = eventsToAttend?.length || 0;

//     switch (plan) {
//       case "premium":
//         return {
//           name: "Premium",
//           icon: Zap,
//           color: "from-purple-500 to-pink-600",
//           limit: 3,
//           used: usedEvents,
//         };
//       case "platinum":
//         return {
//           name: "Platinum",
//           icon: Crown,
//           color: "from-yellow-500 to-orange-600",
//           limit: 5,
//           used: usedEvents,
//         };
//       default:
//         return {
//           name: "Basic",
//           icon: Star,
//           color: "from-gray-500 to-gray-700",
//           limit: 1,
//           used: usedEvents,
//         };
//     }
//   };

//   const planInfo = getSubscriptionPlanInfo();

//   // Generate unique transaction ID with better randomness
//   const generateTransactionId = () => {
//     const timestamp = Date.now();
//     const random = Math.floor(Math.random() * 1000000);
//     const userId = user?._id ? user._id.slice(-6) : "guest";
//     return `TX${timestamp}${random}${userId}`;
//   };

//   const generateSignature = (data) => {
//     const total_amount = String(data.total_amount || "0");
//     const transaction_uuid = String(data.transaction_uuid || "");
//     const product_code = String(data.product_code || "");

//     const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

//     console.log("Signature Message:", message);

//     const hash = CryptoJS.HmacSHA256(message, esewaConfig.secretKey);
//     const signature = CryptoJS.enc.Base64.stringify(hash);

//     console.log("Generated Signature:", signature);
//     return signature;
//   };

//   const addEventToAttendingList = async (quantity = 1) => {
//     if (!user || !id) {
//       toast.error("Please login to register");
//       return;
//     }

//     // Check event limit before proceeding
//     if (eventLimitExceeded) {
//       toast.error(
//         `You have reached your event limit (${userEventLimit} events). Please upgrade your subscription to register for more events.`
//       );
//       return;
//     }

//     try {
//       const result = await dispatch(
//         addToEventsToAttendAsync({ eventId: id, quantity, selectedSeats })
//       ).unwrap();
//       if (result) {
//         toast.success("Successfully registered!");
//         dispatch(getMyEventsAsync());
//         dispatch(getSubscriptionDetails());
//         setShowSeatSelectionModal(false);
//         setSelectedSeats([]);
//       }
//     } catch (error) {
//       toast.error(error.message || "Failed to register");
//     }
//   };

//   const handleBookmarkToggle = async () => {
//     if (!user) {
//       toast.error("Please login to bookmark");
//       navigate("/login", { state: { from: `event/${id}` } });
//       return;
//     }
//     try {
//       if (isEventInWatchlist) {
//         await dispatch(removeFromWatchlistAsync(eventData._id)).unwrap();
//         toast.success("Removed from watchlist");
//       } else {
//         await dispatch(addToWatchlistAsync(eventData._id)).unwrap();
//         toast.success("Added to watchlist");
//       }
//     } catch (error) {
//       toast.error("Failed to update watchlist");
//     }
//   };

//   const initiatePayment = () => {
//     setPaymentProcessing(true);

//     console.log("=== PAYMENT INITIATION ===");

//     // Generate unique transaction ID
//     const transactionId = generateTransactionId();
//     setLastTransactionId(transactionId);

//     const totalAmount = calculateTotalAmount();

//     // Validate payment conditions
//     if (totalAmount <= 0) {
//       toast.error("Invalid payment amount. Please select seats properly.");
//       setPaymentProcessing(false);
//       return;
//     }

//     if (selectedSeats.length !== ticketQuantity) {
//       toast.error(`Please select exactly ${ticketQuantity} seat(s)`);
//       setPaymentProcessing(false);
//       return;
//     }

//     // Store payment data in sessionStorage as backup
//     const paymentBackupData = {
//       eventId: id,
//       quantity: ticketQuantity,
//       selectedSeats: selectedSeats,
//       transactionId: transactionId,
//       totalAmount: totalAmount,
//       timestamp: Date.now(),
//     };
//     sessionStorage.setItem(
//       `pendingPayment_${id}`,
//       JSON.stringify(paymentBackupData)
//     );

//     // Prepare payment data with proper formatting
//     const paymentData = {
//       amount: totalAmount.toFixed(2),
//       tax_amount: "0.00",
//       total_amount: totalAmount.toFixed(2),
//       transaction_uuid: transactionId,
//       product_code: esewaConfig.merchantId,
//       product_service_charge: "0.00",
//       product_delivery_charge: "0.00",
//       success_url: esewaConfig.successUrl,
//       failure_url: esewaConfig.failureUrl,
//       signed_field_names: "total_amount,transaction_uuid,product_code",
//     };

//     console.log("Payment Data:", paymentData);

//     // Generate signature
//     paymentData.signature = generateSignature(paymentData);

//     console.log("Final Payment Data with Signature:", paymentData);

//     // Submit payment using the standard eSewa form
//     submitEsewaPayment(paymentData);
//   };

//   const submitEsewaPayment = (paymentData) => {
//     try {
//       // Remove any existing eSewa forms to avoid conflicts
//       const existingForms = document.querySelectorAll('form[action*="esewa"]');
//       existingForms.forEach((form) => form.remove());

//       // Create new form
//       const form = document.createElement("form");
//       form.method = "POST";
//       form.action = esewaConfig.baseUrl;
//       form.style.display = "none";

//       // Add all payment fields
//       Object.keys(paymentData).forEach((key) => {
//         const input = document.createElement("input");
//         input.type = "hidden";
//         input.name = key;
//         input.value = paymentData[key];
//         form.appendChild(input);
//       });

//       document.body.appendChild(form);

//       console.log("Submitting form to eSewa...");
//       form.submit();
//     } catch (error) {
//       console.error("Error submitting payment:", error);
//       toast.error("Payment submission failed. Please try again.");
//     } finally {
//       setPaymentProcessing(false);
//       setShowPaymentModal(false);
//     }
//   };

//   // Alternative payment method with different approach
//   const initiatePaymentAlternative = () => {
//     setPaymentProcessing(true);

//     const transactionId = generateTransactionId();
//     setLastTransactionId(transactionId);

//     const totalAmount = calculateTotalAmount();

//     if (totalAmount <= 0) {
//       toast.error("Invalid payment amount.");
//       setPaymentProcessing(false);
//       return;
//     }

//     // Use simpler field names and structure
//     const form = document.createElement("form");
//     form.method = "POST";
//     form.action = esewaConfig.baseUrl;
//     form.style.display = "none";

//     const amount = totalAmount.toFixed(2);

//     const fields = {
//       amount: amount,
//       tax_amount: "0",
//       total_amount: amount,
//       transaction_uuid: transactionId,
//       product_code: esewaConfig.merchantId,
//       product_service_charge: "0",
//       product_delivery_charge: "0",
//       success_url: esewaConfig.successUrl,
//       failure_url: esewaConfig.failureUrl,
//       signed_field_names: "total_amount,transaction_uuid,product_code",
//     };

//     // Generate signature
//     const signatureMessage = `total_amount=${fields.total_amount},transaction_uuid=${fields.transaction_uuid},product_code=${fields.product_code}`;
//     const signature = CryptoJS.HmacSHA256(
//       signatureMessage,
//       esewaConfig.secretKey
//     );
//     fields.signature = CryptoJS.enc.Base64.stringify(signature);

//     console.log("Alternative Payment Fields:", fields);

//     // Add fields to form
//     Object.keys(fields).forEach((key) => {
//       const input = document.createElement("input");
//       input.type = "hidden";
//       input.name = key;
//       input.value = fields[key];
//       form.appendChild(input);
//     });

//     // Clear any existing forms and submit
//     const existingForms = document.querySelectorAll('form[action*="esewa"]');
//     existingForms.forEach((form) => form.remove());

//     document.body.appendChild(form);

//     setTimeout(() => {
//       console.log("Submitting alternative payment...");
//       form.submit();
//       setPaymentProcessing(false);
//       setShowPaymentModal(false);
//     }, 100);
//   };

//   // Direct form submission without JavaScript interference
//   const initiateDirectPayment = () => {
//     const transactionId = generateTransactionId();
//     const totalAmount = calculateTotalAmount();

//     const form = document.createElement("form");
//     form.method = "POST";
//     form.action = esewaConfig.baseUrl;
//     form.style.display = "none";

//     const amount = totalAmount.toFixed(2);

//     // Minimal required fields only
//     const fields = {
//       amount: amount,
//       tax_amount: "0",
//       total_amount: amount,
//       transaction_uuid: transactionId,
//       product_code: esewaConfig.merchantId,
//       product_service_charge: "0",
//       product_delivery_charge: "0",
//       success_url: esewaConfig.successUrl,
//       failure_url: esewaConfig.failureUrl,
//       signed_field_names: "total_amount,transaction_uuid,product_code",
//     };

//     // Generate signature
//     const signatureMessage = `total_amount=${fields.total_amount},transaction_uuid=${fields.transaction_uuid},product_code=${fields.product_code}`;
//     const signature = CryptoJS.HmacSHA256(
//       signatureMessage,
//       esewaConfig.secretKey
//     );
//     fields.signature = CryptoJS.enc.Base64.stringify(signature);

//     // Add fields
//     Object.keys(fields).forEach((key) => {
//       const input = document.createElement("input");
//       input.type = "hidden";
//       input.name = key;
//       input.value = fields[key];
//       form.appendChild(input);
//     });

//     // Use a different approach - create in iframe
//     const iframe = document.createElement("iframe");
//     iframe.name = "esewa_payment_frame";
//     iframe.style.display = "none";
//     document.body.appendChild(iframe);

//     form.target = "esewa_payment_frame";
//     document.body.appendChild(form);

//     form.submit();

//     // Clean up after submission
//     setTimeout(() => {
//       document.body.removeChild(iframe);
//       document.body.removeChild(form);
//     }, 5000);

//     setPaymentProcessing(false);
//     setShowPaymentModal(false);
//   };

//   const handleRegistration = async () => {
//     if (!user) {
//       toast.error("Please login to register");
//       navigate("/login", { state: { from: `event/${id}` } });
//       return;
//     }

//     // Check event limit before proceeding
//     if (eventLimitExceeded) {
//       toast.error(
//         `You have reached your event limit (${userEventLimit} events). Please upgrade your subscription to register for more events.`
//       );
//       return;
//     }

//     if (eventData.price === 0) {
//       addEventToAttendingList(1);
//     } else {
//       setLoadingSeats(true);
//       try {
//         const result = await dispatch(getAvailableSeatsAsync(id)).unwrap();
//         setAvailableSeats(result.availableSeats);
//         setSeatPricing(result.seatPricing);
//         setShowSeatSelectionModal(true);
//       } catch (error) {
//         toast.error("Failed to load seats");
//       } finally {
//         setLoadingSeats(false);
//       }
//     }
//   };

//   const handleSeatSelection = (seatType, seatNumber) => {
//     if (selectedSeats.length >= ticketQuantity) {
//       toast.error(`Max ${ticketQuantity} seat(s)`);
//       return;
//     }
//     const seatPrice = seatPricing[seatType];
//     setSelectedSeats((prev) => [...prev, { seatType, seatNumber, seatPrice }]);
//   };

//   const handleRemoveSeat = (seatNumber) => {
//     setSelectedSeats((prev) => prev.filter((s) => s.seatNumber !== seatNumber));
//   };

//   const handleProceedToPayment = () => {
//     if (selectedSeats.length !== ticketQuantity) {
//       toast.error(`Please select exactly ${ticketQuantity} seat(s)`);
//       return;
//     }
//     setShowSeatSelectionModal(false);
//     setShowPaymentModal(true);
//   };

//   const incrementQuantity = () => setTicketQuantity((prev) => prev + 1);
//   const decrementQuantity = () => {
//     if (ticketQuantity > 1) {
//       setTicketQuantity((prev) => prev - 1);
//       setSelectedSeats((prev) => prev.slice(0, ticketQuantity - 1));
//     }
//   };

//   const handleShare = async () => {
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: eventData.title,
//           text: eventData.description,
//           url: window.location.href,
//         });
//       } catch (err) {}
//     } else {
//       navigator.clipboard.writeText(window.location.href);
//       toast.success("Link copied!");
//     }
//   };

//   const handleManageTickets = () => navigate("/myevents/attend");

//   const handleViewTicket = () => navigate("/myevents/attend");

//   const handleUpgradeSubscription = () => navigate("/subscription");

//   const getSeatTypeColor = (type) => {
//     switch (type) {
//       case "front":
//         return "bg-red-500 border-red-600";
//       case "middle":
//         return "bg-blue-500 border-blue-600";
//       case "last":
//         return "bg-green-500 border-green-600";
//       default:
//         return "bg-gray-500 border-gray-600";
//     }
//   };

//   const getSeatTypeName = (type) => {
//     switch (type) {
//       case "front":
//         return "Front Row";
//       case "middle":
//         return "Middle Section";
//       case "last":
//         return "Last Section";
//       default:
//         return type;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//           <p className="text-slate-700">Loading event details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!eventData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
//             <Tag className="w-8 h-8 text-red-600" />
//           </div>
//           <h1 className="text-2xl font-bold text-slate-800 mb-2">
//             Event Not Found
//           </h1>
//           <p className="text-slate-600 mb-6">
//             The event doesn't exist or has been removed.
//           </p>
//           <button
//             onClick={() => window.history.back()}
//             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             <ArrowLeft className="w-4 h-4 inline mr-2" /> Back to Events
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 pb-20">
//       {showMessageDialog && eventData && (
//         <MessageDialog
//           organizer={eventData.createdBy || user}
//           event={eventData}
//           isOpen={showMessageDialog}
//           onClose={() => setShowMessageDialog(false)}
//         />
//       )}

//       <div className="container mx-auto px-4 py-8 max-w-7xl">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <button
//             onClick={() => window.history.back()}
//             className="group flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:border-blue-300 hover:bg-white"
//           >
//             <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
//             <span className="text-slate-700 font-medium">Back to Events</span>
//           </button>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={handleBookmarkToggle}
//               disabled={loadingEvents[eventData._id]}
//               className={`p-3 rounded-2xl transition-all duration-300 backdrop-blur-sm ${
//                 isEventInWatchlist
//                   ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
//                   : "bg-white/80 text-slate-600 hover:bg-blue-50 shadow-lg hover:shadow-xl"
//               } hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20`}
//             >
//               {loadingEvents[eventData._id] ? (
//                 <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
//               ) : (
//                 <Bookmark
//                   className={`w-5 h-5 transition-transform ${
//                     isEventInWatchlist ? "fill-current scale-110" : ""
//                   }`}
//                 />
//               )}
//             </button>
//             <button
//               onClick={handleShare}
//               className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl text-slate-600 hover:bg-slate-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-white/20"
//             >
//               <Share2 className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* Subscription Status */}
//             {user && (
//               <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg">
//                 <div className="flex flex-col md:flex-row items-center justify-between">
//                   <div className="flex items-center gap-3 mb-3 md:mb-0">
//                     <div
//                       className={`p-2 rounded-lg bg-gradient-to-r ${planInfo.color} text-white shadow-md`}
//                     >
//                       <planInfo.icon className="w-4 h-4" />
//                     </div>
//                     <div>
//                       <h3 className="text-sm font-bold text-slate-800">
//                         {planInfo.name} Plan
//                       </h3>
//                       <p className="text-xs text-slate-600">
//                         Event Limit: {planInfo.used}/{planInfo.limit} used
//                       </p>
//                     </div>
//                   </div>
//                   <div className="w-full md:w-48 bg-slate-100 rounded-full h-2">
//                     <div
//                       className={`h-2 rounded-full bg-gradient-to-r ${planInfo.color} transition-all duration-500`}
//                       style={{
//                         width: `${Math.min(
//                           (planInfo.used / planInfo.limit) * 100,
//                           100
//                         )}%`,
//                       }}
//                     ></div>
//                   </div>
//                 </div>
//                 {eventLimitExceeded && (
//                   <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
//                     <div className="flex items-center gap-2 text-red-700">
//                       <AlertCircle className="w-3 h-3" />
//                       <span className="text-xs font-medium">
//                         Event limit reached!{" "}
//                         {planInfo.name === "Basic" &&
//                           "Upgrade to register for more events."}
//                         {planInfo.name === "Premium" &&
//                           "Upgrade to Platinum for more events."}
//                       </span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Tags */}
//             <div className="flex items-center gap-3 flex-wrap">
//               <span
//                 className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
//                   eventData.status
//                 )}`}
//               >
//                 {eventData.status.charAt(0).toUpperCase() +
//                   eventData.status.slice(1)}
//               </span>
//               <span
//                 className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getCategoryColor(
//                   eventData.category
//                 )}`}
//               >
//                 <span className="mr-1">
//                   {getCategoryIcon(eventData.category)}
//                 </span>
//                 {eventData.category.charAt(0).toUpperCase() +
//                   eventData.category.slice(1)}
//               </span>
//               {eventData.price > 0 ? (
//                 <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white">
//                   <IndianRupee className="w-3 h-3 inline mr-1" /> Paid Event
//                 </span>
//               ) : (
//                 <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-green-500 text-white">
//                   <Crown className="w-3 h-3 inline mr-1" /> Free Event
//                 </span>
//               )}
//             </div>

//             <h1 className="text-3xl font-bold text-slate-800 leading-tight">
//               {eventData.title}
//             </h1>
//             <p className="text-slate-600 text-lg leading-relaxed">
//               {eventData.description}
//             </p>

//             {/* Banner */}
//             <div className="relative overflow-hidden rounded-2xl shadow-xl group">
//               {eventData.banner ? (
//                 <>
//                   <div className="relative">
//                     {!imageLoaded && (
//                       <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center">
//                         <div className="text-center">
//                           <Image className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-pulse" />
//                           <p className="text-slate-500 text-sm">Loading...</p>
//                         </div>
//                       </div>
//                     )}
//                     <img
//                       src={`http://localhost:5000/uploads/event-banners/${eventData.banner}`}
//                       alt={eventData.title}
//                       className={`w-full aspect-[16/9] object-cover transition-all duration-700 group-hover:scale-105 ${
//                         imageLoaded ? "opacity-100" : "opacity-0"
//                       }`}
//                       onLoad={() => setImageLoaded(true)}
//                     />
//                     <button
//                       onClick={() => setShowZoomModal(true)}
//                       className="absolute top-4 right-4 p-2 bg-white/90 text-slate-700 rounded-xl backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
//                     >
//                       <ZoomIn className="w-4 h-4" />
//                     </button>
//                   </div>
//                   {showZoomModal && (
//                     <div
//                       className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm"
//                       onClick={() => setShowZoomModal(false)}
//                     >
//                       <div className="max-w-6xl max-h-full">
//                         <img
//                           src={`http://localhost:5000/uploads/event-banners/${eventData.banner}`}
//                           alt={eventData.title}
//                           className="w-full h-full object-contain rounded-xl"
//                         />
//                       </div>
//                       <button
//                         className="absolute top-6 right-6 p-3 bg-black/80 text-white rounded-xl hover:bg-black transition-all duration-300 hover:scale-110"
//                         onClick={() => setShowZoomModal(false)}
//                       >
//                         <X className="w-5 h-5" />
//                       </button>
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <div className="aspect-[16/9] bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center">
//                   <div className="text-center text-slate-500">
//                     <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-white flex items-center justify-center shadow-lg">
//                       <Tag className="w-8 h-8 text-slate-400" />
//                     </div>
//                     <p className="text-lg font-medium">No Banner</p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Tabs */}
//             <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
//               <div className="flex border-b border-slate-200/60 mb-6 overflow-x-auto">
//                 {[
//                   { id: "details", label: "Event Details", icon: CalendarDays },
//                   { id: "location", label: "Location & Date", icon: Map },
//                   {
//                     id: "attendees",
//                     label: `Attendees (${calculateTotalAttendees(
//                       eventData.attendees
//                     )})`,
//                     icon: Users,
//                   },
//                   { id: "organizer", label: "Organizer", icon: User },
//                 ].map((tab) => {
//                   const Icon = tab.icon;
//                   return (
//                     <button
//                       key={tab.id}
//                       className={`flex items-center gap-2 px-4 py-3 font-medium text-sm relative whitespace-nowrap transition-all duration-300 ${
//                         activeTab === tab.id
//                           ? "text-blue-600"
//                           : "text-slate-600 hover:text-slate-900"
//                       }`}
//                       onClick={() => setActiveTab(tab.id)}
//                     >
//                       <Icon className="w-4 h-4" />
//                       {tab.label}
//                       {activeTab === tab.id && (
//                         <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>

//               <div className="min-h-[300px]">
//                 {activeTab === "details" && (
//                   <div className="space-y-6">
//                     <div className="grid md:grid-cols-2 gap-4">
//                       <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-300">
//                         <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
//                           <Calendar className="w-5 h-5 text-white" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-slate-600 mb-1">
//                             Event Date
//                           </p>
//                           <p className="text-base font-semibold text-slate-800">
//                             {format(
//                               new Date(eventData.date),
//                               "EEE, MMM d, yyyy"
//                             )}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50 shadow-sm hover:shadow-md transition-all duration-300">
//                         <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
//                           <Clock className="w-5 h-5 text-white" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-slate-600 mb-1">
//                             Event Time
//                           </p>
//                           <p className="text-base font-semibold text-slate-800">{`${formatTime(
//                             eventData.startTime
//                           )} - ${formatTime(eventData.endTime)}`}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200/50 shadow-sm hover:shadow-md transition-all duration-300">
//                         <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
//                           <MapPin className="w-5 h-5 text-white" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-slate-600 mb-1">
//                             Location
//                           </p>
//                           <p className="text-base font-semibold text-slate-800">
//                             {eventData.location}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200/50 shadow-sm hover:shadow-md transition-all duration-300">
//                         <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
//                           <IndianRupee className="w-5 h-5 text-white" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-slate-600 mb-1">
//                             Base Price
//                           </p>
//                           <div className="flex items-center gap-1">
//                             <IndianRupee
//                               size={16}
//                               strokeWidth={2}
//                               className="opacity-90"
//                             />
//                             <p className="text-base font-semibold text-slate-800">
//                               {eventData.basePrice}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {eventData.price > 0 && (
//                       <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200/50">
//                         <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                           <User className="w-5 h-5 text-blue-500" /> Seat
//                           Pricing
//                         </h3>
//                         <div className="grid md:grid-cols-3 gap-4">
//                           {["front", "middle", "last"].map((seat) => (
//                             <div
//                               key={seat}
//                               className="text-center p-4 bg-white rounded-lg border border-slate-200 shadow-sm"
//                             >
//                               <div
//                                 className={`w-12 h-12 mx-auto mb-3 rounded-lg ${getSeatTypeColor(
//                                   seat
//                                 )} flex items-center justify-center`}
//                               >
//                                 <User className="w-6 h-6 text-white" />
//                               </div>
//                               <h4 className="font-semibold text-slate-800">
//                                 {getSeatTypeName(seat)}
//                               </h4>
//                               <p className="text-sm text-slate-600 mb-2">
//                                 {seat === "front"
//                                   ? "Best view"
//                                   : seat === "middle"
//                                   ? "Great value"
//                                   : "Economy"}
//                               </p>
//                               <div className="flex items-center justify-center gap-1">
//                                 <IndianRupee
//                                   size={14}
//                                   strokeWidth={2}
//                                   className="opacity-90"
//                                 />
//                                 <span className="font-bold text-slate-800">
//                                   {seatPricing
//                                     ? seatPricing[seat]
//                                     : eventData.price}
//                                 </span>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {activeTab === "location" && (
//                   <div className="space-y-6">
//                     <div className="grid md:grid-cols-2 gap-6">
//                       <div>
//                         <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
//                           <CalendarDays className="w-5 h-5 text-blue-500" />
//                           Event Schedule
//                         </h3>
//                         <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200/50 shadow-sm">
//                           <div className="space-y-3">
//                             <div>
//                               <p className="text-sm font-medium text-slate-600">
//                                 Date
//                               </p>
//                               <p className="text-base font-semibold text-slate-800">
//                                 {format(
//                                   new Date(eventData.date),
//                                   "EEE, MMM d, yyyy"
//                                 )}
//                               </p>
//                             </div>
//                             <div>
//                               <p className="text-sm font-medium text-slate-600">
//                                 Time
//                               </p>
//                               <p className="text-base font-semibold text-slate-800">
//                                 {`${formatTime(
//                                   eventData.startTime
//                                 )} - ${formatTime(eventData.endTime)}`}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       <div>
//                         <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
//                           <MapPin className="w-5 h-5 text-orange-500" />
//                           Event Location
//                         </h3>
//                         <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200/50 shadow-sm">
//                           <p className="text-sm font-medium text-slate-600 mb-1">
//                             Address
//                           </p>
//                           <p className="text-base font-semibold text-slate-800 mb-3">
//                             {eventData.location}
//                           </p>
//                           <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
//                             <Navigation className="w-4 h-4" />
//                             Get Directions
//                           </button>
//                         </div>
//                       </div>
//                     </div>

//                     <div>
//                       <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
//                         <Map className="w-5 h-5 text-green-500" />
//                         Location Map
//                       </h3>
//                       <div className="bg-slate-100 rounded-xl p-3 h-80 flex items-center justify-center shadow-inner">
//                         {eventData.coordinates ? (
//                           <MapContainer
//                             center={[
//                               eventData.coordinates.lat,
//                               eventData.coordinates.lng,
//                             ]}
//                             zoom={15}
//                             scrollWheelZoom={false}
//                             style={{
//                               height: "100%",
//                               width: "100%",
//                               borderRadius: "12px",
//                             }}
//                           >
//                             <TileLayer
//                               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                             />
//                             <Marker
//                               position={[
//                                 eventData.coordinates.lat,
//                                 eventData.coordinates.lng,
//                               ]}
//                             />
//                           </MapContainer>
//                         ) : (
//                           <div className="h-full flex items-center justify-center text-slate-500">
//                             <MapPin className="w-10 h-10 mr-2 text-slate-400" />
//                             <div>
//                               <p className="font-medium">
//                                 Location map not available
//                               </p>
//                               <p className="text-sm">
//                                 Check the address above for directions
//                               </p>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {activeTab === "attendees" && (
//                   <div>
//                     <h2 className="text-xl font-semibold text-slate-800 mb-4">
//                       Event Attendees ({eventData.attendees?.length || 0})
//                     </h2>
//                     <div className="grid gap-3">
//                       {eventData.attendees && eventData.attendees.length > 0 ? (
//                         eventData.attendees
//                           .slice(0, 8)
//                           .map((attendeeId, index) => (
//                             <div
//                               key={index}
//                               className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300"
//                             >
//                               <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
//                                 <User className="w-5 h-5 text-white" />
//                               </div>
//                               <div>
//                                 <p className="font-medium text-slate-800">
//                                   Anonymous User
//                                 </p>
//                                 <p className="text-sm text-slate-600">
//                                   Registered attendee
//                                 </p>
//                               </div>
//                             </div>
//                           ))
//                       ) : (
//                         <div className="text-center py-8 text-slate-500">
//                           <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
//                           <p className="font-medium mb-1">No attendees yet</p>
//                           <p className="text-sm">
//                             Be the first to register for this amazing event!
//                           </p>
//                         </div>
//                       )}
//                       {eventData.attendees &&
//                         eventData.attendees.length > 8 && (
//                           <div className="text-center mt-4">
//                             <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 text-sm">
//                               View all {eventData.attendees.length} attendees
//                             </button>
//                           </div>
//                         )}
//                     </div>
//                   </div>
//                 )}

//                 {activeTab === "organizer" && (
//                   <div className="space-y-6">
//                     <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl border border-slate-200/50 shadow-sm">
//                       <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
//                         <User className="w-6 h-6 text-white" />
//                       </div>
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <p className="text-lg font-semibold text-slate-800">
//                             {eventData.createdBy?.name || "Unknown Organizer"}
//                           </p>
//                           <BadgeCheck className="w-4 h-4 text-blue-500" />
//                         </div>
//                         <p className="text-slate-600 text-sm mb-2">
//                           {eventData.createdBy?.eventToOrganize?.length || 0}{" "}
//                           events hosted
//                         </p>
//                         <div className="flex items-center gap-1">
//                           {[1, 2, 3, 4, 5].map((star) => (
//                             <Star
//                               key={star}
//                               className="w-4 h-4 fill-amber-400 text-amber-400"
//                             />
//                           ))}
//                           <span className="text-sm font-medium text-slate-600 ml-1">
//                             4.8/5.0
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="grid gap-3">
//                       <button
//                         onClick={() => setShowMessageDialog(true)}
//                         className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md group"
//                       >
//                         <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
//                           <MessageCircle className="w-4 h-4 text-white" />
//                         </div>
//                         <div className="flex-1 text-left">
//                           <p className="font-medium text-slate-800">
//                             Message the organizer
//                           </p>
//                           <p className="text-sm text-slate-600">
//                             Send a direct message
//                           </p>
//                         </div>
//                         <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
//                       </button>

//                       <button className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-green-300 transition-all duration-300 hover:shadow-md group">
//                         <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
//                           <Phone className="w-4 h-4 text-white" />
//                         </div>
//                         <div className="flex-1 text-left">
//                           <p className="font-medium text-slate-800">
//                             Call the organizer
//                           </p>
//                           <p className="text-sm text-slate-600">
//                             Available during business hours
//                           </p>
//                         </div>
//                         <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-green-500 transition-colors" />
//                       </button>

//                       <button className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-orange-300 transition-all duration-300 hover:shadow-md group">
//                         <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
//                           <Mail className="w-4 h-4 text-white" />
//                         </div>
//                         <div className="flex-1 text-left">
//                           <p className="font-medium text-slate-800">
//                             Email the organizer
//                           </p>
//                           <p className="text-sm text-slate-600">
//                             Get a response within 24 hours
//                           </p>
//                         </div>
//                         <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Registration Card */}
//             <div
//               ref={registrationRef}
//               className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
//             >
//               <div className="text-center mb-6">
//                 <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
//                   <Ticket className="w-6 h-6 text-white" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-slate-800 mb-2">
//                   Join this Event
//                 </h3>
//                 <p className="text-slate-600 text-sm">Reserve your spot now</p>
//               </div>

//               <div className="space-y-4 mb-6">
//                 <div className="flex justify-between items-center p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200/50">
//                   <span className="text-slate-700 text-sm font-medium">
//                     Base Price
//                   </span>
//                   <span className="flex items-center gap-x-1 text-base font-semibold text-slate-800">
//                     <IndianRupee
//                       size={14}
//                       strokeWidth={2}
//                       className="opacity-90"
//                     />
//                     <p>{eventData.basePrice}</p>
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200/50">
//                   <div className="flex items-center gap-2">
//                     <Users className="w-4 h-4 text-blue-600" />
//                     <span className="text-slate-700 text-sm font-medium">
//                       Attendees
//                     </span>
//                   </div>
//                   <span className="text-base font-semibold text-blue-800">
//                     {calculateTotalAttendees(eventData.attendees)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200/50">
//                   <div className="flex items-center gap-2">
//                     <UserPlus className="w-4 h-4 text-orange-600" />
//                     <span className="text-slate-700 text-sm font-medium">
//                       Max Capacity
//                     </span>
//                   </div>
//                   <span className="text-base font-semibold text-orange-800">
//                     {eventData.totalSeats}
//                   </span>
//                 </div>
//                 {selectedSeats.length > 0 && (
//                   <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200/50">
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-green-700 text-sm font-medium">
//                         Selected Seats ({selectedSeats.length})
//                       </span>
//                       <span className="text-green-800 font-semibold">
//                         <IndianRupee size={12} strokeWidth={2} />
//                         {calculateTotalAmount()}
//                       </span>
//                     </div>
//                     <div className="flex flex-wrap gap-1">
//                       {selectedSeats.map((seat, i) => (
//                         <span
//                           key={i}
//                           className="px-2 py-1 bg-white text-green-800 text-xs rounded border border-green-200"
//                         >
//                           {seat.seatNumber}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {!user ? (
//                 <div className="text-center py-3">
//                   <div className="mb-4 flex items-center justify-center gap-2 text-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-200/50">
//                     <Lock className="w-4 h-4" />
//                     <span className="text-sm font-medium">Login required</span>
//                   </div>
//                   <button
//                     onClick={() =>
//                       navigate("/login", { state: { from: `event/${id}` } })
//                     }
//                     className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg"
//                   >
//                     Login to Register
//                   </button>
//                 </div>
//               ) : isRegistered ? (
//                 <>
//                   <button className="w-full py-3 px-4 rounded-lg font-semibold text-base bg-gradient-to-br from-emerald-500 to-green-600 text-white cursor-not-allowed">
//                     <span className="flex items-center justify-center gap-2">
//                       <Check className="w-4 h-4" /> Already Registered
//                     </span>
//                   </button>
//                   <button
//                     onClick={handleViewTicket}
//                     className="w-full mt-3 py-2.5 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm"
//                   >
//                     <Eye className="w-4 h-4" /> View Ticket
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <button
//                     onClick={handleRegistration}
//                     disabled={loadingSeats || eventLimitExceeded}
//                     className={`cursor-pointer w-full py-3 px-4 rounded-lg font-semibold text-base text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
//                       eventLimitExceeded
//                         ? "bg-gradient-to-br from-gray-500 to-gray-600"
//                         : "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
//                     }`}
//                   >
//                     {loadingSeats ? (
//                       <div className="flex items-center justify-center gap-2">
//                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                         Loading...
//                       </div>
//                     ) : eventLimitExceeded ? (
//                       "Event Limit Reached"
//                     ) : (
//                       "Register Now"
//                     )}
//                   </button>

//                   {eventLimitExceeded && (
//                     <button
//                       onClick={handleUpgradeSubscription}
//                       className="w-full mt-3 py-2.5 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm"
//                     >
//                       <ArrowUpRight className="w-4 h-4" /> Upgrade Plan
//                     </button>
//                   )}
//                 </>
//               )}

//               {eventData.price === 0 && (
//                 <p className="text-xs text-emerald-600 mt-4 text-center font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-200/50">
//                   This is a free event! Registration is instant.
//                 </p>
//               )}
//             </div>

//             {/* Event Info Card */}
//             <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20">
//               <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
//                 <Info className="w-4 h-4 text-blue-500" />
//                 Event Information
//               </h3>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
//                   <span className="text-slate-600 text-sm font-medium">
//                     Event ID
//                   </span>
//                   <span className="text-slate-800 font-mono text-xs bg-slate-100 px-2 py-1 rounded">
//                     {eventData._id.slice(-8)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
//                   <span className="text-slate-600 text-sm font-medium">
//                     Created
//                   </span>
//                   <span className="text-slate-800 text-sm">
//                     {eventData.createdAt
//                       ? new Date(eventData.createdAt).toLocaleDateString()
//                       : "N/A"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
//                   <span className="text-slate-600 text-sm font-medium">
//                     Updated
//                   </span>
//                   <span className="text-slate-800 text-sm">
//                     {eventData.updatedAt
//                       ? new Date(eventData.updatedAt).toLocaleDateString()
//                       : "N/A"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center py-2">
//                   <span className="text-slate-600 text-sm font-medium">
//                     Status
//                   </span>
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
//                       eventData.status
//                     )}`}
//                   >
//                     {eventData.status.charAt(0).toUpperCase() +
//                       eventData.status.slice(1)}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Share Card */}
//             <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20">
//               <h3 className="text-lg font-semibold text-slate-800 mb-3">
//                 Share this event
//               </h3>
//               <div className="grid grid-cols-2 gap-3">
//                 <button className="flex items-center justify-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200/50 hover:border-blue-300 transition-all duration-300 hover:shadow-md group">
//                   <svg
//                     className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform"
//                     fill="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
//                   </svg>
//                   <span className="text-sm font-medium">Facebook</span>
//                 </button>
//                 <button className="flex items-center justify-center gap-2 p-3 bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg border border-sky-200/50 hover:border-sky-300 transition-all duration-300 hover:shadow-md group">
//                   <svg
//                     className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform"
//                     fill="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.027 10.027 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
//                   </svg>
//                   <span className="text-sm font-medium">Twitter</span>
//                 </button>
//                 <button className="flex items-center justify-center gap-2 p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border border-pink-200/50 hover:border-pink-300 transition-all duration-300 hover:shadow-md group">
//                   <svg
//                     className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform"
//                     fill="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.420.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
//                   </svg>
//                   <span className="text-sm font-medium">Instagram</span>
//                 </button>
//                 <button
//                   onClick={handleShare}
//                   className="flex items-center justify-center gap-2 p-3 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border border-slate-200/50 hover:border-slate-300 transition-all duration-300 hover:shadow-md group"
//                 >
//                   <Share2 className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform" />
//                   <span className="text-sm font-medium">Copy Link</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Seat Selection Modal */}
//         {showSeatSelectionModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
//               {/* Header */}
//               <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className="text-xl font-bold">Select Your Seats</h2>
//                     <p className="text-white/90 text-sm mt-1">
//                       Choose {ticketQuantity} seat(s) for {eventData.title}
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setShowSeatSelectionModal(false);
//                       setSelectedSeats([]);
//                     }}
//                     className="p-2 rounded-lg hover:bg-white/20 transition-colors"
//                   >
//                     <X className="h-5 w-5 text-white" />
//                   </button>
//                 </div>
//               </div>

//               <div
//                 className="p-6 overflow-y-auto"
//                 style={{ maxHeight: "calc(90vh - 120px)" }}
//               >
//                 {loadingSeats ? (
//                   <div className="flex items-center justify-center py-12">
//                     <div className="text-center">
//                       <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                       <p className="text-slate-600">Loading seats...</p>
//                     </div>
//                   </div>
//                 ) : availableSeats ? (
//                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                     {/* Seat Map */}
//                     <div className="lg:col-span-2">
//                       <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
//                         <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                           <Ticket className="h-5 w-5 text-purple-600" /> Seat
//                           Map
//                         </h3>

//                         {/* Stage */}
//                         <div className="text-center mb-8">
//                           <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg shadow-lg">
//                             <h4 className="font-semibold">STAGE</h4>
//                           </div>
//                           <div className="text-xs text-slate-500 mt-2">
//                             All seats face the stage
//                           </div>
//                         </div>

//                         {/* Legend */}
//                         <div className="grid grid-cols-3 gap-4 mb-6">
//                           {Object.entries(availableSeats).map(
//                             ([type, data]) => (
//                               <div
//                                 key={type}
//                                 className="text-center p-3 rounded-lg bg-white border border-slate-200"
//                               >
//                                 <div
//                                   className={`w-6 h-6 mx-auto mb-2 rounded border-2 ${getSeatTypeColor(
//                                     type
//                                   )}`}
//                                 ></div>
//                                 <div className="text-sm font-semibold text-slate-800">
//                                   {getSeatTypeName(type)}
//                                 </div>
//                                 <div className="text-xs text-slate-600">
//                                   {data?.length || 0} available
//                                 </div>
//                                 <div className="text-sm font-bold text-slate-800 mt-1">
//                                   <IndianRupee size={12} className="inline" />
//                                   {seatPricing[type]}
//                                 </div>
//                               </div>
//                             )
//                           )}
//                         </div>

//                         {/* Seat Grid */}
//                         <div className="space-y-6">
//                           {["front", "middle", "last"].map((type) => (
//                             <div key={type}>
//                               <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
//                                 <div
//                                   className={`w-3 h-3 rounded ${getSeatTypeColor(
//                                     type
//                                   )}`}
//                                 ></div>
//                                 {getSeatTypeName(type)}
//                                 <span className="text-sm text-slate-500 font-normal">
//                                   -{" "}
//                                   {type === "front"
//                                     ? "Best view"
//                                     : type === "middle"
//                                     ? "Great value"
//                                     : "Economy"}
//                                 </span>
//                               </h4>
//                               <div className="grid grid-cols-8 gap-2">
//                                 {availableSeats[type]?.map((seatNumber) => {
//                                   const isSelected = selectedSeats.some(
//                                     (s) => s.seatNumber === seatNumber
//                                   );
//                                   const isDisabled =
//                                     selectedSeats.length >= ticketQuantity &&
//                                     !isSelected;
//                                   return (
//                                     <button
//                                       key={seatNumber}
//                                       onClick={() =>
//                                         !isDisabled &&
//                                         handleSeatSelection(type, seatNumber)
//                                       }
//                                       disabled={isDisabled}
//                                       className={`
//                                         relative p-2 rounded-lg text-xs font-medium transition-all duration-200
//                                         ${
//                                           isSelected
//                                             ? "bg-purple-600 text-white border-2 border-purple-700 transform scale-105"
//                                             : isDisabled
//                                             ? "bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed"
//                                             : "bg-white text-slate-800 border-2 border-slate-300 hover:border-purple-400 hover:bg-purple-50"
//                                         }
//                                         ${getSeatTypeColor(type).split(" ")[0]}
//                                       `}
//                                     >
//                                       {seatNumber}
//                                       {isSelected && (
//                                         <Check className="absolute -top-1 -right-1 h-3 w-3 text-white bg-green-500 rounded-full p-0.5" />
//                                       )}
//                                     </button>
//                                   );
//                                 })}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Summary */}
//                     <div className="space-y-6">
//                       <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
//                         <h3 className="text-lg font-semibold text-slate-800 mb-4">
//                           Your Selection
//                         </h3>
//                         {selectedSeats.length === 0 ? (
//                           <div className="text-center py-8 text-slate-500">
//                             <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
//                             <p className="font-medium">No seats selected</p>
//                             <p className="text-sm mt-1">
//                               Click on available seats
//                             </p>
//                           </div>
//                         ) : (
//                           <div className="space-y-4">
//                             <div className="space-y-2">
//                               {selectedSeats.map((seat, i) => (
//                                 <div
//                                   key={i}
//                                   className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
//                                 >
//                                   <div className="flex items-center gap-3">
//                                     <div
//                                       className={`w-4 h-4 rounded ${getSeatTypeColor(
//                                         seat.seatType
//                                       )}`}
//                                     ></div>
//                                     <span className="font-medium text-slate-800">
//                                       {seat.seatNumber}
//                                     </span>
//                                     <span className="text-sm text-slate-600 capitalize">
//                                       ({seat.seatType})
//                                     </span>
//                                   </div>
//                                   <div className="flex items-center text-slate-800 font-semibold">
//                                     <IndianRupee
//                                       size={14}
//                                       className="opacity-70"
//                                     />
//                                     {seat.seatPrice}
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                             <div className="border-t border-slate-200 pt-4">
//                               <div className="flex justify-between items-center mb-2">
//                                 <span className="text-slate-600">Seats:</span>
//                                 <span className="font-semibold text-slate-800">
//                                   {selectedSeats.length}
//                                 </span>
//                               </div>
//                               <div className="flex justify-between items-center text-lg font-bold text-slate-800">
//                                 <span>Total:</span>
//                                 <span className="flex items-center">
//                                   <IndianRupee
//                                     size={16}
//                                     className="opacity-80"
//                                   />
//                                   {calculateTotalAmount()}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </div>

//                       {/* Quantity & Proceed */}
//                       <div className="space-y-3">
//                         <div className="flex items-center justify-between mb-4">
//                           <div className="flex items-center gap-4">
//                             <span className="text-sm text-slate-600">
//                               Quantity:
//                             </span>
//                             <div className="flex items-center gap-2">
//                               <button
//                                 onClick={decrementQuantity}
//                                 disabled={ticketQuantity <= 1}
//                                 className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
//                               >
//                                 <Minus className="w-3 h-3" />
//                               </button>
//                               <span className="w-6 text-center font-bold text-slate-800">
//                                 {ticketQuantity}
//                               </span>
//                               <button
//                                 onClick={incrementQuantity}
//                                 className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-all duration-200"
//                               >
//                                 <Plus className="w-3 h-3" />
//                               </button>
//                             </div>
//                           </div>
//                           <div className="text-right">
//                             <p className="text-sm text-slate-600">Selected</p>
//                             <p className="text-lg font-bold text-slate-800">
//                               {selectedSeats.length} / {ticketQuantity}
//                             </p>
//                           </div>
//                         </div>
//                         <button
//                           onClick={handleProceedToPayment}
//                           disabled={selectedSeats.length !== ticketQuantity}
//                           className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
//                         >
//                           Proceed to Payment ({selectedSeats.length} seats)
//                         </button>
//                         <button
//                           onClick={() => {
//                             setShowSeatSelectionModal(false);
//                             setSelectedSeats([]);
//                           }}
//                           className="w-full py-3 px-4 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 transition-all duration-200"
//                         >
//                           Cancel
//                         </button>
//                       </div>

//                       {/* Help */}
//                       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                         <div className="flex items-start gap-3">
//                           <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                           <div className="text-sm text-blue-700">
//                             <p className="font-medium">Selection Guide</p>
//                             <ul className="mt-1 space-y-1">
//                               <li>• Click to select/deselect</li>
//                               <li>• Gray = booked</li>
//                               <li>• Max {ticketQuantity} seat(s)</li>
//                               <li>• Reserved during payment</li>
//                             </ul>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-center py-12 text-slate-600">
//                     <AlertCircle className="h-12 w-12 mx-auto mb-3 text-slate-400" />
//                     <p className="font-medium">Failed to load seats</p>
//                     <p className="text-sm mt-1">Try again later</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Payment Modal */}
//         {showPaymentModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
//               <button
//                 onClick={() => setShowPaymentModal(false)}
//                 className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-200 group ring-2 ring-white/20 hover:ring-white/30"
//               >
//                 <X className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
//               </button>
//               <div className="bg-gradient-to-r from-[#34d399] to-[#059669] p-5 text-white pt-14">
//                 <div className="flex items-center gap-4 mb-3">
//                   <img
//                     src="https://esewa.com.np/common/images/esewa-logo.png"
//                     alt="eSewa"
//                     style={{ width: "80px", height: "auto" }}
//                   />
//                   <div>
//                     <h3 className="text-lg font-bold">eSewa Payment</h3>
//                     <p className="text-green-100 text-xs">Secure Wallet</p>
//                   </div>
//                 </div>
//                 <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
//                   <p className="text-green-50 text-xs mb-1">Paying for</p>
//                   <p className="font-semibold text-sm truncate">
//                     {eventData.title}
//                   </p>
//                 </div>
//               </div>
//               <div className="p-5">
//                 <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-200">
//                   <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm">
//                     <Ticket className="w-4 h-4 text-green-600" /> Selected Seats
//                   </h4>
//                   <div className="space-y-2">
//                     {selectedSeats.map((seat, i) => (
//                       <div
//                         key={i}
//                         className="flex justify-between items-center text-xs bg-white p-2 rounded border border-slate-200"
//                       >
//                         <span className="text-slate-700">
//                           {seat.seatNumber} ({getSeatTypeName(seat.seatType)})
//                         </span>
//                         <span className="font-medium">
//                           <IndianRupee
//                             size={10}
//                             strokeWidth={2}
//                             className="inline"
//                           />
//                           {seat.seatPrice}
//                         </span>
//                       </div>
//                     ))}
//                     <div className="flex justify-between items-center pt-2 border-t border-slate-200">
//                       <span className="font-semibold text-slate-800 text-sm">
//                         Total:
//                       </span>
//                       <span className="flex items-center text-lg font-bold text-green-700">
//                         <IndianRupee
//                           size={14}
//                           strokeWidth={2}
//                           className="opacity-80"
//                         />
//                         <p> {calculateTotalAmount()} </p>
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   <button
//                     onClick={initiatePayment}
//                     disabled={paymentProcessing}
//                     className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 ${
//                       paymentProcessing
//                         ? "bg-green-400 cursor-not-allowed"
//                         : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg"
//                     }`}
//                   >
//                     {paymentProcessing ? (
//                       <div className="flex items-center justify-center gap-2 text-sm">
//                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                         Processing...
//                       </div>
//                     ) : (
//                       <div className="flex items-center justify-center gap-2 text-sm">
//                         Pay with eSewa <IndianRupee size={12} />
//                         {calculateTotalAmount()}
//                       </div>
//                     )}
//                   </button>

//                   <button
//                     onClick={initiatePaymentAlternative}
//                     disabled={paymentProcessing}
//                     className="w-full py-2 px-4 rounded-lg font-medium text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition-all duration-300 text-xs"
//                   >
//                     Try Alternative Payment Method
//                   </button>

//                   <button
//                     onClick={initiateDirectPayment}
//                     disabled={paymentProcessing}
//                     className="w-full py-2 px-4 rounded-lg font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all duration-300 text-xs"
//                   >
//                     Direct Form Submission
//                   </button>
//                 </div>

//                 <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-3">
//                   <Shield className="w-3 h-3" />
//                   <span>256-bit SSL Secure</span>
//                 </div>

//                 <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
//                   <p className="font-medium">Note:</p>
//                   <p>
//                     If you get a 409 Conflict error, try the alternative methods
//                     above.
//                   </p>
//                   <p className="mt-1">Transaction ID: {lastTransactionId}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Tag,
  Clock,
  ArrowLeft,
  Image,
  ZoomIn,
  X,
  CreditCard,
  Plus,
  Minus,
  Ticket,
  Check,
  Shield,
  Heart,
  Share2,
  Bookmark,
  Edit3,
  User,
  Info,
  Lock,
  Star,
  MessageCircle,
  Phone,
  Mail,
  IndianRupee,
  ChevronRight,
  Eye,
  Map,
  Navigation,
  CalendarDays,
  Sparkles,
  BadgeCheck,
  Crown,
  UserPlus,
  AlertCircle,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import CryptoJS from "crypto-js";
import { toast } from "react-toastify";
import {
  addToEventsToAttendAsync,
  getMyEventsAsync,
  addToWatchlistAsync,
  removeFromWatchlistAsync,
  getAvailableSeatsAsync,
} from "../redux/slices/eventSlice";
import { getSubscriptionDetails } from "../redux/slices/subscriptionSlice";
import { MessageDialog } from "../components/MessageDialogue";
import GeoCheckIn from "../components/GeoCheckIn";

export function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSeatSelectionModal, setShowSeatSelectionModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [availableSeats, setAvailableSeats] = useState(null);
  const [seatPricing, setSeatPricing] = useState(null);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState(null);
  const [eventLimitExceeded, setEventLimitExceeded] = useState(false);
  const [userEventLimit, setUserEventLimit] = useState(0);
  const [usedEventSlots, setUsedEventSlots] = useState(0);
  const [isOrganizer, setIsOrganizer] = useState(false);

  const registrationRef = useRef(null);

  // Redux state
  const events = useSelector((state) => state.events.allEvents);
  const user = useSelector((state) => state.auth.user);
  const eventsToAttend = useSelector((state) => state.events.eventsToAttend);
  const watchlist = useSelector((state) => state.events.watchlist);
  const loadingEvents = useSelector((state) => state.events.loadingEvents);
  const subscription = useSelector((state) => state.subscriptions.subscription);
  console.log(subscription);

  // Check if user is already registered for this event or is the organizer
  const isRegistered =
    eventsToAttend?.some((ticket) => ticket.event?._id === id) || isOrganizer;

  const isEventInWatchlist = watchlist.some((event) => event._id === id);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckInSuccess = () => setCheckedIn(true);

  const esewaConfig = {
    merchantId: "EPAYTEST",
    baseUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    successUrl: `${
      window.location.origin
    }/payment-success?action=addToEventsToAttend&eventId=${id}&quantity=${ticketQuantity}&selectedSeats=${encodeURIComponent(
      JSON.stringify(selectedSeats)
    )}`,
    failureUrl: `${window.location.origin}/payment-failure?action=addToEventsToAttend`,
    secretKey: "8gBm/:&EnhH.1/q",
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${String(minutes).padStart(2, "0")} ${ampm}`;
  };

  // Check if user is the organizer
  useEffect(() => {
    if (user && eventData) {
      const organizerId = eventData.createdBy?._id || eventData.createdBy;
      setIsOrganizer(user._id === organizerId);
    }
  }, [user, eventData]);

  // Calculate user's event limit based on subscription
  useEffect(() => {
    if (subscription) {
      const planLimits = {
        basic: 1,
        premium: 3,
        platinum: 5,
      };

      const userPlan = subscription.plan?.toLowerCase() || "basic";
      const limit = planLimits[userPlan] || 1;
      setUserEventLimit(limit);

      // Calculate used event slots
      const usedSlots = eventsToAttend?.length || 0;
      setUsedEventSlots(usedSlots);

      // Check if user has reached their event limit
      if (usedSlots >= limit && !isRegistered) {
        setEventLimitExceeded(true);
      } else {
        setEventLimitExceeded(false);
      }
    } else {
      // Default to basic plan if no subscription
      setUserEventLimit(1);
      const usedSlots = eventsToAttend?.length || 0;
      setUsedEventSlots(usedSlots);

      if (usedSlots >= 1 && !isRegistered) {
        setEventLimitExceeded(true);
      } else {
        setEventLimitExceeded(false);
      }
    }
  }, [subscription, eventsToAttend, isRegistered]);

  useEffect(() => {
    if (user) {
      dispatch(getMyEventsAsync());
      dispatch(getSubscriptionDetails());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (events && events.length > 0) {
      const foundEvent = events.find((event) => event._id === id);
      if (foundEvent) {
        setEventData(foundEvent);
        if (foundEvent.seatPricing) {
          setSeatPricing({
            front: foundEvent.price + (foundEvent.seatPricing.front || 0),
            middle: foundEvent.price + (foundEvent.seatPricing.middle || 0),
            last: foundEvent.price + (foundEvent.seatPricing.last || 0),
          });
        } else {
          setSeatPricing({
            front: foundEvent.price,
            middle: foundEvent.price,
            last: foundEvent.price,
          });
        }
      }
      setLoading(false);
    }
  }, [events, id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-gradient-to-r from-emerald-500 to-green-500 text-white";
      case "pending":
        return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
      case "rejected":
        return "bg-gradient-to-r from-rose-500 to-pink-500 text-white";
      default:
        return "bg-gradient-to-r from-slate-500 to-gray-500 text-white";
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      technology: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
      music: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
      food: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
      arts: "bg-gradient-to-r from-pink-500 to-rose-500 text-white",
      business: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white",
      wellness: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
    };
    return (
      colors[category] ||
      "bg-gradient-to-r from-slate-500 to-gray-500 text-white"
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      technology: "💻",
      music: "🎵",
      food: "🍕",
      arts: "🎨",
      business: "💼",
      wellness: "🧘",
    };
    return icons[category] || "🎯";
  };

  const calculateTotalAmount = () => {
    if (!selectedSeats || !Array.isArray(selectedSeats)) return 0;

    const total = selectedSeats.reduce((total, seat) => {
      const seatPrice = Number(seat.seatPrice) || 0;
      return total + seatPrice;
    }, 0);

    return Math.max(0, total);
  };

  const calculateTotalAttendees = (attendees) =>
    attendees && Array.isArray(attendees) ? attendees.length : 0;

  // Get subscription plan info
  const getSubscriptionPlanInfo = () => {
    if (!subscription) {
      return {
        name: "Basic",
        icon: Star,
        color: "from-gray-500 to-gray-700",
        limit: 1,
        used: eventsToAttend?.length || 0,
      };
    }

    const plan = subscription.plan?.toLowerCase();
    const usedEvents = eventsToAttend?.length || 0;

    switch (plan) {
      case "premium":
        return {
          name: "Premium",
          icon: Zap,
          color: "from-purple-500 to-pink-600",
          limit: 3,
          used: usedEvents,
        };
      case "platinum":
        return {
          name: "Platinum",
          icon: Crown,
          color: "from-yellow-500 to-orange-600",
          limit: 5,
          used: usedEvents,
        };
      default:
        return {
          name: "Basic",
          icon: Star,
          color: "from-gray-500 to-gray-700",
          limit: 1,
          used: usedEvents,
        };
    }
  };

  const planInfo = getSubscriptionPlanInfo();

  // Generate unique transaction ID with better randomness
  const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const userId = user?._id ? user._id.slice(-6) : "guest";
    return `TX${timestamp}${random}${userId}`;
  };

  const generateSignature = (data) => {
    const total_amount = String(data.total_amount || "0");
    const transaction_uuid = String(data.transaction_uuid || "");
    const product_code = String(data.product_code || "");

    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

    console.log("Signature Message:", message);

    const hash = CryptoJS.HmacSHA256(message, esewaConfig.secretKey);
    const signature = CryptoJS.enc.Base64.stringify(hash);

    console.log("Generated Signature:", signature);
    return signature;
  };

  const addEventToAttendingList = async (quantity = 1) => {
    if (!user || !id) {
      toast.error("Please login to register");
      return;
    }

    // Check if user is the organizer
    if (isOrganizer) {
      toast.error("You cannot register for your own event");
      return;
    }

    // Check event limit before proceeding
    if (eventLimitExceeded) {
      toast.error(
        `You have reached your event limit (${userEventLimit} events). Please upgrade your subscription to register for more events.`
      );
      return;
    }

    try {
      const result = await dispatch(
        addToEventsToAttendAsync({ eventId: id, quantity, selectedSeats })
      ).unwrap();
      if (result) {
        toast.success("Successfully registered!");
        dispatch(getMyEventsAsync());
        dispatch(getSubscriptionDetails());
        setShowSeatSelectionModal(false);
        setSelectedSeats([]);
      }
    } catch (error) {
      toast.error(error.message || "Failed to register");
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      toast.error("Please login to bookmark");
      navigate("/login", { state: { from: `event/${id}` } });
      return;
    }
    try {
      if (isEventInWatchlist) {
        await dispatch(removeFromWatchlistAsync(eventData._id)).unwrap();
        toast.success("Removed from watchlist");
      } else {
        await dispatch(addToWatchlistAsync(eventData._id)).unwrap();
        toast.success("Added to watchlist");
      }
    } catch (error) {
      toast.error("Failed to update watchlist");
    }
  };

  const initiatePayment = () => {
    setPaymentProcessing(true);

    console.log("=== PAYMENT INITIATION ===");

    // Generate unique transaction ID
    const transactionId = generateTransactionId();
    setLastTransactionId(transactionId);

    const totalAmount = calculateTotalAmount();

    // Validate payment conditions
    if (totalAmount <= 0) {
      toast.error("Invalid payment amount. Please select seats properly.");
      setPaymentProcessing(false);
      return;
    }

    if (selectedSeats.length !== ticketQuantity) {
      toast.error(`Please select exactly ${ticketQuantity} seat(s)`);
      setPaymentProcessing(false);
      return;
    }

    // Store payment data in sessionStorage as backup
    const paymentBackupData = {
      eventId: id,
      quantity: ticketQuantity,
      selectedSeats: selectedSeats,
      transactionId: transactionId,
      totalAmount: totalAmount,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(
      `pendingPayment_${id}`,
      JSON.stringify(paymentBackupData)
    );

    // Prepare payment data with proper formatting
    const paymentData = {
      amount: totalAmount.toFixed(2),
      tax_amount: "0.00",
      total_amount: totalAmount.toFixed(2),
      transaction_uuid: transactionId,
      product_code: esewaConfig.merchantId,
      product_service_charge: "0.00",
      product_delivery_charge: "0.00",
      success_url: esewaConfig.successUrl,
      failure_url: esewaConfig.failureUrl,
      signed_field_names: "total_amount,transaction_uuid,product_code",
    };

    console.log("Payment Data:", paymentData);

    // Generate signature
    paymentData.signature = generateSignature(paymentData);

    console.log("Final Payment Data with Signature:", paymentData);

    // Submit payment using the standard eSewa form
    submitEsewaPayment(paymentData);
  };

  const submitEsewaPayment = (paymentData) => {
    try {
      // Remove any existing eSewa forms to avoid conflicts
      const existingForms = document.querySelectorAll('form[action*="esewa"]');
      existingForms.forEach((form) => form.remove());

      // Create new form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = esewaConfig.baseUrl;
      form.style.display = "none";

      // Add all payment fields
      Object.keys(paymentData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);

      console.log("Submitting form to eSewa...");
      form.submit();
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast.error("Payment submission failed. Please try again.");
    } finally {
      setPaymentProcessing(false);
      setShowPaymentModal(false);
    }
  };

  // Alternative payment method with different approach
  const initiatePaymentAlternative = () => {
    setPaymentProcessing(true);

    const transactionId = generateTransactionId();
    setLastTransactionId(transactionId);

    const totalAmount = calculateTotalAmount();

    if (totalAmount <= 0) {
      toast.error("Invalid payment amount.");
      setPaymentProcessing(false);
      return;
    }

    // Use simpler field names and structure
    const form = document.createElement("form");
    form.method = "POST";
    form.action = esewaConfig.baseUrl;
    form.style.display = "none";

    const amount = totalAmount.toFixed(2);

    const fields = {
      amount: amount,
      tax_amount: "0",
      total_amount: amount,
      transaction_uuid: transactionId,
      product_code: esewaConfig.merchantId,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: esewaConfig.successUrl,
      failure_url: esewaConfig.failureUrl,
      signed_field_names: "total_amount,transaction_uuid,product_code",
    };

    // Generate signature
    const signatureMessage = `total_amount=${fields.total_amount},transaction_uuid=${fields.transaction_uuid},product_code=${fields.product_code}`;
    const signature = CryptoJS.HmacSHA256(
      signatureMessage,
      esewaConfig.secretKey
    );
    fields.signature = CryptoJS.enc.Base64.stringify(signature);

    console.log("Alternative Payment Fields:", fields);

    // Add fields to form
    Object.keys(fields).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = fields[key];
      form.appendChild(input);
    });

    // Clear any existing forms and submit
    const existingForms = document.querySelectorAll('form[action*="esewa"]');
    existingForms.forEach((form) => form.remove());

    document.body.appendChild(form);

    setTimeout(() => {
      console.log("Submitting alternative payment...");
      form.submit();
      setPaymentProcessing(false);
      setShowPaymentModal(false);
    }, 100);
  };

  // Direct form submission without JavaScript interference
  const initiateDirectPayment = () => {
    const transactionId = generateTransactionId();
    const totalAmount = calculateTotalAmount();

    const form = document.createElement("form");
    form.method = "POST";
    form.action = esewaConfig.baseUrl;
    form.style.display = "none";

    const amount = totalAmount.toFixed(2);

    // Minimal required fields only
    const fields = {
      amount: amount,
      tax_amount: "0",
      total_amount: amount,
      transaction_uuid: transactionId,
      product_code: esewaConfig.merchantId,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: esewaConfig.successUrl,
      failure_url: esewaConfig.failureUrl,
      signed_field_names: "total_amount,transaction_uuid,product_code",
    };

    // Generate signature
    const signatureMessage = `total_amount=${fields.total_amount},transaction_uuid=${fields.transaction_uuid},product_code=${fields.product_code}`;
    const signature = CryptoJS.HmacSHA256(
      signatureMessage,
      esewaConfig.secretKey
    );
    fields.signature = CryptoJS.enc.Base64.stringify(signature);

    // Add fields
    Object.keys(fields).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = fields[key];
      form.appendChild(input);
    });

    // Use a different approach - create in iframe
    const iframe = document.createElement("iframe");
    iframe.name = "esewa_payment_frame";
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    form.target = "esewa_payment_frame";
    document.body.appendChild(form);

    form.submit();

    // Clean up after submission
    setTimeout(() => {
      document.body.removeChild(iframe);
      document.body.removeChild(form);
    }, 5000);

    setPaymentProcessing(false);
    setShowPaymentModal(false);
  };

  const handleRegistration = async () => {
    if (!user) {
      toast.error("Please login to register");
      navigate("/login", { state: { from: `event/${id}` } });
      return;
    }

    // Check if user is the organizer
    if (isOrganizer) {
      toast.error("You cannot register for your own event");
      return;
    }

    // Check event limit before proceeding
    if (eventLimitExceeded) {
      toast.error(
        `You have reached your event limit (${userEventLimit} events). Please upgrade your subscription to register for more events.`
      );
      return;
    }

    if (eventData.price === 0) {
      addEventToAttendingList(1);
    } else {
      setLoadingSeats(true);
      try {
        const result = await dispatch(getAvailableSeatsAsync(id)).unwrap();
        setAvailableSeats(result.availableSeats);
        setSeatPricing(result.seatPricing);
        setShowSeatSelectionModal(true);
      } catch (error) {
        toast.error("Failed to load seats");
      } finally {
        setLoadingSeats(false);
      }
    }
  };

  const handleSeatSelection = (seatType, seatNumber) => {
    if (selectedSeats.length >= ticketQuantity) {
      toast.error(`Max ${ticketQuantity} seat(s)`);
      return;
    }
    const seatPrice = seatPricing[seatType];
    setSelectedSeats((prev) => [...prev, { seatType, seatNumber, seatPrice }]);
  };

  const handleRemoveSeat = (seatNumber) => {
    setSelectedSeats((prev) => prev.filter((s) => s.seatNumber !== seatNumber));
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length !== ticketQuantity) {
      toast.error(`Please select exactly ${ticketQuantity} seat(s)`);
      return;
    }
    setShowSeatSelectionModal(false);
    setShowPaymentModal(true);
  };

  const incrementQuantity = () => setTicketQuantity((prev) => prev + 1);
  const decrementQuantity = () => {
    if (ticketQuantity > 1) {
      setTicketQuantity((prev) => prev - 1);
      setSelectedSeats((prev) => prev.slice(0, ticketQuantity - 1));
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventData.title,
          text: eventData.description,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  const handleManageTickets = () => navigate("/myevents/attend");

  const handleViewTicket = () => navigate("/myevents/attend");

  const handleUpgradeSubscription = () => navigate("/subscription");

  const getSeatTypeColor = (type) => {
    switch (type) {
      case "front":
        return "bg-red-500 border-red-600";
      case "middle":
        return "bg-blue-500 border-blue-600";
      case "last":
        return "bg-green-500 border-green-600";
      default:
        return "bg-gray-500 border-gray-600";
    }
  };

  const getSeatTypeName = (type) => {
    switch (type) {
      case "front":
        return "Front Row";
      case "middle":
        return "Middle Section";
      case "last":
        return "Last Section";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-700">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <Tag className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Event Not Found
          </h1>
          <p className="text-slate-600 mb-6">
            The event doesn't exist or has been removed.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" /> Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 pb-20">
      {showMessageDialog && eventData && (
        <MessageDialog
          organizer={eventData.createdBy || user}
          event={eventData}
          isOpen={showMessageDialog}
          onClose={() => setShowMessageDialog(false)}
        />
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:border-blue-300 hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
            <span className="text-slate-700 font-medium">Back to Events</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBookmarkToggle}
              disabled={loadingEvents[eventData._id]}
              className={`p-3 rounded-2xl transition-all duration-300 backdrop-blur-sm ${
                isEventInWatchlist
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                  : "bg-white/80 text-slate-600 hover:bg-blue-50 shadow-lg hover:shadow-xl"
              } hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20`}
            >
              {loadingEvents[eventData._id] ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Bookmark
                  className={`w-5 h-5 transition-transform ${
                    isEventInWatchlist ? "fill-current scale-110" : ""
                  }`}
                />
              )}
            </button>
            <button
              onClick={handleShare}
              className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl text-slate-600 hover:bg-slate-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-white/20"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subscription Status */}
            {user && (
              <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center gap-3 mb-3 md:mb-0">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-r ${planInfo.color} text-white shadow-md`}
                    >
                      <planInfo.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        {planInfo.name} Plan
                      </h3>
                      <p className="text-xs text-slate-600">
                        Event Limit: {planInfo.used}/{planInfo.limit} used
                      </p>
                    </div>
                  </div>
                  <div className="w-full md:w-48 bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${planInfo.color} transition-all duration-500`}
                      style={{
                        width: `${Math.min(
                          (planInfo.used / planInfo.limit) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
                {eventLimitExceeded && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        Event limit reached!{" "}
                        {planInfo.name === "Basic" &&
                          "Upgrade to register for more events."}
                        {planInfo.name === "Premium" &&
                          "Upgrade to Platinum for more events."}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                  eventData.status
                )}`}
              >
                {eventData.status.charAt(0).toUpperCase() +
                  eventData.status.slice(1)}
              </span>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getCategoryColor(
                  eventData.category
                )}`}
              >
                <span className="mr-1">
                  {getCategoryIcon(eventData.category)}
                </span>
                {eventData.category.charAt(0).toUpperCase() +
                  eventData.category.slice(1)}
              </span>
              {eventData.price > 0 ? (
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <IndianRupee className="w-3 h-3 inline mr-1" /> Paid Event
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                  <Crown className="w-3 h-3 inline mr-1" /> Free Event
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-slate-800 leading-tight">
              {eventData.title}
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed">
              {eventData.description}
            </p>

            {/* Banner */}
            <div className="relative overflow-hidden rounded-2xl shadow-xl group">
              {eventData.banner ? (
                <>
                  <div className="relative">
                    {!imageLoaded && (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center">
                        <div className="text-center">
                          <Image className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-pulse" />
                          <p className="text-slate-500 text-sm">Loading...</p>
                        </div>
                      </div>
                    )}
                    <img
                      src={`http://localhost:5000/uploads/event-banners/${eventData.banner}`}
                      alt={eventData.title}
                      className={`w-full aspect-[16/9] object-cover transition-all duration-700 group-hover:scale-105 ${
                        imageLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      onLoad={() => setImageLoaded(true)}
                    />
                    <button
                      onClick={() => setShowZoomModal(true)}
                      className="absolute top-4 right-4 p-2 bg-white/90 text-slate-700 rounded-xl backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                  {showZoomModal && (
                    <div
                      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm"
                      onClick={() => setShowZoomModal(false)}
                    >
                      <div className="max-w-6xl max-h-full">
                        <img
                          src={`http://localhost:5000/uploads/event-banners/${eventData.banner}`}
                          alt={eventData.title}
                          className="w-full h-full object-contain rounded-xl"
                        />
                      </div>
                      <button
                        className="absolute top-6 right-6 p-3 bg-black/80 text-white rounded-xl hover:bg-black transition-all duration-300 hover:scale-110"
                        onClick={() => setShowZoomModal(false)}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-[16/9] bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-white flex items-center justify-center shadow-lg">
                      <Tag className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-lg font-medium">No Banner</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex border-b border-slate-200/60 mb-6 overflow-x-auto">
                {[
                  { id: "details", label: "Event Details", icon: CalendarDays },
                  { id: "location", label: "Location & Date", icon: Map },
                  {
                    id: "attendees",
                    label: `Attendees (${calculateTotalAttendees(
                      eventData.attendees
                    )})`,
                    icon: Users,
                  },
                  { id: "organizer", label: "Organizer", icon: User },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      className={`flex items-center gap-2 px-4 py-3 font-medium text-sm relative whitespace-nowrap transition-all duration-300 ${
                        activeTab === tab.id
                          ? "text-blue-600"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="min-h-[300px]">
                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-1">
                            Event Date
                          </p>
                          <p className="text-base font-semibold text-slate-800">
                            {format(
                              new Date(eventData.date),
                              "EEE, MMM d, yyyy"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-1">
                            Event Time
                          </p>
                          <p className="text-base font-semibold text-slate-800">{`${formatTime(
                            eventData.startTime
                          )} - ${formatTime(eventData.endTime)}`}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-1">
                            Location
                          </p>
                          <p className="text-base font-semibold text-slate-800">
                            {eventData.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                          <IndianRupee className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-1">
                            Base Price
                          </p>
                          <div className="flex items-center gap-1">
                            <IndianRupee
                              size={16}
                              strokeWidth={2}
                              className="opacity-90"
                            />
                            <p className="text-base font-semibold text-slate-800">
                              {eventData.basePrice}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {eventData.price > 0 && (
                      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200/50">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-blue-500" /> Seat
                          Pricing
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          {["front", "middle", "last"].map((seat) => (
                            <div
                              key={seat}
                              className="text-center p-4 bg-white rounded-lg border border-slate-200 shadow-sm"
                            >
                              <div
                                className={`w-12 h-12 mx-auto mb-3 rounded-lg ${getSeatTypeColor(
                                  seat
                                )} flex items-center justify-center`}
                              >
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <h4 className="font-semibold text-slate-800">
                                {getSeatTypeName(seat)}
                              </h4>
                              <p className="text-sm text-slate-600 mb-2">
                                {seat === "front"
                                  ? "Best view"
                                  : seat === "middle"
                                  ? "Great value"
                                  : "Economy"}
                              </p>
                              <div className="flex items-center justify-center gap-1">
                                <IndianRupee
                                  size={14}
                                  strokeWidth={2}
                                  className="opacity-90"
                                />
                                <span className="font-bold text-slate-800">
                                  {seatPricing
                                    ? seatPricing[seat]
                                    : eventData.price}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "location" && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                          <CalendarDays className="w-5 h-5 text-blue-500" />
                          Event Schedule
                        </h3>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200/50 shadow-sm">
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-slate-600">
                                Date
                              </p>
                              <p className="text-base font-semibold text-slate-800">
                                {format(
                                  new Date(eventData.date),
                                  "EEE, MMM d, yyyy"
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-600">
                                Time
                              </p>
                              <p className="text-base font-semibold text-slate-800">
                                {`${formatTime(
                                  eventData.startTime
                                )} - ${formatTime(eventData.endTime)}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-orange-500" />
                          Event Location
                        </h3>
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200/50 shadow-sm">
                          <p className="text-sm font-medium text-slate-600 mb-1">
                            Address
                          </p>
                          <p className="text-base font-semibold text-slate-800 mb-3">
                            {eventData.location}
                          </p>
                          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                            <Navigation className="w-4 h-4" />
                            Get Directions
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Map className="w-5 h-5 text-green-500" />
                        Location Map
                      </h3>
                      <div className="bg-slate-100 rounded-xl p-3 h-80 flex items-center justify-center shadow-inner">
                        {eventData.coordinates ? (
                          <MapContainer
                            center={[
                              eventData.coordinates.lat,
                              eventData.coordinates.lng,
                            ]}
                            zoom={15}
                            scrollWheelZoom={false}
                            style={{
                              height: "100%",
                              width: "100%",
                              borderRadius: "12px",
                            }}
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker
                              position={[
                                eventData.coordinates.lat,
                                eventData.coordinates.lng,
                              ]}
                            />
                          </MapContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-500">
                            <MapPin className="w-10 h-10 mr-2 text-slate-400" />
                            <div>
                              <p className="font-medium">
                                Location map not available
                              </p>
                              <p className="text-sm">
                                Check the address above for directions
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "attendees" && (
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">
                      Event Attendees ({eventData.attendees?.length || 0})
                    </h2>
                    <div className="grid gap-3">
                      {eventData.attendees && eventData.attendees.length > 0 ? (
                        eventData.attendees
                          .slice(0, 8)
                          .map((attendeeId, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">
                                  Anonymous User
                                </p>
                                <p className="text-sm text-slate-600">
                                  Registered attendee
                                </p>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                          <p className="font-medium mb-1">No attendees yet</p>
                          <p className="text-sm">
                            Be the first to register for this amazing event!
                          </p>
                        </div>
                      )}
                      {eventData.attendees &&
                        eventData.attendees.length > 8 && (
                          <div className="text-center mt-4">
                            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 text-sm">
                              View all {eventData.attendees.length} attendees
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {activeTab === "organizer" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl border border-slate-200/50 shadow-sm">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-lg font-semibold text-slate-800">
                            {eventData.createdBy?.name || "Unknown Organizer"}
                          </p>
                          <BadgeCheck className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-slate-600 text-sm mb-2">
                          {eventData.createdBy?.eventToOrganize?.length || 0}{" "}
                          events hosted
                        </p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-4 h-4 fill-amber-400 text-amber-400"
                            />
                          ))}
                          <span className="text-sm font-medium text-slate-600 ml-1">
                            4.8/5.0
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <button
                        onClick={() => setShowMessageDialog(true)}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <MessageCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-slate-800">
                            Message the organizer
                          </p>
                          <p className="text-sm text-slate-600">
                            Send a direct message
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      </button>

                      <button className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-green-300 transition-all duration-300 hover:shadow-md group">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <Phone className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-slate-800">
                            Call the organizer
                          </p>
                          <p className="text-sm text-slate-600">
                            Available during business hours
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-green-500 transition-colors" />
                      </button>

                      <button className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-orange-300 transition-all duration-300 hover:shadow-md group">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <Mail className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-slate-800">
                            Email the organizer
                          </p>
                          <p className="text-sm text-slate-600">
                            Get a response within 24 hours
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div
              ref={registrationRef}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Join this Event
                </h3>
                <p className="text-slate-600 text-sm">Reserve your spot now</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200/50">
                  <span className="text-slate-700 text-sm font-medium">
                    Base Price
                  </span>
                  <span className="flex items-center gap-x-1 text-base font-semibold text-slate-800">
                    <IndianRupee
                      size={14}
                      strokeWidth={2}
                      className="opacity-90"
                    />
                    <p>{eventData.basePrice}</p>
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200/50">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-slate-700 text-sm font-medium">
                      Attendees
                    </span>
                  </div>
                  <span className="text-base font-semibold text-blue-800">
                    {calculateTotalAttendees(eventData.attendees)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200/50">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-orange-600" />
                    <span className="text-slate-700 text-sm font-medium">
                      Max Capacity
                    </span>
                  </div>
                  <span className="text-base font-semibold text-orange-800">
                    {eventData.totalSeats}
                  </span>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-700 text-sm font-medium">
                        Selected Seats ({selectedSeats.length})
                      </span>
                      <span className="text-green-800 font-semibold">
                        <IndianRupee size={12} strokeWidth={2} />
                        {calculateTotalAmount()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedSeats.map((seat, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-white text-green-800 text-xs rounded border border-green-200"
                        >
                          {seat.seatNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!user ? (
                <div className="text-center py-3">
                  <div className="mb-4 flex items-center justify-center gap-2 text-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-200/50">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">Login required</span>
                  </div>
                  <button
                    onClick={() =>
                      navigate("/login", { state: { from: `event/${id}` } })
                    }
                    className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg"
                  >
                    Login to Register
                  </button>
                </div>
              ) : isOrganizer ? (
                <div className="text-center py-3">
                  <div className="mb-4 flex items-center justify-center gap-2 text-blue-600 bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200/50">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      You are the organizer
                    </span>
                  </div>
                  <button
                    className="w-full py-3 px-4 rounded-lg font-semibold text-base bg-gradient-to-br from-blue-500 to-cyan-600 text-white cursor-not-allowed"
                    disabled
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Event Organizer
                    </span>
                  </button>
                  <p className="text-xs text-slate-600 mt-3 text-center">
                    As the organizer, you don't need to register for your own
                    event.
                  </p>
                </div>
              ) : isRegistered ? (
                <>
                  <button className="w-full py-3 px-4 rounded-lg font-semibold text-base bg-gradient-to-br from-emerald-500 to-green-600 text-white cursor-not-allowed">
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Already Registered
                    </span>
                  </button>
                  <button
                    onClick={handleViewTicket}
                    className="w-full mt-3 py-2.5 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" /> View Ticket
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleRegistration}
                    disabled={loadingSeats || eventLimitExceeded}
                    className={`cursor-pointer w-full py-3 px-4 rounded-lg font-semibold text-base text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                      eventLimitExceeded
                        ? "bg-gradient-to-br from-gray-500 to-gray-600"
                        : "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    }`}
                  >
                    {loadingSeats ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                      </div>
                    ) : eventLimitExceeded ? (
                      "Event Limit Reached"
                    ) : (
                      "Register Now"
                    )}
                  </button>

                  {eventLimitExceeded && (
                    <button
                      onClick={handleUpgradeSubscription}
                      className="w-full mt-3 py-2.5 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm"
                    >
                      <ArrowUpRight className="w-4 h-4" /> Upgrade Plan
                    </button>
                  )}
                </>
              )}

              {eventData.price === 0 && (
                <p className="text-xs text-emerald-600 mt-4 text-center font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-200/50">
                  This is a free event! Registration is instant.
                </p>
              )}
            </div>

            {/* Event Info Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20">
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Event Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                  <span className="text-slate-600 text-sm font-medium">
                    Event ID
                  </span>
                  <span className="text-slate-800 font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                    {eventData._id.slice(-8)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                  <span className="text-slate-600 text-sm font-medium">
                    Created
                  </span>
                  <span className="text-slate-800 text-sm">
                    {eventData.createdAt
                      ? new Date(eventData.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                  <span className="text-slate-600 text-sm font-medium">
                    Updated
                  </span>
                  <span className="text-slate-800 text-sm">
                    {eventData.updatedAt
                      ? new Date(eventData.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 text-sm font-medium">
                    Status
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      eventData.status
                    )}`}
                  >
                    {eventData.status.charAt(0).toUpperCase() +
                      eventData.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Share Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">
                Share this event
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200/50 hover:border-blue-300 transition-all duration-300 hover:shadow-md group">
                  <svg
                    className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-sm font-medium">Facebook</span>
                </button>
                <button className="flex items-center justify-center gap-2 p-3 bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg border border-sky-200/50 hover:border-sky-300 transition-all duration-300 hover:shadow-md group">
                  <svg
                    className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.027 10.027 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
                  </svg>
                  <span className="text-sm font-medium">Twitter</span>
                </button>
                <button className="flex items-center justify-center gap-2 p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border border-pink-200/50 hover:border-pink-300 transition-all duration-300 hover:shadow-md group">
                  <svg
                    className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.420.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                  </svg>
                  <span className="text-sm font-medium">Instagram</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 p-3 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border border-slate-200/50 hover:border-slate-300 transition-all duration-300 hover:shadow-md group"
                >
                  <Share2 className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Copy Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Seat Selection Modal */}
        {showSeatSelectionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Select Your Seats</h2>
                    <p className="text-white/90 text-sm mt-1">
                      Choose {ticketQuantity} seat(s) for {eventData.title}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowSeatSelectionModal(false);
                      setSelectedSeats([]);
                    }}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>

              <div
                className="p-6 overflow-y-auto"
                style={{ maxHeight: "calc(90vh - 120px)" }}
              >
                {loadingSeats ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-600">Loading seats...</p>
                    </div>
                  </div>
                ) : availableSeats ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Seat Map */}
                    <div className="lg:col-span-2">
                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <Ticket className="h-5 w-5 text-purple-600" /> Seat
                          Map
                        </h3>

                        {/* Stage */}
                        <div className="text-center mb-8">
                          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg shadow-lg">
                            <h4 className="font-semibold">STAGE</h4>
                          </div>
                          <div className="text-xs text-slate-500 mt-2">
                            All seats face the stage
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          {Object.entries(availableSeats).map(
                            ([type, data]) => (
                              <div
                                key={type}
                                className="text-center p-3 rounded-lg bg-white border border-slate-200"
                              >
                                <div
                                  className={`w-6 h-6 mx-auto mb-2 rounded border-2 ${getSeatTypeColor(
                                    type
                                  )}`}
                                ></div>
                                <div className="text-sm font-semibold text-slate-800">
                                  {getSeatTypeName(type)}
                                </div>
                                <div className="text-xs text-slate-600">
                                  {data?.length || 0} available
                                </div>
                                <div className="text-sm font-bold text-slate-800 mt-1">
                                  <IndianRupee size={12} className="inline" />
                                  {seatPricing[type]}
                                </div>
                              </div>
                            )
                          )}
                        </div>

                        {/* Seat Grid */}
                        <div className="space-y-6">
                          {["front", "middle", "last"].map((type) => (
                            <div key={type}>
                              <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded ${getSeatTypeColor(
                                    type
                                  )}`}
                                ></div>
                                {getSeatTypeName(type)}
                                <span className="text-sm text-slate-500 font-normal">
                                  -{" "}
                                  {type === "front"
                                    ? "Best view"
                                    : type === "middle"
                                    ? "Great value"
                                    : "Economy"}
                                </span>
                              </h4>
                              <div className="grid grid-cols-8 gap-2">
                                {availableSeats[type]?.map((seatNumber) => {
                                  const isSelected = selectedSeats.some(
                                    (s) => s.seatNumber === seatNumber
                                  );
                                  const isDisabled =
                                    selectedSeats.length >= ticketQuantity &&
                                    !isSelected;
                                  return (
                                    <button
                                      key={seatNumber}
                                      onClick={() =>
                                        !isDisabled &&
                                        handleSeatSelection(type, seatNumber)
                                      }
                                      disabled={isDisabled}
                                      className={`
                                        relative p-2 rounded-lg text-xs font-medium transition-all duration-200
                                        ${
                                          isSelected
                                            ? "bg-purple-600 text-white border-2 border-purple-700 transform scale-105"
                                            : isDisabled
                                            ? "bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed"
                                            : "bg-white text-slate-800 border-2 border-slate-300 hover:border-purple-400 hover:bg-purple-50"
                                        }
                                        ${getSeatTypeColor(type).split(" ")[0]}
                                      `}
                                    >
                                      {seatNumber}
                                      {isSelected && (
                                        <Check className="absolute -top-1 -right-1 h-3 w-3 text-white bg-green-500 rounded-full p-0.5" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                          Your Selection
                        </h3>
                        {selectedSeats.length === 0 ? (
                          <div className="text-center py-8 text-slate-500">
                            <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            <p className="font-medium">No seats selected</p>
                            <p className="text-sm mt-1">
                              Click on available seats
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              {selectedSeats.map((seat, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-4 h-4 rounded ${getSeatTypeColor(
                                        seat.seatType
                                      )}`}
                                    ></div>
                                    <span className="font-medium text-slate-800">
                                      {seat.seatNumber}
                                    </span>
                                    <span className="text-sm text-slate-600 capitalize">
                                      ({seat.seatType})
                                    </span>
                                  </div>
                                  <div className="flex items-center text-slate-800 font-semibold">
                                    <IndianRupee
                                      size={14}
                                      className="opacity-70"
                                    />
                                    {seat.seatPrice}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="border-t border-slate-200 pt-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-600">Seats:</span>
                                <span className="font-semibold text-slate-800">
                                  {selectedSeats.length}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-lg font-bold text-slate-800">
                                <span>Total:</span>
                                <span className="flex items-center">
                                  <IndianRupee
                                    size={16}
                                    className="opacity-80"
                                  />
                                  {calculateTotalAmount()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quantity & Proceed */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-600">
                              Quantity:
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={decrementQuantity}
                                disabled={ticketQuantity <= 1}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center font-bold text-slate-800">
                                {ticketQuantity}
                              </span>
                              <button
                                onClick={incrementQuantity}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-all duration-200"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-600">Selected</p>
                            <p className="text-lg font-bold text-slate-800">
                              {selectedSeats.length} / {ticketQuantity}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleProceedToPayment}
                          disabled={selectedSeats.length !== ticketQuantity}
                          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          Proceed to Payment ({selectedSeats.length} seats)
                        </button>
                        <button
                          onClick={() => {
                            setShowSeatSelectionModal(false);
                            setSelectedSeats([]);
                          }}
                          className="w-full py-3 px-4 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Help */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-700">
                            <p className="font-medium">Selection Guide</p>
                            <ul className="mt-1 space-y-1">
                              <li>• Click to select/deselect</li>
                              <li>• Gray = booked</li>
                              <li>• Max {ticketQuantity} seat(s)</li>
                              <li>• Reserved during payment</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-600">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                    <p className="font-medium">Failed to load seats</p>
                    <p className="text-sm mt-1">Try again later</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-200 group ring-2 ring-white/20 hover:ring-white/30"
              >
                <X className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
              </button>
              <div className="bg-gradient-to-r from-[#34d399] to-[#059669] p-5 text-white pt-14">
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src="https://esewa.com.np/common/images/esewa-logo.png"
                    alt="eSewa"
                    style={{ width: "80px", height: "auto" }}
                  />
                  <div>
                    <h3 className="text-lg font-bold">eSewa Payment</h3>
                    <p className="text-green-100 text-xs">Secure Wallet</p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-green-50 text-xs mb-1">Paying for</p>
                  <p className="font-semibold text-sm truncate">
                    {eventData.title}
                  </p>
                </div>
              </div>
              <div className="p-5">
                <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                    <Ticket className="w-4 h-4 text-green-600" /> Selected Seats
                  </h4>
                  <div className="space-y-2">
                    {selectedSeats.map((seat, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-xs bg-white p-2 rounded border border-slate-200"
                      >
                        <span className="text-slate-700">
                          {seat.seatNumber} ({getSeatTypeName(seat.seatType)})
                        </span>
                        <span className="font-medium">
                          <IndianRupee
                            size={10}
                            strokeWidth={2}
                            className="inline"
                          />
                          {seat.seatPrice}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <span className="font-semibold text-slate-800 text-sm">
                        Total:
                      </span>
                      <span className="flex items-center text-lg font-bold text-green-700">
                        <IndianRupee
                          size={14}
                          strokeWidth={2}
                          className="opacity-80"
                        />
                        <p> {calculateTotalAmount()} </p>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={initiatePayment}
                    disabled={paymentProcessing}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      paymentProcessing
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg"
                    }`}
                  >
                    {paymentProcessing ? (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        Pay with eSewa <IndianRupee size={12} />
                        {calculateTotalAmount()}
                      </div>
                    )}
                  </button>

                  <button
                    onClick={initiatePaymentAlternative}
                    disabled={paymentProcessing}
                    className="w-full py-2 px-4 rounded-lg font-medium text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition-all duration-300 text-xs"
                  >
                    Try Alternative Payment Method
                  </button>

                  <button
                    onClick={initiateDirectPayment}
                    disabled={paymentProcessing}
                    className="w-full py-2 px-4 rounded-lg font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all duration-300 text-xs"
                  >
                    Direct Form Submission
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-3">
                  <Shield className="w-3 h-3" />
                  <span>256-bit SSL Secure</span>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                  <p className="font-medium">Note:</p>
                  <p>
                    If you get a 409 Conflict error, try the alternative methods
                    above.
                  </p>
                  <p className="mt-1">Transaction ID: {lastTransactionId}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

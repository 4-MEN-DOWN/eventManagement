// import { useEffect, useState, useMemo } from "react";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";

// import { toast } from "react-toastify";
// import {
//   CheckCircle,
//   Smartphone,
//   Mail,
//   Download,
//   Home,
//   Calendar,
//   Users,
//   Ticket,
//   User,
//   MapPin,
//   Clock,
//   IndianRupee,
//   AlertCircle,
//   Loader,
// } from "lucide-react";
// import { addToEventsToAttendAsync } from "../../redux/slices/eventSlice";

// export function PaymentSuccess() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [processed, setProcessed] = useState(false);
//   const [processing, setProcessing] = useState(false);
//   const [eventData, setEventData] = useState(null);
//   const [paymentData, setPaymentData] = useState(null);

//   // Parse URL parameters with better error handling
//   const parseUrlParameters = () => {
//     const currentUrl = window.location.href;
//     console.log("🔍 Full URL:", currentUrl);

//     let params = {};

//     try {
//       // Try to get from URL first
//       const urlObj = new URL(currentUrl);
//       const urlParams = new URLSearchParams(urlObj.search);

//       params = {
//         action: urlParams.get("action"),
//         eventId: urlParams.get("eventId"),
//         quantity: parseInt(urlParams.get("quantity")) || 1,
//         totalAmount: urlParams.get("totalAmount"),
//         transaction_uuid:
//           urlParams.get("transaction_uuid") ||
//           urlParams.get("transaction_uuid"),
//       };

//       // Parse selectedSeats from URL
//       let selectedSeats = [];
//       const seatsParam = urlParams.get("selectedSeats");
//       if (seatsParam) {
//         try {
//           selectedSeats = JSON.parse(decodeURIComponent(seatsParam));
//         } catch (e) {
//           console.error("Error parsing selectedSeats from URL:", e);
//         }
//       }
//       params.selectedSeats = selectedSeats;

//       console.log("✅ URL Parameters:", params);
//     } catch (error) {
//       console.error("Error parsing URL:", error);
//     }

//     return params;
//   };

//   // Get payment data from sessionStorage as fallback
//   const getPaymentDataFromStorage = (eventId) => {
//     try {
//       const stored = sessionStorage.getItem(`pendingPayment_${eventId}`);
//       if (stored) {
//         const data = JSON.parse(stored);
//         console.log("📦 Retrieved from storage:", data);

//         // Check if data is not too old (5 minutes)
//         if (Date.now() - data.timestamp < 5 * 60 * 1000) {
//           return data;
//         } else {
//           sessionStorage.removeItem(`pendingPayment_${eventId}`);
//         }
//       }
//     } catch (error) {
//       console.error("Error getting data from storage:", error);
//     }
//     return null;
//   };

//   const urlParams = parseUrlParameters();
//   const eventId = urlParams.eventId;

//   // Get complete payment data
//   const getCompletePaymentData = () => {
//     const urlData = { ...urlParams };

//     // If we're missing critical data, try to get from storage
//     if (
//       (!urlData.selectedSeats ||
//         urlData.selectedSeats.length === 0 ||
//         !urlData.transaction_uuid) &&
//       eventId
//     ) {
//       const storedData = getPaymentDataFromStorage(eventId);
//       if (storedData) {
//         console.log("🔄 Using stored data to fill missing fields");
//         return {
//           ...urlData,
//           selectedSeats: urlData.selectedSeats?.length
//             ? urlData.selectedSeats
//             : storedData.selectedSeats,
//           transaction_uuid:
//             urlData.transaction_uuid || storedData.transactionId,
//           quantity: urlData.quantity || storedData.quantity,
//           totalAmount: urlData.totalAmount || storedData.totalAmount,
//         };
//       }
//     }

//     return urlData;
//   };

//   const completePaymentData = getCompletePaymentData();

//   console.log("🎯 Final Payment Data:", completePaymentData);

//   // Fetch event data
//   useEffect(() => {
//     if (eventId) {
//       fetchEventData();
//     }
//   }, [eventId]);

//   const fetchEventData = async () => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/v1/event/all`);
//       const data = await response.json();
//       if (data.success) {
//         const event = data.events.find((e) => e._id === eventId);
//         setEventData(event);
//       }
//     } catch (error) {
//       console.error("Error fetching event data:", error);
//     }
//   };

//   // Main payment processing
//   useEffect(() => {
//     const processPaymentSuccess = async () => {
//       if (processed || processing) {
//         return;
//       }

//       // Validate we have all required data
//       if (!completePaymentData.eventId) {
//         toast.error("Event information missing. Please contact support.");
//         return;
//       }

//       if (
//         !completePaymentData.selectedSeats ||
//         completePaymentData.selectedSeats.length === 0
//       ) {
//         toast.error("Seat selection missing. Please try booking again.");
//         setTimeout(
//           () => navigate(`/event/${completePaymentData.eventId}`),
//           3000
//         );
//         return;
//       }

//       if (!completePaymentData.transaction_uuid) {
//         toast.error("Transaction ID missing. Please contact support.");
//         return;
//       }

//       if (completePaymentData.action === "addToEventsToAttend") {
//         try {
//           setProcessing(true);

//           console.log("🚀 Sending to backend:", {
//             eventId: completePaymentData.eventId,
//             quantity: completePaymentData.quantity,
//             selectedSeats: completePaymentData.selectedSeats,
//             transactionId: completePaymentData.transaction_uuid,
//           });

//           // Call the backend
//           await dispatch(
//             addToEventsToAttendAsync({
//               eventId: completePaymentData.eventId,
//               quantity: completePaymentData.quantity,
//               selectedSeats: completePaymentData.selectedSeats,
//               transactionId: completePaymentData.transaction_uuid,
//             })
//           ).unwrap();

//           setProcessed(true);
//           setProcessing(false);
//           toast.success(
//             "🎉 Payment successful! Event added to your attending list."
//           );

//           // Cleanup
//           sessionStorage.removeItem(
//             `pendingPayment_${completePaymentData.eventId}`
//           );
//         } catch (error) {
//           console.error("💥 Payment processing error:", error);
//           setProcessed(true);
//           setProcessing(false);

//           if (error.message?.includes("already have a ticket")) {
//             toast.error("You already have a ticket for this event.");
//             setTimeout(() => navigate("/myevents/attend"), 3000);
//           } else if (error.message?.includes("Please select seats")) {
//             toast.error("Seat selection missing. Please try booking again.");
//             setTimeout(
//               () => navigate(`/event/${completePaymentData.eventId}`),
//               3000
//             );
//           } else {
//             toast.error(
//               error.message ||
//                 "Failed to register for event. Please contact support."
//             );
//           }
//         }
//       }
//     };

//     const timer = setTimeout(() => {
//       processPaymentSuccess();
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, [dispatch, completePaymentData, processed, processing, navigate]);

//   const handleDownloadReceipt = () => {
//     const receiptData = {
//       transactionId: completePaymentData.transaction_uuid,
//       amount: completePaymentData.totalAmount,
//       date: new Date().toLocaleDateString(),
//       time: new Date().toLocaleTimeString(),
//       event: eventData?.title || "Event",
//       eventDate: eventData
//         ? new Date(eventData.date).toLocaleDateString()
//         : "N/A",
//       eventTime: eventData
//         ? `${eventData.startTime} - ${eventData.endTime}`
//         : "N/A",
//       eventLocation: eventData?.location || "N/A",
//       seats: completePaymentData.selectedSeats || [],
//       quantity: completePaymentData.quantity,
//     };

//     const receiptText = `
// HAMRO EVENT MANAGEMENT SYSTEM
// ===============================
// PAYMENT RECEIPT
// ===============================

// Event Details:
// --------------
// Event: ${receiptData.event}
// Date: ${receiptData.eventDate}
// Time: ${receiptData.eventTime}
// Location: ${receiptData.eventLocation}

// Transaction Details:
// -------------------
// Transaction ID: ${receiptData.transactionId}
// Amount: ₹${receiptData.amount}
// Payment Date: ${receiptData.date}
// Payment Time: ${receiptData.time}

// Seat Information:
// ----------------
// ${receiptData.seats
//   .map(
//     (seat, index) =>
//       `Seat ${index + 1}: ${seat.seatNumber} (${seat.seatType}) - ₹${
//         seat.seatPrice
//       }`
//   )
//   .join("\n")}

// Total Seats: ${receiptData.quantity}
// Total Amount: ₹${receiptData.amount}

// Thank you for your purchase!

// Support: +977 9997713144
// Email: support@hamroevent.com
//     `.trim();

//     const blob = new Blob([receiptText], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `receipt-${completePaymentData.transaction_uuid}.txt`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);

//     toast.success("Receipt downloaded!");
//   };

//   const handleViewMyEvents = () => navigate("/myevents/attend");
//   const handleReturnHome = () => navigate("/");
//   const handleViewEvent = () =>
//     navigate(`/event/${completePaymentData.eventId}`);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
//         <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white text-center">
//           <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
//             {processing ? (
//               <Loader className="w-8 h-8 animate-spin" />
//             ) : processed ? (
//               <CheckCircle className="w-10 h-10" />
//             ) : (
//               <AlertCircle className="w-10 h-10" />
//             )}
//           </div>
//           <h1 className="text-3xl font-bold mb-2">
//             {processing
//               ? "Processing..."
//               : processed
//               ? "Payment Successful!"
//               : "Processing Payment"}
//           </h1>
//           <p className="text-green-100 opacity-90 text-lg">
//             {processing
//               ? "Completing your registration..."
//               : processed
//               ? "Your tickets have been confirmed!"
//               : "Please wait while we process your payment"}
//           </p>
//         </div>

//         <div className="p-8 space-y-6">
//           {/* Debug Info - Remove in production */}
//           {process.env.NODE_ENV === "development" && (
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//               <h4 className="font-semibold text-yellow-800 mb-2">
//                 Debug Info:
//               </h4>
//               <pre className="text-xs text-yellow-700 overflow-auto">
//                 {JSON.stringify(completePaymentData, null, 2)}
//               </pre>
//             </div>
//           )}

//           {processing && (
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <div className="flex items-center justify-center gap-3">
//                 <Loader className="w-4 h-4 text-blue-600 animate-spin" />
//                 <span className="text-blue-700 font-medium">
//                   Finalizing your registration...
//                 </span>
//               </div>
//             </div>
//           )}

//           {/* Event Details */}
//           {eventData && (
//             <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
//               <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
//                 <Ticket className="w-5 h-5" />
//                 Event Details
//               </h3>
//               <div className="grid md:grid-cols-2 gap-4">
//                 <div className="space-y-3">
//                   <div className="flex items-center gap-3">
//                     <Calendar className="w-4 h-4 text-blue-600" />
//                     <div>
//                       <p className="text-sm text-blue-700">Date</p>
//                       <p className="font-semibold text-blue-900">
//                         {new Date(eventData.date).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <Clock className="w-4 h-4 text-blue-600" />
//                     <div>
//                       <p className="text-sm text-blue-700">Time</p>
//                       <p className="font-semibold text-blue-900">
//                         {eventData.startTime} - {eventData.endTime}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="space-y-3">
//                   <div className="flex items-center gap-3">
//                     <MapPin className="w-4 h-4 text-blue-600" />
//                     <div>
//                       <p className="text-sm text-blue-700">Location</p>
//                       <p className="font-semibold text-blue-900">
//                         {eventData.location}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <Users className="w-4 h-4 text-blue-600" />
//                     <div>
//                       <p className="text-sm text-blue-700">Tickets</p>
//                       <p className="font-semibold text-blue-900">
//                         {completePaymentData.quantity} ticket
//                         {completePaymentData.quantity > 1 ? "s" : ""}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Seat Details */}
//           {completePaymentData.selectedSeats &&
//             completePaymentData.selectedSeats.length > 0 && (
//               <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
//                 <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
//                   <User className="w-5 h-5" />
//                   Your Seats
//                 </h3>
//                 <div className="grid gap-3">
//                   {completePaymentData.selectedSeats.map((seat, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center justify-between bg-white p-4 rounded-lg border border-purple-200"
//                     >
//                       <div className="flex items-center gap-4">
//                         <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
//                           <User className="w-6 h-6 text-white" />
//                         </div>
//                         <div>
//                           <p className="font-semibold text-purple-900 text-lg">
//                             {seat.seatNumber}
//                           </p>
//                           <p className="text-sm text-purple-600 capitalize">
//                             {seat.seatType} Section
//                           </p>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm text-purple-600">Price</p>
//                         <p className="font-bold text-purple-900 text-lg">
//                           <IndianRupee
//                             size={18}
//                             strokeWidth={2.5}
//                             className="inline"
//                           />
//                           {seat.seatPrice}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//           {/* Transaction Details */}
//           <div className="bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl p-6 border border-slate-200">
//             <h3 className="text-xl font-bold text-slate-800 mb-4">
//               Transaction Details
//             </h3>
//             <div className="space-y-3">
//               <div className="flex justify-between items-center py-2 border-b border-slate-200">
//                 <span className="text-sm font-medium text-slate-600">
//                   Transaction ID
//                 </span>
//                 <span className="text-sm font-semibold text-slate-800 font-mono">
//                   {completePaymentData.transaction_uuid || "Pending..."}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center py-2 border-b border-slate-200">
//                 <span className="text-sm font-medium text-slate-600">
//                   Payment Method
//                 </span>
//                 <span className="text-sm font-semibold text-slate-800">
//                   eSewa Wallet
//                 </span>
//               </div>
//               <div className="flex justify-between items-center py-2 border-b border-slate-200">
//                 <span className="text-sm font-medium text-slate-600">
//                   Payment Status
//                 </span>
//                 <span
//                   className={`text-sm font-semibold ${
//                     processing
//                       ? "text-yellow-600"
//                       : processed
//                       ? "text-green-600"
//                       : "text-blue-600"
//                   }`}
//                 >
//                   {processing
//                     ? "Processing"
//                     : processed
//                     ? "Completed"
//                     : "Pending"}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center py-2">
//                 <span className="text-sm font-medium text-slate-600">
//                   Total Amount
//                 </span>
//                 <span className="text-lg font-bold text-green-700">
//                   <IndianRupee size={16} strokeWidth={2.5} className="inline" />
//                   {completePaymentData.totalAmount || "0.00"}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="grid gap-4">
//             <button
//               onClick={handleDownloadReceipt}
//               disabled={processing}
//               className="flex items-center justify-center gap-3 py-4 bg-white border-2 border-green-200 text-green-700 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md"
//             >
//               <Download className="w-5 h-5" />
//               Download Receipt
//             </button>

//             <div className="grid md:grid-cols-3 gap-4">
//               <button
//                 onClick={handleViewEvent}
//                 disabled={processing}
//                 className="flex items-center justify-center gap-2 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
//               >
//                 <Calendar className="w-4 h-4" />
//                 View Event
//               </button>
//               <button
//                 onClick={handleViewMyEvents}
//                 disabled={processing}
//                 className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
//               >
//                 <Users className="w-4 h-4" />
//                 My Events
//               </button>
//               <button
//                 onClick={handleReturnHome}
//                 disabled={processing}
//                 className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50"
//               >
//                 <Home className="w-4 h-4" />
//                 Home
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import {
  CheckCircle,
  Smartphone,
  Mail,
  Download,
  Home,
  Calendar,
  Users,
  Ticket,
  User,
  MapPin,
  Clock,
  IndianRupee,
  AlertCircle,
  Loader,
} from "lucide-react";
import { addToEventsToAttendAsync } from "../../redux/slices/eventSlice";

export function PaymentSuccess() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [processed, setProcessed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  // Parse URL parameters once and store in state
  const [urlParams, setUrlParams] = useState(null);

  // Parse URL parameters only once on component mount
  useEffect(() => {
    const parseUrlParameters = () => {
      const currentUrl = window.location.href;
      console.log("🔍 Full URL:", currentUrl);

      let params = {};

      try {
        // Try to get from URL first
        const urlObj = new URL(currentUrl);
        const urlParams = new URLSearchParams(urlObj.search);

        params = {
          action: urlParams.get("action"),
          eventId: urlParams.get("eventId"),
          quantity: parseInt(urlParams.get("quantity")) || 1,
          totalAmount: urlParams.get("totalAmount"),
          transaction_uuid:
            urlParams.get("transaction_uuid") ||
            urlParams.get("transaction_uuid"),
        };

        // Parse selectedSeats from URL
        let selectedSeats = [];
        const seatsParam = urlParams.get("selectedSeats");
        if (seatsParam) {
          try {
            selectedSeats = JSON.parse(decodeURIComponent(seatsParam));
          } catch (e) {
            console.error("Error parsing selectedSeats from URL:", e);
          }
        }
        params.selectedSeats = selectedSeats;

        console.log("✅ URL Parameters:", params);
      } catch (error) {
        console.error("Error parsing URL:", error);
      }

      return params;
    };

    const params = parseUrlParameters();
    setUrlParams(params);
  }, []);

  // Get payment data from sessionStorage as fallback - only once
  const getPaymentDataFromStorage = (eventId) => {
    try {
      const stored = sessionStorage.getItem(`pendingPayment_${eventId}`);
      if (stored) {
        const data = JSON.parse(stored);
        console.log("📦 Retrieved from storage:", data);
        return data;
      }
    } catch (error) {
      console.error("Error getting data from storage:", error);
    }
    return null;
  };

  // Memoize complete payment data to prevent recalculation on every render
  const completePaymentData = useMemo(() => {
    if (!urlParams) return null;

    const urlData = { ...urlParams };

    // If we're missing critical data, try to get from storage
    if (
      (!urlData.selectedSeats ||
        urlData.selectedSeats.length === 0 ||
        !urlData.transaction_uuid) &&
      urlData.eventId
    ) {
      const storedData = getPaymentDataFromStorage(urlData.eventId);
      if (storedData) {
        console.log("🔄 Using stored data to fill missing fields");
        return {
          ...urlData,
          selectedSeats: urlData.selectedSeats?.length
            ? urlData.selectedSeats
            : storedData.selectedSeats,
          transaction_uuid:
            urlData.transaction_uuid || storedData.transactionId,
          quantity: urlData.quantity || storedData.quantity,
          totalAmount: urlData.totalAmount || storedData.totalAmount,
        };
      }
    }

    return urlData;
  }, [urlParams]);

  // Store payment data in state to prevent loss during re-renders
  useEffect(() => {
    if (completePaymentData && !paymentData) {
      setPaymentData(completePaymentData);
    }
  }, [completePaymentData, paymentData]);

  console.log("🎯 Final Payment Data:", paymentData);

  // Fetch event data
  useEffect(() => {
    if (paymentData?.eventId) {
      fetchEventData();
    }
  }, [paymentData?.eventId]);

  const fetchEventData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/event/all`);
      const data = await response.json();
      if (data.success) {
        const event = data.events.find((e) => e._id === paymentData.eventId);
        setEventData(event);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };

  // Main payment processing - only run once
  useEffect(() => {
    const processPaymentSuccess = async () => {
      if (processed || processing || !paymentData) {
        return;
      }

      // Validate we have all required data
      if (!paymentData.eventId) {
        toast.error("Event information missing. Please contact support.");
        return;
      }

      if (
        !paymentData.selectedSeats ||
        paymentData.selectedSeats.length === 0
      ) {
        toast.error("Seat selection missing. Please try booking again.");
        setTimeout(() => navigate(`/event/${paymentData.eventId}`), 3000);
        return;
      }

      if (!paymentData.transaction_uuid) {
        toast.error("Transaction ID missing. Please contact support.");
        return;
      }

      if (paymentData.action === "addToEventsToAttend") {
        try {
          setProcessing(true);

          console.log("🚀 Sending to backend:", {
            eventId: paymentData.eventId,
            quantity: paymentData.quantity,
            selectedSeats: paymentData.selectedSeats,
            transactionId: paymentData.transaction_uuid,
          });

          // Call the backend
          await dispatch(
            addToEventsToAttendAsync({
              eventId: paymentData.eventId,
              quantity: paymentData.quantity,
              selectedSeats: paymentData.selectedSeats,
              transactionId: paymentData.transaction_uuid,
            })
          ).unwrap();

          setProcessed(true);
          setProcessing(false);

          // Show success toast but don't clear data
          toast.success(
            "🎉 Payment successful! Event added to your attending list."
          );

          // Don't clear sessionStorage immediately - keep it for the UI
          // We'll clear it when user navigates away
        } catch (error) {
          console.error("💥 Payment processing error:", error);
          setProcessed(true);
          setProcessing(false);

          if (error.message?.includes("already have a ticket")) {
            toast.error("You already have a ticket for this event.");
            setTimeout(() => navigate("/myevents/attend"), 3000);
          } else if (error.message?.includes("Please select seats")) {
            toast.error("Seat selection missing. Please try booking again.");
            setTimeout(() => navigate(`/event/${paymentData.eventId}`), 3000);
          } else {
            toast.error(
              error.message ||
                "Failed to register for event. Please contact support."
            );
          }
        }
      }
    };

    const timer = setTimeout(() => {
      processPaymentSuccess();
    }, 1000);

    return () => clearTimeout(timer);
  }, [dispatch, paymentData, processed, processing, navigate]);

  // Clear sessionStorage when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      if (paymentData?.eventId) {
        sessionStorage.removeItem(`pendingPayment_${paymentData.eventId}`);
      }
    };
  }, [paymentData?.eventId]);

  const handleDownloadReceipt = () => {
    if (!paymentData) {
      toast.error("Payment data not available");
      return;
    }

    const receiptData = {
      transactionId: paymentData.transaction_uuid,
      amount: paymentData.totalAmount,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      event: eventData?.title || "Event",
      eventDate: eventData
        ? new Date(eventData.date).toLocaleDateString()
        : "N/A",
      eventTime: eventData
        ? `${eventData.startTime} - ${eventData.endTime}`
        : "N/A",
      eventLocation: eventData?.location || "N/A",
      seats: paymentData.selectedSeats || [],
      quantity: paymentData.quantity,
    };

    const receiptText = `
HAMRO EVENT MANAGEMENT SYSTEM
===============================
PAYMENT RECEIPT
===============================

Event Details:
--------------
Event: ${receiptData.event}
Date: ${receiptData.eventDate}
Time: ${receiptData.eventTime}
Location: ${receiptData.eventLocation}

Transaction Details:
-------------------
Transaction ID: ${receiptData.transactionId}
Amount: ₹${receiptData.amount}
Payment Date: ${receiptData.date}
Payment Time: ${receiptData.time}

Seat Information:
----------------
${receiptData.seats
  .map(
    (seat, index) =>
      `Seat ${index + 1}: ${seat.seatNumber} (${seat.seatType}) - ₹${
        seat.seatPrice
      }`
  )
  .join("\n")}

Total Seats: ${receiptData.quantity}
Total Amount: ₹${receiptData.amount}

Thank you for your purchase!

Support: +977 9997713144
Email: support@hamroevent.com
    `.trim();

    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${paymentData.transaction_uuid}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Receipt downloaded!");
  };

  const handleViewMyEvents = () => {
    // Clear storage before navigating
    if (paymentData?.eventId) {
      sessionStorage.removeItem(`pendingPayment_${paymentData.eventId}`);
    }
    navigate("/myevents/attend");
  };

  const handleReturnHome = () => {
    // Clear storage before navigating
    if (paymentData?.eventId) {
      sessionStorage.removeItem(`pendingPayment_${paymentData.eventId}`);
    }
    navigate("/");
  };

  const handleViewEvent = () => {
    // Clear storage before navigating
    if (paymentData?.eventId) {
      sessionStorage.removeItem(`pendingPayment_${paymentData.eventId}`);
    }
    navigate(`/event/${paymentData.eventId}`);
  };

  // Don't render until we have payment data
  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Loader className="w-8 h-8 animate-spin" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Loading...</h1>
            <p className="text-green-100 opacity-90 text-lg">
              Preparing your payment details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            {processing ? (
              <Loader className="w-8 h-8 animate-spin" />
            ) : processed ? (
              <CheckCircle className="w-10 h-10" />
            ) : (
              <AlertCircle className="w-10 h-10" />
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {processing
              ? "Processing..."
              : processed
              ? "Payment Successful!"
              : "Processing Payment"}
          </h1>
          <p className="text-green-100 opacity-90 text-lg">
            {processing
              ? "Completing your registration..."
              : processed
              ? "Your tickets have been confirmed!"
              : "Please wait while we process your payment"}
          </p>
        </div>

        <div className="p-8 space-y-6">
          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === "development" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">
                Debug Info:
              </h4>
              <pre className="text-xs text-yellow-700 overflow-auto">
                {JSON.stringify(paymentData, null, 2)}
              </pre>
            </div>
          )}

          {processing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-3">
                <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-blue-700 font-medium">
                  Finalizing your registration...
                </span>
              </div>
            </div>
          )}

          {/* Event Details */}
          {eventData && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                Event Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-700">Date</p>
                      <p className="font-semibold text-blue-900">
                        {new Date(eventData.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-700">Time</p>
                      <p className="font-semibold text-blue-900">
                        {eventData.startTime} - {eventData.endTime}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-700">Location</p>
                      <p className="font-semibold text-blue-900">
                        {eventData.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-700">Tickets</p>
                      <p className="font-semibold text-blue-900">
                        {paymentData.quantity} ticket
                        {paymentData.quantity > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Seat Details */}
          {paymentData.selectedSeats &&
            paymentData.selectedSeats.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Your Seats
                </h3>
                <div className="grid gap-3">
                  {paymentData.selectedSeats.map((seat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-4 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-purple-900 text-lg">
                            {seat.seatNumber}
                          </p>
                          <p className="text-sm text-purple-600 capitalize">
                            {seat.seatType} Section
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-purple-600">Price</p>
                        <p className="font-bold text-purple-900 text-lg">
                          <IndianRupee
                            size={18}
                            strokeWidth={2.5}
                            className="inline"
                          />
                          {seat.seatPrice}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Transaction Details */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl p-6 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Transaction Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-600">
                  Transaction ID
                </span>
                <span className="text-sm font-semibold text-slate-800 font-mono">
                  {paymentData.transaction_uuid || "Pending..."}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-600">
                  Payment Method
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  eSewa Wallet
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-600">
                  Payment Status
                </span>
                <span
                  className={`text-sm font-semibold ${
                    processing
                      ? "text-yellow-600"
                      : processed
                      ? "text-green-600"
                      : "text-blue-600"
                  }`}
                >
                  {processing
                    ? "Processing"
                    : processed
                    ? "Completed"
                    : "Pending"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-slate-600">
                  Total Amount
                </span>
                <span className="text-lg font-bold text-green-700">
                  <IndianRupee size={16} strokeWidth={2.5} className="inline" />
                  {paymentData.totalAmount ||
                    calculateTotalAmount(paymentData.selectedSeats)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid gap-4">
            <button
              onClick={handleDownloadReceipt}
              disabled={processing}
              className="flex items-center justify-center gap-3 py-4 bg-white border-2 border-green-200 text-green-700 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              <Download className="w-5 h-5" />
              Download Receipt
            </button>

            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={handleViewEvent}
                disabled={processing}
                className="flex items-center justify-center gap-2 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <Calendar className="w-4 h-4" />
                View Event
              </button>
              <button
                onClick={handleViewMyEvents}
                disabled={processing}
                className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                <Users className="w-4 h-4" />
                My Events
              </button>
              <button
                onClick={handleReturnHome}
                disabled={processing}
                className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate total amount from seats
function calculateTotalAmount(selectedSeats) {
  if (!selectedSeats || !Array.isArray(selectedSeats)) return "0.00";

  const total = selectedSeats.reduce((total, seat) => {
    const seatPrice = Number(seat.seatPrice) || 0;
    return total + seatPrice;
  }, 0);

  return total.toFixed(2);
}

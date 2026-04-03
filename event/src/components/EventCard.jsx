// import {
//   Calendar,
//   Clock,
//   MapPin,
//   Users,
//   IndianRupee,
//   Bookmark,
//   UserPlus,
// } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   addToWatchlistAsync,
//   removeFromWatchlistAsync,
//   getMyEventsAsync,
// } from "../redux/slices/eventSlice";
// import { toast } from "sonner";
// import { Link, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";

// const EventCard = ({ event }) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // Get user and watchlist state from Redux
//   const user = useSelector((state) => state.auth.user);
//   const { watchlist = [], loadingEvents = {} } = useSelector(
//     (state) => state.events
//   );

//   // Local state to track bookmark status - check localStorage first
//   const [isBookmarked, setIsBookmarked] = useState(() => {
//     // Check localStorage on initial render
//     if (typeof window !== "undefined") {
//       const savedWatchlist = localStorage.getItem("userWatchlist");
//       if (savedWatchlist) {
//         try {
//           const watchlistArray = JSON.parse(savedWatchlist);
//           return watchlistArray.some(
//             (watchlistEvent) => watchlistEvent._id === event._id
//           );
//         } catch (error) {
//           console.error("Error parsing watchlist from localStorage:", error);
//           return false;
//         }
//       }
//     }
//     return false;
//   });

//   // Sync local state with Redux store AND localStorage
//   useEffect(() => {
//     const checkBookmarkStatus = () => {
//       // First check Redux store
//       const isInReduxWatchlist = watchlist.some(
//         (watchlistEvent) => watchlistEvent._id === event._id
//       );

//       // Then check localStorage as fallback
//       if (typeof window !== "undefined") {
//         const savedWatchlist = localStorage.getItem("userWatchlist");
//         if (savedWatchlist) {
//           try {
//             const watchlistArray = JSON.parse(savedWatchlist);
//             const isInLocalStorage = watchlistArray.some(
//               (watchlistEvent) => watchlistEvent._id === event._id
//             );
//             setIsBookmarked(isInReduxWatchlist || isInLocalStorage);
//             return;
//           } catch (error) {
//             console.error("Error parsing watchlist from localStorage:", error);
//           }
//         }
//       }
//       setIsBookmarked(isInReduxWatchlist);
//     };

//     checkBookmarkStatus();
//   }, [watchlist, event._id]);

//   const formatDate = (dateString) => {
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

//   const totalAttendees = event.attendees
//     ? event.attendees.reduce(
//         (total, attendee) => total + (attendee.ticketCount || 1),
//         0
//       )
//     : 0;

//   // Helper function to update localStorage
//   const updateLocalStorageWatchlist = (updatedWatchlist) => {
//     if (typeof window !== "undefined") {
//       try {
//         localStorage.setItem("userWatchlist", JSON.stringify(updatedWatchlist));
//       } catch (error) {
//         console.error("Error saving watchlist to localStorage:", error);
//       }
//     }
//   };

//   // Handle bookmark toggle
//   const handleBookmarkToggle = async (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!user) {
//       toast.error("Please login to bookmark events");
//       navigate("/login", { state: { from: window.location.pathname } });
//       return;
//     }

//     try {
//       // Optimistic UI update - update immediately
//       const newBookmarkState = !isBookmarked;
//       setIsBookmarked(newBookmarkState);

//       if (newBookmarkState) {
//         // Add to watchlist
//         const result = await dispatch(addToWatchlistAsync(event._id)).unwrap();
//         toast.success("Event added to watchlist", {
//           duration: 3000,
//         });

//         // Update localStorage with the new watchlist
//         if (result.watchlist) {
//           updateLocalStorageWatchlist(result.watchlist);
//         } else {
//           // If no watchlist in response, update localStorage optimistically
//           const currentWatchlist = JSON.parse(
//             localStorage.getItem("userWatchlist") || "[]"
//           );
//           const updatedWatchlist = [...currentWatchlist, event];
//           updateLocalStorageWatchlist(updatedWatchlist);
//         }
//       } else {
//         // Remove from watchlist
//         const result = await dispatch(
//           removeFromWatchlistAsync(event._id)
//         ).unwrap();
//         toast.success("Event removed from watchlist", {
//           duration: 3000,
//         });

//         // Update localStorage with the updated watchlist
//         if (result.watchlist) {
//           updateLocalStorageWatchlist(result.watchlist);
//         } else {
//           // If no watchlist in response, update localStorage optimistically
//           const currentWatchlist = JSON.parse(
//             localStorage.getItem("userWatchlist") || "[]"
//           );
//           const updatedWatchlist = currentWatchlist.filter(
//             (item) => item._id !== event._id
//           );
//           updateLocalStorageWatchlist(updatedWatchlist);
//         }
//       }

//       // Refresh the watchlist to ensure consistency
//       dispatch(getMyEventsAsync());
//     } catch (error) {
//       // Revert optimistic update on error
//       setIsBookmarked(!isBookmarked);

//       console.error("Bookmark error:", error);
//       if (
//         error?.includes?.("authenticated") ||
//         error?.includes?.("login") ||
//         error?.includes?.("Unauthorized")
//       ) {
//         toast.error("Please login again to bookmark events", {
//           duration: 4000,
//         });
//         navigate("/login", { state: { from: window.location.pathname } });
//       } else {
//         toast.error(error.message || "Failed to update watchlist", {
//           duration: 4000,
//         });
//       }
//     }
//   };

//   return (
//     <div className="group overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 rounded-2xl">
//       <div className="relative overflow-hidden">
//         <img
//           src={`http://localhost:5000/uploads/event-banners/${event.banner}`}
//           alt={event.title}
//           className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
//           onError={(e) => {
//             e.target.src =
//               "https://via.placeholder.com/300x200?text=Event+Image";
//           }}
//         />

//         {/* Bookmark Button */}
//         <button
//           onClick={handleBookmarkToggle}
//           disabled={loadingEvents[event._id]}
//           className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${
//             isBookmarked
//               ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
//               : "bg-white/90 text-gray-600 hover:bg-white hover:text-blue-600"
//           } shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
//         >
//           {loadingEvents[event._id] ? (
//             <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
//           ) : (
//             <Bookmark
//               className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
//             />
//           )}
//         </button>

//         <div className="absolute top-4 left-4">
//           <span className="px-3 py-1 bg-white/90 text-purple-700 text-sm rounded-full font-medium hover:bg-white transition-colors duration-200">
//             {event.category}
//           </span>
//         </div>

//         <div className="flex items-center gap-x-1 absolute bottom-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
//           <IndianRupee size={16} strokeWidth={2} className="opacity-80" />
//           {event.basePrice}
//         </div>
//       </div>

//       <div className="p-6">
//         <Link to={`/events/${event._id}`}>
//           <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-200 cursor-pointer">
//             {event.title}
//           </h3>
//         </Link>

//         <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

//         <div className="flex flex-col justify-between space-y-2 mb-4 px-4">
//           <div className="flex justify-between gap-x-2">
//             <div className="flex items-center text-sm text-gray-500">
//               <Calendar className="h-4 w-4 mr-2 text-purple-500" />
//               {formatDate(event.date)}
//             </div>
//             <div className="flex items-center text-sm text-gray-500">
//               <Clock className="h-4 w-4 mr-2 text-blue-500" />
//               {formatTime(event.startTime)} - {formatTime(event.endTime)}
//             </div>
//           </div>
//           <div className="flex gap-y-2">
//             <div className="flex items-center text-sm text-gray-500">
//               <MapPin className="h-4 w-4 mr-2 text-green-500" />
//               {event.location.split(",").slice(0, 2).join(",")}
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
//           <div className="flex items-center">
//             <Users className="h-4 w-4 mr-2 text-indigo-500" />
//             {totalAttendees} attending
//           </div>
//           <div className="flex items-center">
//             <UserPlus className="h-4 w-4 mr-2 text-orange-500" />
//             {event.totalSeats} max
//           </div>
//         </div>
//         <Link to={`/events/${event._id}`}>
//           <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md shadow-lg hover:from-purple-700 hover:to-blue-700 hover:shadow-xl transition-all duration-300 font-medium">
//             Get Tickets
//           </button>
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default EventCard;
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  IndianRupee,
  Bookmark,
  UserPlus,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWatchlistAsync,
  removeFromWatchlistAsync,
  getMyEventsAsync,
} from "../redux/slices/eventSlice";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const EventCard = ({ event }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user and watchlist state from Redux
  const user = useSelector((state) => state.auth.user);
  const { watchlist = [], loadingEvents = {} } = useSelector(
    (state) => state.events
  );

  // Derive bookmark status directly from Redux store - this is the key fix
  const isBookmarked = watchlist.some(
    (watchlistEvent) => watchlistEvent._id === event._id
  );

  // Sync localStorage with Redux store (one-way: store -> localStorage)
  useEffect(() => {
    if (typeof window !== "undefined" && watchlist.length > 0) {
      try {
        localStorage.setItem("userWatchlist", JSON.stringify(watchlist));
      } catch (error) {
        console.error("Error saving watchlist to localStorage:", error);
      }
    }
  }, [watchlist]);

  const formatDate = (dateString) => {
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

  const totalAttendees = event.attendees
    ? event.attendees.reduce(
        (total, attendee) => total + (attendee.ticketCount || 1),
        0
      )
    : 0;

  // Helper function to update localStorage
  const updateLocalStorageWatchlist = (updatedWatchlist) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("userWatchlist", JSON.stringify(updatedWatchlist));
      } catch (error) {
        console.error("Error saving watchlist to localStorage:", error);
      }
    }
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to bookmark events");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    try {
      // No optimistic update - rely on Redux state only
      if (isBookmarked) {
        // Remove from watchlist
        const result = await dispatch(
          removeFromWatchlistAsync(event._id)
        ).unwrap();
        toast.success("Event removed from watchlist", {
          duration: 3000,
        });

        // Update localStorage with the updated watchlist
        if (result.watchlist) {
          updateLocalStorageWatchlist(result.watchlist);
        } else {
          // If no watchlist in response, update localStorage based on current Redux state
          const currentWatchlist = watchlist.filter(
            (item) => item._id !== event._id
          );
          updateLocalStorageWatchlist(currentWatchlist);
        }
      } else {
        // Add to watchlist
        const result = await dispatch(addToWatchlistAsync(event._id)).unwrap();
        toast.success("Event added to watchlist", {
          duration: 3000,
        });

        // Update localStorage with the new watchlist
        if (result.watchlist) {
          updateLocalStorageWatchlist(result.watchlist);
        } else {
          // If no watchlist in response, update localStorage based on current Redux state
          const currentWatchlist = [...watchlist, event];
          updateLocalStorageWatchlist(currentWatchlist);
        }
      }

      // Refresh the watchlist to ensure consistency
      dispatch(getMyEventsAsync());
    } catch (error) {
      console.error("Bookmark error:", error);
      if (
        error?.includes?.("authenticated") ||
        error?.includes?.("login") ||
        error?.includes?.("Unauthorized")
      ) {
        toast.error("Please login again to bookmark events", {
          duration: 4000,
        });
        navigate("/login", { state: { from: window.location.pathname } });
      } else {
        toast.error(error.message || "Failed to update watchlist", {
          duration: 4000,
        });
      }
    }
  };

  return (
    <div className="group overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 rounded-2xl">
      <div className="relative overflow-hidden">
        <img
          src={`http://localhost:5000/uploads/event-banners/${event.banner}`}
          alt={event.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/300x200?text=Event+Image";
          }}
        />

        {/* Bookmark Button */}
        <button
          onClick={handleBookmarkToggle}
          disabled={loadingEvents[event._id]}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${
            isBookmarked
              ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
              : "bg-white/90 text-gray-600 hover:bg-white hover:text-blue-600"
          } shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loadingEvents[event._id] ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Bookmark
              className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
            />
          )}
        </button>

        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 text-purple-700 text-sm rounded-full font-medium hover:bg-white transition-colors duration-200">
            {event.category}
          </span>
        </div>

        <div className="flex items-center gap-x-1 absolute bottom-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          <IndianRupee size={16} strokeWidth={2} className="opacity-80" />
          {event.basePrice}
        </div>
      </div>

      <div className="p-6">
        <Link to={`/events/${event._id}`}>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-200 cursor-pointer">
            {event.title}
          </h3>
        </Link>

        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

        <div className="flex flex-col justify-between space-y-2 mb-4 px-4">
          <div className="flex justify-between gap-x-2">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2 text-purple-500" />
              {formatDate(event.date)}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-2 text-blue-500" />
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </div>
          </div>
          <div className="flex gap-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-2 text-green-500" />
              {event.location.split(",").slice(0, 2).join(",")}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-indigo-500" />
            {totalAttendees} attending
          </div>
          <div className="flex items-center">
            <UserPlus className="h-4 w-4 mr-2 text-orange-500" />
            {event.totalSeats} max
          </div>
        </div>
        <Link to={`/events/${event._id}`}>
          <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md shadow-lg hover:from-purple-700 hover:to-blue-700 hover:shadow-xl transition-all duration-300 font-medium">
            Get Tickets
          </button>
        </Link>
      </div>
    </div>
  );
};

export default EventCard;

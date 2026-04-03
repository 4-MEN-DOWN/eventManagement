// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
// import { toast } from "sonner";

// export const addEventAsync = createAsyncThunk(
//   "events/addEventAsync",
//   async (formData, { rejectWithValue }) => {
//     try {
//       console.log(
//         "🎫 Sending event creation request with seat configuration...",
//       );

//       const { data } = await axios.post(
//         "http://localhost:5000/api/v1/event/add",
//         formData,
//         {
//           withCredentials: true,
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         },
//       );

//       console.log("✅ Event created successfully with seat configuration:", {
//         title: data.event.title,
//         totalSeats: data.event.totalSeats,
//         seatConfig: data.event.seatConfig,
//         basePrice: data.event.basePrice,
//       });

//       return data.event;
//     } catch (err) {
//       console.error(
//         "❌ Event creation failed:",
//         err.response?.data || err.message,
//       );
//       return rejectWithValue(
//         err.response?.data?.message || "Failed to add event",
//       );
//     }
//   },
// );

// export const getAllEventsAsync = createAsyncThunk(
//   "events/getAllEventsAsync",
//   async (_, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.get(
//         "http://localhost:5000/api/v1/event/all",
//         {
//           withCredentials: true,
//         },
//       );
//       return data.events;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || "Failed to fetch events",
//       );
//     }
//   },
// );

// // NEW: Get user with populated events (including ticket details)
// export const getUserWithPopulatedEventsAsync = createAsyncThunk(
//   "events/getUserWithPopulatedEventsAsync",
//   async (_, { rejectWithValue }) => {
//     try {
//       console.log("Fetching user with populated events...");
//       const { data } = await axios.get(
//         "http://localhost:5000/api/v1/user/profile",
//         { withCredentials: true },
//       );

//       console.log("User with populated events response:", data);

//       return {
//         eventsToOrganize: data.user?.eventToOrganize || [],
//         watchlist: data.user?.myEventWatchlist || [],
//         eventsToAttend: data.user?.eventsToAttend || [], // This now contains ticket objects with populated events
//       };
//     } catch (err) {
//       console.error(
//         "Get user events error:",
//         err.response?.data || err.message,
//       );
//       return rejectWithValue(
//         err.response?.data?.message || "Failed to fetch user events",
//       );
//     }
//   },
// );

// // Keep the old getMyEventsAsync for backward compatibility
// export const getMyEventsAsync = createAsyncThunk(
//   "events/getMyEventsAsync",
//   async (_, { rejectWithValue }) => {
//     try {
//       console.log("Fetching my events...");
//       const { data } = await axios.get(
//         "http://localhost:5000/api/v1/user/me/events",
//         { withCredentials: true },
//       );

//       console.log("My events response:", data);

//       return {
//         eventsToOrganize:
//           data.eventsToOrganize || data.user?.eventToOrganize || [],
//         watchlist: data.watchlist || data.user?.myEventWatchlist || [],
//         eventsToAttend: data.eventsToAttend || data.user?.eventsToAttend || [],
//       };
//     } catch (err) {
//       console.error("Get my events error:", err.response?.data || err.message);
//       return rejectWithValue(
//         err.response?.data?.message || "Failed to fetch my events",
//       );
//     }
//   },
// );

// export const removeEventAsync = createAsyncThunk(
//   "events/removeEventAsync",
//   async (eventId, { rejectWithValue }) => {
//     try {
//       await axios.delete(
//         `http://localhost:5000/api/v1/event/delete/${eventId}`,
//         {
//           withCredentials: true,
//         },
//       );
//       return eventId;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || "Failed to delete event",
//       );
//     }
//   },
// );

// export const addToWatchlistAsync = createAsyncThunk(
//   "events/addToWatchlist",
//   async (eventId, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.post(
//         `http://localhost:5000/api/v1/event/watchlist/add/${eventId}`,
//         {},
//         { withCredentials: true },
//       );
//       return data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   },
// );

// export const removeFromWatchlistAsync = createAsyncThunk(
//   "events/removeFromWatchlist",
//   async (eventId, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.put(
//         `http://localhost:5000/api/v1/event/watchlist/remove/${eventId}`,
//         {},
//         { withCredentials: true },
//       );
//       return data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   },
// );

// export const addToEventsToAttendAsync = createAsyncThunk(
//   "events/addToEventsToAttendAsync",
//   async (
//     { eventId, quantity, transactionId, selectedSeats },
//     { rejectWithValue },
//   ) => {
//     try {
//       console.log("🔄 Sending attend request with data:", {
//         eventId,
//         quantity,
//         transactionId,
//         selectedSeats,
//       });

//       const { data } = await axios.post(
//         "http://localhost:5000/api/v1/event/attend",
//         {
//           eventId,
//           quantity,
//           transactionId,
//           selectedSeats,
//         },
//         { withCredentials: true },
//       );

//       console.log("✅ Attend response:", data);

//       return {
//         ticket: data.ticket,
//         eventsToAttend: data.eventsToAttend,
//         totalAmount: data.totalAmount,
//         seatSummary: data.seatSummary,
//       };
//     } catch (err) {
//       console.error("❌ Attend error:", err.response?.data || err.message);
//       return rejectWithValue(
//         err.response?.data?.message || "Failed to add to attending list",
//       );
//     }
//   },
// );

// export const getEventsToOrganizeAsync = createAsyncThunk(
//   "events/getEventsToOrganizeAsync",
//   async (userId, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.get(
//         `http://localhost:5000/api/v1/event/${userId}/organized-events`,
//         { withCredentials: true },
//       );
//       return data.organizedEvents;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || "Failed to fetch organized events",
//       );
//     }
//   },
// );

// export const updateEventStatusAsync = createAsyncThunk(
//   "events/updateEventStatusAsync",
//   async ({ id, status }, { rejectWithValue }) => {
//     try {
//       await axios.put(
//         `http://localhost:5000/api/v1/event/update-status/${id}`,
//         { status },
//         { withCredentials: true },
//       );
//       return { id, status };
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || "Failed to update event status",
//       );
//     }
//   },
// );

// // UPDATED: Edit Organized Event with FormData support
// export const editOrganizedEventAsync = createAsyncThunk(
//   "events/editOrganizedEventAsync",
//   async ({ eventId, updatedData }, { rejectWithValue }) => {
//     try {
//       console.log(
//         "🔄 Sending update request for event:",
//         eventId,
//         "with data:",
//         updatedData,
//       );

//       const { data } = await axios.put(
//         `http://localhost:5000/api/v1/event/organized/${eventId}`,
//         updatedData,
//         {
//           withCredentials: true,
//           headers: {
//             "Content-Type":
//               updatedData instanceof FormData
//                 ? "multipart/form-data"
//                 : "application/json",
//           },
//         },
//       );

//       console.log("✅ Backend response:", data);

//       if (!data.event) {
//         console.error("No event data in response:", data);
//         throw new Error("No event data received from server");
//       }

//       return data.event;
//     } catch (err) {
//       console.error("❌ Edit event error:", err.response?.data || err.message);
//       return rejectWithValue(
//         err.response?.data?.message || "Failed to edit event",
//       );
//     }
//   },
// );

// export const deleteOrganizedEventAsync = createAsyncThunk(
//   "events/deleteOrganizedEventAsync",
//   async (eventId, { rejectWithValue }) => {
//     try {
//       await axios.delete(
//         `http://localhost:5000/api/v1/event/organized/${eventId}`,
//         { withCredentials: true },
//       );
//       return eventId;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || "Failed to delete event",
//       );
//     }
//   },
// );

// // UPDATED: Update ticket quantity (now works with ticket IDs)
// export const updateTicketQuantityAsync = createAsyncThunk(
//   "events/updateTicketQuantity",
//   async ({ ticketId, newQuantity }, { rejectWithValue }) => {
//     try {
//       console.log("🔄 Frontend: Updating ticket quantity", {
//         ticketId,
//         newQuantity,
//       });

//       const { data } = await axios.put(
//         `http://localhost:5000/api/v1/event/tickets/update/${ticketId}`,
//         { newQuantity },
//         { withCredentials: true },
//       );

//       console.log("✅ Frontend: Ticket update response", data);
//       return data;
//     } catch (error) {
//       console.error(
//         "❌ Frontend: Ticket update error",
//         error.response?.data || error.message,
//       );
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   },
// );

// // UPDATED: Cancel event attendance (now works with ticket IDs)
// export const cancelEventAttendanceAsync = createAsyncThunk(
//   "events/cancelAttendance",
//   async (ticketId, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.delete(
//         `http://localhost:5000/api/v1/event/attend/ticket/${ticketId}`,
//         { withCredentials: true },
//       );

//       return data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   },
// );

// // NEW: Get QR code for a specific ticket
// export const getTicketQRCodeAsync = createAsyncThunk(
//   "events/getTicketQRCode",
//   async (ticketId, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.get(
//         `http://localhost:5000/api/v1/event/ticket/${ticketId}/qrcode`,
//         { withCredentials: true },
//       );

//       return data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   },
// );

// // NEW: Regenerate QR code for a ticket
// export const regenerateTicketQRCodeAsync = createAsyncThunk(
//   "events/regenerateTicketQRCode",
//   async (ticketId, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.put(
//         `http://localhost:5000/api/v1/event/ticket/${ticketId}/regenerate-qr`,
//         {},
//         { withCredentials: true },
//       );

//       return data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   },
// );

// export const handlePaymentSuccessAsync = createAsyncThunk(
//   "events/handlePaymentSuccess",
//   async (params, { rejectWithValue, dispatch }) => {
//     try {
//       const { eventId, newQuantity, transactionId, action } = params;

//       if (action === "updateTicketQuantity") {
//         await dispatch(
//           updateTicketQuantityAsync({
//             eventId,
//             newQuantity: parseInt(newQuantity),
//           }),
//         ).unwrap();

//         await dispatch(getUserWithPopulatedEventsAsync());

//         return {
//           success: true,
//           message: "Ticket quantity updated successfully!",
//         };
//       } else if (action === "addToEventsToAttend") {
//         await dispatch(
//           addToEventsToAttendAsync({
//             eventId,
//             quantity: parseInt(newQuantity || 1),
//             transactionId,
//           }),
//         ).unwrap();

//         await dispatch(getUserWithPopulatedEventsAsync());

//         return {
//           success: true,
//           message: "Event added to your attending list!",
//         };
//       } else {
//         throw new Error("Invalid action type");
//       }
//     } catch (error) {
//       return rejectWithValue(error.message || "Payment processing failed");
//     }
//   },
// );

// export const getLiveEventsAsync = createAsyncThunk(
//   "events/getLiveEventsAsync",
//   async (_, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.get(
//         "http://localhost:5000/api/v1/event/live",
//         {
//           withCredentials: true,
//         },
//       );
//       return data.liveEvents;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || "Failed to fetch live events",
//       );
//     }
//   },
// );

// export const addCommentAsync = createAsyncThunk(
//   "events/addCommentAsync",
//   async ({ eventId, text }, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.post(
//         `http://localhost:5000/api/v1/event/${eventId}/comment`,
//         { text },
//         { withCredentials: true },
//       );

//       return data;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || "Failed to add comment",
//       );
//     }
//   },
// );

// export const getAvailableSeatsAsync = createAsyncThunk(
//   "events/getAvailableSeats",
//   async (eventId, { rejectWithValue }) => {
//     try {
//       const { data } = await axios.get(
//         `http://localhost:5000/api/v1/event/${eventId}/available-seats`,
//         { withCredentials: true },
//       );

//       return data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   },
// );

// const initialState = {
//   liveEvents: [],
//   allEvents: [],
//   filteredEvents: [],
//   activeCategory: "All",
//   searchQuery: "",
//   loading: false,
//   error: null,
//   eventToOrganize: [],
//   watchlist: [],
//   eventsToAttend: [], // This now contains ticket objects with populated events
//   commentLoading: false,
//   commentError: null,
//   commentWarningCount: 0,
//   commentDisabled: false,
//   success: false,
//   message: null,
//   loadingEvents: {},
//   paymentProcessing: false,
//   paymentSuccess: false,
//   paymentError: null,
//   eventCount: 0,
//   latestQrCode: null,
//   qrCodeLoading: false,
//   selectedTicket: null,
//   availableSeats: null,
//   seatPricing: null,
//   basePrice: 0,
//   ticketPurchase: {
//     totalAmount: 0,
//     seatSummary: [],
//     lastPurchase: null,
//   },
//   // NEW: Add state for edit modal
//   editLoading: false,
//   editError: null,
// };

// const eventSlice = createSlice({
//   name: "events",
//   initialState,
//   reducers: {
//     filterByCategory: (state, action) => {
//       state.activeCategory = action.payload;
//       eventSlice.caseReducers.applyFilters(state);
//     },
//     setSearchQuery: (state, action) => {
//       state.searchQuery = action.payload;
//       eventSlice.caseReducers.applyFilters(state);
//     },
//     clearFilter: (state) => {
//       state.activeCategory = "All";
//       state.searchQuery = "";
//       state.filteredEvents = state.allEvents;
//     },
//     applyFilters: (state) => {
//       let filtered = [...state.allEvents];
//       if (state.activeCategory !== "All") {
//         filtered = filtered.filter(
//           (event) => event.category === state.activeCategory,
//         );
//       }
//       if (state.searchQuery.trim()) {
//         const query = state.searchQuery.toLowerCase();
//         filtered = filtered.filter(
//           (event) =>
//             event.title.toLowerCase().includes(query) ||
//             event.description.toLowerCase().includes(query) ||
//             event.location.toLowerCase().includes(query) ||
//             event.category.toLowerCase().includes(query),
//         );
//       }
//       state.filteredEvents = filtered;
//     },
//     resetEventState: (state) => {
//       state.success = false;
//       state.message = null;
//       state.error = null;
//       state.paymentSuccess = false;
//       state.paymentError = null;
//       state.editError = null; // NEW: Reset edit error
//     },
//     setEventCount: (state, action) => {
//       state.eventCount = action.payload;
//     },
//     resetPaymentState: (state) => {
//       state.paymentProcessing = false;
//       state.paymentSuccess = false;
//       state.paymentError = null;
//     },
//     // NEW: Set selected ticket for QR code display
//     setSelectedTicket: (state, action) => {
//       state.selectedTicket = action.payload;
//     },
//     // NEW: Clear QR code data
//     clearQrCode: (state) => {
//       state.latestQrCode = null;
//     },
//     setWatchlist: (state, action) => {
//       state.watchlist = action.payload;
//     },
//     clearTicketPurchase: (state) => {
//       state.ticketPurchase = {
//         totalAmount: 0,
//         seatSummary: [],
//         lastPurchase: null,
//       };
//     },
//     // NEW: Reset edit state
//     resetEditState: (state) => {
//       state.editLoading = false;
//       state.editError = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Add Event
//       .addCase(addEventAsync.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(addEventAsync.fulfilled, (state, action) => {
//         state.loading = false;
//         state.allEvents.push(action.payload);
//         eventSlice.caseReducers.applyFilters(state);
//         state.success = true;
//         state.message = "Event created successfully!";

//         state.eventToOrganize.push(action.payload);
//         state.eventCount = state.eventToOrganize.length;

//         toast.success("Event created successfully!");
//       })
//       .addCase(addEventAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         toast.error(action.payload || "Failed to create event");
//       })

//       // Get All Events
//       .addCase(getAllEventsAsync.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getAllEventsAsync.fulfilled, (state, action) => {
//         state.loading = false;
//         state.allEvents = action.payload;
//         state.filteredEvents = action.payload;
//       })
//       .addCase(getAllEventsAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Get User with Populated Events (NEW)
//       .addCase(getUserWithPopulatedEventsAsync.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getUserWithPopulatedEventsAsync.fulfilled, (state, action) => {
//         state.loading = false;

//         state.eventToOrganize = action.payload.eventsToOrganize || [];
//         state.watchlist = action.payload.watchlist || [];
//         state.eventsToAttend = action.payload.eventsToAttend || []; // Ticket objects with populated events

//         state.eventCount = state.eventToOrganize.length;

//         console.log("User events stored in state:", {
//           organized: state.eventToOrganize.length,
//           watchlist: state.watchlist.length,
//           attending: state.eventsToAttend.length,
//           attendingTickets: state.eventsToAttend.map((t) => ({
//             ticketId: t._id,
//             eventId: t.event?._id,
//             eventTitle: t.event?.title,
//           })),
//         });
//       })
//       .addCase(getUserWithPopulatedEventsAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Get My Events (keep for backward compatibility)
//       .addCase(getMyEventsAsync.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getMyEventsAsync.fulfilled, (state, action) => {
//         state.loading = false;

//         state.eventToOrganize = action.payload.eventsToOrganize || [];
//         state.watchlist = action.payload.watchlist || [];
//         state.eventsToAttend = action.payload.eventsToAttend || [];

//         state.eventCount = state.eventToOrganize.length;

//         console.log("My events stored in state:", {
//           organized: state.eventToOrganize.length,
//           watchlist: state.watchlist.length,
//           attending: state.eventsToAttend.length,
//         });
//       })
//       .addCase(getMyEventsAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Remove Event
//       .addCase(removeEventAsync.fulfilled, (state, action) => {
//         state.allEvents = state.allEvents.filter(
//           (e) => e._id !== action.payload,
//         );
//         state.filteredEvents = state.filteredEvents.filter(
//           (e) => e._id !== action.payload,
//         );
//         toast.success("Event deleted successfully!");
//       })

//       // Watchlist
//       .addCase(addToWatchlistAsync.pending, (state, action) => {
//         state.loadingEvents[action.meta.arg] = true;
//       })
//       .addCase(addToWatchlistAsync.fulfilled, (state, action) => {
//         state.loadingEvents[action.meta.arg] = false;

//         const eventAlreadyInWatchlist = state.watchlist.some(
//           (event) => event._id === action.payload.event._id,
//         );

//         if (!eventAlreadyInWatchlist) {
//           state.watchlist.push(action.payload.event);
//         }

//         if (action.payload.watchlist) {
//           state.watchlist = action.payload.watchlist;
//         }

//         toast.success("Event added to watchlist!");
//       })
//       .addCase(addToWatchlistAsync.rejected, (state, action) => {
//         state.loadingEvents[action.meta.arg] = false;
//         state.error = action.payload;
//         toast.error(action.payload || "Failed to add to watchlist");
//       })

//       .addCase(removeFromWatchlistAsync.pending, (state, action) => {
//         state.loadingEvents[action.meta.arg] = true;
//       })
//       .addCase(removeFromWatchlistAsync.fulfilled, (state, action) => {
//         state.loadingEvents[action.meta.arg] = false;

//         state.watchlist = state.watchlist.filter(
//           (event) => event._id !== action.meta.arg,
//         );

//         if (action.payload.watchlist) {
//           state.watchlist = action.payload.watchlist;
//         }

//         toast.success("Event removed from watchlist!");
//       })
//       .addCase(removeFromWatchlistAsync.rejected, (state, action) => {
//         state.loadingEvents[action.meta.arg] = false;
//         state.error = action.payload;
//         toast.error(action.payload || "Failed to remove from watchlist");
//       })

//       // Events to Organize
//       .addCase(getEventsToOrganizeAsync.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getEventsToOrganizeAsync.fulfilled, (state, action) => {
//         state.loading = false;
//         state.eventToOrganize = action.payload;
//         state.eventCount = action.payload.length;
//       })
//       .addCase(getEventsToOrganizeAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Update Event Status
//       .addCase(updateEventStatusAsync.fulfilled, (state, action) => {
//         const { id, status } = action.payload;
//         const eventIndex = state.allEvents.findIndex((e) => e._id === id);
//         if (eventIndex !== -1) {
//           state.allEvents[eventIndex].status = status;
//         }
//         const filteredIndex = state.filteredEvents.findIndex(
//           (e) => e._id === id,
//         );
//         if (filteredIndex !== -1) {
//           state.filteredEvents[filteredIndex].status = status;
//         }
//         const organizedIndex = state.eventToOrganize.findIndex(
//           (e) => e._id === id,
//         );
//         if (organizedIndex !== -1) {
//           state.eventToOrganize[organizedIndex].status = status;
//         }
//       })

//       // UPDATED: Edit Organized Event with better state management
//       .addCase(editOrganizedEventAsync.pending, (state) => {
//         state.editLoading = true;
//         state.editError = null;
//         state.error = null;
//       })
//       .addCase(editOrganizedEventAsync.fulfilled, (state, action) => {
//         state.editLoading = false;
//         const updatedEvent = action.payload;

//         console.log("🔄 Updating state with edited event:", updatedEvent);

//         // Update eventToOrganize array
//         const organizedIndex = state.eventToOrganize.findIndex(
//           (e) => e._id === updatedEvent._id,
//         );
//         if (organizedIndex !== -1) {
//           state.eventToOrganize[organizedIndex] = updatedEvent;
//           console.log("✅ Updated event in eventToOrganize");
//         }

//         // Update allEvents array
//         const allEventsIndex = state.allEvents.findIndex(
//           (e) => e._id === updatedEvent._id,
//         );
//         if (allEventsIndex !== -1) {
//           state.allEvents[allEventsIndex] = updatedEvent;
//           console.log("✅ Updated event in allEvents");
//         }

//         // Update filteredEvents array
//         const filteredIndex = state.filteredEvents.findIndex(
//           (e) => e._id === updatedEvent._id,
//         );
//         if (filteredIndex !== -1) {
//           state.filteredEvents[filteredIndex] = updatedEvent;
//           console.log("✅ Updated event in filteredEvents");
//         }

//         state.success = true;
//         state.message = "Event updated successfully!";

//         toast.success("Event updated successfully!");
//       })
//       .addCase(editOrganizedEventAsync.rejected, (state, action) => {
//         state.editLoading = false;
//         state.editError = action.payload;
//         state.error = action.payload;
//         console.error("❌ Edit event rejected:", action.payload);
//         toast.error(action.payload || "Failed to edit event");
//       })

//       // Delete Organized Event
//       .addCase(deleteOrganizedEventAsync.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(deleteOrganizedEventAsync.fulfilled, (state, action) => {
//         state.loading = false;
//         const deletedEventId = action.payload;

//         state.eventToOrganize = state.eventToOrganize.filter(
//           (e) => e._id !== deletedEventId,
//         );

//         state.eventCount = state.eventToOrganize.length;

//         state.allEvents = state.allEvents.filter(
//           (e) => e._id !== deletedEventId,
//         );
//         state.filteredEvents = state.filteredEvents.filter(
//           (e) => e._id !== deletedEventId,
//         );
//         state.watchlist = state.watchlist.filter(
//           (e) => e._id !== deletedEventId,
//         );

//         // Remove tickets for the deleted event
//         state.eventsToAttend = state.eventsToAttend.filter(
//           (ticket) => ticket.event?._id !== deletedEventId,
//         );

//         toast.success("Event deleted successfully!");
//       })
//       .addCase(deleteOrganizedEventAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         toast.error(action.payload || "Failed to delete event");
//       })

//       // UPDATED: Add to events to attend
//       .addCase(addToEventsToAttendAsync.fulfilled, (state, action) => {
//         const { ticket, eventsToAttend, totalAmount, seatSummary } =
//           action.payload;

//         // Update the eventsToAttend array with the new ticket
//         state.eventsToAttend = eventsToAttend;
//         state.latestQrCode = ticket?.qrCode;

//         // Set ticket purchase details
//         state.ticketPurchase = {
//           totalAmount: totalAmount || 0,
//           seatSummary: seatSummary || [],
//           lastPurchase: new Date().toISOString(),
//         };

//         console.log("✅ Ticket purchase completed:", {
//           ticketId: ticket?._id,
//           totalAmount,
//           seatSummary,
//           seatsBooked: seatSummary?.length || 0,
//         });

//         toast.success(
//           `Ticket purchased successfully! Total: $${totalAmount || 0}`,
//         );
//       })

//       // UPDATED: Update ticket quantity
//       .addCase(updateTicketQuantityAsync.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(updateTicketQuantityAsync.fulfilled, (state, action) => {
//         state.loading = false;

//         // Find and update the ticket in eventsToAttend
//         const updatedTicket = action.payload.ticket;
//         const ticketIndex = state.eventsToAttend.findIndex(
//           (ticket) => ticket._id === updatedTicket._id,
//         );

//         if (ticketIndex !== -1) {
//           state.eventsToAttend[ticketIndex] = updatedTicket;
//         }

//         toast.success("Ticket quantity updated successfully!");
//       })
//       .addCase(updateTicketQuantityAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         toast.error(action.payload);
//       })

//       // UPDATED: Cancel attendance
//       .addCase(cancelEventAttendanceAsync.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(cancelEventAttendanceAsync.fulfilled, (state, action) => {
//         state.loading = false;

//         // Remove the ticket from eventsToAttend
//         state.eventsToAttend = state.eventsToAttend.filter(
//           (ticket) => ticket._id !== action.meta.arg,
//         );

//         toast.success("Attendance cancelled successfully!");
//       })
//       .addCase(cancelEventAttendanceAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         toast.error(action.payload);
//       })

//       // NEW: Get ticket QR code
//       .addCase(getTicketQRCodeAsync.pending, (state) => {
//         state.qrCodeLoading = true;
//       })
//       .addCase(getTicketQRCodeAsync.fulfilled, (state, action) => {
//         state.qrCodeLoading = false;
//         state.latestQrCode = action.payload.qrCode;
//         state.selectedTicket = action.payload.ticketDetails;
//       })
//       .addCase(getTicketQRCodeAsync.rejected, (state, action) => {
//         state.qrCodeLoading = false;
//         state.error = action.payload;
//         toast.error(action.payload || "Failed to get QR code");
//       })

//       // NEW: Regenerate ticket QR code
//       .addCase(regenerateTicketQRCodeAsync.pending, (state) => {
//         state.qrCodeLoading = true;
//       })
//       .addCase(regenerateTicketQRCodeAsync.fulfilled, (state, action) => {
//         state.qrCodeLoading = false;
//         state.latestQrCode = action.payload.qrCode;

//         // Update the ticket in eventsToAttend with new QR code
//         const updatedTicket = action.payload.ticket;
//         const ticketIndex = state.eventsToAttend.findIndex(
//           (ticket) => ticket._id === updatedTicket._id,
//         );

//         if (ticketIndex !== -1) {
//           state.eventsToAttend[ticketIndex] = updatedTicket;
//         }

//         toast.success("QR code regenerated successfully!");
//       })
//       .addCase(regenerateTicketQRCodeAsync.rejected, (state, action) => {
//         state.qrCodeLoading = false;
//         state.error = action.payload;
//         toast.error(action.payload || "Failed to regenerate QR code");
//       })

//       // Payment Success Handling
//       .addCase(handlePaymentSuccessAsync.pending, (state) => {
//         state.paymentProcessing = true;
//         state.paymentSuccess = false;
//         state.paymentError = null;
//       })
//       .addCase(handlePaymentSuccessAsync.fulfilled, (state, action) => {
//         state.paymentProcessing = false;
//         state.paymentSuccess = true;
//         toast.success(action.payload.message);
//       })
//       .addCase(handlePaymentSuccessAsync.rejected, (state, action) => {
//         state.paymentProcessing = false;
//         state.paymentError = action.payload;
//         toast.error(action.payload || "Payment processing failed");
//       })

//       .addCase(getLiveEventsAsync.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(getLiveEventsAsync.fulfilled, (state, action) => {
//         state.loading = false;
//         state.liveEvents = action.payload;
//       })
//       .addCase(getLiveEventsAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       .addCase(addCommentAsync.pending, (state) => {
//         state.commentLoading = true;
//         state.commentError = null;
//       })
//       .addCase(addCommentAsync.fulfilled, (state, action) => {
//         state.commentLoading = false;

//         const { comment, warningCount, isToxic } = action.payload;

//         const eventIndex = state.allEvents.findIndex(
//           (e) => e._id === comment.eventId,
//         );
//         if (eventIndex !== -1) {
//           if (!state.allEvents[eventIndex].comments) {
//             state.allEvents[eventIndex].comments = [];
//           }
//           state.allEvents[eventIndex].comments.push(comment);
//         }

//         state.commentWarningCount = warningCount;

//         if (warningCount >= 3) {
//           state.commentDisabled = true;
//           toast.error(
//             "You have reached 3 warnings. Commenting is now disabled!",
//           );
//         } else if (isToxic) {
//           toast.warning(`Warning! Toxic words detected (${warningCount}/3)`);
//         } else {
//           toast.success("Comment added successfully!");
//         }
//       })
//       .addCase(addCommentAsync.rejected, (state, action) => {
//         state.commentLoading = false;
//         state.commentError = action.payload;
//         toast.error(action.payload || "Failed to add comment");
//       })
//       .addCase(getAvailableSeatsAsync.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(getAvailableSeatsAsync.fulfilled, (state, action) => {
//         state.loading = false;
//         state.availableSeats = action.payload.availableSeats;
//         state.seatPricing = action.payload.seatPricing;
//         state.basePrice = action.payload.basePrice;
//       })
//       .addCase(getAvailableSeatsAsync.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const {
//   filterByCategory,
//   setSearchQuery,
//   clearFilter,
//   applyFilters,
//   resetEventState,
//   setEventCount,
//   resetPaymentState,
//   setSelectedTicket,
//   clearQrCode,
//   setWatchlist,
//   clearTicketPurchase,
//   resetEditState, // NEW: Export resetEditState
// } = eventSlice.actions;
// export default eventSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "sonner";

const BASE_URL = "https://eventmanagement-4-49d3.onrender.com";

export const addEventAsync = createAsyncThunk(
  "events/addEventAsync",
  async (formData, { rejectWithValue }) => {
    try {
      console.log(
        "🎫 Sending event creation request with seat configuration...",
      );

      const { data } = await axios.post(
        `${BASE_URL}/api/v1/event/add`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("✅ Event created successfully with seat configuration:", {
        title: data.event.title,
        totalSeats: data.event.totalSeats,
        seatConfig: data.event.seatConfig,
        basePrice: data.event.basePrice,
      });

      return data.event;
    } catch (err) {
      console.error(
        "❌ Event creation failed:",
        err.response?.data || err.message,
      );
      return rejectWithValue(
        err.response?.data?.message || "Failed to add event",
      );
    }
  },
);

export const getAllEventsAsync = createAsyncThunk(
  "events/getAllEventsAsync",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/v1/event/all`, {
        withCredentials: true,
      });
      return data.events;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch events",
      );
    }
  },
);

export const getUserWithPopulatedEventsAsync = createAsyncThunk(
  "events/getUserWithPopulatedEventsAsync",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching user with populated events...");
      const { data } = await axios.get(`${BASE_URL}/api/v1/user/profile`, {
        withCredentials: true,
      });

      console.log("User with populated events response:", data);

      return {
        eventsToOrganize: data.user?.eventToOrganize || [],
        watchlist: data.user?.myEventWatchlist || [],
        eventsToAttend: data.user?.eventsToAttend || [],
      };
    } catch (err) {
      console.error(
        "Get user events error:",
        err.response?.data || err.message,
      );
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch user events",
      );
    }
  },
);

export const getMyEventsAsync = createAsyncThunk(
  "events/getMyEventsAsync",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching my events...");
      const { data } = await axios.get(`${BASE_URL}/api/v1/user/me/events`, {
        withCredentials: true,
      });

      console.log("My events response:", data);

      return {
        eventsToOrganize:
          data.eventsToOrganize || data.user?.eventToOrganize || [],
        watchlist: data.watchlist || data.user?.myEventWatchlist || [],
        eventsToAttend: data.eventsToAttend || data.user?.eventsToAttend || [],
      };
    } catch (err) {
      console.error("Get my events error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch my events",
      );
    }
  },
);

export const removeEventAsync = createAsyncThunk(
  "events/removeEventAsync",
  async (eventId, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/api/v1/event/delete/${eventId}`, {
        withCredentials: true,
      });
      return eventId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete event",
      );
    }
  },
);

export const addToWatchlistAsync = createAsyncThunk(
  "events/addToWatchlist",
  async (eventId, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/v1/event/watchlist/add/${eventId}`,
        {},
        { withCredentials: true },
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const removeFromWatchlistAsync = createAsyncThunk(
  "events/removeFromWatchlist",
  async (eventId, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${BASE_URL}/api/v1/event/watchlist/remove/${eventId}`,
        {},
        { withCredentials: true },
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const addToEventsToAttendAsync = createAsyncThunk(
  "events/addToEventsToAttendAsync",
  async (
    { eventId, quantity, transactionId, selectedSeats },
    { rejectWithValue },
  ) => {
    try {
      console.log("🔄 Sending attend request with data:", {
        eventId,
        quantity,
        transactionId,
        selectedSeats,
      });

      const { data } = await axios.post(
        `${BASE_URL}/api/v1/event/attend`,
        {
          eventId,
          quantity,
          transactionId,
          selectedSeats,
        },
        { withCredentials: true },
      );

      console.log("✅ Attend response:", data);

      return {
        ticket: data.ticket,
        eventsToAttend: data.eventsToAttend,
        totalAmount: data.totalAmount,
        seatSummary: data.seatSummary,
      };
    } catch (err) {
      console.error("❌ Attend error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.message || "Failed to add to attending list",
      );
    }
  },
);

export const getEventsToOrganizeAsync = createAsyncThunk(
  "events/getEventsToOrganizeAsync",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/api/v1/event/${userId}/organized-events`,
        { withCredentials: true },
      );
      return data.organizedEvents;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch organized events",
      );
    }
  },
);

export const updateEventStatusAsync = createAsyncThunk(
  "events/updateEventStatusAsync",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await axios.put(
        `${BASE_URL}/api/v1/event/update-status/${id}`,
        { status },
        { withCredentials: true },
      );
      return { id, status };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update event status",
      );
    }
  },
);

export const editOrganizedEventAsync = createAsyncThunk(
  "events/editOrganizedEventAsync",
  async ({ eventId, updatedData }, { rejectWithValue }) => {
    try {
      console.log(
        "🔄 Sending update request for event:",
        eventId,
        "with data:",
        updatedData,
      );

      const { data } = await axios.put(
        `${BASE_URL}/api/v1/event/organized/${eventId}`,
        updatedData,
        {
          withCredentials: true,
          headers: {
            "Content-Type":
              updatedData instanceof FormData
                ? "multipart/form-data"
                : "application/json",
          },
        },
      );

      console.log("✅ Backend response:", data);

      if (!data.event) {
        console.error("No event data in response:", data);
        throw new Error("No event data received from server");
      }

      return data.event;
    } catch (err) {
      console.error("❌ Edit event error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.message || "Failed to edit event",
      );
    }
  },
);

export const deleteOrganizedEventAsync = createAsyncThunk(
  "events/deleteOrganizedEventAsync",
  async (eventId, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/api/v1/event/organized/${eventId}`, {
        withCredentials: true,
      });
      return eventId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete event",
      );
    }
  },
);

export const updateTicketQuantityAsync = createAsyncThunk(
  "events/updateTicketQuantity",
  async ({ ticketId, newQuantity }, { rejectWithValue }) => {
    try {
      console.log("🔄 Frontend: Updating ticket quantity", {
        ticketId,
        newQuantity,
      });

      const { data } = await axios.put(
        `${BASE_URL}/api/v1/event/tickets/update/${ticketId}`,
        { newQuantity },
        { withCredentials: true },
      );

      console.log("✅ Frontend: Ticket update response", data);
      return data;
    } catch (error) {
      console.error(
        "❌ Frontend: Ticket update error",
        error.response?.data || error.message,
      );
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const cancelEventAttendanceAsync = createAsyncThunk(
  "events/cancelAttendance",
  async (ticketId, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(
        `${BASE_URL}/api/v1/event/attend/ticket/${ticketId}`,
        { withCredentials: true },
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const getTicketQRCodeAsync = createAsyncThunk(
  "events/getTicketQRCode",
  async (ticketId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/api/v1/event/ticket/${ticketId}/qrcode`,
        { withCredentials: true },
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const regenerateTicketQRCodeAsync = createAsyncThunk(
  "events/regenerateTicketQRCode",
  async (ticketId, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${BASE_URL}/api/v1/event/ticket/${ticketId}/regenerate-qr`,
        {},
        { withCredentials: true },
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const handlePaymentSuccessAsync = createAsyncThunk(
  "events/handlePaymentSuccess",
  async (params, { rejectWithValue, dispatch }) => {
    try {
      const { eventId, newQuantity, transactionId, action } = params;

      if (action === "updateTicketQuantity") {
        await dispatch(
          updateTicketQuantityAsync({
            eventId,
            newQuantity: parseInt(newQuantity),
          }),
        ).unwrap();

        await dispatch(getUserWithPopulatedEventsAsync());

        return {
          success: true,
          message: "Ticket quantity updated successfully!",
        };
      } else if (action === "addToEventsToAttend") {
        await dispatch(
          addToEventsToAttendAsync({
            eventId,
            quantity: parseInt(newQuantity || 1),
            transactionId,
          }),
        ).unwrap();

        await dispatch(getUserWithPopulatedEventsAsync());

        return {
          success: true,
          message: "Event added to your attending list!",
        };
      } else {
        throw new Error("Invalid action type");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Payment processing failed");
    }
  },
);

export const getLiveEventsAsync = createAsyncThunk(
  "events/getLiveEventsAsync",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/v1/event/live`, {
        withCredentials: true,
      });
      return data.liveEvents;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch live events",
      );
    }
  },
);

export const addCommentAsync = createAsyncThunk(
  "events/addCommentAsync",
  async ({ eventId, text }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/v1/event/${eventId}/comment`,
        { text },
        { withCredentials: true },
      );

      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add comment",
      );
    }
  },
);

export const getAvailableSeatsAsync = createAsyncThunk(
  "events/getAvailableSeats",
  async (eventId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/api/v1/event/${eventId}/available-seats`,
        { withCredentials: true },
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const initialState = {
  liveEvents: [],
  allEvents: [],
  filteredEvents: [],
  activeCategory: "All",
  searchQuery: "",
  loading: false,
  error: null,
  eventToOrganize: [],
  watchlist: [],
  eventsToAttend: [],
  commentLoading: false,
  commentError: null,
  commentWarningCount: 0,
  commentDisabled: false,
  success: false,
  message: null,
  loadingEvents: {},
  paymentProcessing: false,
  paymentSuccess: false,
  paymentError: null,
  eventCount: 0,
  latestQrCode: null,
  qrCodeLoading: false,
  selectedTicket: null,
  availableSeats: null,
  seatPricing: null,
  basePrice: 0,
  ticketPurchase: {
    totalAmount: 0,
    seatSummary: [],
    lastPurchase: null,
  },
  editLoading: false,
  editError: null,
};

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    filterByCategory: (state, action) => {
      state.activeCategory = action.payload;
      eventSlice.caseReducers.applyFilters(state);
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      eventSlice.caseReducers.applyFilters(state);
    },
    clearFilter: (state) => {
      state.activeCategory = "All";
      state.searchQuery = "";
      state.filteredEvents = state.allEvents;
    },
    applyFilters: (state) => {
      let filtered = [...state.allEvents];
      if (state.activeCategory !== "All") {
        filtered = filtered.filter(
          (event) => event.category === state.activeCategory,
        );
      }
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (event) =>
            event.title.toLowerCase().includes(query) ||
            event.description.toLowerCase().includes(query) ||
            event.location.toLowerCase().includes(query) ||
            event.category.toLowerCase().includes(query),
        );
      }
      state.filteredEvents = filtered;
    },
    resetEventState: (state) => {
      state.success = false;
      state.message = null;
      state.error = null;
      state.paymentSuccess = false;
      state.paymentError = null;
      state.editError = null;
    },
    setEventCount: (state, action) => {
      state.eventCount = action.payload;
    },
    resetPaymentState: (state) => {
      state.paymentProcessing = false;
      state.paymentSuccess = false;
      state.paymentError = null;
    },
    setSelectedTicket: (state, action) => {
      state.selectedTicket = action.payload;
    },
    clearQrCode: (state) => {
      state.latestQrCode = null;
    },
    setWatchlist: (state, action) => {
      state.watchlist = action.payload;
    },
    clearTicketPurchase: (state) => {
      state.ticketPurchase = {
        totalAmount: 0,
        seatSummary: [],
        lastPurchase: null,
      };
    },
    resetEditState: (state) => {
      state.editLoading = false;
      state.editError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addEventAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEventAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.allEvents.push(action.payload);
        eventSlice.caseReducers.applyFilters(state);
        state.success = true;
        state.message = "Event created successfully!";
        state.eventToOrganize.push(action.payload);
        state.eventCount = state.eventToOrganize.length;
        toast.success("Event created successfully!");
      })
      .addCase(addEventAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to create event");
      })

      .addCase(getAllEventsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllEventsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.allEvents = action.payload;
        state.filteredEvents = action.payload;
      })
      .addCase(getAllEventsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getUserWithPopulatedEventsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserWithPopulatedEventsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.eventToOrganize = action.payload.eventsToOrganize || [];
        state.watchlist = action.payload.watchlist || [];
        state.eventsToAttend = action.payload.eventsToAttend || [];
        state.eventCount = state.eventToOrganize.length;
        console.log("User events stored in state:", {
          organized: state.eventToOrganize.length,
          watchlist: state.watchlist.length,
          attending: state.eventsToAttend.length,
          attendingTickets: state.eventsToAttend.map((t) => ({
            ticketId: t._id,
            eventId: t.event?._id,
            eventTitle: t.event?.title,
          })),
        });
      })
      .addCase(getUserWithPopulatedEventsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getMyEventsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyEventsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.eventToOrganize = action.payload.eventsToOrganize || [];
        state.watchlist = action.payload.watchlist || [];
        state.eventsToAttend = action.payload.eventsToAttend || [];
        state.eventCount = state.eventToOrganize.length;
        console.log("My events stored in state:", {
          organized: state.eventToOrganize.length,
          watchlist: state.watchlist.length,
          attending: state.eventsToAttend.length,
        });
      })
      .addCase(getMyEventsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(removeEventAsync.fulfilled, (state, action) => {
        state.allEvents = state.allEvents.filter(
          (e) => e._id !== action.payload,
        );
        state.filteredEvents = state.filteredEvents.filter(
          (e) => e._id !== action.payload,
        );
        toast.success("Event deleted successfully!");
      })

      .addCase(addToWatchlistAsync.pending, (state, action) => {
        state.loadingEvents[action.meta.arg] = true;
      })
      .addCase(addToWatchlistAsync.fulfilled, (state, action) => {
        state.loadingEvents[action.meta.arg] = false;
        const eventAlreadyInWatchlist = state.watchlist.some(
          (event) => event._id === action.payload.event._id,
        );
        if (!eventAlreadyInWatchlist) {
          state.watchlist.push(action.payload.event);
        }
        if (action.payload.watchlist) {
          state.watchlist = action.payload.watchlist;
        }
        toast.success("Event added to watchlist!");
      })
      .addCase(addToWatchlistAsync.rejected, (state, action) => {
        state.loadingEvents[action.meta.arg] = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to add to watchlist");
      })

      .addCase(removeFromWatchlistAsync.pending, (state, action) => {
        state.loadingEvents[action.meta.arg] = true;
      })
      .addCase(removeFromWatchlistAsync.fulfilled, (state, action) => {
        state.loadingEvents[action.meta.arg] = false;
        state.watchlist = state.watchlist.filter(
          (event) => event._id !== action.meta.arg,
        );
        if (action.payload.watchlist) {
          state.watchlist = action.payload.watchlist;
        }
        toast.success("Event removed from watchlist!");
      })
      .addCase(removeFromWatchlistAsync.rejected, (state, action) => {
        state.loadingEvents[action.meta.arg] = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to remove from watchlist");
      })

      .addCase(getEventsToOrganizeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEventsToOrganizeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.eventToOrganize = action.payload;
        state.eventCount = action.payload.length;
      })
      .addCase(getEventsToOrganizeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateEventStatusAsync.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const eventIndex = state.allEvents.findIndex((e) => e._id === id);
        if (eventIndex !== -1) {
          state.allEvents[eventIndex].status = status;
        }
        const filteredIndex = state.filteredEvents.findIndex(
          (e) => e._id === id,
        );
        if (filteredIndex !== -1) {
          state.filteredEvents[filteredIndex].status = status;
        }
        const organizedIndex = state.eventToOrganize.findIndex(
          (e) => e._id === id,
        );
        if (organizedIndex !== -1) {
          state.eventToOrganize[organizedIndex].status = status;
        }
      })

      .addCase(editOrganizedEventAsync.pending, (state) => {
        state.editLoading = true;
        state.editError = null;
        state.error = null;
      })
      .addCase(editOrganizedEventAsync.fulfilled, (state, action) => {
        state.editLoading = false;
        const updatedEvent = action.payload;
        console.log("🔄 Updating state with edited event:", updatedEvent);
        const organizedIndex = state.eventToOrganize.findIndex(
          (e) => e._id === updatedEvent._id,
        );
        if (organizedIndex !== -1) {
          state.eventToOrganize[organizedIndex] = updatedEvent;
          console.log("✅ Updated event in eventToOrganize");
        }
        const allEventsIndex = state.allEvents.findIndex(
          (e) => e._id === updatedEvent._id,
        );
        if (allEventsIndex !== -1) {
          state.allEvents[allEventsIndex] = updatedEvent;
          console.log("✅ Updated event in allEvents");
        }
        const filteredIndex = state.filteredEvents.findIndex(
          (e) => e._id === updatedEvent._id,
        );
        if (filteredIndex !== -1) {
          state.filteredEvents[filteredIndex] = updatedEvent;
          console.log("✅ Updated event in filteredEvents");
        }
        state.success = true;
        state.message = "Event updated successfully!";
        toast.success("Event updated successfully!");
      })
      .addCase(editOrganizedEventAsync.rejected, (state, action) => {
        state.editLoading = false;
        state.editError = action.payload;
        state.error = action.payload;
        console.error("❌ Edit event rejected:", action.payload);
        toast.error(action.payload || "Failed to edit event");
      })

      .addCase(deleteOrganizedEventAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrganizedEventAsync.fulfilled, (state, action) => {
        state.loading = false;
        const deletedEventId = action.payload;
        state.eventToOrganize = state.eventToOrganize.filter(
          (e) => e._id !== deletedEventId,
        );
        state.eventCount = state.eventToOrganize.length;
        state.allEvents = state.allEvents.filter(
          (e) => e._id !== deletedEventId,
        );
        state.filteredEvents = state.filteredEvents.filter(
          (e) => e._id !== deletedEventId,
        );
        state.watchlist = state.watchlist.filter(
          (e) => e._id !== deletedEventId,
        );
        state.eventsToAttend = state.eventsToAttend.filter(
          (ticket) => ticket.event?._id !== deletedEventId,
        );
        toast.success("Event deleted successfully!");
      })
      .addCase(deleteOrganizedEventAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to delete event");
      })

      .addCase(addToEventsToAttendAsync.fulfilled, (state, action) => {
        const { ticket, eventsToAttend, totalAmount, seatSummary } =
          action.payload;
        state.eventsToAttend = eventsToAttend;
        state.latestQrCode = ticket?.qrCode;
        state.ticketPurchase = {
          totalAmount: totalAmount || 0,
          seatSummary: seatSummary || [],
          lastPurchase: new Date().toISOString(),
        };
        console.log("✅ Ticket purchase completed:", {
          ticketId: ticket?._id,
          totalAmount,
          seatSummary,
          seatsBooked: seatSummary?.length || 0,
        });
        toast.success(
          `Ticket purchased successfully! Total: $${totalAmount || 0}`,
        );
      })

      .addCase(updateTicketQuantityAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTicketQuantityAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTicket = action.payload.ticket;
        const ticketIndex = state.eventsToAttend.findIndex(
          (ticket) => ticket._id === updatedTicket._id,
        );
        if (ticketIndex !== -1) {
          state.eventsToAttend[ticketIndex] = updatedTicket;
        }
        toast.success("Ticket quantity updated successfully!");
      })
      .addCase(updateTicketQuantityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      .addCase(cancelEventAttendanceAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelEventAttendanceAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.eventsToAttend = state.eventsToAttend.filter(
          (ticket) => ticket._id !== action.meta.arg,
        );
        toast.success("Attendance cancelled successfully!");
      })
      .addCase(cancelEventAttendanceAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      .addCase(getTicketQRCodeAsync.pending, (state) => {
        state.qrCodeLoading = true;
      })
      .addCase(getTicketQRCodeAsync.fulfilled, (state, action) => {
        state.qrCodeLoading = false;
        state.latestQrCode = action.payload.qrCode;
        state.selectedTicket = action.payload.ticketDetails;
      })
      .addCase(getTicketQRCodeAsync.rejected, (state, action) => {
        state.qrCodeLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to get QR code");
      })

      .addCase(regenerateTicketQRCodeAsync.pending, (state) => {
        state.qrCodeLoading = true;
      })
      .addCase(regenerateTicketQRCodeAsync.fulfilled, (state, action) => {
        state.qrCodeLoading = false;
        state.latestQrCode = action.payload.qrCode;
        const updatedTicket = action.payload.ticket;
        const ticketIndex = state.eventsToAttend.findIndex(
          (ticket) => ticket._id === updatedTicket._id,
        );
        if (ticketIndex !== -1) {
          state.eventsToAttend[ticketIndex] = updatedTicket;
        }
        toast.success("QR code regenerated successfully!");
      })
      .addCase(regenerateTicketQRCodeAsync.rejected, (state, action) => {
        state.qrCodeLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to regenerate QR code");
      })

      .addCase(handlePaymentSuccessAsync.pending, (state) => {
        state.paymentProcessing = true;
        state.paymentSuccess = false;
        state.paymentError = null;
      })
      .addCase(handlePaymentSuccessAsync.fulfilled, (state, action) => {
        state.paymentProcessing = false;
        state.paymentSuccess = true;
        toast.success(action.payload.message);
      })
      .addCase(handlePaymentSuccessAsync.rejected, (state, action) => {
        state.paymentProcessing = false;
        state.paymentError = action.payload;
        toast.error(action.payload || "Payment processing failed");
      })

      .addCase(getLiveEventsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLiveEventsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.liveEvents = action.payload;
      })
      .addCase(getLiveEventsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addCommentAsync.pending, (state) => {
        state.commentLoading = true;
        state.commentError = null;
      })
      .addCase(addCommentAsync.fulfilled, (state, action) => {
        state.commentLoading = false;
        const { comment, warningCount, isToxic } = action.payload;
        const eventIndex = state.allEvents.findIndex(
          (e) => e._id === comment.eventId,
        );
        if (eventIndex !== -1) {
          if (!state.allEvents[eventIndex].comments) {
            state.allEvents[eventIndex].comments = [];
          }
          state.allEvents[eventIndex].comments.push(comment);
        }
        state.commentWarningCount = warningCount;
        if (warningCount >= 3) {
          state.commentDisabled = true;
          toast.error(
            "You have reached 3 warnings. Commenting is now disabled!",
          );
        } else if (isToxic) {
          toast.warning(`Warning! Toxic words detected (${warningCount}/3)`);
        } else {
          toast.success("Comment added successfully!");
        }
      })
      .addCase(addCommentAsync.rejected, (state, action) => {
        state.commentLoading = false;
        state.commentError = action.payload;
        toast.error(action.payload || "Failed to add comment");
      })

      .addCase(getAvailableSeatsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAvailableSeatsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSeats = action.payload.availableSeats;
        state.seatPricing = action.payload.seatPricing;
        state.basePrice = action.payload.basePrice;
      })
      .addCase(getAvailableSeatsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  filterByCategory,
  setSearchQuery,
  clearFilter,
  applyFilters,
  resetEventState,
  setEventCount,
  resetPaymentState,
  setSelectedTicket,
  clearQrCode,
  setWatchlist,
  clearTicketPurchase,
  resetEditState,
} = eventSlice.actions;
export default eventSlice.reducer;

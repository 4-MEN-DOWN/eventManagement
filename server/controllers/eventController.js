// import catchAsyncError from "../middlewares/catchAsyncError.js";
// import ErrorHandler from "../middlewares/errorMiddleware.js";
// import { Event } from "../models/eventModel.js";
// import { User } from "../models/userModel.js";
// import mongoose from "mongoose";
// import Sentiment from "sentiment";
// import { analyzeText } from "../utils/sentimentConfig.js";
// const sentiment = new Sentiment();
// import { v4 as uuidv4 } from "uuid";
// import QRCode from "qrcode";
// import { sendEmail, sendEventStatusEmail } from "../utils/emailService.js";

// export const addEvent = catchAsyncError(async (req, res, next) => {
//   const {
//     title,
//     description,
//     date,
//     startTime,
//     endTime,
//     location,
//     category,
//     basePrice,
//     coordinates,
//     seatConfig, // New field for seat configuration
//   } = req.body;

//   console.log("📥 Received coordinates:", coordinates);
//   console.log("🎫 Received seat config:", seatConfig);

//   if (
//     !title ||
//     !description ||
//     !date ||
//     !startTime ||
//     !endTime ||
//     !location ||
//     !category ||
//     basePrice === undefined ||
//     !seatConfig
//   ) {
//     return next(new ErrorHandler("Please enter all the required fields", 400));
//   }

//   if (!req.file) {
//     return next(new ErrorHandler("Banner image is required", 400));
//   }

//   if (!req.user?._id) {
//     return next(new ErrorHandler("Unauthorized: User info missing", 401));
//   }

//   // Get user to determine max attendees based on subscription
//   const user = await User.findById(req.user._id);
//   if (!user) {
//     return next(new ErrorHandler("User not found", 404));
//   }

//   // Check if user can create event
//   const canCreateCheck = user.canCreateEvent(basePrice > 0);
//   if (!canCreateCheck.canCreate) {
//     return next(
//       new ErrorHandler(
//         "Cannot create event. Check your subscription limits.",
//         400
//       )
//     );
//   }

//   // Parse seat configuration
//   let parsedSeatConfig;
//   try {
//     parsedSeatConfig =
//       typeof seatConfig === "string" ? JSON.parse(seatConfig) : seatConfig;

//     // Validate seat configuration
//     if (
//       !parsedSeatConfig.front ||
//       !parsedSeatConfig.middle ||
//       !parsedSeatConfig.last
//     ) {
//       return next(new ErrorHandler("Invalid seat configuration", 400));
//     }

//     // Ensure all required fields are present for each seat type
//     const seatTypes = ["front", "middle", "last"];
//     for (const seatType of seatTypes) {
//       if (
//         parsedSeatConfig[seatType].count === undefined ||
//         parsedSeatConfig[seatType].price === undefined
//       ) {
//         return next(
//           new ErrorHandler(`Missing count or price for ${seatType} seats`, 400)
//         );
//       }
//     }
//   } catch (error) {
//     console.error("❌ Failed to parse seat configuration:", error.message);
//     return next(new ErrorHandler("Invalid seat configuration format", 400));
//   }

//   // Calculate total seats from configuration
//   const totalSeats =
//     parsedSeatConfig.front.count +
//     parsedSeatConfig.middle.count +
//     parsedSeatConfig.last.count;

//   // Get max attendees based on user's subscription plan
//   const maxAttendees = user.getMaxAttendees();
//   console.log(
//     `🎫 User subscription allows: ${maxAttendees} attendees, Event requires: ${totalSeats} seats`
//   );

//   // Check if total seats exceed subscription limit
//   if (totalSeats > maxAttendees) {
//     return next(
//       new ErrorHandler(
//         `Your ${user.subscription} plan allows maximum ${maxAttendees} attendees, but you're trying to create ${totalSeats} seats. Please upgrade your plan.`,
//         400
//       )
//     );
//   }

//   const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//   const existingEvent = await Event.findOne({
//     title: { $regex: new RegExp(`^${escapedTitle}$`, "i") },
//     status: { $ne: "rejected" },
//   });

//   if (existingEvent) {
//     return next(
//       new ErrorHandler(
//         `An event titled "${title}" already exists. Please choose a different name.`,
//         400
//       )
//     );
//   }

//   let parsedCoordinates = null;
//   if (coordinates) {
//     try {
//       parsedCoordinates =
//         typeof coordinates === "string" ? JSON.parse(coordinates) : coordinates;
//       console.log("✅ Parsed coordinates:", parsedCoordinates);
//     } catch (error) {
//       console.error("❌ Failed to parse coordinates:", error.message);
//     }
//   }

//   // Initialize available and booked counts for each seat type
//   const finalSeatConfig = {
//     front: {
//       count: Number(parsedSeatConfig.front.count),
//       price: Number(parsedSeatConfig.front.price),
//       available: Number(parsedSeatConfig.front.count),
//       booked: 0,
//     },
//     middle: {
//       count: Number(parsedSeatConfig.middle.count),
//       price: Number(parsedSeatConfig.middle.price),
//       available: Number(parsedSeatConfig.middle.count),
//       booked: 0,
//     },
//     last: {
//       count: Number(parsedSeatConfig.last.count),
//       price: Number(parsedSeatConfig.last.price),
//       available: Number(parsedSeatConfig.last.count),
//       booked: 0,
//     },
//   };

//   const event = await Event.create({
//     title,
//     description,
//     date: new Date(date),
//     startTime,
//     endTime,
//     location,
//     coordinates: parsedCoordinates || null,
//     category,
//     basePrice: Number(basePrice),
//     seatConfig: finalSeatConfig,
//     createdBy: req.user._id,
//     // Remove maxAttendees as it's now handled by seatConfig
//     status: "pending",
//     banner: req.file.filename,
//     // These will be auto-calculated by the pre-save middleware
//     totalSeats: totalSeats,
//     availableSeats: totalSeats,
//     bookedSeats: 0,
//   });

//   user.eventToOrganize.push(event._id);
//   await user.save();

//   console.log("✅ Event created successfully:", {
//     title: event.title,
//     totalSeats: event.totalSeats,
//     seatConfig: {
//       front: `${event.seatConfig.front.count} seats (₹${
//         event.basePrice + event.seatConfig.front.price
//       })`,
//       middle: `${event.seatConfig.middle.count} seats (₹${
//         event.basePrice + event.seatConfig.middle.price
//       })`,
//       last: `${event.seatConfig.last.count} seats (₹${
//         event.basePrice + event.seatConfig.last.price
//       })`,
//     },
//     plan: user.subscription,
//   });

//   res.status(201).json({
//     success: true,
//     message: "Event created successfully",
//     event,
//     planLimits: {
//       maxAttendees: maxAttendees,
//       userPlan: user.subscription,
//       seatsCreated: totalSeats,
//     },
//     seatPricing: {
//       front: event.basePrice + event.seatConfig.front.price,
//       middle: event.basePrice + event.seatConfig.middle.price,
//       last: event.basePrice + event.seatConfig.last.price,
//     },
//   });
// });

// export const removeEvent = catchAsyncError(async (req, res, next) => {
//   const { id } = req.params;

//   const event = await Event.findById(id);
//   if (!event) {
//     return next(new ErrorHandler("Event Not Found", 404));
//   }

//   await event.deleteOne();

//   await User.updateMany(
//     {},
//     {
//       $pull: {
//         eventToOrganize: { _id: id },
//         myEventWatchlist: { _id: id },
//         eventsToAttend: { _id: id },
//       },
//     }
//   );

//   res.status(200).json({
//     success: true,
//     message: "Event deleted successfully",
//   });
// });

// export const getAllEvents = catchAsyncError(async (req, res, next) => {
//   const events = await Event.find().populate("createdBy", "name email");
//   res.status(200).json({
//     success: true,
//     message: "All events fetched successfully",
//     events,
//   });
// });

// export const updateEvent = catchAsyncError(async (req, res, next) => {
//   const { id } = req.params;
//   const {
//     title,
//     description,
//     date,
//     startTime,
//     endTime,
//     location,
//     category,
//     price,
//     isActive,
//   } = req.body;

//   console.log(startTime, endTime);
//   const event = await Event.findById(id);
//   if (!event) {
//     return next(new ErrorHandler("Event Not Found", 404));
//   }

//   event.title = title ?? event.title;
//   event.description = description ?? event.description;
//   event.date = date ?? event.date;
//   event.startTime = startTime ?? event.startTime;
//   event.endTime = endTime ?? event.endTime;
//   event.location = location ?? event.location;
//   event.category = category ?? event.category;
//   event.price = price ?? event.price;
//   event.isActive = isActive ?? event.isActive;

//   await event.save();

//   res.status(200).json({
//     success: true,
//     message: "Event updated successfully",
//     event,
//   });
// });

// export const addToWatchlist = catchAsyncError(async (req, res, next) => {
//   const userId = req.user._id;
//   const { eventId } = req.params;

//   const event = await Event.findById(eventId);
//   if (!event) {
//     return next(new ErrorHandler("Event not found", 404));
//   }

//   const user = await User.findById(userId).populate("myEventWatchlist");

//   if (user.myEventWatchlist.some((e) => e._id.toString() === eventId)) {
//     return next(new ErrorHandler("Event already in watchlist", 400));
//   }

//   user.myEventWatchlist.push(event);
//   await user.save();

//   await user.populate("myEventWatchlist");

//   res.status(200).json({
//     success: true,
//     message: "Event added to watchlist",
//     event: event,
//     watchlist: user.myEventWatchlist,
//   });
// });

// export const removeFromWatchlist = catchAsyncError(async (req, res, next) => {
//   const userId = req.user._id;
//   const { eventId } = req.params;

//   const user = await User.findById(userId).populate("myEventWatchlist");
//   if (!user) return next(new ErrorHandler("User not found", 404));

//   user.myEventWatchlist = user.myEventWatchlist.filter(
//     (e) => e._id.toString() !== eventId
//   );

//   await user.save();

//   await user.populate("myEventWatchlist");

//   res.status(200).json({
//     success: true,
//     message: "Event removed from watchlist",
//     eventId: eventId,
//     watchlist: user.myEventWatchlist,
//   });
// });

// // Add this function to calculate seat price
// const calculateSeatPrice = (basePrice, seatType, seatConfig) => {
//   const seatPremium = seatConfig?.[seatType]?.price || 0;
//   return basePrice + seatPremium;
// };
// // Update the addToEventsToAttend function
// export const addToEventsToAttend = catchAsyncError(async (req, res, next) => {
//   const userId = req.user._id;
//   const { eventId, quantity = 1, transactionId, selectedSeats } = req.body;
//   console.log("🎫 Booking seats:", { eventId, quantity, selectedSeats });

//   if (!eventId) {
//     return next(new ErrorHandler("Event ID is required", 400));
//   }

//   if (quantity < 1) {
//     return next(new ErrorHandler("Quantity must be at least 1", 400));
//   }

//   if (
//     !selectedSeats ||
//     !Array.isArray(selectedSeats) ||
//     selectedSeats.length === 0
//   ) {
//     return next(new ErrorHandler("Please select seats", 400));
//   }

//   if (selectedSeats.length !== quantity) {
//     return next(new ErrorHandler("Number of seats must match quantity", 400));
//   }

//   const event = await Event.findById(eventId);
//   if (!event) {
//     return next(new ErrorHandler("Event not found", 404));
//   }

//   const user = await User.findById(userId);
//   if (!user) {
//     return next(new ErrorHandler("User not found", 404));
//   }

//   const existingTicket = user.getTicketForEvent(eventId);
//   if (existingTicket) {
//     return next(
//       new ErrorHandler(
//         "You already have a ticket for this event. Use update ticket quantity instead.",
//         400
//       )
//     );
//   }

//   // Check if seats are available using the new seatConfig system
//   const takenSeats = event.attendees.map((attendee) => attendee.seatNumber);
//   const unavailableSeats = selectedSeats.filter((seat) =>
//     takenSeats.includes(seat.seatNumber)
//   );

//   if (unavailableSeats.length > 0) {
//     return next(
//       new ErrorHandler(
//         `Some seats are no longer available: ${unavailableSeats
//           .map((s) => s.seatNumber)
//           .join(", ")}`,
//         400
//       )
//     );
//   }

//   // Check seat availability in seatConfig
//   const seatTypeCounts = {};
//   selectedSeats.forEach((seat) => {
//     seatTypeCounts[seat.seatType] = (seatTypeCounts[seat.seatType] || 0) + 1;
//   });

//   for (const [seatType, count] of Object.entries(seatTypeCounts)) {
//     const availableSeats = event.seatConfig[seatType]?.available || 0;
//     if (availableSeats < count) {
//       return next(
//         new ErrorHandler(
//           `Not enough ${seatType} seats available. Only ${availableSeats} left, but you requested ${count}.`,
//           400
//         )
//       );
//     }
//   }

//   const uniqueId = uuidv4();
//   const ticketIds = [];
//   const seatDetails = [];
//   let totalAmount = 0;

//   // Calculate prices and prepare seat details
//   for (let i = 0; i < quantity; i++) {
//     const seat = selectedSeats[i];
//     const finalPrice = calculateSeatPrice(
//       event.basePrice,
//       seat.seatType,
//       event.seatConfig
//     );

//     ticketIds.push(`${uniqueId}-${i + 1}`);
//     seatDetails.push({
//       seatType: seat.seatType,
//       seatNumber: seat.seatNumber,
//       seatPrice: finalPrice,
//       finalPrice: finalPrice,
//     });
//     totalAmount += finalPrice;
//   }
//   console.log("Seat Detail", seatDetails);
//   console.log("Total Amount", totalAmount);
//   const newTicket = {
//     event: event._id,
//     ticketQuantity: quantity,
//     paymentStatus: "completed",
//     transactionId: transactionId || undefined,
//     ticketIds: ticketIds,
//     seatDetails: seatDetails,
//     totalAmount: totalAmount,
//     purchaseDate: new Date(),
//     lastUpdated: new Date(),
//     attendanceStatus: "not_attended",
//     attendanceTime: null,
//     checkInNotifications: {
//       count: 0,
//       lastNotificationTime: null,
//       notificationHistory: [],
//       autoCheckedIn: false,
//     },
//   };

//   user.eventsToAttend.push(newTicket);

//   // Add attendees with seat information and update seat availability
//   for (let i = 0; i < quantity; i++) {
//     const seat = selectedSeats[i];

//     // Add attendee to event
//     event.attendees.push({
//       userId: userId,
//       attended: false,
//       seatType: seat.seatType,
//       seatNumber: seat.seatNumber,
//       ticketId: `${uniqueId}-${i + 1}`,
//       finalPrice: seatDetails[i].finalPrice,
//     });

//     // Update seat availability in seatConfig
//     event.seatConfig[seat.seatType].available -= 1;
//     event.seatConfig[seat.seatType].booked += 1;
//   }

//   // Update event seat counts
//   event.availableSeats -= quantity;
//   event.bookedSeats += quantity;

//   await user.save();
//   await event.save();

//   await user.populate("eventsToAttend.event");

//   console.log("✅ Ticket purchased successfully:", {
//     event: event.title,
//     seats: selectedSeats.map((s) => `${s.seatType}-${s.seatNumber}`),
//     totalAmount: totalAmount,
//     seatConfig: {
//       front: {
//         available: event.seatConfig.front.available,
//         booked: event.seatConfig.front.booked,
//       },
//       middle: {
//         available: event.seatConfig.middle.available,
//         booked: event.seatConfig.middle.booked,
//       },
//       last: {
//         available: event.seatConfig.last.available,
//         booked: event.seatConfig.last.booked,
//       },
//     },
//   });

//   res.status(200).json({
//     success: true,
//     message: "Ticket purchased successfully!",
//     ticket: {
//       ...newTicket,
//       _id: user.eventsToAttend[user.eventsToAttend.length - 1]._id,
//       event: {
//         _id: event._id,
//         title: event.title,
//         date: event.date,
//         location: event.location,
//       },
//     },
//     totalAmount: totalAmount,
//     seatSummary: selectedSeats.map((seat) => ({
//       seatType: seat.seatType,
//       seatNumber: seat.seatNumber,
//       price: calculateSeatPrice(
//         event.basePrice,
//         seat.seatType,
//         event.seatConfig
//       ),
//     })),
//   });
// });

// // Add this function to get available seats
// export const getAvailableSeats = catchAsyncError(async (req, res, next) => {
//   const { eventId } = req.params;

//   const event = await Event.findById(eventId);
//   if (!event) {
//     return next(new ErrorHandler("Event not found", 404));
//   }

//   // Get taken seats
//   const takenSeats = event.attendees.map((attendee) => attendee.seatNumber);

//   // Generate seat layout based on actual seat configuration
//   const generateSeatLayout = (seatType, count) => {
//     const prefix =
//       seatType === "front" ? "F" : seatType === "middle" ? "M" : "L";
//     const length = seatType === "front" ? 2 : 3; // F01 vs M001

//     return Array.from(
//       { length: count },
//       (_, i) => `${prefix}${String(i + 1).padStart(length, "0")}`
//     );
//   };

//   const availableSeats = {
//     front: generateSeatLayout("front", event.seatConfig.front.count).filter(
//       (seat) => !takenSeats.includes(seat)
//     ),
//     middle: generateSeatLayout("middle", event.seatConfig.middle.count).filter(
//       (seat) => !takenSeats.includes(seat)
//     ),
//     last: generateSeatLayout("last", event.seatConfig.last.count).filter(
//       (seat) => !takenSeats.includes(seat)
//     ),
//   };

//   const seatPricing = {
//     front: calculateSeatPrice(event.basePrice, "front", event.seatConfig),
//     middle: calculateSeatPrice(event.basePrice, "middle", event.seatConfig),
//     last: calculateSeatPrice(event.basePrice, "last", event.seatConfig),
//   };

//   res.status(200).json({
//     success: true,
//     availableSeats,
//     seatPricing,
//     basePrice: event.basePrice,
//     seatAvailability: {
//       front: {
//         total: event.seatConfig.front.count,
//         available: event.seatConfig.front.available,
//         booked: event.seatConfig.front.booked,
//       },
//       middle: {
//         total: event.seatConfig.middle.count,
//         available: event.seatConfig.middle.available,
//         booked: event.seatConfig.middle.booked,
//       },
//       last: {
//         total: event.seatConfig.last.count,
//         available: event.seatConfig.last.available,
//         booked: event.seatConfig.last.booked,
//       },
//     },
//     totalSeats: event.totalSeats,
//     availableSeatsCount: event.availableSeats,
//     bookedSeats: event.bookedSeats,
//   });
// });
// export const getOrganizedEvents = catchAsyncError(async (req, res, next) => {
//   const { id } = req.params;
//   console.log(id);
//   const user = await User.findById(id);
//   console.log(user);
//   if (!user) {
//     return next(new ErrorHandler("User not found", 404));
//   }

//   res.status(200).json({
//     success: true,
//     message: "Organized events fetched successfully",
//     organizedEvents: user.eventToOrganize,
//   });
// });

// export const updateEventStatus = catchAsyncError(async (req, res, next) => {
//   const { id } = req.params;
//   const { status, rejectionReason } = req.body;

//   if (!["approved", "rejected", "pending"].includes(status)) {
//     return next(new ErrorHandler("Invalid status value", 400));
//   }

//   const event = await Event.findById(id);
//   if (!event) return next(new ErrorHandler("Event not found", 404));

//   event.status = status;
//   await event.save();

//   const usersWithEvent = await User.find({
//     "eventToOrganize._id": id,
//   });

//   for (const user of usersWithEvent) {
//     const eventIndex = user.eventToOrganize.findIndex(
//       (e) => e._id.toString() === id
//     );

//     if (eventIndex !== -1) {
//       user.eventToOrganize[eventIndex].status = status;
//       await user.save();
//     }
//   }

//   if (status === "approved" || status === "rejected") {
//     sendEventStatusEmail(event, status, rejectionReason)
//       .then((success) => {
//         if (success) {
//           console.log(
//             `Event status email sent successfully for event: ${event.title}`
//           );
//         } else {
//           console.error(
//             `Failed to send event status email for event: ${event.title}`
//           );
//         }
//       })
//       .catch((err) => {
//         console.error("Error in email sending process:", err);
//       });
//   }

//   res.status(200).json({
//     success: true,
//     message: `Event status updated to ${status}`,
//     updatedStatus: status,
//   });
// });

// export const editOrganizedEvent = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { eventId } = req.params;
//     const updates = req.body;

//     if (!mongoose.Types.ObjectId.isValid(eventId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid event ID format",
//       });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (!user.eventToOrganize.includes(eventId)) {
//       return res.status(403).json({
//         success: false,
//         message: "You don't have permission to edit this event",
//       });
//     }

//     const updatedEvent = await Event.findByIdAndUpdate(eventId, updates, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedEvent) {
//       return res.status(404).json({
//         success: false,
//         message: "Event not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Event updated successfully",
//       event: updatedEvent,
//     });
//   } catch (error) {
//     console.error("Edit Event Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// export const deleteOrganizedEvent = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { eventId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(eventId)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid event ID" });
//     }

//     const eventObjectId = new mongoose.Types.ObjectId(eventId);

//     const deletedEvent = await Event.findByIdAndDelete(eventId);
//     if (!deletedEvent) {
//       return res.status(404).json({
//         success: false,
//         message: "Event not found in global collection",
//       });
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { $pull: { eventToOrganize: eventObjectId } },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     await User.updateMany(
//       {
//         $or: [
//           { myEventWatchlist: eventObjectId },
//           { eventsToAttend: eventObjectId },
//         ],
//       },
//       {
//         $pull: {
//           myEventWatchlist: eventObjectId,
//           eventsToAttend: eventObjectId,
//         },
//       }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Event deleted successfully from all collections",
//       eventToOrganize: updatedUser.eventToOrganize,
//     });
//   } catch (error) {
//     console.error("Delete Event Error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const addCommentToEvent = catchAsyncError(async (req, res, next) => {
//   const { eventId } = req.params;
//   const { text } = req.body;
//   const userId = req.user._id;

//   if (!text) return next(new ErrorHandler("Comment text is required", 400));

//   const event = await Event.findById(eventId);
//   if (!event) return next(new ErrorHandler("Event not found", 404));

//   const user = await User.findById(userId);

//   const analysis = analyzeText(text);
//   let finalText = text;
//   let isToxic = analysis.isToxic;

//   if (isToxic) {
//     const Filter = (await import("bad-words")).Filter;
//     const filter = new Filter();
//     finalText = filter.clean(text);

//     user.warningCount = (user.warningCount || 0) + 1;
//     await user.save();
//   }

//   const comment = {
//     userId,
//     text: finalText,
//     sentimentScore: analysis.score,
//   };

//   event.comments.push(comment);
//   await event.save();

//   res.status(201).json({
//     success: true,
//     message: isToxic
//       ? "Comment added with toxic words censored. Warning issued!"
//       : "Comment added successfully",
//     comment,
//     warningCount: user.warningCount,
//     isToxic,
//   });
// });

// export const getEventWithSentimentStats = catchAsyncError(
//   async (req, res, next) => {
//     const { eventId } = req.params;

//     const event = await Event.findById(eventId).populate(
//       "comments.userId",
//       "name email"
//     );
//     if (!event) {
//       return next(new ErrorHandler("Event not found", 404));
//     }

//     const comments = event.comments || [];

//     const positive = comments.filter((c) => c.sentimentScore > 0).length;
//     const negative = comments.filter((c) => c.sentimentScore < 0).length;
//     const neutral = comments.filter((c) => c.sentimentScore === 0).length;

//     res.status(200).json({
//       success: true,
//       event,
//       sentimentStats: {
//         positive,
//         negative,
//         neutral,
//         total: comments.length,
//       },
//     });
//   }
// );

// export const getLiveEvents = catchAsyncError(async (req, res, next) => {
//   const now = new Date();

//   const events = await Event.find({ isActive: true }).lean();

//   const liveEvents = events.filter((event) => {
//     const [year, month, day] = event.date
//       .toISOString()
//       .split("T")[0]
//       .split("-");

//     const [startHour, startMinute] = event.startTime.split(":").map(Number);
//     const [endHour, endMinute] = event.endTime.split(":").map(Number);

//     const start = new Date(year, month - 1, day, startHour, startMinute);
//     let end = new Date(year, month - 1, day, endHour, endMinute);

//     if (end < start) {
//       end.setDate(end.getDate() + 1);
//     }

//     return start <= now && now <= end;
//   });

//   res.status(200).json({
//     success: true,
//     liveEvents: liveEvents.sort((a, b) => {
//       const aStart = new Date(
//         `${a.date.toISOString().split("T")[0]}T${a.startTime}`
//       );
//       const bStart = new Date(
//         `${b.date.toISOString().split("T")[0]}T${b.startTime}`
//       );
//       return aStart - bStart;
//     }),
//   });
// });

// export const completeEventPayment = catchAsyncError(async (req, res, next) => {
//   const userId = req.user._id;
//   const { eventId } = req.params;

//   const user = await User.findById(userId).populate("eventsToAttend.event");
//   if (!user) return next(new ErrorHandler("User not found", 404));

//   const eventEntry = user.eventsToAttend.find((e) =>
//     e.event._id.equals(eventId)
//   );
//   if (!eventEntry)
//     return next(new ErrorHandler("Event not in your attending list", 404));

//   if (eventEntry.paymentStatus === "completed") {
//     return next(new ErrorHandler("Payment already completed", 400));
//   }

//   eventEntry.paymentStatus = "completed";

//   const qrData = {
//     userId: user._id.toString(),
//     eventId: eventId,
//     ticketQuantity: eventEntry.ticketQuantity,
//     timestamp: new Date(),
//   };
//   eventEntry.qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

//   await user.save();

//   res.status(200).json({
//     success: true,
//     message: "Payment completed. QR code generated!",
//     qrCode: eventEntry.qrCode,
//     eventsToAttend: user.eventsToAttend,
//   });
// });

// export const updateTicketQuantity = catchAsyncError(async (req, res, next) => {
//   const userId = req.user._id;
//   const { ticketId } = req.params;
//   const { newQuantity } = req.body;

//   console.log("🔄 Updating ticket quantity:", {
//     ticketId,
//     newQuantity,
//     userId,
//     params: req.params,
//     body: req.body,
//   });

//   if (!ticketId) {
//     return next(new ErrorHandler("Ticket ID is required", 400));
//   }

//   if (newQuantity === undefined || newQuantity === null) {
//     return next(new ErrorHandler("New quantity is required", 400));
//   }

//   if (newQuantity < 1) {
//     return next(new ErrorHandler("Quantity must be at least 1", 400));
//   }

//   const user = await User.findById(userId);
//   if (!user) {
//     return next(new ErrorHandler("User not found", 404));
//   }

//   console.log("🔍 User eventsToAttend:", user.eventsToAttend);

//   const ticket = user.eventsToAttend.id(ticketId);
//   if (!ticket) {
//     console.log("❌ Ticket not found with ID:", ticketId);
//     console.log(
//       "📋 Available ticket IDs:",
//       user.eventsToAttend.map((t) => t._id)
//     );
//     return next(new ErrorHandler("Ticket not found", 404));
//   }

//   console.log("✅ Found ticket:", {
//     ticketId: ticket._id,
//     currentQuantity: ticket.ticketQuantity,
//     event: ticket.event,
//   });

//   const event = await Event.findById(ticket.event);
//   if (!event) {
//     return next(new ErrorHandler("Event not found", 404));
//   }

//   const currentQuantity = ticket.ticketQuantity;
//   const quantityDifference = newQuantity - currentQuantity;

//   console.log("📊 Quantity update details:", {
//     currentQuantity,
//     newQuantity,
//     quantityDifference,
//     eventId: event._id,
//     eventTitle: event.title,
//   });

//   if (quantityDifference > 0) {
//     for (let i = 0; i < quantityDifference; i++) {
//       event.attendees.push(userId);
//     }
//     console.log(`✅ Added ${quantityDifference} attendees to event`);
//   } else if (quantityDifference < 0) {
//     const ticketsToRemove = Math.abs(quantityDifference);
//     let removed = 0;

//     event.attendees = event.attendees.filter((attendee) => {
//       if (
//         attendee.toString() === userId.toString() &&
//         removed < ticketsToRemove
//       ) {
//         removed++;
//         return false;
//       }
//       return true;
//     });
//     console.log(`✅ Removed ${ticketsToRemove} attendees from event`);
//   }

//   ticket.ticketQuantity = newQuantity;
//   ticket.lastUpdated = new Date();

//   console.log(
//     "🔄 Updating ticket quantity from",
//     currentQuantity,
//     "to",
//     newQuantity
//   );

//   if (quantityDifference !== 0) {
//     const baseId =
//       ticket.ticketIds[0]?.split("-").slice(0, -1).join("-") ||
//       ticket._id.toString();
//     ticket.ticketIds = [];
//     for (let i = 0; i < newQuantity; i++) {
//       ticket.ticketIds.push(`${baseId}-${i + 1}`);
//     }

//     console.log("🔄 Updated ticket IDs:", ticket.ticketIds);

//     const qrPayload = {
//       ticketId: baseId,
//       userId: userId.toString(),
//       eventId: event._id.toString(),
//       eventTitle: event.title,
//       eventDate: event.date,
//       ticketQuantity: newQuantity,
//       purchaseDate: ticket.purchaseDate,
//       lastUpdated: ticket.lastUpdated,
//     };

//     const qrString = JSON.stringify(qrPayload);
//     ticket.qrCode = await QRCode.toDataURL(qrString, {
//       width: 300,
//       margin: 2,
//       color: { dark: "#000000", light: "#FFFFFF" },
//     });

//     console.log("✅ Regenerated QR code with new quantity:", newQuantity);
//   }

//   await user.save();
//   await event.save();

//   console.log("✅ Ticket quantity updated successfully to:", newQuantity);

//   res.status(200).json({
//     success: true,
//     message: `Ticket quantity updated to ${newQuantity}`,
//     ticket: ticket,
//   });
// });

// export const cancelEventAttendance = catchAsyncError(async (req, res, next) => {
//   const userId = req.user._id;
//   const { ticketId } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(ticketId)) {
//     return next(new ErrorHandler("Invalid ticket ID", 400));
//   }

//   const user = await User.findById(userId);
//   if (!user) {
//     return next(new ErrorHandler("User not found", 404));
//   }

//   const ticket = user.eventsToAttend.id(ticketId);
//   if (!ticket) {
//     return next(new ErrorHandler("Ticket not found", 404));
//   }

//   const event = await Event.findById(ticket.event);
//   if (!event) {
//     return next(new ErrorHandler("Event not found", 404));
//   }

//   // Get all ticket IDs to remove from attendees
//   const ticketIdsToRemove = ticket.ticketIds || [];

//   console.log("🎫 Cancelling tickets:", {
//     ticketId,
//     ticketIds: ticketIdsToRemove,
//     seatDetails: ticket.seatDetails,
//   });

//   // Remove attendees based on ticketIds
//   const removedAttendees = [];
//   event.attendees = event.attendees.filter((attendee) => {
//     if (ticketIdsToRemove.includes(attendee.ticketId)) {
//       removedAttendees.push(attendee);
//       return false; // Remove this attendee
//     }
//     return true; // Keep this attendee
//   });

//   // Release seats back to availability
//   if (ticket.seatDetails && Array.isArray(ticket.seatDetails)) {
//     ticket.seatDetails.forEach((seatDetail) => {
//       const seatType = seatDetail.seatType;

//       if (event.seatConfig[seatType]) {
//         // Release the seat back to available
//         event.seatConfig[seatType].available += 1;
//         event.seatConfig[seatType].booked -= 1;

//         console.log(`♻️ Released ${seatType} seat: ${seatDetail.seatNumber}`);
//       }
//     });

//     // Update overall event seat counts
//     event.availableSeats += ticket.ticketQuantity;
//     event.bookedSeats -= ticket.ticketQuantity;
//   }

//   // Remove the ticket from user's eventsToAttend
//   user.eventsToAttend.pull({ _id: ticketId });

//   await user.save();
//   await event.save();

//   console.log("✅ Ticket cancelled successfully:", {
//     ticketId,
//     seatsReleased: ticket.seatDetails?.length || 0,
//     totalAmountRefunded: ticket.totalAmount || 0,
//   });

//   res.status(200).json({
//     success: true,
//     message: "Ticket cancelled successfully",
//     data: {
//       ticketId,
//       seatsReleased: ticket.seatDetails?.length || 0,
//       totalAmount: ticket.totalAmount || 0,
//       eventTitle: event.title,
//     },
//   });
// });

// // export const markEventAttendance = catchAsyncError(async (req, res, next) => {
// //   const { ticketId, userId, eventId } = req.body;

// //   if (!ticketId || !userId || !eventId) {
// //     return next(new ErrorHandler("Missing required fields", 400));
// //   }

// //   const user = await User.findById(userId).populate("eventsToAttend.event");
// //   if (!user) return next(new ErrorHandler("User not found", 404));

// //   const ticket = user.eventsToAttend.find(
// //     (t) => t.event._id.toString() === eventId.toString()
// //   );

// //   if (!ticket) {
// //     return next(new ErrorHandler("Ticket not found for this event", 404));
// //   }

// //   if (ticket.attendanceStatus === "attended") {
// //     return res.status(200).json({
// //       success: true,
// //       message: "User already marked as attended",
// //       ticket,
// //     });
// //   }

// //   ticket.attendanceStatus = "attended";
// //   ticket.attendanceTime = new Date();

// //   await user.save();

// //   const event = await Event.findById(eventId);
// //   if (!event) return next(new ErrorHandler("Event not found", 404));

// //   if (!event.attendanceLogs) event.attendanceLogs = [];
// //   event.attendanceLogs.push({
// //     user: userId,
// //     ticketId,
// //     time: new Date(),
// //   });
// //   await event.save();

// //   res.status(200).json({
// //     success: true,
// //     message: "Attendance marked successfully!",
// //     attendance: {
// //       user: user.name,
// //       event: event.title,
// //       ticketId,
// //       attendanceTime: ticket.attendanceTime,
// //     },
// //   });
// // });

// // export const geoCheckIn = async (req, res) => {
// //   try {
// //     console.log("📍 Geo-checkin attempt:", {
// //       eventId: req.body.eventId,
// //       latitude: req.body.latitude,
// //       longitude: req.body.longitude,
// //       userId: req.user._id,
// //     });

// //     const { eventId, latitude, longitude } = req.body;
// //     const userId = req.user._id;

// //     if (!eventId || latitude === undefined || longitude === undefined) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Event ID and location coordinates are required",
// //       });
// //     }

// //     const event = await Event.findById(eventId);
// //     if (!event) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Event not found",
// //       });
// //     }

// //     if (
// //       !event.coordinates ||
// //       event.coordinates.lat === undefined ||
// //       event.coordinates.lng === undefined
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Event location is not properly set",
// //       });
// //     }

// //     const calculateDistance = (lat1, lon1, lat2, lon2) => {
// //       const R = 6371e3;
// //       const φ1 = (lat1 * Math.PI) / 180;
// //       const φ2 = (lat2 * Math.PI) / 180;
// //       const Δφ = ((lat2 - lat1) * Math.PI) / 180;
// //       const Δλ = ((lon2 - lon1) * Math.PI) / 180;

// //       const a =
// //         Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
// //         Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
// //       const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// //       return R * c;
// //     };

// //     const distance = calculateDistance(
// //       latitude,
// //       longitude,
// //       event.coordinates.lat,
// //       event.coordinates.lng
// //     );

// //     console.log(`📍 Distance calculated: ${Math.round(distance)}m`);

// //     const ALLOWED_DISTANCE = 5200;
// //     if (distance > ALLOWED_DISTANCE) {
// //       console.log(
// //         `❌ User too far: ${Math.round(distance)}m > ${ALLOWED_DISTANCE}m`
// //       );
// //       return res.status(400).json({
// //         success: false,
// //         message: `You are ${Math.round(
// //           distance
// //         )}m away from the event. Please get within ${ALLOWED_DISTANCE}m to check in.`,
// //         distance: Math.round(distance),
// //         allowedDistance: ALLOWED_DISTANCE,
// //       });
// //     }

// //     console.log("✅ Distance check passed, proceeding with check-in...");

// //     const existingAttendeeIndex = event.attendees.findIndex((attendee) => {
// //       return (
// //         attendee &&
// //         attendee.userId &&
// //         attendee.userId.toString() === userId.toString()
// //       );
// //     });

// //     console.log(`📍 Existing attendee index: ${existingAttendeeIndex}`);

// //     if (existingAttendeeIndex !== -1) {
// //       event.attendees[existingAttendeeIndex].attended = true;
// //       event.attendees[existingAttendeeIndex].checkInTime = new Date();
// //       console.log("📍 Updated existing attendee");
// //     } else {
// //       event.attendees.push({
// //         userId: userId,
// //         attended: true,
// //         checkInTime: new Date(),
// //       });
// //       console.log("📍 Added new attendee");
// //     }

// //     await event.save();
// //     console.log("✅ Event saved successfully");

// //     res.json({
// //       success: true,
// //       message: "Check-in successful! 🎉",
// //       distance: Math.round(distance),
// //       checkInTime: new Date(),
// //     });
// //   } catch (error) {
// //     console.error("❌ Geo-checkin error:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Internal server error during check-in",
// //     });
// //   }
// // };

// export const markEventAttendance = catchAsyncError(async (req, res, next) => {
//   const { ticketId, userId, eventId } = req.body;

//   if (!ticketId || !userId || !eventId) {
//     return next(new ErrorHandler("Missing required fields", 400));
//   }

//   const user = await User.findById(userId).populate("eventsToAttend.event");
//   if (!user) return next(new ErrorHandler("User not found", 404));

//   const ticket = user.eventsToAttend.find(
//     (t) => t.event._id.toString() === eventId.toString()
//   );

//   if (!ticket) {
//     return next(new ErrorHandler("Ticket not found for this event", 404));
//   }

//   if (ticket.attendanceStatus === "attended") {
//     return res.status(200).json({
//       success: true,
//       message: "User already marked as attended",
//       ticket,
//     });
//   }

//   ticket.attendanceStatus = "attended";
//   ticket.attendanceTime = new Date();

//   await user.save();

//   const event = await Event.findById(eventId);
//   if (!event) return next(new ErrorHandler("Event not found", 404));

//   // Find and update the attendee's attended status to true
//   const attendeeIndex = event.attendees.findIndex(
//     (attendee) => attendee.userId.toString() === userId.toString()
//   );

//   if (attendeeIndex !== -1) {
//     event.attendees[attendeeIndex].attended = true; // SET TO TRUE
//     event.attendees[attendeeIndex].checkInTime = new Date();
//     console.log("✅ Mark attendance: Updated attendee - attended: true");
//   }

//   if (!event.attendanceLogs) event.attendanceLogs = [];
//   event.attendanceLogs.push({
//     user: userId,
//     ticketId,
//     time: new Date(),
//   });

//   await event.save();

//   res.status(200).json({
//     success: true,
//     message: "Attendance marked successfully!",
//     attendance: {
//       user: user.name,
//       event: event.title,
//       ticketId,
//       attendanceTime: ticket.attendanceTime,
//       attended: true, // Confirm in response
//     },
//   });
// });
// export const geoCheckIn = async (req, res) => {
//   try {
//     console.log("📍 Geo-checkin attempt:", {
//       eventId: req.body.eventId,
//       latitude: req.body.latitude,
//       longitude: req.body.longitude,
//       userId: req.user._id,
//     });

//     const { eventId, latitude, longitude } = req.body;
//     const userId = req.user._id;

//     if (!eventId || latitude === undefined || longitude === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "Event ID and location coordinates are required",
//       });
//     }

//     const event = await Event.findById(eventId);
//     if (!event) {
//       return res.status(404).json({
//         success: false,
//         message: "Event not found",
//       });
//     }

//     if (
//       !event.coordinates ||
//       event.coordinates.lat === undefined ||
//       event.coordinates.lng === undefined
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Event location is not properly set",
//       });
//     }

//     const calculateDistance = (lat1, lon1, lat2, lon2) => {
//       const R = 6371e3;
//       const φ1 = (lat1 * Math.PI) / 180;
//       const φ2 = (lat2 * Math.PI) / 180;
//       const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//       const Δλ = ((lon2 - lon1) * Math.PI) / 180;

//       const a =
//         Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//         Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//       const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//       return R * c;
//     };

//     const distance = calculateDistance(
//       latitude,
//       longitude,
//       event.coordinates.lat,
//       event.coordinates.lng
//     );

//     console.log(`📍 Distance calculated: ${Math.round(distance)}m`);

//     const ALLOWED_DISTANCE = 5200;
//     if (distance > ALLOWED_DISTANCE) {
//       console.log(
//         `❌ User too far: ${Math.round(distance)}m > ${ALLOWED_DISTANCE}m`
//       );
//       return res.status(400).json({
//         success: false,
//         message: `You are ${Math.round(
//           distance
//         )}m away from the event. Please get within ${ALLOWED_DISTANCE}m to check in.`,
//         distance: Math.round(distance),
//         allowedDistance: ALLOWED_DISTANCE,
//       });
//     }

//     console.log("✅ Distance check passed, proceeding with check-in...");

//     // Find the specific attendee by userId
//     const attendeeIndex = event.attendees.findIndex(
//       (attendee) => attendee.userId.toString() === userId.toString()
//     );

//     console.log(`📍 Found attendee at index: ${attendeeIndex}`);

//     if (attendeeIndex !== -1) {
//       // Update existing attendee - SET ATTENDED TO TRUE
//       event.attendees[attendeeIndex].attended = true;
//       event.attendees[attendeeIndex].checkInTime = new Date();
//       console.log("✅ Updated existing attendee - attended: true");
//     } else {
//       // Add new attendee with attended: true
//       event.attendees.push({
//         userId: userId,
//         attended: true, // SET TO TRUE
//         checkInTime: new Date(),
//       });
//       console.log("✅ Added new attendee - attended: true");
//     }

//     await event.save();
//     console.log("✅ Event saved successfully with attended: true");

//     res.json({
//       success: true,
//       message: "Check-in successful! 🎉",
//       distance: Math.round(distance),
//       checkInTime: new Date(),
//       attended: true, // Confirm in response
//     });
//   } catch (error) {
//     console.error("❌ Geo-checkin error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error during check-in",
//     });
//   }
// };
// export const cleanupAttendees = async (req, res) => {
//   try {
//     const events = await Event.find({});
//     let cleanedCount = 0;

//     for (let event of events) {
//       const originalLength = event.attendees.length;

//       event.attendees = event.attendees.filter(
//         (attendee) => attendee && attendee.userId && attendee.userId.toString
//       );

//       if (event.attendees.length !== originalLength) {
//         await event.save();
//         cleanedCount++;
//         console.log(
//           `✅ Cleaned event: ${event.title} - removed ${
//             originalLength - event.attendees.length
//           } invalid attendees`
//         );
//       }
//     }

//     res.json({
//       success: true,
//       message: `Cleaned ${cleanedCount} events with invalid attendees`,
//     });
//   } catch (error) {
//     console.error("Cleanup error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Cleanup failed",
//     });
//   }
// };

// export const detectNearbyEvents = catchAsyncError(async (req, res, next) => {
//   try {
//     const { latitude, longitude } = req.body;
//     const userId = req.user._id;

//     console.log("📍 Detecting nearby events for user:", userId);

//     if (latitude === undefined || longitude === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "Location coordinates are required",
//       });
//     }

//     const user = await User.findById(userId).populate("eventsToAttend.event");
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const userEvents = user.eventsToAttend.filter(
//       (ticket) =>
//         ticket.paymentStatus === "completed" &&
//         ticket.attendanceStatus === "not_attended" &&
//         ticket.event
//     );

//     console.log(`📋 User has ${userEvents.length} events to attend`);

//     const nearbyEvents = [];
//     const VENUE_RADIUS = 5000; // 100 meters - venue entrance
//     const NEARBY_RADIUS = 10000; // 500 meters - nearby area
//     const NOTIFICATION_INTERVAL = 60000; // 1 minute in milliseconds
//     const MAX_NOTIFICATIONS = 3; // Maximum 3 notifications before auto check-in

//     let userNeedsSave = false;

//     for (const ticket of userEvents) {
//       const event = ticket.event;

//       if (
//         !event.coordinates ||
//         !event.coordinates.lat ||
//         !event.coordinates.lng
//       ) {
//         continue;
//       }

//       const distance = calculateDistance(
//         latitude,
//         longitude,
//         event.coordinates.lat,
//         event.coordinates.lng
//       );

//       console.log(`📍 Event "${event.title}": ${Math.round(distance)}m away`);

//       const now = new Date();

//       // Initialize checkInNotifications if not exists (for backward compatibility)
//       if (!ticket.checkInNotifications) {
//         ticket.checkInNotifications = {
//           count: 0,
//           lastNotificationTime: null,
//           notificationHistory: [],
//           autoCheckedIn: false,
//           notificationsEnabled: true,
//         };
//         userNeedsSave = true;
//       }

//       // If already auto-checked in, skip processing
//       if (ticket.checkInNotifications.autoCheckedIn) {
//         console.log(
//           `✅ Already auto-checked in for "${event.title}", skipping`
//         );
//         continue;
//       }

//       const notificationCount = ticket.checkInNotifications.count || 0;
//       const lastNotificationTime =
//         ticket.checkInNotifications.lastNotificationTime;

//       // Calculate time since last notification
//       const timeSinceLastNotification = lastNotificationTime
//         ? now - new Date(lastNotificationTime)
//         : NOTIFICATION_INTERVAL + 1; // Force first notification

//       console.log(`📊 Notification state for "${event.title}":`, {
//         notificationCount,
//         timeSinceLastNotification:
//           Math.round(timeSinceLastNotification / 1000) + "s",
//         needsNextNotification:
//           timeSinceLastNotification >= NOTIFICATION_INTERVAL,
//         canSendMore: notificationCount < MAX_NOTIFICATIONS,
//         lastNotificationTime: lastNotificationTime,
//       });

//       // Check if user is within venue radius (100m)
//       if (distance <= VENUE_RADIUS) {
//         console.log(`📍 User is within venue radius for "${event.title}"`);

//         // Determine if we should send a notification
//         let shouldSendNotification = false;
//         let notificationNumber = 0;

//         if (notificationCount === 0) {
//           // First time in venue - send first notification immediately
//           shouldSendNotification = true;
//           notificationNumber = 1;
//           console.log(`🔄 First notification ready for "${event.title}"`);
//         } else if (
//           notificationCount < MAX_NOTIFICATIONS &&
//           timeSinceLastNotification >= NOTIFICATION_INTERVAL
//         ) {
//           // Subsequent notifications - only send after 1 minute interval
//           shouldSendNotification = true;
//           notificationNumber = notificationCount + 1;
//           console.log(
//             `🔄 Notification ${notificationNumber} ready for "${event.title}"`
//           );
//         }

//         nearbyEvents.push({
//           eventId: event._id,
//           eventTitle: event.title,
//           distance: Math.round(distance),
//           ticketId: ticket._id,
//           proximity: "venue",
//           needsCheckIn: true,
//           notificationCount,
//           maxNotifications: MAX_NOTIFICATIONS,
//           nextNotificationTime: lastNotificationTime
//             ? new Date(
//                 new Date(lastNotificationTime).getTime() + NOTIFICATION_INTERVAL
//               )
//             : null,
//           timeUntilNextNotification: lastNotificationTime
//             ? Math.max(0, NOTIFICATION_INTERVAL - timeSinceLastNotification)
//             : 0,
//           shouldSendNotification,
//           notificationNumber,
//           canSendMore: notificationCount < MAX_NOTIFICATIONS,
//         });

//         // Send venue notification if conditions are met
//         if (shouldSendNotification) {
//           console.log(
//             `📢 Sending notification ${notificationNumber}/${MAX_NOTIFICATIONS} for "${event.title}"`
//           );

//           await sendVenueCheckInNotification(
//             user,
//             event,
//             distance,
//             notificationNumber,
//             MAX_NOTIFICATIONS
//           );

//           // Update notification tracking - PERSISTED IN DATABASE
//           ticket.checkInNotifications.count = notificationNumber;
//           ticket.checkInNotifications.lastNotificationTime = now;
//           ticket.checkInNotifications.notificationHistory.push({
//             type: "venue_checkin_reminder",
//             time: now,
//             notificationNumber: notificationNumber,
//             distance: Math.round(distance),
//             sent: true,
//           });

//           userNeedsSave = true;

//           // If this is the third notification, perform automatic check-in
//           if (notificationNumber >= MAX_NOTIFICATIONS) {
//             console.log(
//               `🎯 Maximum notifications reached, performing automatic check-in for "${event.title}"`
//             );
//             await performAutomaticCheckIn(user, ticket, event);
//             userNeedsSave = true;
//           }
//         } else {
//           console.log(
//             `⏳ Waiting for next notification for "${
//               event.title
//             }": ${Math.round(
//               (NOTIFICATION_INTERVAL - timeSinceLastNotification) / 1000
//             )}s remaining`
//           );
//         }
//       }
//       // Check if user is within nearby radius (500m) but not at venue
//       else if (distance <= NEARBY_RADIUS) {
//         const canSendNotification =
//           !ticket.lastNearbyNotificationTime ||
//           now - new Date(ticket.lastNearbyNotificationTime) >=
//             NOTIFICATION_INTERVAL;

//         nearbyEvents.push({
//           eventId: event._id,
//           eventTitle: event.title,
//           distance: Math.round(distance),
//           ticketId: ticket._id,
//           proximity: "nearby",
//           needsCheckIn: false,
//           alreadyNotified: ticket.nearbyNotified || false,
//           canSendNotification,
//           nextNotificationTime: ticket.lastNearbyNotificationTime
//             ? new Date(
//                 new Date(ticket.lastNearbyNotificationTime).getTime() +
//                   NOTIFICATION_INTERVAL
//               )
//             : null,
//         });

//         // Send nearby notification if conditions are met
//         if (!ticket.nearbyNotified || canSendNotification) {
//           await sendNearbyEventNotification(user, event, distance);

//           ticket.nearbyNotified = true;
//           ticket.lastNearbyNotificationTime = now;
//           userNeedsSave = true;

//           console.log(`📢 Sent nearby notification for "${event.title}"`);
//         }
//       }
//     }

//     // Save user only if there are changes
//     if (userNeedsSave) {
//       try {
//         await user.save();
//         console.log("✅ User data saved with updated notification tracking");
//       } catch (saveError) {
//         console.error("❌ Error saving user data:", saveError);
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message:
//         nearbyEvents.length > 0
//           ? `Found ${nearbyEvents.length} event(s) nearby`
//           : "No events nearby",
//       nearbyEvents,
//       userLocation: { latitude, longitude },
//     });
//   } catch (error) {
//     console.error("❌ Detect nearby events error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error detecting nearby events",
//     });
//   }
// });

// export const completeGeoCheckIn = catchAsyncError(async (req, res, next) => {
//   try {
//     const { eventId, ticketId } = req.body;
//     const userId = req.user._id;

//     console.log("📍 Completing geo check-in:", { eventId, ticketId, userId });

//     if (!eventId || !ticketId) {
//       return res.status(400).json({
//         success: false,
//         message: "Event ID and Ticket ID are required",
//       });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const ticket = user.eventsToAttend.id(ticketId);
//     if (!ticket) {
//       return res.status(404).json({
//         success: false,
//         message: "Ticket not found",
//       });
//     }

//     if (ticket.event.toString() !== eventId) {
//       return res.status(400).json({
//         success: false,
//         message: "Ticket does not belong to this event",
//       });
//     }

//     if (ticket.attendanceStatus === "attended") {
//       return res.status(400).json({
//         success: false,
//         message: "Already checked in to this event",
//       });
//     }

//     // Perform manual check-in
//     await performManualCheckIn(user, ticket, eventId);

//     console.log(`✅ User ${userId} successfully checked into event ${eventId}`);

//     res.status(200).json({
//       success: true,
//       message: "Check-in successful! 🎉",
//       attendance: {
//         eventTitle: ticket.event.title,
//         checkInTime: ticket.attendanceTime,
//         ticketQuantity: ticket.ticketQuantity,
//         checkInType: "manual",
//       },
//     });
//   } catch (error) {
//     console.error("❌ Complete geo check-in error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error during check-in process",
//     });
//   }
// });

// // Perform automatic check-in
// // const performAutomaticCheckIn = async (user, ticket, event) => {
// //   try {
// //     if (ticket.attendanceStatus === "attended") {
// //       console.log("ℹ️ User already checked in, skipping auto check-in");
// //       return;
// //     }

// //     console.log(
// //       `🎯 Performing automatic check-in for user ${user._id} to event "${event.title}"`
// //     );

// //     // Update ticket status
// //     ticket.attendanceStatus = "attended";
// //     ticket.attendanceTime = new Date();
// //     ticket.checkInNotifications.autoCheckedIn = true;
// //     ticket.geoCheckInNotified = true;
// //     ticket.nearbyNotified = true;
// //     ticket.venueNotified = true;

// //     // Update event attendees
// //     const eventDoc = await Event.findById(event._id);
// //     if (eventDoc) {
// //       const existingAttendeeIndex = eventDoc.attendees.findIndex(
// //         (attendee) => attendee.userId.toString() === user._id.toString()
// //       );

// //       if (existingAttendeeIndex !== -1) {
// //         eventDoc.attendees[existingAttendeeIndex].attended = true;
// //         eventDoc.attendees[existingAttendeeIndex].checkInTime = new Date();
// //       } else {
// //         eventDoc.attendees.push({
// //           userId: user._id,
// //           attended: true,
// //           checkInTime: new Date(),
// //         });
// //       }

// //       // Add to attendance logs
// //       if (!eventDoc.attendanceLogs) eventDoc.attendanceLogs = [];
// //       eventDoc.attendanceLogs.push({
// //         user: user._id,
// //         ticketId: ticket._id.toString(),
// //         time: new Date(),
// //         checkInType: "automatic",
// //       });

// //       await eventDoc.save();
// //     }

// //     await user.save();

// //     // Send automatic check-in confirmation email
// //     await sendAutomaticCheckInConfirmationEmail(user, event);

// //     console.log(
// //       `✅ Automatic check-in completed for user ${user._id} to event "${event.title}"`
// //     );
// //   } catch (error) {
// //     console.error("❌ Error during automatic check-in:", error);
// //     throw error;
// //   }
// // };
// // Perform automatic check-in
// const performAutomaticCheckIn = async (user, ticket, event) => {
//   try {
//     if (ticket.attendanceStatus === "attended") {
//       console.log("ℹ️ User already checked in, skipping auto check-in");
//       return;
//     }

//     console.log(
//       `🎯 Performing automatic check-in for user ${user._id} to event "${event.title}"`
//     );

//     // Update ticket status
//     ticket.attendanceStatus = "attended";
//     ticket.attendanceTime = new Date();
//     ticket.checkInNotifications.autoCheckedIn = true;
//     ticket.geoCheckInNotified = true;
//     ticket.nearbyNotified = true;
//     ticket.venueNotified = true;

//     // Update event attendees - SET ATTENDED TO TRUE
//     const eventDoc = await Event.findById(event._id);
//     if (eventDoc) {
//       const attendeeIndex = eventDoc.attendees.findIndex(
//         (attendee) => attendee.userId.toString() === user._id.toString()
//       );

//       if (attendeeIndex !== -1) {
//         // Update existing attendee - SET ATTENDED TO TRUE
//         eventDoc.attendees[attendeeIndex].attended = true;
//         eventDoc.attendees[attendeeIndex].checkInTime = new Date();
//         console.log(
//           "✅ Auto check-in: Updated existing attendee - attended: true"
//         );
//       } else {
//         // Add new attendee with attended: true
//         eventDoc.attendees.push({
//           userId: user._id,
//           attended: true, // SET TO TRUE
//           checkInTime: new Date(),
//         });
//         console.log("✅ Auto check-in: Added new attendee - attended: true");
//       }

//       // Add to attendance logs
//       if (!eventDoc.attendanceLogs) eventDoc.attendanceLogs = [];
//       eventDoc.attendanceLogs.push({
//         user: user._id,
//         ticketId: ticket._id.toString(),
//         time: new Date(),
//         checkInType: "automatic",
//       });

//       await eventDoc.save();
//     }

//     await user.save();

//     // Send automatic check-in confirmation email
//     await sendAutomaticCheckInConfirmationEmail(user, event);

//     console.log(
//       `✅ Automatic check-in completed for user ${user._id} to event "${event.title}"`
//     );
//   } catch (error) {
//     console.error("❌ Error during automatic check-in:", error);
//     throw error;
//   }
// };
// // Perform manual check-in
// // const performManualCheckIn = async (user, ticket, eventId) => {
// //   try {
// //     const event = await Event.findById(eventId);
// //     if (!event) {
// //       throw new Error("Event not found");
// //     }

// //     // Update ticket status
// //     ticket.attendanceStatus = "attended";
// //     ticket.attendanceTime = new Date();
// //     ticket.geoCheckInNotified = true;
// //     ticket.nearbyNotified = true;
// //     ticket.venueNotified = true;

// //     // Update event attendees
// //     const existingAttendeeIndex = event.attendees.findIndex(
// //       (attendee) => attendee.userId.toString() === user._id.toString()
// //     );

// //     if (existingAttendeeIndex !== -1) {
// //       event.attendees[existingAttendeeIndex].attended = true;
// //       event.attendees[existingAttendeeIndex].checkInTime = new Date();
// //     } else {
// //       event.attendees.push({
// //         userId: user._id,
// //         attended: true,
// //         checkInTime: new Date(),
// //       });
// //     }

// //     // Add to attendance logs
// //     if (!event.attendanceLogs) event.attendanceLogs = [];
// //     event.attendanceLogs.push({
// //       user: user._id,
// //       ticketId: ticket._id.toString(),
// //       time: new Date(),
// //       checkInType: "manual",
// //     });

// //     await event.save();
// //     await user.save();

// //     // Send manual check-in confirmation email
// //     await sendCheckInConfirmationEmail(user, event);
// //   } catch (error) {
// //     console.error("❌ Error during manual check-in:", error);
// //     throw error;
// //   }
// // };
// // Perform manual check-in
// const performManualCheckIn = async (user, ticket, eventId) => {
//   try {
//     const event = await Event.findById(eventId);
//     if (!event) {
//       throw new Error("Event not found");
//     }

//     // Update ticket status
//     ticket.attendanceStatus = "attended";
//     ticket.attendanceTime = new Date();
//     ticket.geoCheckInNotified = true;
//     ticket.nearbyNotified = true;
//     ticket.venueNotified = true;

//     // Find the specific attendee by userId and update attended status
//     const attendeeIndex = event.attendees.findIndex(
//       (attendee) => attendee.userId.toString() === user._id.toString()
//     );

//     if (attendeeIndex !== -1) {
//       // Update existing attendee - SET ATTENDED TO TRUE
//       event.attendees[attendeeIndex].attended = true;
//       event.attendees[attendeeIndex].checkInTime = new Date();
//       console.log(
//         "✅ Manual check-in: Updated existing attendee - attended: true"
//       );
//     } else {
//       // Add new attendee with attended: true
//       event.attendees.push({
//         userId: user._id,
//         attended: true, // SET TO TRUE
//         checkInTime: new Date(),
//       });
//       console.log("✅ Manual check-in: Added new attendee - attended: true");
//     }

//     // Add to attendance logs
//     if (!event.attendanceLogs) event.attendanceLogs = [];
//     event.attendanceLogs.push({
//       user: user._id,
//       ticketId: ticket._id.toString(),
//       time: new Date(),
//       checkInType: "manual",
//     });

//     await event.save();
//     await user.save();

//     // Send manual check-in confirmation email
//     await sendCheckInConfirmationEmail(user, event);
//   } catch (error) {
//     console.error("❌ Error during manual check-in:", error);
//     throw error;
//   }
// };

// export const getEventOrganizerStats = catchAsyncError(
//   async (req, res, next) => {
//     try {
//       const { eventId } = req.params;
//       const userId = req.user._id;

//       console.log(
//         `📊 Fetching organizer stats for event: ${eventId}, user: ${userId}`
//       );

//       // Find the event and verify ownership
//       const event = await Event.findById(eventId);
//       console.log(event);
//       if (!event) {
//         return next(new ErrorHandler("Event not found", 404));
//       }

//       // Check if the current user is the organizer
//       if (event.createdBy.toString() !== userId.toString()) {
//         return next(
//           new ErrorHandler(
//             "Unauthorized: You are not the organizer of this event",
//             403
//           )
//         );
//       }

//       // Get all users who have tickets for this event
//       const usersWithTickets = await User.find({
//         "eventsToAttend.event": eventId,
//       }).select("name email eventsToAttend");

//       // Calculate statistics
//       let totalRevenue = 0;
//       let paidTickets = 0;
//       let pendingTickets = 0;
//       let checkedInUsers = 0;
//       let attendedUsers = 0;
//       const eventAttendees = [];

//       usersWithTickets.forEach((user) => {
//         user.eventsToAttend.forEach((ticket) => {
//           if (ticket.event.toString() === eventId) {
//             const attendeeInfo = {
//               userId: user._id,
//               userName: user.name,
//               userEmail: user.email,
//               ticketQuantity: ticket.ticketQuantity || 1,
//               paymentStatus: ticket.paymentStatus,
//               attendanceStatus: ticket.attendanceStatus,
//               purchaseDate: ticket.purchaseDate,
//               attendanceTime: ticket.attendanceTime,
//               ticketIds: ticket.ticketIds || [],
//               seatType: ticket.seatType,
//               seatNumber: ticket.seatNumber,
//               finalPrice: ticket.finalPrice,
//             };

//             eventAttendees.push(attendeeInfo);

//             // Count stats based on payment status
//             if (ticket.paymentStatus === "completed") {
//               paidTickets += ticket.ticketQuantity || 1;
//               totalRevenue +=
//                 ticket.finalPrice ||
//                 (ticket.ticketQuantity || 1) *
//                   (getSeatPrice(event, ticket.seatType) || 0);
//             } else if (ticket.paymentStatus === "pending") {
//               pendingTickets += ticket.ticketQuantity || 1;
//             }

//             // Count attendance stats
//             if (ticket.attendanceStatus === "checked-in") {
//               checkedInUsers += ticket.ticketQuantity || 1;
//             } else if (ticket.attendanceStatus === "attended") {
//               attendedUsers += ticket.ticketQuantity || 1;
//               checkedInUsers += ticket.ticketQuantity || 1;
//             }
//           }
//         });
//       });

//       // Also process attendees from event.attendees array (for checked-in users)
//       if (event.attendees && event.attendees.length > 0) {
//         const uniqueAttendees = new Map();

//         // Remove duplicates from event.attendees array
//         event.attendees.forEach((attendee) => {
//           const key = `${attendee.userId}-${attendee.seatNumber}`;
//           if (!uniqueAttendees.has(key)) {
//             uniqueAttendees.set(key, attendee);
//           }
//         });

//         // Process unique attendees
//         uniqueAttendees.forEach((attendee) => {
//           if (attendee.attended) {
//             checkedInUsers += 1;
//             attendedUsers += 1;

//             // Add to eventAttendees if not already present
//             const existingAttendee = eventAttendees.find(
//               (a) =>
//                 a.userId.toString() === attendee.userId.toString() &&
//                 a.seatNumber === attendee.seatNumber
//             );

//             if (!existingAttendee) {
//               eventAttendees.push({
//                 userId: attendee.userId,
//                 userName: "Unknown", // You might want to fetch this from User model
//                 userEmail: "Unknown",
//                 ticketQuantity: 1,
//                 paymentStatus: "completed", // Assuming checked-in means paid
//                 attendanceStatus: "attended",
//                 purchaseDate: attendee.purchaseDate,
//                 attendanceTime: attendee.checkInTime,
//                 ticketIds: [attendee.ticketId],
//                 seatType: attendee.seatType,
//                 seatNumber: attendee.seatNumber,
//                 finalPrice: attendee.finalPrice,
//               });
//             }
//           }
//         });
//       }

//       const stats = {
//         paidTickets,
//         pendingTickets,
//         checkedInUsers,
//         attendedUsers,
//         totalTickets: paidTickets + pendingTickets,
//         revenue: totalRevenue,
//         totalAttendees: eventAttendees.length,
//         seatStats: {
//           front: {
//             total: event.seatConfig.front.count,
//             booked: event.seatConfig.front.booked,
//             available: event.seatConfig.front.available,
//             revenue:
//               event.seatConfig.front.booked * event.seatConfig.front.price,
//           },
//           middle: {
//             total: event.seatConfig.middle.count,
//             booked: event.seatConfig.middle.booked,
//             available: event.seatConfig.middle.available,
//             revenue:
//               event.seatConfig.middle.booked * event.seatConfig.middle.price,
//           },
//           last: {
//             total: event.seatConfig.last.count,
//             booked: event.seatConfig.last.booked,
//             available: event.seatConfig.last.available,
//             revenue: event.seatConfig.last.booked * event.seatConfig.last.price,
//           },
//         },
//       };

//       res.status(200).json({
//         success: true,
//         message: "Event statistics fetched successfully",
//         stats,
//         attendees: eventAttendees,
//         eventDetails: {
//           title: event.title,
//           date: event.date,
//           startTime: event.startTime,
//           endTime: event.endTime,
//           location: event.location,
//           basePrice: event.basePrice,
//           seatConfig: event.seatConfig,
//           category: event.category,
//           totalSeats: event.totalSeats,
//           availableSeats: event.availableSeats,
//           bookedSeats: event.bookedSeats,
//         },
//       });
//     } catch (error) {
//       console.error("❌ Error fetching event organizer stats:", error);
//       res.status(500).json({
//         success: false,
//         message: "Error fetching event statistics",
//       });
//     }
//   }
// );

// // Add this function to send event summary
// export const sendEventSummary = catchAsyncError(async (req, res, next) => {
//   const { eventId } = req.params;
//   const userId = req.user._id;

//   const event = await Event.findById(eventId);
//   if (!event) {
//     return next(new ErrorHandler("Event not found", 404));
//   }

//   // Check if user is the organizer
//   if (event.createdBy.toString() !== userId.toString()) {
//     return next(
//       new ErrorHandler(
//         "Unauthorized: You are not the organizer of this event",
//         403
//       )
//     );
//   }

//   // Check if event is completed
//   if (!event.isCompleted()) {
//     return next(
//       new ErrorHandler(
//         "Event summary is only available after the event has ended",
//         400
//       )
//     );
//   }

//   const success = await sendEventSummaryEmail(eventId);

//   if (success) {
//     res.status(200).json({
//       success: true,
//       message: "Event summary sent successfully to your email",
//     });
//   } else {
//     return next(new ErrorHandler("Failed to send event summary", 500));
//   }
// });

// // Add this function to rate organizer
// export const rateOrganizer = catchAsyncError(async (req, res, next) => {
//   const { eventId } = req.params;
//   const { rating, comment } = req.body;
//   const userId = req.user._id;

//   if (!rating || rating < 1 || rating > 5) {
//     return next(new ErrorHandler("Rating must be between 1 and 5", 400));
//   }

//   const event = await Event.findById(eventId);
//   if (!event) {
//     return next(new ErrorHandler("Event not found", 404));
//   }

//   // Check if user attended the event
//   const userTicket = await User.findOne({
//     _id: userId,
//     "eventsToAttend.event": eventId,
//     "eventsToAttend.attendanceStatus": "attended",
//   });

//   if (!userTicket) {
//     return next(
//       new ErrorHandler(
//         "You can only rate organizers for events you attended",
//         400
//       )
//     );
//   }

//   // Check if user already rated this organizer for this event
//   const existingRating = event.organizerRatings.find(
//     (rating) => rating.userId.toString() === userId.toString()
//   );

//   if (existingRating) {
//     return next(
//       new ErrorHandler(
//         "You have already rated this organizer for this event",
//         400
//       )
//     );
//   }

//   // Add rating
//   event.organizerRatings.push({
//     userId,
//     rating,
//     comment,
//   });

//   await event.save();

//   // Update organizer stats
//   const organizer = await User.findById(event.createdBy);
//   if (organizer) {
//     await organizer.updateOrganizerStats();
//   }

//   // Update user's ticket to mark as rated
//   await User.updateOne(
//     {
//       _id: userId,
//       "eventsToAttend.event": eventId,
//     },
//     {
//       $set: {
//         "eventsToAttend.$.organizerRated": true,
//         "eventsToAttend.$.organizerRating": rating,
//         "eventsToAttend.$.organizerComment": comment,
//       },
//     }
//   );

//   res.status(200).json({
//     success: true,
//     message: "Organizer rated successfully",
//     rating: {
//       rating,
//       comment,
//       event: event.title,
//       organizer: organizer.name,
//     },
//   });
// });

// // Add this function to get organizer ratings
// export const getOrganizerRatings = catchAsyncError(async (req, res, next) => {
//   const { eventId } = req.params;

//   const event = await Event.findById(eventId)
//     .populate("organizerRatings.userId", "name")
//     .select("organizerRatings title");

//   if (!event) {
//     return next(new ErrorHandler("Event not found", 404));
//   }

//   const ratings = event.organizerRatings.map((rating) => ({
//     _id: rating._id,
//     user: {
//       _id: rating.userId._id,
//       name: rating.userId.name,
//     },
//     rating: rating.rating,
//     comment: rating.comment,
//     createdAt: rating.createdAt,
//   }));

//   const averageRating = event.averageOrganizerRating;
//   const totalRatings = event.organizerRatings.length;

//   res.status(200).json({
//     success: true,
//     message: "Organizer ratings fetched successfully",
//     ratings,
//     summary: {
//       averageRating,
//       totalRatings,
//       eventTitle: event.title,
//     },
//   });
// });

// // Add this function to get organizer profile with stats
// export const getOrganizerProfile = catchAsyncError(async (req, res, next) => {
//   const { organizerId } = req.params;

//   const organizer = await User.findById(organizerId).select(
//     "name email organizerStats"
//   );
//   if (!organizer) {
//     return next(new ErrorHandler("Organizer not found", 404));
//   }

//   // Get organizer's events
//   const organizedEvents = await Event.find({
//     createdBy: organizerId,
//     status: "approved",
//   }).select("title date attendees organizerRatings");

//   res.status(200).json({
//     success: true,
//     message: "Organizer profile fetched successfully",
//     organizer: {
//       _id: organizer._id,
//       name: organizer.name,
//       email: organizer.email,
//       stats: organizer.organizerStats,
//       totalEvents: organizedEvents.length,
//       recentEvents: organizedEvents
//         .sort((a, b) => new Date(b.date) - new Date(a.date))
//         .slice(0, 5)
//         .map((event) => ({
//           _id: event._id,
//           title: event.title,
//           date: event.date,
//           attendees: event.attendees.length,
//           averageRating: event.averageOrganizerRating,
//         })),
//     },
//   });
// });

// // Helper function to get seat price
// function getSeatPrice(event, seatType) {
//   if (!event.seatConfig || !seatType) return event.basePrice || 0;

//   return event.seatConfig[seatType]?.price || event.basePrice || 0;
// }

// const sendVenueCheckInNotification = async (
//   user,
//   event,
//   distance,
//   notificationNumber,
//   maxNotifications
// ) => {
//   try {
//     const subject = `📍 Check-In Reminder ${notificationNumber}/${maxNotifications} for "${event.title}"`;
//     const message = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: ${
//           notificationNumber === maxNotifications ? "#ef4444" : "#3b82f6"
//         };">Check-In Reminder ${notificationNumber}/${maxNotifications}</h2>
//         <p>Hello ${user.name},</p>
//         <p>You're within <strong>${Math.round(
//           distance
//         )} meters</strong> of <strong>"${event.title}"</strong>.</p>

//         ${
//           notificationNumber === maxNotifications
//             ? `<div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
//             <h4 style="margin: 0 0 10px 0; color: #dc2626;">Final Reminder - Automatic Check-In!</h4>
//             <p>This is your final reminder. Since you're at the venue but haven't checked in manually,
//             we'll automatically check you in to the event now.</p>
//           </div>`
//             : `<p>This is reminder <strong>${notificationNumber} of ${maxNotifications}</strong>. Please check in through the app.</p>
//           <p><em>Next reminder in 1 minute if you don't check in manually.</em></p>`
//         }

//         <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
//           <h3 style="margin: 0 0 10px 0; color: #1e40af;">Event Details:</h3>
//           <p><strong>Event:</strong> ${event.title}</p>
//           <p><strong>When:</strong> ${new Date(
//             event.date
//           ).toLocaleDateString()} | ${event.startTime} - ${event.endTime}</p>
//           <p><strong>Where:</strong> ${event.location}</p>
//           <p><strong>Your Distance:</strong> ${Math.round(
//             distance
//           )} meters away</p>
//         </div>

//         ${
//           notificationNumber < maxNotifications
//             ? `<div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
//             <h4 style="margin: 0 0 10px 0; color: #047857;">How to Check In:</h4>
//             <p>1. Open the Hamro Event app</p>
//             <p>2. Go to "My Events" or "Check-In" section</p>
//             <p>3. Tap "Check In Now" for this event</p>
//             <p>4. Show your QR code if required</p>
//           </div>`
//             : `<div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
//             <h4 style="margin: 0 0 10px 0; color: #92400e;">Automatic Check-In Completed</h4>
//             <p>You have been automatically checked in to the event. Enjoy!</p>
//           </div>`
//         }

//         <p>Best regards,<br>Hamro Event Team</p>
//       </div>
//     `;

//     await sendEmail({
//       email: user.email,
//       subject,
//       message,
//     });

//     console.log(
//       `📧 Venue check-in notification ${notificationNumber} sent to ${user.email}`
//     );
//   } catch (error) {
//     console.error("Error sending venue check-in notification:", error);
//   }
// };

// // Email confirmation for automatic check-in
// const sendAutomaticCheckInConfirmationEmail = async (user, event) => {
//   try {
//     const subject = `✅ Automatically Checked In to "${event.title}"`;
//     const message = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #10b981;">Automatic Check-In Completed! 🎉</h2>
//         <p>Hello ${user.name},</p>
//         <p>We noticed you were at the venue but didn't check in manually, so we've automatically checked you in to <strong>"${
//           event.title
//         }"</strong>.</p>

//         <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
//           <h3 style="margin: 0 0 10px 0;">Event Details:</h3>
//           <p><strong>Event:</strong> ${event.title}</p>
//           <p><strong>Date & Time:</strong> ${new Date(
//             event.date
//           ).toLocaleDateString()} | ${event.startTime}</p>
//           <p><strong>Location:</strong> ${event.location}</p>
//           <p><strong>Check-in Time:</strong> ${new Date().toLocaleString()}</p>
//           <p><strong>Check-in Type:</strong> Automatic (after 3 reminders)</p>
//         </div>

//         <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
//           <h4 style="margin: 0 0 10px 0; color: #92400e;">Note:</h4>
//           <p>You received 3 check-in reminders before we automatically checked you in. You can always check in manually in the future to avoid automatic check-ins.</p>
//         </div>

//         <p>We hope you have a great time at the event!</p>
//         <p>Best regards,<br>Hamro Event Team</p>
//       </div>
//     `;

//     await sendEmail({
//       email: user.email,
//       subject,
//       message,
//     });

//     console.log(`📧 Automatic check-in confirmation sent to ${user.email}`);
//   } catch (error) {
//     console.error("Error sending automatic check-in confirmation:", error);
//   }
// };

// // Helper function to calculate distance
// const calculateDistance = (lat1, lon1, lat2, lon2) => {
//   const R = 6371e3;
//   const φ1 = (lat1 * Math.PI) / 180;
//   const φ2 = (lat2 * Math.PI) / 180;
//   const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//   const Δλ = ((lon2 - lon1) * Math.PI) / 180;

//   const a =
//     Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//     Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

// // Email notification for when user is nearby (500m)
// const sendNearbyEventNotification = async (user, event, distance) => {
//   try {
//     const subject = `📍 You're Near "${event.title}"`;
//     const message = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #3b82f6;">You're Getting Close to the Event!</h2>
//         <p>Hello ${user.name},</p>
//         <p>Great news! You're within <strong>${Math.round(
//           distance
//         )} meters</strong> of <strong>"${event.title}"</strong>.</p>
//         <p>You're in the vicinity of the event venue. As you get closer (within 100 meters), you'll be able to check in.</p>

//         <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
//           <h3 style="margin: 0 0 10px 0; color: #1e40af;">Event Details:</h3>
//           <p><strong>Event:</strong> ${event.title}</p>
//           <p><strong>When:</strong> ${new Date(
//             event.date
//           ).toLocaleDateString()} | ${event.startTime} - ${event.endTime}</p>
//           <p><strong>Where:</strong> ${event.location}</p>
//           <p><strong>Your Distance:</strong> ${Math.round(
//             distance
//           )} meters away</p>
//         </div>

//         <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
//           <h4 style="margin: 0 0 10px 0; color: #92400e;">Next Steps:</h4>
//           <p>• Continue towards the venue</p>
//           <p>• Check in when you're within 100 meters</p>
//           <p>• Have your ticket ready</p>
//         </div>

//         <p>We look forward to seeing you at the event!</p>
//         <p>Best regards,<br>Hamro Event Team</p>
//       </div>
//     `;

//     await sendEmail({
//       email: user.email,
//       subject,
//       message,
//     });

//     console.log(`📧 Nearby event notification sent to ${user.email}`);
//   } catch (error) {
//     console.error("Error sending nearby event notification:", error);
//   }
// };

// // Email notification for when user enters venue (100m)
// const sendVenueEntryNotification = async (user, event, distance) => {
//   try {
//     const subject = `🎉 You've Arrived at "${event.title}" - Ready to Check In!`;
//     const message = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #10b981;">Welcome to the Event Venue! 🎉</h2>
//         <p>Hello ${user.name},</p>
//         <p>Perfect! You're now within <strong>${Math.round(
//           distance
//         )} meters</strong> of <strong>"${
//       event.title
//     }"</strong> and have entered the event venue.</p>
//         <p>You can now check in to the event through the app.</p>

//         <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
//           <h3 style="margin: 0 0 10px 0; color: #047857;">Event Details:</h3>
//           <p><strong>Event:</strong> ${event.title}</p>
//           <p><strong>When:</strong> ${new Date(
//             event.date
//           ).toLocaleDateString()} | ${event.startTime} - ${event.endTime}</p>
//           <p><strong>Where:</strong> ${event.location}</p>
//           <p><strong>Your Location:</strong> At the venue (${Math.round(
//             distance
//           )}m from center)</p>
//         </div>

//         <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
//           <h4 style="margin: 0 0 10px 0; color: #1e40af;">Check-In Instructions:</h4>
//           <p>1. Open the Hamro Event app</p>
//           <p>2. Go to the "Check-In" section</p>
//           <p>3. Tap "Check In Now" for "${event.title}"</p>
//           <p>4. Show your QR code if required</p>
//         </div>

//         <p style="text-align: center;">
//           <strong>Enjoy the event! 🎊</strong>
//         </p>

//         <p>Best regards,<br>Hamro Event Team</p>
//       </div>
//     `;

//     await sendEmail({
//       email: user.email,
//       subject,
//       message,
//     });

//     console.log(`📧 Venue entry notification sent to ${user.email}`);
//   } catch (error) {
//     console.error("Error sending venue entry notification:", error);
//   }
// };

// // Email confirmation after manual check-in
// const sendCheckInConfirmationEmail = async (user, event) => {
//   try {
//     const subject = `✅ Successfully Checked In to "${event.title}"`;
//     const message = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #10b981;">Check-In Confirmed! 🎉</h2>
//         <p>Hello ${user.name},</p>
//         <p>You have successfully checked in to <strong>"${
//           event.title
//         }"</strong>.</p>
//         <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
//           <h3 style="margin: 0 0 10px 0;">Event Details:</h3>
//           <p><strong>Event:</strong> ${event.title}</p>
//           <p><strong>Date & Time:</strong> ${new Date(
//             event.date
//           ).toLocaleDateString()} | ${event.startTime}</p>
//           <p><strong>Location:</strong> ${event.location}</p>
//           <p><strong>Check-in Time:</strong> ${new Date().toLocaleString()}</p>
//           <p><strong>Check-in Type:</strong> Manual</p>
//         </div>
//         <p>We hope you have a great time at the event!</p>
//         <p>Best regards,<br>Hamro Event Team</p>
//       </div>
//     `;

//     await sendEmail({
//       email: user.email,
//       subject,
//       message,
//     });

//     console.log(`📧 Check-in confirmation sent to ${user.email}`);
//   } catch (error) {
//     console.error("Error sending check-in confirmation:", error);
//   }
// };

// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY
// PROXY

import catchAsyncError from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Event } from "../models/eventModel.js";
import { User } from "../models/userModel.js";
import mongoose from "mongoose";
import Sentiment from "sentiment";
import { analyzeText } from "../utils/sentimentConfig.js";
const sentiment = new Sentiment();
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { sendEmail, sendEventStatusEmail } from "../utils/emailService.js";

export const addEvent = catchAsyncError(async (req, res, next) => {
  // Parse JSON fields from FormData
  const {
    title,
    description,
    date,
    startTime,
    endTime,
    location,
    category,
    basePrice,
    coordinates: coordinatesStr, // This will be a string from FormData
    seatConfig: seatConfigStr, // This will be a string from FormData
  } = req.body;

  console.log("📥 Received coordinates string:", coordinatesStr);
  console.log("🎫 Received seat config string:", seatConfigStr);

  // Parse coordinates
  let parsedCoordinates = null;
  if (coordinatesStr) {
    try {
      parsedCoordinates = JSON.parse(coordinatesStr);
      console.log("✅ Parsed coordinates:", parsedCoordinates);
    } catch (error) {
      console.error("❌ Failed to parse coordinates:", error.message);
      return next(new ErrorHandler("Invalid coordinates format", 400));
    }
  }

  // Parse seat configuration
  let parsedSeatConfig;
  try {
    parsedSeatConfig = JSON.parse(seatConfigStr);
    console.log("✅ Parsed seat config:", parsedSeatConfig);
  } catch (error) {
    console.error("❌ Failed to parse seat configuration:", error.message);
    return next(new ErrorHandler("Invalid seat configuration format", 400));
  }

  // Now use the parsed data for validation
  if (
    !title ||
    !description ||
    !date ||
    !startTime ||
    !endTime ||
    !location ||
    !category ||
    basePrice === undefined ||
    !parsedSeatConfig
  ) {
    console.log("❌ Missing required fields:", {
      title: !!title,
      description: !!description,
      date: !!date,
      startTime: !!startTime,
      endTime: !!endTime,
      location: !!location,
      category: !!category,
      basePrice: basePrice !== undefined,
      seatConfig: !!parsedSeatConfig,
    });
    return next(new ErrorHandler("Please enter all the required fields", 400));
  }

  if (!req.file) {
    return next(new ErrorHandler("Banner image is required", 400));
  }

  if (!req.user?._id) {
    return next(new ErrorHandler("Unauthorized: User info missing", 401));
  }

  // Get user to determine max attendees based on subscription
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Check if user can create event
  const canCreateCheck = user.canCreateEvent(basePrice > 0);
  if (!canCreateCheck.canCreate) {
    return next(
      new ErrorHandler(
        "Cannot create event. Check your subscription limits.",
        400
      )
    );
  }

  // Validate seat configuration structure
  if (
    !parsedSeatConfig.front ||
    !parsedSeatConfig.middle ||
    !parsedSeatConfig.last
  ) {
    return next(new ErrorHandler("Invalid seat configuration", 400));
  }

  // Ensure all required fields are present for each seat type
  const seatTypes = ["front", "middle", "last"];
  for (const seatType of seatTypes) {
    if (
      parsedSeatConfig[seatType].count === undefined ||
      parsedSeatConfig[seatType].price === undefined
    ) {
      return next(
        new ErrorHandler(`Missing count or price for ${seatType} seats`, 400)
      );
    }
  }

  // Calculate total seats from configuration
  const totalSeats =
    parsedSeatConfig.front.count +
    parsedSeatConfig.middle.count +
    parsedSeatConfig.last.count;

  // Get max attendees based on user's subscription plan
  const maxAttendees = user.getMaxAttendees();
  console.log(
    `🎫 User subscription allows: ${maxAttendees} attendees, Event requires: ${totalSeats} seats`
  );

  // Check if total seats exceed subscription limit
  if (totalSeats > maxAttendees) {
    return next(
      new ErrorHandler(
        `Your ${user.subscription} plan allows maximum ${maxAttendees} attendees, but you're trying to create ${totalSeats} seats. Please upgrade your plan.`,
        400
      )
    );
  }

  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const existingEvent = await Event.findOne({
    title: { $regex: new RegExp(`^${escapedTitle}$`, "i") },
    status: { $ne: "rejected" },
  });

  if (existingEvent) {
    return next(
      new ErrorHandler(
        `An event titled "${title}" already exists. Please choose a different name.`,
        400
      )
    );
  }

  // Initialize available and booked counts for each seat type
  const finalSeatConfig = {
    front: {
      count: Number(parsedSeatConfig.front.count),
      price: Number(parsedSeatConfig.front.price),
      available: Number(parsedSeatConfig.front.count),
      booked: 0,
    },
    middle: {
      count: Number(parsedSeatConfig.middle.count),
      price: Number(parsedSeatConfig.middle.price),
      available: Number(parsedSeatConfig.middle.count),
      booked: 0,
    },
    last: {
      count: Number(parsedSeatConfig.last.count),
      price: Number(parsedSeatConfig.last.price),
      available: Number(parsedSeatConfig.last.count),
      booked: 0,
    },
  };

  const event = await Event.create({
    title,
    description,
    date: new Date(date),
    startTime,
    endTime,
    location,
    coordinates: parsedCoordinates,
    category,
    basePrice: Number(basePrice),
    seatConfig: finalSeatConfig,
    createdBy: req.user._id,
    status: "pending",
    banner: req.file.filename,
    totalSeats: totalSeats,
    availableSeats: totalSeats,
    bookedSeats: 0,
  });

  user.eventToOrganize.push(event._id);
  await user.save();

  console.log("✅ Event created successfully:", {
    title: event.title,
    totalSeats: event.totalSeats,
    seatConfig: {
      front: `${event.seatConfig.front.count} seats (₹${
        event.basePrice + event.seatConfig.front.price
      })`,
      middle: `${event.seatConfig.middle.count} seats (₹${
        event.basePrice + event.seatConfig.middle.price
      })`,
      last: `${event.seatConfig.last.count} seats (₹${
        event.basePrice + event.seatConfig.last.price
      })`,
    },
    plan: user.subscription,
  });

  res.status(201).json({
    success: true,
    message: "Event created successfully",
    event,
    planLimits: {
      maxAttendees: maxAttendees,
      userPlan: user.subscription,
      seatsCreated: totalSeats,
    },
    seatPricing: {
      front: event.basePrice + event.seatConfig.front.price,
      middle: event.basePrice + event.seatConfig.middle.price,
      last: event.basePrice + event.seatConfig.last.price,
    },
  });
});

export const removeEvent = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const event = await Event.findById(id);
  if (!event) {
    return next(new ErrorHandler("Event Not Found", 404));
  }

  await event.deleteOne();

  await User.updateMany(
    {},
    {
      $pull: {
        eventToOrganize: { _id: id },
        myEventWatchlist: { _id: id },
        eventsToAttend: { _id: id },
      },
    }
  );

  res.status(200).json({
    success: true,
    message: "Event deleted successfully",
  });
});

export const getAllEvents = catchAsyncError(async (req, res, next) => {
  const events = await Event.find().populate("createdBy", "name email");
  res.status(200).json({
    success: true,
    message: "All events fetched successfully",
    events,
  });
});

export const updateEvent = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    description,
    date,
    startTime,
    endTime,
    location,
    category,
    price,
    isActive,
  } = req.body;

  console.log(startTime, endTime);
  const event = await Event.findById(id);
  if (!event) {
    return next(new ErrorHandler("Event Not Found", 404));
  }

  event.title = title ?? event.title;
  event.description = description ?? event.description;
  event.date = date ?? event.date;
  event.startTime = startTime ?? event.startTime;
  event.endTime = endTime ?? event.endTime;
  event.location = location ?? event.location;
  event.category = category ?? event.category;
  event.price = price ?? event.price;
  event.isActive = isActive ?? event.isActive;

  await event.save();

  res.status(200).json({
    success: true,
    message: "Event updated successfully",
    event,
  });
});

export const addToWatchlist = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new ErrorHandler("Event not found", 404));
  }

  const user = await User.findById(userId).populate("myEventWatchlist");

  if (user.myEventWatchlist.some((e) => e._id.toString() === eventId)) {
    return next(new ErrorHandler("Event already in watchlist", 400));
  }

  user.myEventWatchlist.push(event);
  await user.save();

  await user.populate("myEventWatchlist");

  res.status(200).json({
    success: true,
    message: "Event added to watchlist",
    event: event,
    watchlist: user.myEventWatchlist,
  });
});

export const removeFromWatchlist = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { eventId } = req.params;

  const user = await User.findById(userId).populate("myEventWatchlist");
  if (!user) return next(new ErrorHandler("User not found", 404));

  user.myEventWatchlist = user.myEventWatchlist.filter(
    (e) => e._id.toString() !== eventId
  );

  await user.save();

  await user.populate("myEventWatchlist");

  res.status(200).json({
    success: true,
    message: "Event removed from watchlist",
    eventId: eventId,
    watchlist: user.myEventWatchlist,
  });
});

// Add this function to calculate seat price
const calculateSeatPrice = (basePrice, seatType, seatConfig) => {
  const seatPremium = seatConfig?.[seatType]?.price || 0;
  return basePrice + seatPremium;
};
// Update the addToEventsToAttend function
export const addToEventsToAttend = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { eventId, quantity = 1, transactionId, selectedSeats } = req.body;
  console.log("🎫 Booking seats:", { eventId, quantity, selectedSeats });

  if (!eventId) {
    return next(new ErrorHandler("Event ID is required", 400));
  }

  if (quantity < 1) {
    return next(new ErrorHandler("Quantity must be at least 1", 400));
  }

  if (
    !selectedSeats ||
    !Array.isArray(selectedSeats) ||
    selectedSeats.length === 0
  ) {
    return next(new ErrorHandler("Please select seats", 400));
  }

  if (selectedSeats.length !== quantity) {
    return next(new ErrorHandler("Number of seats must match quantity", 400));
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new ErrorHandler("Event not found", 404));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const existingTicket = user.getTicketForEvent(eventId);
  if (existingTicket) {
    return next(
      new ErrorHandler(
        "You already have a ticket for this event. Use update ticket quantity instead.",
        400
      )
    );
  }

  // Check if seats are available using the new seatConfig system
  const takenSeats = event.attendees.map((attendee) => attendee.seatNumber);
  const unavailableSeats = selectedSeats.filter((seat) =>
    takenSeats.includes(seat.seatNumber)
  );

  if (unavailableSeats.length > 0) {
    return next(
      new ErrorHandler(
        `Some seats are no longer available: ${unavailableSeats
          .map((s) => s.seatNumber)
          .join(", ")}`,
        400
      )
    );
  }

  // Check seat availability in seatConfig
  const seatTypeCounts = {};
  selectedSeats.forEach((seat) => {
    seatTypeCounts[seat.seatType] = (seatTypeCounts[seat.seatType] || 0) + 1;
  });

  for (const [seatType, count] of Object.entries(seatTypeCounts)) {
    const availableSeats = event.seatConfig[seatType]?.available || 0;
    if (availableSeats < count) {
      return next(
        new ErrorHandler(
          `Not enough ${seatType} seats available. Only ${availableSeats} left, but you requested ${count}.`,
          400
        )
      );
    }
  }

  const uniqueId = uuidv4();
  const ticketIds = [];
  const seatDetails = [];
  let totalAmount = 0;

  // Calculate prices and prepare seat details
  for (let i = 0; i < quantity; i++) {
    const seat = selectedSeats[i];
    const finalPrice = calculateSeatPrice(
      event.basePrice,
      seat.seatType,
      event.seatConfig
    );

    ticketIds.push(`${uniqueId}-${i + 1}`);
    seatDetails.push({
      seatType: seat.seatType,
      seatNumber: seat.seatNumber,
      seatPrice: finalPrice,
      finalPrice: finalPrice,
    });
    totalAmount += finalPrice;
  }
  console.log("Seat Detail", seatDetails);
  console.log("Total Amount", totalAmount);
  const newTicket = {
    event: event._id,
    ticketQuantity: quantity,
    paymentStatus: "completed",
    transactionId: transactionId || undefined,
    ticketIds: ticketIds,
    seatDetails: seatDetails,
    totalAmount: totalAmount,
    purchaseDate: new Date(),
    lastUpdated: new Date(),
    attendanceStatus: "not_attended",
    attendanceTime: null,
    checkInNotifications: {
      count: 0,
      lastNotificationTime: null,
      notificationHistory: [],
      autoCheckedIn: false,
    },
  };

  user.eventsToAttend.push(newTicket);

  // Add attendees with seat information and update seat availability
  for (let i = 0; i < quantity; i++) {
    const seat = selectedSeats[i];

    // Add attendee to event
    event.attendees.push({
      userId: userId,
      attended: false,
      seatType: seat.seatType,
      seatNumber: seat.seatNumber,
      ticketId: `${uniqueId}-${i + 1}`,
      finalPrice: seatDetails[i].finalPrice,
    });

    // Update seat availability in seatConfig
    event.seatConfig[seat.seatType].available -= 1;
    event.seatConfig[seat.seatType].booked += 1;
  }

  // Update event seat counts
  event.availableSeats -= quantity;
  event.bookedSeats += quantity;

  await user.save();
  await event.save();

  await user.populate("eventsToAttend.event");

  console.log("✅ Ticket purchased successfully:", {
    event: event.title,
    seats: selectedSeats.map((s) => `${s.seatType}-${s.seatNumber}`),
    totalAmount: totalAmount,
    seatConfig: {
      front: {
        available: event.seatConfig.front.available,
        booked: event.seatConfig.front.booked,
      },
      middle: {
        available: event.seatConfig.middle.available,
        booked: event.seatConfig.middle.booked,
      },
      last: {
        available: event.seatConfig.last.available,
        booked: event.seatConfig.last.booked,
      },
    },
  });

  res.status(200).json({
    success: true,
    message: "Ticket purchased successfully!",
    ticket: {
      ...newTicket,
      _id: user.eventsToAttend[user.eventsToAttend.length - 1]._id,
      event: {
        _id: event._id,
        title: event.title,
        date: event.date,
        location: event.location,
      },
    },
    totalAmount: totalAmount,
    seatSummary: selectedSeats.map((seat) => ({
      seatType: seat.seatType,
      seatNumber: seat.seatNumber,
      price: calculateSeatPrice(
        event.basePrice,
        seat.seatType,
        event.seatConfig
      ),
    })),
  });
});

// Add this function to get available seats
export const getAvailableSeats = catchAsyncError(async (req, res, next) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new ErrorHandler("Event not found", 404));
  }

  // Get taken seats
  const takenSeats = event.attendees.map((attendee) => attendee.seatNumber);

  // Generate seat layout based on actual seat configuration
  const generateSeatLayout = (seatType, count) => {
    const prefix =
      seatType === "front" ? "F" : seatType === "middle" ? "M" : "L";
    const length = seatType === "front" ? 2 : 3; // F01 vs M001

    return Array.from(
      { length: count },
      (_, i) => `${prefix}${String(i + 1).padStart(length, "0")}`
    );
  };

  const availableSeats = {
    front: generateSeatLayout("front", event.seatConfig.front.count).filter(
      (seat) => !takenSeats.includes(seat)
    ),
    middle: generateSeatLayout("middle", event.seatConfig.middle.count).filter(
      (seat) => !takenSeats.includes(seat)
    ),
    last: generateSeatLayout("last", event.seatConfig.last.count).filter(
      (seat) => !takenSeats.includes(seat)
    ),
  };

  const seatPricing = {
    front: calculateSeatPrice(event.basePrice, "front", event.seatConfig),
    middle: calculateSeatPrice(event.basePrice, "middle", event.seatConfig),
    last: calculateSeatPrice(event.basePrice, "last", event.seatConfig),
  };

  res.status(200).json({
    success: true,
    availableSeats,
    seatPricing,
    basePrice: event.basePrice,
    seatAvailability: {
      front: {
        total: event.seatConfig.front.count,
        available: event.seatConfig.front.available,
        booked: event.seatConfig.front.booked,
      },
      middle: {
        total: event.seatConfig.middle.count,
        available: event.seatConfig.middle.available,
        booked: event.seatConfig.middle.booked,
      },
      last: {
        total: event.seatConfig.last.count,
        available: event.seatConfig.last.available,
        booked: event.seatConfig.last.booked,
      },
    },
    totalSeats: event.totalSeats,
    availableSeatsCount: event.availableSeats,
    bookedSeats: event.bookedSeats,
  });
});
export const getOrganizedEvents = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  const user = await User.findById(id);
  console.log(user);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Organized events fetched successfully",
    organizedEvents: user.eventToOrganize,
  });
});

export const updateEventStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  if (!["approved", "rejected", "pending"].includes(status)) {
    return next(new ErrorHandler("Invalid status value", 400));
  }

  const event = await Event.findById(id);
  if (!event) return next(new ErrorHandler("Event not found", 404));

  event.status = status;
  await event.save();

  const usersWithEvent = await User.find({
    "eventToOrganize._id": id,
  });

  for (const user of usersWithEvent) {
    const eventIndex = user.eventToOrganize.findIndex(
      (e) => e._id.toString() === id
    );

    if (eventIndex !== -1) {
      user.eventToOrganize[eventIndex].status = status;
      await user.save();
    }
  }

  if (status === "approved" || status === "rejected") {
    sendEventStatusEmail(event, status, rejectionReason)
      .then((success) => {
        if (success) {
          console.log(
            `Event status email sent successfully for event: ${event.title}`
          );
        } else {
          console.error(
            `Failed to send event status email for event: ${event.title}`
          );
        }
      })
      .catch((err) => {
        console.error("Error in email sending process:", err);
      });
  }

  res.status(200).json({
    success: true,
    message: `Event status updated to ${status}`,
    updatedStatus: status,
  });
});
export const editOrganizedEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventId } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.eventToOrganize.includes(eventId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to edit this event",
      });
    }

    // Get the current event to preserve existing data
    const currentEvent = await Event.findById(eventId);
    if (!currentEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Parse seat configuration if provided
    let parsedSeatConfig;
    if (updates.seatConfig) {
      try {
        parsedSeatConfig =
          typeof updates.seatConfig === "string"
            ? JSON.parse(updates.seatConfig)
            : updates.seatConfig;

        console.log("🔄 Parsed seat config:", parsedSeatConfig);

        // Validate seat configuration has required fields
        if (
          !parsedSeatConfig.front ||
          !parsedSeatConfig.middle ||
          !parsedSeatConfig.last
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid seat configuration - missing seat types",
          });
        }

        // Ensure all required fields are present and calculate available seats
        const seatTypes = ["front", "middle", "last"];

        for (const seatType of seatTypes) {
          if (!parsedSeatConfig[seatType]) {
            return res.status(400).json({
              success: false,
              message: `Missing ${seatType} seat configuration`,
            });
          }

          // Ensure count and price are provided
          if (
            parsedSeatConfig[seatType].count === undefined ||
            parsedSeatConfig[seatType].price === undefined
          ) {
            return res.status(400).json({
              success: false,
              message: `Missing count or price for ${seatType} seats`,
            });
          }

          // Convert to numbers
          parsedSeatConfig[seatType].count = Number(
            parsedSeatConfig[seatType].count
          );
          parsedSeatConfig[seatType].price = Number(
            parsedSeatConfig[seatType].price
          );

          // Calculate available seats based on current bookings
          const currentBooked = currentEvent.seatConfig[seatType]?.booked || 0;
          const newCount = parsedSeatConfig[seatType].count;

          // Check if we're reducing seats below current bookings
          if (newCount < currentBooked) {
            return res.status(400).json({
              success: false,
              message: `Cannot reduce ${seatType} seats to ${newCount} as there are already ${currentBooked} booked seats`,
            });
          }

          // Set available seats (total - booked)
          parsedSeatConfig[seatType].available = newCount - currentBooked;
          // Preserve booked count from current event
          parsedSeatConfig[seatType].booked = currentBooked;
        }

        // Calculate new total seats
        const newTotalSeats =
          parsedSeatConfig.front.count +
          parsedSeatConfig.middle.count +
          parsedSeatConfig.last.count;

        // Check if we're reducing total seats below current total bookings
        const currentTotalBooked = currentEvent.bookedSeats;
        if (newTotalSeats < currentTotalBooked) {
          return res.status(400).json({
            success: false,
            message: `Cannot reduce total seats to ${newTotalSeats} as there are already ${currentTotalBooked} booked seats`,
          });
        }

        // Update overall seat counts
        updates.totalSeats = newTotalSeats;
        updates.availableSeats = newTotalSeats - currentTotalBooked;
        updates.bookedSeats = currentTotalBooked;

        console.log("✅ Updated seat configuration:", parsedSeatConfig);
      } catch (error) {
        console.error("❌ Failed to parse seat configuration:", error.message);
        return res.status(400).json({
          success: false,
          message: "Invalid seat configuration format",
        });
      }
    }

    // Handle banner update if provided
    if (req.file) {
      updates.banner = req.file.filename;
    }

    // Parse coordinates if provided
    if (updates.coordinates) {
      try {
        updates.coordinates =
          typeof updates.coordinates === "string"
            ? JSON.parse(updates.coordinates)
            : updates.coordinates;
      } catch (error) {
        console.error("❌ Failed to parse coordinates:", error.message);
        // Keep existing coordinates if parsing fails
        delete updates.coordinates;
      }
    }

    // Ensure date is properly formatted
    if (updates.date) {
      updates.date = new Date(updates.date);
    }

    // Ensure numeric fields are properly converted
    if (updates.basePrice !== undefined) {
      updates.basePrice = Number(updates.basePrice);
    }

    // Ensure seatConfig is properly set in updates
    if (parsedSeatConfig) {
      updates.seatConfig = parsedSeatConfig;
    }

    console.log("🔄 Final updates being applied:", {
      title: updates.title,
      basePrice: updates.basePrice,
      totalSeats: updates.totalSeats,
      seatConfig: updates.seatConfig,
    });

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found after update",
      });
    }

    console.log("✅ Event updated successfully:", {
      title: updatedEvent.title,
      totalSeats: updatedEvent.totalSeats,
      seatConfig: updatedEvent.seatConfig,
    });

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Edit Event Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const deleteOrganizedEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event ID" });
    }

    const eventObjectId = new mongoose.Types.ObjectId(eventId);

    const deletedEvent = await Event.findByIdAndDelete(eventId);
    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found in global collection",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { eventToOrganize: eventObjectId } },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await User.updateMany(
      {
        $or: [
          { myEventWatchlist: eventObjectId },
          { eventsToAttend: eventObjectId },
        ],
      },
      {
        $pull: {
          myEventWatchlist: eventObjectId,
          eventsToAttend: eventObjectId,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully from all collections",
      eventToOrganize: updatedUser.eventToOrganize,
    });
  } catch (error) {
    console.error("Delete Event Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addCommentToEvent = catchAsyncError(async (req, res, next) => {
  const { eventId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  if (!text) return next(new ErrorHandler("Comment text is required", 400));

  const event = await Event.findById(eventId);
  if (!event) return next(new ErrorHandler("Event not found", 404));

  const user = await User.findById(userId);

  const analysis = analyzeText(text);
  let finalText = text;
  let isToxic = analysis.isToxic;

  if (isToxic) {
    const Filter = (await import("bad-words")).Filter;
    const filter = new Filter();
    finalText = filter.clean(text);

    user.warningCount = (user.warningCount || 0) + 1;
    await user.save();
  }

  const comment = {
    userId,
    text: finalText,
    sentimentScore: analysis.score,
  };

  event.comments.push(comment);
  await event.save();

  res.status(201).json({
    success: true,
    message: isToxic
      ? "Comment added with toxic words censored. Warning issued!"
      : "Comment added successfully",
    comment,
    warningCount: user.warningCount,
    isToxic,
  });
});

export const getEventWithSentimentStats = catchAsyncError(
  async (req, res, next) => {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).populate(
      "comments.userId",
      "name email"
    );
    if (!event) {
      return next(new ErrorHandler("Event not found", 404));
    }

    const comments = event.comments || [];

    const positive = comments.filter((c) => c.sentimentScore > 0).length;
    const negative = comments.filter((c) => c.sentimentScore < 0).length;
    const neutral = comments.filter((c) => c.sentimentScore === 0).length;

    res.status(200).json({
      success: true,
      event,
      sentimentStats: {
        positive,
        negative,
        neutral,
        total: comments.length,
      },
    });
  }
);

export const getLiveEvents = catchAsyncError(async (req, res, next) => {
  const now = new Date();

  const events = await Event.find({ isActive: true }).lean();

  const liveEvents = events.filter((event) => {
    const [year, month, day] = event.date
      .toISOString()
      .split("T")[0]
      .split("-");

    const [startHour, startMinute] = event.startTime.split(":").map(Number);
    const [endHour, endMinute] = event.endTime.split(":").map(Number);

    const start = new Date(year, month - 1, day, startHour, startMinute);
    let end = new Date(year, month - 1, day, endHour, endMinute);

    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    return start <= now && now <= end;
  });

  res.status(200).json({
    success: true,
    liveEvents: liveEvents.sort((a, b) => {
      const aStart = new Date(
        `${a.date.toISOString().split("T")[0]}T${a.startTime}`
      );
      const bStart = new Date(
        `${b.date.toISOString().split("T")[0]}T${b.startTime}`
      );
      return aStart - bStart;
    }),
  });
});

export const completeEventPayment = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { eventId } = req.params;

  const user = await User.findById(userId).populate("eventsToAttend.event");
  if (!user) return next(new ErrorHandler("User not found", 404));

  const eventEntry = user.eventsToAttend.find((e) =>
    e.event._id.equals(eventId)
  );
  if (!eventEntry)
    return next(new ErrorHandler("Event not in your attending list", 404));

  if (eventEntry.paymentStatus === "completed") {
    return next(new ErrorHandler("Payment already completed", 400));
  }

  eventEntry.paymentStatus = "completed";

  const qrData = {
    userId: user._id.toString(),
    eventId: eventId,
    ticketQuantity: eventEntry.ticketQuantity,
    timestamp: new Date(),
  };
  eventEntry.qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

  await user.save();

  res.status(200).json({
    success: true,
    message: "Payment completed. QR code generated!",
    qrCode: eventEntry.qrCode,
    eventsToAttend: user.eventsToAttend,
  });
});

export const updateTicketQuantity = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { ticketId } = req.params;
  const { newQuantity } = req.body;

  console.log("🔄 Updating ticket quantity:", {
    ticketId,
    newQuantity,
    userId,
    params: req.params,
    body: req.body,
  });

  if (!ticketId) {
    return next(new ErrorHandler("Ticket ID is required", 400));
  }

  if (newQuantity === undefined || newQuantity === null) {
    return next(new ErrorHandler("New quantity is required", 400));
  }

  if (newQuantity < 1) {
    return next(new ErrorHandler("Quantity must be at least 1", 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  console.log("🔍 User eventsToAttend:", user.eventsToAttend);

  const ticket = user.eventsToAttend.id(ticketId);
  if (!ticket) {
    console.log("❌ Ticket not found with ID:", ticketId);
    console.log(
      "📋 Available ticket IDs:",
      user.eventsToAttend.map((t) => t._id)
    );
    return next(new ErrorHandler("Ticket not found", 404));
  }

  console.log("✅ Found ticket:", {
    ticketId: ticket._id,
    currentQuantity: ticket.ticketQuantity,
    event: ticket.event,
  });

  const event = await Event.findById(ticket.event);
  if (!event) {
    return next(new ErrorHandler("Event not found", 404));
  }

  const currentQuantity = ticket.ticketQuantity;
  const quantityDifference = newQuantity - currentQuantity;

  console.log("📊 Quantity update details:", {
    currentQuantity,
    newQuantity,
    quantityDifference,
    eventId: event._id,
    eventTitle: event.title,
  });

  if (quantityDifference > 0) {
    for (let i = 0; i < quantityDifference; i++) {
      event.attendees.push(userId);
    }
    console.log(`✅ Added ${quantityDifference} attendees to event`);
  } else if (quantityDifference < 0) {
    const ticketsToRemove = Math.abs(quantityDifference);
    let removed = 0;

    event.attendees = event.attendees.filter((attendee) => {
      if (
        attendee.toString() === userId.toString() &&
        removed < ticketsToRemove
      ) {
        removed++;
        return false;
      }
      return true;
    });
    console.log(`✅ Removed ${ticketsToRemove} attendees from event`);
  }

  ticket.ticketQuantity = newQuantity;
  ticket.lastUpdated = new Date();

  console.log(
    "🔄 Updating ticket quantity from",
    currentQuantity,
    "to",
    newQuantity
  );

  if (quantityDifference !== 0) {
    const baseId =
      ticket.ticketIds[0]?.split("-").slice(0, -1).join("-") ||
      ticket._id.toString();
    ticket.ticketIds = [];
    for (let i = 0; i < newQuantity; i++) {
      ticket.ticketIds.push(`${baseId}-${i + 1}`);
    }

    console.log("🔄 Updated ticket IDs:", ticket.ticketIds);

    const qrPayload = {
      ticketId: baseId,
      userId: userId.toString(),
      eventId: event._id.toString(),
      eventTitle: event.title,
      eventDate: event.date,
      ticketQuantity: newQuantity,
      purchaseDate: ticket.purchaseDate,
      lastUpdated: ticket.lastUpdated,
    };

    const qrString = JSON.stringify(qrPayload);
    ticket.qrCode = await QRCode.toDataURL(qrString, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#FFFFFF" },
    });

    console.log("✅ Regenerated QR code with new quantity:", newQuantity);
  }

  await user.save();
  await event.save();

  console.log("✅ Ticket quantity updated successfully to:", newQuantity);

  res.status(200).json({
    success: true,
    message: `Ticket quantity updated to ${newQuantity}`,
    ticket: ticket,
  });
});

export const cancelEventAttendance = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { ticketId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    return next(new ErrorHandler("Invalid ticket ID", 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const ticket = user.eventsToAttend.id(ticketId);
  if (!ticket) {
    return next(new ErrorHandler("Ticket not found", 404));
  }

  const event = await Event.findById(ticket.event);
  if (!event) {
    return next(new ErrorHandler("Event not found", 404));
  }

  // Get all ticket IDs to remove from attendees
  const ticketIdsToRemove = ticket.ticketIds || [];

  console.log("🎫 Cancelling tickets:", {
    ticketId,
    ticketIds: ticketIdsToRemove,
    seatDetails: ticket.seatDetails,
  });

  // Remove attendees based on ticketIds
  const removedAttendees = [];
  event.attendees = event.attendees.filter((attendee) => {
    if (ticketIdsToRemove.includes(attendee.ticketId)) {
      removedAttendees.push(attendee);
      return false; // Remove this attendee
    }
    return true; // Keep this attendee
  });

  // Release seats back to availability
  if (ticket.seatDetails && Array.isArray(ticket.seatDetails)) {
    ticket.seatDetails.forEach((seatDetail) => {
      const seatType = seatDetail.seatType;

      if (event.seatConfig[seatType]) {
        // Release the seat back to available
        event.seatConfig[seatType].available += 1;
        event.seatConfig[seatType].booked -= 1;

        console.log(`♻️ Released ${seatType} seat: ${seatDetail.seatNumber}`);
      }
    });

    // Update overall event seat counts
    event.availableSeats += ticket.ticketQuantity;
    event.bookedSeats -= ticket.ticketQuantity;
  }

  // Remove the ticket from user's eventsToAttend
  user.eventsToAttend.pull({ _id: ticketId });

  await user.save();
  await event.save();

  console.log("✅ Ticket cancelled successfully:", {
    ticketId,
    seatsReleased: ticket.seatDetails?.length || 0,
    totalAmountRefunded: ticket.totalAmount || 0,
  });

  res.status(200).json({
    success: true,
    message: "Ticket cancelled successfully",
    data: {
      ticketId,
      seatsReleased: ticket.seatDetails?.length || 0,
      totalAmount: ticket.totalAmount || 0,
      eventTitle: event.title,
    },
  });
});

// export const markEventAttendance = catchAsyncError(async (req, res, next) => {
//   const { ticketId, userId, eventId } = req.body;

//   if (!ticketId || !userId || !eventId) {
//     return next(new ErrorHandler("Missing required fields", 400));
//   }

//   const user = await User.findById(userId).populate("eventsToAttend.event");
//   if (!user) return next(new ErrorHandler("User not found", 404));

//   const ticket = user.eventsToAttend.find(
//     (t) => t.event._id.toString() === eventId.toString()
//   );

//   if (!ticket) {
//     return next(new ErrorHandler("Ticket not found for this event", 404));
//   }

//   if (ticket.attendanceStatus === "attended") {
//     return res.status(200).json({
//       success: true,
//       message: "User already marked as attended",
//       ticket,
//     });
//   }

//   ticket.attendanceStatus = "attended";
//   ticket.attendanceTime = new Date();

//   await user.save();

//   const event = await Event.findById(eventId);
//   if (!event) return next(new ErrorHandler("Event not found", 404));

//   if (!event.attendanceLogs) event.attendanceLogs = [];
//   event.attendanceLogs.push({
//     user: userId,
//     ticketId,
//     time: new Date(),
//   });
//   await event.save();

//   res.status(200).json({
//     success: true,
//     message: "Attendance marked successfully!",
//     attendance: {
//       user: user.name,
//       event: event.title,
//       ticketId,
//       attendanceTime: ticket.attendanceTime,
//     },
//   });
// });

// export const geoCheckIn = async (req, res) => {
//   try {
//     console.log("📍 Geo-checkin attempt:", {
//       eventId: req.body.eventId,
//       latitude: req.body.latitude,
//       longitude: req.body.longitude,
//       userId: req.user._id,
//     });

//     const { eventId, latitude, longitude } = req.body;
//     const userId = req.user._id;

//     if (!eventId || latitude === undefined || longitude === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "Event ID and location coordinates are required",
//       });
//     }

//     const event = await Event.findById(eventId);
//     if (!event) {
//       return res.status(404).json({
//         success: false,
//         message: "Event not found",
//       });
//     }

//     if (
//       !event.coordinates ||
//       event.coordinates.lat === undefined ||
//       event.coordinates.lng === undefined
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Event location is not properly set",
//       });
//     }

//     const calculateDistance = (lat1, lon1, lat2, lon2) => {
//       const R = 6371e3;
//       const φ1 = (lat1 * Math.PI) / 180;
//       const φ2 = (lat2 * Math.PI) / 180;
//       const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//       const Δλ = ((lon2 - lon1) * Math.PI) / 180;

//       const a =
//         Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//         Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//       const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//       return R * c;
//     };

//     const distance = calculateDistance(
//       latitude,
//       longitude,
//       event.coordinates.lat,
//       event.coordinates.lng
//     );

//     console.log(`📍 Distance calculated: ${Math.round(distance)}m`);

//     const ALLOWED_DISTANCE = 5200;
//     if (distance > ALLOWED_DISTANCE) {
//       console.log(
//         `❌ User too far: ${Math.round(distance)}m > ${ALLOWED_DISTANCE}m`
//       );
//       return res.status(400).json({
//         success: false,
//         message: `You are ${Math.round(
//           distance
//         )}m away from the event. Please get within ${ALLOWED_DISTANCE}m to check in.`,
//         distance: Math.round(distance),
//         allowedDistance: ALLOWED_DISTANCE,
//       });
//     }

//     console.log("✅ Distance check passed, proceeding with check-in...");

//     const existingAttendeeIndex = event.attendees.findIndex((attendee) => {
//       return (
//         attendee &&
//         attendee.userId &&
//         attendee.userId.toString() === userId.toString()
//       );
//     });

//     console.log(`📍 Existing attendee index: ${existingAttendeeIndex}`);

//     if (existingAttendeeIndex !== -1) {
//       event.attendees[existingAttendeeIndex].attended = true;
//       event.attendees[existingAttendeeIndex].checkInTime = new Date();
//       console.log("📍 Updated existing attendee");
//     } else {
//       event.attendees.push({
//         userId: userId,
//         attended: true,
//         checkInTime: new Date(),
//       });
//       console.log("📍 Added new attendee");
//     }

//     await event.save();
//     console.log("✅ Event saved successfully");

//     res.json({
//       success: true,
//       message: "Check-in successful! 🎉",
//       distance: Math.round(distance),
//       checkInTime: new Date(),
//     });
//   } catch (error) {
//     console.error("❌ Geo-checkin error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error during check-in",
//     });
//   }
// };

export const markEventAttendance = catchAsyncError(async (req, res, next) => {
  const { ticketId, userId, eventId } = req.body;

  if (!ticketId || !userId || !eventId) {
    return next(new ErrorHandler("Missing required fields", 400));
  }

  const user = await User.findById(userId).populate("eventsToAttend.event");
  if (!user) return next(new ErrorHandler("User not found", 404));

  const ticket = user.eventsToAttend.find(
    (t) => t.event._id.toString() === eventId.toString()
  );

  if (!ticket) {
    return next(new ErrorHandler("Ticket not found for this event", 404));
  }

  if (ticket.attendanceStatus === "attended") {
    return res.status(200).json({
      success: true,
      message: "User already marked as attended",
      ticket,
    });
  }

  ticket.attendanceStatus = "attended";
  ticket.attendanceTime = new Date();

  await user.save();

  const event = await Event.findById(eventId);
  if (!event) return next(new ErrorHandler("Event not found", 404));

  // Find and update the attendee's attended status to true
  const attendeeIndex = event.attendees.findIndex(
    (attendee) => attendee.userId.toString() === userId.toString()
  );

  if (attendeeIndex !== -1) {
    event.attendees[attendeeIndex].attended = true; // SET TO TRUE
    event.attendees[attendeeIndex].checkInTime = new Date();
    console.log("✅ Mark attendance: Updated attendee - attended: true");
  }

  if (!event.attendanceLogs) event.attendanceLogs = [];
  event.attendanceLogs.push({
    user: userId,
    ticketId,
    time: new Date(),
  });

  await event.save();

  res.status(200).json({
    success: true,
    message: "Attendance marked successfully!",
    attendance: {
      user: user.name,
      event: event.title,
      ticketId,
      attendanceTime: ticket.attendanceTime,
      attended: true, // Confirm in response
    },
  });
});
export const geoCheckIn = async (req, res) => {
  try {
    console.log("📍 Geo-checkin attempt:", {
      eventId: req.body.eventId,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      userId: req.user._id,
    });

    const { eventId, latitude, longitude } = req.body;
    const userId = req.user._id;

    if (!eventId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Event ID and location coordinates are required",
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (
      !event.coordinates ||
      event.coordinates.lat === undefined ||
      event.coordinates.lng === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Event location is not properly set",
      });
    }

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371e3;
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const distance = calculateDistance(
      latitude,
      longitude,
      event.coordinates.lat,
      event.coordinates.lng
    );

    console.log(`📍 Distance calculated: ${Math.round(distance)}m`);

    const ALLOWED_DISTANCE = 5200;
    if (distance > ALLOWED_DISTANCE) {
      console.log(
        `❌ User too far: ${Math.round(distance)}m > ${ALLOWED_DISTANCE}m`
      );
      return res.status(400).json({
        success: false,
        message: `You are ${Math.round(
          distance
        )}m away from the event. Please get within ${ALLOWED_DISTANCE}m to check in.`,
        distance: Math.round(distance),
        allowedDistance: ALLOWED_DISTANCE,
      });
    }

    console.log("✅ Distance check passed, proceeding with check-in...");

    // Find the specific attendee by userId
    const attendeeIndex = event.attendees.findIndex(
      (attendee) => attendee.userId.toString() === userId.toString()
    );

    console.log(`📍 Found attendee at index: ${attendeeIndex}`);

    if (attendeeIndex !== -1) {
      // Update existing attendee - SET ATTENDED TO TRUE
      event.attendees[attendeeIndex].attended = true;
      event.attendees[attendeeIndex].checkInTime = new Date();
      console.log("✅ Updated existing attendee - attended: true");
    } else {
      // Add new attendee with attended: true
      event.attendees.push({
        userId: userId,
        attended: true, // SET TO TRUE
        checkInTime: new Date(),
      });
      console.log("✅ Added new attendee - attended: true");
    }

    await event.save();
    console.log("✅ Event saved successfully with attended: true");

    res.json({
      success: true,
      message: "Check-in successful! 🎉",
      distance: Math.round(distance),
      checkInTime: new Date(),
      attended: true, // Confirm in response
    });
  } catch (error) {
    console.error("❌ Geo-checkin error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during check-in",
    });
  }
};
export const cleanupAttendees = async (req, res) => {
  try {
    const events = await Event.find({});
    let cleanedCount = 0;

    for (let event of events) {
      const originalLength = event.attendees.length;

      event.attendees = event.attendees.filter(
        (attendee) => attendee && attendee.userId && attendee.userId.toString
      );

      if (event.attendees.length !== originalLength) {
        await event.save();
        cleanedCount++;
        console.log(
          `✅ Cleaned event: ${event.title} - removed ${
            originalLength - event.attendees.length
          } invalid attendees`
        );
      }
    }

    res.json({
      success: true,
      message: `Cleaned ${cleanedCount} events with invalid attendees`,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    res.status(500).json({
      success: false,
      message: "Cleanup failed",
    });
  }
};

export const detectNearbyEvents = catchAsyncError(async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user._id;

    console.log("📍 Detecting nearby events for user:", userId);

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Location coordinates are required",
      });
    }

    const user = await User.findById(userId).populate("eventsToAttend.event");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userEvents = user.eventsToAttend.filter(
      (ticket) =>
        ticket.paymentStatus === "completed" &&
        ticket.attendanceStatus === "not_attended" &&
        ticket.event
    );

    console.log(`📋 User has ${userEvents.length} events to attend`);

    const nearbyEvents = [];
    const VENUE_RADIUS = 5000; // 100 meters - venue entrance
    const NEARBY_RADIUS = 10000; // 500 meters - nearby area
    const NOTIFICATION_INTERVAL = 60000; // 1 minute in milliseconds
    const MAX_NOTIFICATIONS = 3; // Maximum 3 notifications before auto check-in

    let userNeedsSave = false;

    for (const ticket of userEvents) {
      const event = ticket.event;

      if (
        !event.coordinates ||
        !event.coordinates.lat ||
        !event.coordinates.lng
      ) {
        continue;
      }

      const distance = calculateDistance(
        latitude,
        longitude,
        event.coordinates.lat,
        event.coordinates.lng
      );

      console.log(`📍 Event "${event.title}": ${Math.round(distance)}m away`);

      const now = new Date();

      // Initialize checkInNotifications if not exists (for backward compatibility)
      if (!ticket.checkInNotifications) {
        ticket.checkInNotifications = {
          count: 0,
          lastNotificationTime: null,
          notificationHistory: [],
          autoCheckedIn: false,
          notificationsEnabled: true,
        };
        userNeedsSave = true;
      }

      // If already auto-checked in, skip processing
      if (ticket.checkInNotifications.autoCheckedIn) {
        console.log(
          `✅ Already auto-checked in for "${event.title}", skipping`
        );
        continue;
      }

      const notificationCount = ticket.checkInNotifications.count || 0;
      const lastNotificationTime =
        ticket.checkInNotifications.lastNotificationTime;

      // Calculate time since last notification
      const timeSinceLastNotification = lastNotificationTime
        ? now - new Date(lastNotificationTime)
        : NOTIFICATION_INTERVAL + 1; // Force first notification

      console.log(`📊 Notification state for "${event.title}":`, {
        notificationCount,
        timeSinceLastNotification:
          Math.round(timeSinceLastNotification / 1000) + "s",
        needsNextNotification:
          timeSinceLastNotification >= NOTIFICATION_INTERVAL,
        canSendMore: notificationCount < MAX_NOTIFICATIONS,
        lastNotificationTime: lastNotificationTime,
      });

      // Check if user is within venue radius (100m)
      if (distance <= VENUE_RADIUS) {
        console.log(`📍 User is within venue radius for "${event.title}"`);

        // Determine if we should send a notification
        let shouldSendNotification = false;
        let notificationNumber = 0;

        if (notificationCount === 0) {
          // First time in venue - send first notification immediately
          shouldSendNotification = true;
          notificationNumber = 1;
          console.log(`🔄 First notification ready for "${event.title}"`);
        } else if (
          notificationCount < MAX_NOTIFICATIONS &&
          timeSinceLastNotification >= NOTIFICATION_INTERVAL
        ) {
          // Subsequent notifications - only send after 1 minute interval
          shouldSendNotification = true;
          notificationNumber = notificationCount + 1;
          console.log(
            `🔄 Notification ${notificationNumber} ready for "${event.title}"`
          );
        }

        nearbyEvents.push({
          eventId: event._id,
          eventTitle: event.title,
          distance: Math.round(distance),
          ticketId: ticket._id,
          proximity: "venue",
          needsCheckIn: true,
          notificationCount,
          maxNotifications: MAX_NOTIFICATIONS,
          nextNotificationTime: lastNotificationTime
            ? new Date(
                new Date(lastNotificationTime).getTime() + NOTIFICATION_INTERVAL
              )
            : null,
          timeUntilNextNotification: lastNotificationTime
            ? Math.max(0, NOTIFICATION_INTERVAL - timeSinceLastNotification)
            : 0,
          shouldSendNotification,
          notificationNumber,
          canSendMore: notificationCount < MAX_NOTIFICATIONS,
        });

        // Send venue notification if conditions are met
        if (shouldSendNotification) {
          console.log(
            `📢 Sending notification ${notificationNumber}/${MAX_NOTIFICATIONS} for "${event.title}"`
          );

          await sendVenueCheckInNotification(
            user,
            event,
            distance,
            notificationNumber,
            MAX_NOTIFICATIONS
          );

          // Update notification tracking - PERSISTED IN DATABASE
          ticket.checkInNotifications.count = notificationNumber;
          ticket.checkInNotifications.lastNotificationTime = now;
          ticket.checkInNotifications.notificationHistory.push({
            type: "venue_checkin_reminder",
            time: now,
            notificationNumber: notificationNumber,
            distance: Math.round(distance),
            sent: true,
          });

          userNeedsSave = true;

          // If this is the third notification, perform automatic check-in
          if (notificationNumber >= MAX_NOTIFICATIONS) {
            console.log(
              `🎯 Maximum notifications reached, performing automatic check-in for "${event.title}"`
            );
            await performAutomaticCheckIn(user, ticket, event);
            userNeedsSave = true;
          }
        } else {
          console.log(
            `⏳ Waiting for next notification for "${
              event.title
            }": ${Math.round(
              (NOTIFICATION_INTERVAL - timeSinceLastNotification) / 1000
            )}s remaining`
          );
        }
      }
      // Check if user is within nearby radius (500m) but not at venue
      else if (distance <= NEARBY_RADIUS) {
        const canSendNotification =
          !ticket.lastNearbyNotificationTime ||
          now - new Date(ticket.lastNearbyNotificationTime) >=
            NOTIFICATION_INTERVAL;

        nearbyEvents.push({
          eventId: event._id,
          eventTitle: event.title,
          distance: Math.round(distance),
          ticketId: ticket._id,
          proximity: "nearby",
          needsCheckIn: false,
          alreadyNotified: ticket.nearbyNotified || false,
          canSendNotification,
          nextNotificationTime: ticket.lastNearbyNotificationTime
            ? new Date(
                new Date(ticket.lastNearbyNotificationTime).getTime() +
                  NOTIFICATION_INTERVAL
              )
            : null,
        });

        // Send nearby notification if conditions are met
        if (!ticket.nearbyNotified || canSendNotification) {
          await sendNearbyEventNotification(user, event, distance);

          ticket.nearbyNotified = true;
          ticket.lastNearbyNotificationTime = now;
          userNeedsSave = true;

          console.log(`📢 Sent nearby notification for "${event.title}"`);
        }
      }
    }

    // Save user only if there are changes
    if (userNeedsSave) {
      try {
        await user.save();
        console.log("✅ User data saved with updated notification tracking");
      } catch (saveError) {
        console.error("❌ Error saving user data:", saveError);
      }
    }

    res.status(200).json({
      success: true,
      message:
        nearbyEvents.length > 0
          ? `Found ${nearbyEvents.length} event(s) nearby`
          : "No events nearby",
      nearbyEvents,
      userLocation: { latitude, longitude },
    });
  } catch (error) {
    console.error("❌ Detect nearby events error:", error);
    res.status(500).json({
      success: false,
      message: "Error detecting nearby events",
    });
  }
});

export const completeGeoCheckIn = catchAsyncError(async (req, res, next) => {
  try {
    const { eventId, ticketId } = req.body;
    const userId = req.user._id;

    console.log("📍 Completing geo check-in:", { eventId, ticketId, userId });

    if (!eventId || !ticketId) {
      return res.status(400).json({
        success: false,
        message: "Event ID and Ticket ID are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const ticket = user.eventsToAttend.id(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (ticket.event.toString() !== eventId) {
      return res.status(400).json({
        success: false,
        message: "Ticket does not belong to this event",
      });
    }

    if (ticket.attendanceStatus === "attended") {
      return res.status(400).json({
        success: false,
        message: "Already checked in to this event",
      });
    }

    // Perform manual check-in
    await performManualCheckIn(user, ticket, eventId);

    console.log(`✅ User ${userId} successfully checked into event ${eventId}`);

    res.status(200).json({
      success: true,
      message: "Check-in successful! 🎉",
      attendance: {
        eventTitle: ticket.event.title,
        checkInTime: ticket.attendanceTime,
        ticketQuantity: ticket.ticketQuantity,
        checkInType: "manual",
      },
    });
  } catch (error) {
    console.error("❌ Complete geo check-in error:", error);
    res.status(500).json({
      success: false,
      message: "Error during check-in process",
    });
  }
});

// Perform automatic check-in
// const performAutomaticCheckIn = async (user, ticket, event) => {
//   try {
//     if (ticket.attendanceStatus === "attended") {
//       console.log("ℹ️ User already checked in, skipping auto check-in");
//       return;
//     }

//     console.log(
//       `🎯 Performing automatic check-in for user ${user._id} to event "${event.title}"`
//     );

//     // Update ticket status
//     ticket.attendanceStatus = "attended";
//     ticket.attendanceTime = new Date();
//     ticket.checkInNotifications.autoCheckedIn = true;
//     ticket.geoCheckInNotified = true;
//     ticket.nearbyNotified = true;
//     ticket.venueNotified = true;

//     // Update event attendees
//     const eventDoc = await Event.findById(event._id);
//     if (eventDoc) {
//       const existingAttendeeIndex = eventDoc.attendees.findIndex(
//         (attendee) => attendee.userId.toString() === user._id.toString()
//       );

//       if (existingAttendeeIndex !== -1) {
//         eventDoc.attendees[existingAttendeeIndex].attended = true;
//         eventDoc.attendees[existingAttendeeIndex].checkInTime = new Date();
//       } else {
//         eventDoc.attendees.push({
//           userId: user._id,
//           attended: true,
//           checkInTime: new Date(),
//         });
//       }

//       // Add to attendance logs
//       if (!eventDoc.attendanceLogs) eventDoc.attendanceLogs = [];
//       eventDoc.attendanceLogs.push({
//         user: user._id,
//         ticketId: ticket._id.toString(),
//         time: new Date(),
//         checkInType: "automatic",
//       });

//       await eventDoc.save();
//     }

//     await user.save();

//     // Send automatic check-in confirmation email
//     await sendAutomaticCheckInConfirmationEmail(user, event);

//     console.log(
//       `✅ Automatic check-in completed for user ${user._id} to event "${event.title}"`
//     );
//   } catch (error) {
//     console.error("❌ Error during automatic check-in:", error);
//     throw error;
//   }
// };
// Perform automatic check-in
const performAutomaticCheckIn = async (user, ticket, event) => {
  try {
    if (ticket.attendanceStatus === "attended") {
      console.log("ℹ️ User already checked in, skipping auto check-in");
      return;
    }

    console.log(
      `🎯 Performing automatic check-in for user ${user._id} to event "${event.title}"`
    );

    // Update ticket status
    ticket.attendanceStatus = "attended";
    ticket.attendanceTime = new Date();
    ticket.checkInNotifications.autoCheckedIn = true;
    ticket.geoCheckInNotified = true;
    ticket.nearbyNotified = true;
    ticket.venueNotified = true;

    // Update event attendees - SET ATTENDED TO TRUE
    const eventDoc = await Event.findById(event._id);
    if (eventDoc) {
      const attendeeIndex = eventDoc.attendees.findIndex(
        (attendee) => attendee.userId.toString() === user._id.toString()
      );

      if (attendeeIndex !== -1) {
        // Update existing attendee - SET ATTENDED TO TRUE
        eventDoc.attendees[attendeeIndex].attended = true;
        eventDoc.attendees[attendeeIndex].checkInTime = new Date();
        console.log(
          "✅ Auto check-in: Updated existing attendee - attended: true"
        );
      } else {
        // Add new attendee with attended: true
        eventDoc.attendees.push({
          userId: user._id,
          attended: true, // SET TO TRUE
          checkInTime: new Date(),
        });
        console.log("✅ Auto check-in: Added new attendee - attended: true");
      }

      // Add to attendance logs
      if (!eventDoc.attendanceLogs) eventDoc.attendanceLogs = [];
      eventDoc.attendanceLogs.push({
        user: user._id,
        ticketId: ticket._id.toString(),
        time: new Date(),
        checkInType: "automatic",
      });

      await eventDoc.save();
    }

    await user.save();

    // Send automatic check-in confirmation email
    await sendAutomaticCheckInConfirmationEmail(user, event);

    console.log(
      `✅ Automatic check-in completed for user ${user._id} to event "${event.title}"`
    );
  } catch (error) {
    console.error("❌ Error during automatic check-in:", error);
    throw error;
  }
};
// Perform manual check-in
// const performManualCheckIn = async (user, ticket, eventId) => {
//   try {
//     const event = await Event.findById(eventId);
//     if (!event) {
//       throw new Error("Event not found");
//     }

//     // Update ticket status
//     ticket.attendanceStatus = "attended";
//     ticket.attendanceTime = new Date();
//     ticket.geoCheckInNotified = true;
//     ticket.nearbyNotified = true;
//     ticket.venueNotified = true;

//     // Update event attendees
//     const existingAttendeeIndex = event.attendees.findIndex(
//       (attendee) => attendee.userId.toString() === user._id.toString()
//     );

//     if (existingAttendeeIndex !== -1) {
//       event.attendees[existingAttendeeIndex].attended = true;
//       event.attendees[existingAttendeeIndex].checkInTime = new Date();
//     } else {
//       event.attendees.push({
//         userId: user._id,
//         attended: true,
//         checkInTime: new Date(),
//       });
//     }

//     // Add to attendance logs
//     if (!event.attendanceLogs) event.attendanceLogs = [];
//     event.attendanceLogs.push({
//       user: user._id,
//       ticketId: ticket._id.toString(),
//       time: new Date(),
//       checkInType: "manual",
//     });

//     await event.save();
//     await user.save();

//     // Send manual check-in confirmation email
//     await sendCheckInConfirmationEmail(user, event);
//   } catch (error) {
//     console.error("❌ Error during manual check-in:", error);
//     throw error;
//   }
// };
// Perform manual check-in
const performManualCheckIn = async (user, ticket, eventId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Update ticket status
    ticket.attendanceStatus = "attended";
    ticket.attendanceTime = new Date();
    ticket.geoCheckInNotified = true;
    ticket.nearbyNotified = true;
    ticket.venueNotified = true;

    // Find the specific attendee by userId and update attended status
    const attendeeIndex = event.attendees.findIndex(
      (attendee) => attendee.userId.toString() === user._id.toString()
    );

    if (attendeeIndex !== -1) {
      // Update existing attendee - SET ATTENDED TO TRUE
      event.attendees[attendeeIndex].attended = true;
      event.attendees[attendeeIndex].checkInTime = new Date();
      console.log(
        "✅ Manual check-in: Updated existing attendee - attended: true"
      );
    } else {
      // Add new attendee with attended: true
      event.attendees.push({
        userId: user._id,
        attended: true, // SET TO TRUE
        checkInTime: new Date(),
      });
      console.log("✅ Manual check-in: Added new attendee - attended: true");
    }

    // Add to attendance logs
    if (!event.attendanceLogs) event.attendanceLogs = [];
    event.attendanceLogs.push({
      user: user._id,
      ticketId: ticket._id.toString(),
      time: new Date(),
      checkInType: "manual",
    });

    await event.save();
    await user.save();

    // Send manual check-in confirmation email
    await sendCheckInConfirmationEmail(user, event);
  } catch (error) {
    console.error("❌ Error during manual check-in:", error);
    throw error;
  }
};

export const getEventOrganizerStats = catchAsyncError(
  async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const userId = req.user._id;

      console.log(
        `📊 Fetching organizer stats for event: ${eventId}, user: ${userId}`
      );

      // Find the event and verify ownership
      const event = await Event.findById(eventId);
      console.log(event);
      if (!event) {
        return next(new ErrorHandler("Event not found", 404));
      }

      // Check if the current user is the organizer
      if (event.createdBy.toString() !== userId.toString()) {
        return next(
          new ErrorHandler(
            "Unauthorized: You are not the organizer of this event",
            403
          )
        );
      }

      // Get all users who have tickets for this event
      const usersWithTickets = await User.find({
        "eventsToAttend.event": eventId,
      }).select("name email eventsToAttend");

      // Calculate statistics
      let totalRevenue = 0;
      let paidTickets = 0;
      let pendingTickets = 0;
      let checkedInUsers = 0;
      let attendedUsers = 0;
      const eventAttendees = [];

      usersWithTickets.forEach((user) => {
        user.eventsToAttend.forEach((ticket) => {
          if (ticket.event.toString() === eventId) {
            const attendeeInfo = {
              userId: user._id,
              userName: user.name,
              userEmail: user.email,
              ticketQuantity: ticket.ticketQuantity || 1,
              paymentStatus: ticket.paymentStatus,
              attendanceStatus: ticket.attendanceStatus,
              purchaseDate: ticket.purchaseDate,
              attendanceTime: ticket.attendanceTime,
              ticketIds: ticket.ticketIds || [],
              seatType: ticket.seatType,
              seatNumber: ticket.seatNumber,
              finalPrice: ticket.finalPrice,
            };

            eventAttendees.push(attendeeInfo);

            // Count stats based on payment status
            if (ticket.paymentStatus === "completed") {
              paidTickets += ticket.ticketQuantity || 1;
              totalRevenue +=
                ticket.finalPrice ||
                (ticket.ticketQuantity || 1) *
                  (getSeatPrice(event, ticket.seatType) || 0);
            } else if (ticket.paymentStatus === "pending") {
              pendingTickets += ticket.ticketQuantity || 1;
            }

            // Count attendance stats
            if (ticket.attendanceStatus === "checked-in") {
              checkedInUsers += ticket.ticketQuantity || 1;
            } else if (ticket.attendanceStatus === "attended") {
              attendedUsers += ticket.ticketQuantity || 1;
              checkedInUsers += ticket.ticketQuantity || 1;
            }
          }
        });
      });

      // Also process attendees from event.attendees array (for checked-in users)
      if (event.attendees && event.attendees.length > 0) {
        const uniqueAttendees = new Map();

        // Remove duplicates from event.attendees array
        event.attendees.forEach((attendee) => {
          const key = `${attendee.userId}-${attendee.seatNumber}`;
          if (!uniqueAttendees.has(key)) {
            uniqueAttendees.set(key, attendee);
          }
        });

        // Process unique attendees
        uniqueAttendees.forEach((attendee) => {
          if (attendee.attended) {
            checkedInUsers += 1;
            attendedUsers += 1;

            // Add to eventAttendees if not already present
            const existingAttendee = eventAttendees.find(
              (a) =>
                a.userId.toString() === attendee.userId.toString() &&
                a.seatNumber === attendee.seatNumber
            );

            if (!existingAttendee) {
              eventAttendees.push({
                userId: attendee.userId,
                userName: "Unknown", // You might want to fetch this from User model
                userEmail: "Unknown",
                ticketQuantity: 1,
                paymentStatus: "completed", // Assuming checked-in means paid
                attendanceStatus: "attended",
                purchaseDate: attendee.purchaseDate,
                attendanceTime: attendee.checkInTime,
                ticketIds: [attendee.ticketId],
                seatType: attendee.seatType,
                seatNumber: attendee.seatNumber,
                finalPrice: attendee.finalPrice,
              });
            }
          }
        });
      }

      const stats = {
        paidTickets,
        pendingTickets,
        checkedInUsers,
        attendedUsers,
        totalTickets: paidTickets + pendingTickets,
        revenue: totalRevenue,
        totalAttendees: eventAttendees.length,
        seatStats: {
          front: {
            total: event.seatConfig.front.count,
            booked: event.seatConfig.front.booked,
            available: event.seatConfig.front.available,
            revenue:
              event.seatConfig.front.booked * event.seatConfig.front.price,
          },
          middle: {
            total: event.seatConfig.middle.count,
            booked: event.seatConfig.middle.booked,
            available: event.seatConfig.middle.available,
            revenue:
              event.seatConfig.middle.booked * event.seatConfig.middle.price,
          },
          last: {
            total: event.seatConfig.last.count,
            booked: event.seatConfig.last.booked,
            available: event.seatConfig.last.available,
            revenue: event.seatConfig.last.booked * event.seatConfig.last.price,
          },
        },
      };

      res.status(200).json({
        success: true,
        message: "Event statistics fetched successfully",
        stats,
        attendees: eventAttendees,
        eventDetails: {
          title: event.title,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          basePrice: event.basePrice,
          seatConfig: event.seatConfig,
          category: event.category,
          totalSeats: event.totalSeats,
          availableSeats: event.availableSeats,
          bookedSeats: event.bookedSeats,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching event organizer stats:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching event statistics",
      });
    }
  }
);

// Add this function to send event summary
export const sendEventSummary = catchAsyncError(async (req, res, next) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new ErrorHandler("Event not found", 404));
  }

  // Check if user is the organizer
  if (event.createdBy.toString() !== userId.toString()) {
    return next(
      new ErrorHandler(
        "Unauthorized: You are not the organizer of this event",
        403
      )
    );
  }

  // Check if event is completed
  if (!event.isCompleted()) {
    return next(
      new ErrorHandler(
        "Event summary is only available after the event has ended",
        400
      )
    );
  }

  const success = await sendEventSummaryEmail(eventId);

  if (success) {
    res.status(200).json({
      success: true,
      message: "Event summary sent successfully to your email",
    });
  } else {
    return next(new ErrorHandler("Failed to send event summary", 500));
  }
});

// Add this function to rate organizer
export const rateOrganizer = catchAsyncError(async (req, res, next) => {
  const { eventId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  if (!rating || rating < 1 || rating > 5) {
    return next(new ErrorHandler("Rating must be between 1 and 5", 400));
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new ErrorHandler("Event not found", 404));
  }

  // Check if user attended the event
  const userTicket = await User.findOne({
    _id: userId,
    "eventsToAttend.event": eventId,
    "eventsToAttend.attendanceStatus": "attended",
  });

  if (!userTicket) {
    return next(
      new ErrorHandler(
        "You can only rate organizers for events you attended",
        400
      )
    );
  }

  // Check if user already rated this organizer for this event
  const existingRating = event.organizerRatings.find(
    (rating) => rating.userId.toString() === userId.toString()
  );

  if (existingRating) {
    return next(
      new ErrorHandler(
        "You have already rated this organizer for this event",
        400
      )
    );
  }

  // Add rating
  event.organizerRatings.push({
    userId,
    rating,
    comment,
  });

  await event.save();

  // Update organizer stats
  const organizer = await User.findById(event.createdBy);
  if (organizer) {
    await organizer.updateOrganizerStats();
  }

  // Update user's ticket to mark as rated
  await User.updateOne(
    {
      _id: userId,
      "eventsToAttend.event": eventId,
    },
    {
      $set: {
        "eventsToAttend.$.organizerRated": true,
        "eventsToAttend.$.organizerRating": rating,
        "eventsToAttend.$.organizerComment": comment,
      },
    }
  );

  res.status(200).json({
    success: true,
    message: "Organizer rated successfully",
    rating: {
      rating,
      comment,
      event: event.title,
      organizer: organizer.name,
    },
  });
});

// Add this function to get organizer ratings
export const getOrganizerRatings = catchAsyncError(async (req, res, next) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId)
    .populate("organizerRatings.userId", "name")
    .select("organizerRatings title");

  if (!event) {
    return next(new ErrorHandler("Event not found", 404));
  }

  const ratings = event.organizerRatings.map((rating) => ({
    _id: rating._id,
    user: {
      _id: rating.userId._id,
      name: rating.userId.name,
    },
    rating: rating.rating,
    comment: rating.comment,
    createdAt: rating.createdAt,
  }));

  const averageRating = event.averageOrganizerRating;
  const totalRatings = event.organizerRatings.length;

  res.status(200).json({
    success: true,
    message: "Organizer ratings fetched successfully",
    ratings,
    summary: {
      averageRating,
      totalRatings,
      eventTitle: event.title,
    },
  });
});

// Add this function to get organizer profile with stats
export const getOrganizerProfile = catchAsyncError(async (req, res, next) => {
  const { organizerId } = req.params;

  const organizer = await User.findById(organizerId).select(
    "name email organizerStats"
  );
  if (!organizer) {
    return next(new ErrorHandler("Organizer not found", 404));
  }

  // Get organizer's events
  const organizedEvents = await Event.find({
    createdBy: organizerId,
    status: "approved",
  }).select("title date attendees organizerRatings");

  res.status(200).json({
    success: true,
    message: "Organizer profile fetched successfully",
    organizer: {
      _id: organizer._id,
      name: organizer.name,
      email: organizer.email,
      stats: organizer.organizerStats,
      totalEvents: organizedEvents.length,
      recentEvents: organizedEvents
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map((event) => ({
          _id: event._id,
          title: event.title,
          date: event.date,
          attendees: event.attendees.length,
          averageRating: event.averageOrganizerRating,
        })),
    },
  });
});

// Helper function to get seat price
function getSeatPrice(event, seatType) {
  if (!event.seatConfig || !seatType) return event.basePrice || 0;

  return event.seatConfig[seatType]?.price || event.basePrice || 0;
}

const sendVenueCheckInNotification = async (
  user,
  event,
  distance,
  notificationNumber,
  maxNotifications
) => {
  try {
    const subject = `📍 Check-In Reminder ${notificationNumber}/${maxNotifications} for "${event.title}"`;
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${
          notificationNumber === maxNotifications ? "#ef4444" : "#3b82f6"
        };">Check-In Reminder ${notificationNumber}/${maxNotifications}</h2>
        <p>Hello ${user.name},</p>
        <p>You're within <strong>${Math.round(
          distance
        )} meters</strong> of <strong>"${event.title}"</strong>.</p>

        ${
          notificationNumber === maxNotifications
            ? `<div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h4 style="margin: 0 0 10px 0; color: #dc2626;">Final Reminder - Automatic Check-In!</h4>
            <p>This is your final reminder. Since you're at the venue but haven't checked in manually,
            we'll automatically check you in to the event now.</p>
          </div>`
            : `<p>This is reminder <strong>${notificationNumber} of ${maxNotifications}</strong>. Please check in through the app.</p>
          <p><em>Next reminder in 1 minute if you don't check in manually.</em></p>`
        }

        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">Event Details:</h3>
          <p><strong>Event:</strong> ${event.title}</p>
          <p><strong>When:</strong> ${new Date(
            event.date
          ).toLocaleDateString()} | ${event.startTime} - ${event.endTime}</p>
          <p><strong>Where:</strong> ${event.location}</p>
          <p><strong>Your Distance:</strong> ${Math.round(
            distance
          )} meters away</p>
        </div>

        ${
          notificationNumber < maxNotifications
            ? `<div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #047857;">How to Check In:</h4>
            <p>1. Open the Hamro Event app</p>
            <p>2. Go to "My Events" or "Check-In" section</p>
            <p>3. Tap "Check In Now" for this event</p>
            <p>4. Show your QR code if required</p>
          </div>`
            : `<div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #92400e;">Automatic Check-In Completed</h4>
            <p>You have been automatically checked in to the event. Enjoy!</p>
          </div>`
        }

        <p>Best regards,<br>Hamro Event Team</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject,
      message,
    });

    console.log(
      `📧 Venue check-in notification ${notificationNumber} sent to ${user.email}`
    );
  } catch (error) {
    console.error("Error sending venue check-in notification:", error);
  }
};

// Email confirmation for automatic check-in
const sendAutomaticCheckInConfirmationEmail = async (user, event) => {
  try {
    const subject = `✅ Automatically Checked In to "${event.title}"`;
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Automatic Check-In Completed! 🎉</h2>
        <p>Hello ${user.name},</p>
        <p>We noticed you were at the venue but didn't check in manually, so we've automatically checked you in to <strong>"${
          event.title
        }"</strong>.</p>

        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Event Details:</h3>
          <p><strong>Event:</strong> ${event.title}</p>
          <p><strong>Date & Time:</strong> ${new Date(
            event.date
          ).toLocaleDateString()} | ${event.startTime}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Check-in Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Check-in Type:</strong> Automatic (after 3 reminders)</p>
        </div>

        <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #92400e;">Note:</h4>
          <p>You received 3 check-in reminders before we automatically checked you in. You can always check in manually in the future to avoid automatic check-ins.</p>
        </div>

        <p>We hope you have a great time at the event!</p>
        <p>Best regards,<br>Hamro Event Team</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject,
      message,
    });

    console.log(`📧 Automatic check-in confirmation sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending automatic check-in confirmation:", error);
  }
};

// Helper function to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Email notification for when user is nearby (500m)
const sendNearbyEventNotification = async (user, event, distance) => {
  try {
    const subject = `📍 You're Near "${event.title}"`;
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">You're Getting Close to the Event!</h2>
        <p>Hello ${user.name},</p>
        <p>Great news! You're within <strong>${Math.round(
          distance
        )} meters</strong> of <strong>"${event.title}"</strong>.</p>
        <p>You're in the vicinity of the event venue. As you get closer (within 100 meters), you'll be able to check in.</p>

        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">Event Details:</h3>
          <p><strong>Event:</strong> ${event.title}</p>
          <p><strong>When:</strong> ${new Date(
            event.date
          ).toLocaleDateString()} | ${event.startTime} - ${event.endTime}</p>
          <p><strong>Where:</strong> ${event.location}</p>
          <p><strong>Your Distance:</strong> ${Math.round(
            distance
          )} meters away</p>
        </div>

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #92400e;">Next Steps:</h4>
          <p>• Continue towards the venue</p>
          <p>• Check in when you're within 100 meters</p>
          <p>• Have your ticket ready</p>
        </div>

        <p>We look forward to seeing you at the event!</p>
        <p>Best regards,<br>Hamro Event Team</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject,
      message,
    });

    console.log(`📧 Nearby event notification sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending nearby event notification:", error);
  }
};

// Email notification for when user enters venue (100m)
const sendVenueEntryNotification = async (user, event, distance) => {
  try {
    const subject = `🎉 You've Arrived at "${event.title}" - Ready to Check In!`;
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Welcome to the Event Venue! 🎉</h2>
        <p>Hello ${user.name},</p>
        <p>Perfect! You're now within <strong>${Math.round(
          distance
        )} meters</strong> of <strong>"${
      event.title
    }"</strong> and have entered the event venue.</p>
        <p>You can now check in to the event through the app.</p>

        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #047857;">Event Details:</h3>
          <p><strong>Event:</strong> ${event.title}</p>
          <p><strong>When:</strong> ${new Date(
            event.date
          ).toLocaleDateString()} | ${event.startTime} - ${event.endTime}</p>
          <p><strong>Where:</strong> ${event.location}</p>
          <p><strong>Your Location:</strong> At the venue (${Math.round(
            distance
          )}m from center)</p>
        </div>

        <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #1e40af;">Check-In Instructions:</h4>
          <p>1. Open the Hamro Event app</p>
          <p>2. Go to the "Check-In" section</p>
          <p>3. Tap "Check In Now" for "${event.title}"</p>
          <p>4. Show your QR code if required</p>
        </div>

        <p style="text-align: center;">
          <strong>Enjoy the event! 🎊</strong>
        </p>

        <p>Best regards,<br>Hamro Event Team</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject,
      message,
    });

    console.log(`📧 Venue entry notification sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending venue entry notification:", error);
  }
};

// Email confirmation after manual check-in
const sendCheckInConfirmationEmail = async (user, event) => {
  try {
    const subject = `✅ Successfully Checked In to "${event.title}"`;
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Check-In Confirmed! 🎉</h2>
        <p>Hello ${user.name},</p>
        <p>You have successfully checked in to <strong>"${
          event.title
        }"</strong>.</p>
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Event Details:</h3>
          <p><strong>Event:</strong> ${event.title}</p>
          <p><strong>Date & Time:</strong> ${new Date(
            event.date
          ).toLocaleDateString()} | ${event.startTime}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Check-in Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Check-in Type:</strong> Manual</p>
        </div>
        <p>We hope you have a great time at the event!</p>
        <p>Best regards,<br>Hamro Event Team</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject,
      message,
    });

    console.log(`📧 Check-in confirmation sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending check-in confirmation:", error);
  }
};

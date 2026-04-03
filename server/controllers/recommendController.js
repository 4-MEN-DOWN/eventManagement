import { User } from "../models/userModel.js";
import { Event } from "../models/eventModel.js";

export const getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Find the target user with populated events
    const targetUser = await User.findById(userId)
      .populate("eventToOrganize")
      .populate("myEventWatchlist")
      .populate({
        path: "eventsToAttend.event",
        select: "_id title category status isActive createdBy",
      });

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Extract event IDs ONLY from tickets in eventsToAttend (paid events)
    const targetEventIds = targetUser.eventsToAttend
      .map((ticket) => ticket.event?._id?.toString())
      .filter((id) => id); // Remove undefined/null values

    console.log("Target User:", targetUser.name);
    console.log("Target User's Paid Events:", targetEventIds);

    // 2. Get all other users with populated events
    const otherUsers = await User.find({ _id: { $ne: userId } }).populate({
      path: "eventsToAttend.event",
      select: "_id title category status isActive createdBy",
    });

    // 3. Collaborative Filtering - Find similar users based on PAID event overlap
    let collabIds = [];
    const similarUsers = otherUsers.filter((user) => {
      // Get event IDs ONLY from this user's paid tickets
      const userEventIds = user.eventsToAttend
        .map((ticket) => ticket.event?._id?.toString())
        .filter((id) => id);

      // Calculate overlap with target user's PAID events only
      const overlap = userEventIds.filter((eventId) =>
        targetEventIds.includes(eventId)
      ).length;

      if (overlap > 0) {
        console.log(
          `Similar user found: ${user.name} with ${overlap} overlapping event(s)`
        );
      }

      return overlap > 0;
    });

    console.log("Similar users count:", similarUsers.length);

    if (similarUsers.length > 0) {
      // Collect events ONLY from similar users' paid events that target user hasn't paid for
      similarUsers.forEach((user) => {
        user.eventsToAttend.forEach((ticket) => {
          const eventId = ticket.event?._id?.toString();
          if (
            eventId &&
            !targetEventIds.includes(eventId) &&
            !collabIds.includes(eventId)
          ) {
            console.log(
              `Adding collaborative event: ${eventId} from user ${user.name}`
            );
            collabIds.push(eventId);
          }
        });
      });
    }

    console.log("Collaborative event IDs:", collabIds);

    // 4. Popular Events based on ticket purchases with popularity metrics
    let fallbackIds = [];

    // Count event popularity based on PAID tickets only
    const eventFrequency = {};

    otherUsers.forEach((user) => {
      // Count ONLY from eventsToAttend (paid tickets)
      user.eventsToAttend.forEach((ticket) => {
        const eventId = ticket.event?._id?.toString();
        if (eventId && !targetEventIds.includes(eventId)) {
          eventFrequency[eventId] = (eventFrequency[eventId] || 0) + 1;
        }
      });
    });

    // Get event IDs that have at least one attendee
    const popularEventIds = Object.keys(eventFrequency);

    console.log("Popular event IDs with attendees:", popularEventIds);

    // Fetch events with full details to calculate popularity scores
    if (popularEventIds.length > 0) {
      const popularEvents = await Event.find({
        _id: { $in: popularEventIds },
        status: "approved",
        isActive: true,
        bookedSeats: { $gt: 0 }, // Ensure at least one booked seat
      });

      // Calculate popularity score: (bookedSeats / totalSeats) * attendeeCount
      const eventsWithScores = popularEvents.map((event) => {
        const attendeeCount = eventFrequency[event._id.toString()] || 0;
        const occupancyRate =
          event.totalSeats > 0 ? event.bookedSeats / event.totalSeats : 0;
        const popularityScore = occupancyRate * attendeeCount;

        return {
          eventId: event._id.toString(),
          attendeeCount,
          bookedSeats: event.bookedSeats,
          totalSeats: event.totalSeats,
          occupancyRate,
          popularityScore,
        };
      });

      // Sort by popularity score (descending) and then by attendee count
      eventsWithScores.sort((a, b) => {
        if (b.popularityScore !== a.popularityScore) {
          return b.popularityScore - a.popularityScore;
        }
        return b.attendeeCount - a.attendeeCount;
      });

      // Get top 20 popular events
      fallbackIds = eventsWithScores.slice(0, 20).map((event) => event.eventId);

      console.log(
        "Fallback events with scores:",
        eventsWithScores.slice(0, 20)
      );
    }

    console.log("Fallback event IDs:", fallbackIds);

    // 5. Combine all recommendation sources and remove duplicates
    const allRecommendedIds = [...new Set([...collabIds, ...fallbackIds])];

    console.log("All recommended IDs:", allRecommendedIds);

    // 6. Fetch full event details with safety checks
    let collaborativeEvents = [];
    let fallbackEvents = [];

    if (allRecommendedIds.length > 0) {
      const recommendedEvents = await Event.find({
        _id: { $in: allRecommendedIds },
        status: "approved",
        isActive: true,
      })
        .populate("createdBy", "name email")
        .sort({ attendees: -1, createdAt: -1 });

      console.log(
        "Fetched recommended events count:",
        recommendedEvents.length
      );

      // Separate collaborative and fallback events
      collaborativeEvents = recommendedEvents.filter((event) =>
        collabIds.includes(event._id.toString())
      );

      // Sort fallback events by popularity score
      const fallbackEventsUnsorted = recommendedEvents.filter((event) =>
        fallbackIds.includes(event._id.toString())
      );

      // Maintain the order from fallbackIds (already sorted by popularity)
      fallbackEvents = fallbackIds
        .map((id) =>
          fallbackEventsUnsorted.find((e) => e._id.toString() === id)
        )
        .filter((event) => event); // Remove any undefined values
    }

    // 7. Final fallback - if no recommendations, get some random approved events with attendees
    if (collaborativeEvents.length === 0 && fallbackEvents.length === 0) {
      const randomEvents = await Event.find({
        status: "approved",
        isActive: true,
        bookedSeats: { $gt: 0 }, // At least one booked seat
        _id: { $nin: targetEventIds },
      })
        .populate("createdBy", "name email")
        .sort({ bookedSeats: -1, createdAt: -1 }) // Sort by popularity
        .limit(6);

      fallbackEvents = randomEvents;
      console.log("Using random popular events as final fallback");
    }

    // Limit the number of recommendations
    collaborativeEvents = collaborativeEvents.slice(0, 6);
    fallbackEvents = fallbackEvents.slice(0, 6);

    console.log(
      "Final collaborative events count:",
      collaborativeEvents.length
    );
    console.log("Final fallback events count:", fallbackEvents.length);

    res.json({
      success: true,
      collaborative: collaborativeEvents,
      fallback: fallbackEvents,
      stats: {
        similarUsers: similarUsers.length,
        collaborativeEvents: collaborativeEvents.length,
        fallbackEvents: fallbackEvents.length,
        userPaidEventCount: targetEventIds.length,
      },
    });
  } catch (error) {
    console.error("Error in getRecommendations:", error);

    // Emergency fallback - return some approved events with attendees
    try {
      const fallbackEvents = await Event.find({
        status: "approved",
        isActive: true,
        bookedSeats: { $gt: 0 }, // At least one booked seat
      })
        .populate("createdBy", "name email")
        .sort({ bookedSeats: -1, createdAt: -1 })
        .limit(6);

      res.json({
        success: false,
        collaborative: [],
        fallback: fallbackEvents,
        error: "Using fallback recommendations due to server error",
      });
    } catch (fallbackError) {
      res.status(500).json({
        error: "Server error",
        details: error.message,
      });
    }
  }
};

// Additional endpoint for similar events based on a specific event
export const getSimilarEvents = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Return similar events regardless of attendee count
    const similarEvents = await Event.find({
      _id: { $ne: eventId },
      category: event.category,
      status: "approved",
      isActive: true,
    })
      .populate("createdBy", "name email")
      .sort({ bookedSeats: -1, createdAt: -1 }) // Sort by popularity, then recency
      .limit(4);

    res.json({
      success: true,
      similarEvents,
      baseEvent: {
        title: event.title,
        category: event.category,
      },
    });
  } catch (error) {
    console.error("Error in getSimilarEvents:", error);
    res.status(500).json({ error: "Server error" });
  }
};

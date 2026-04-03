import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  sentimentScore: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const attendeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  attended: {
    type: Boolean,
    default: false,
  },
  seatType: {
    type: String,
    enum: ["front", "middle", "last"],
  },
  seatNumber: {
    type: String,
  },
  ticketId: {
    type: String,
  },
  finalPrice: {
    type: Number,
  },
  checkInTime: {
    type: Date,
  },
});

const attendanceLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  ticketId: String,
  time: Date,
  checkInType: String,
});

const organizerRatingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      enum: ["technology", "music", "food", "arts", "business", "wellness"],
    },
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: 0,
    },
    seatConfig: {
      front: {
        count: { type: Number, required: true, min: 0 },
        price: { type: Number, required: true, min: 0 },
        available: { type: Number, required: true, min: 0 },
        booked: { type: Number, default: 0, min: 0 },
      },
      middle: {
        count: { type: Number, required: true, min: 0 },
        price: { type: Number, required: true, min: 0 },
        available: { type: Number, required: true, min: 0 },
        booked: { type: Number, default: 0, min: 0 },
      },
      last: {
        count: { type: Number, required: true, min: 0 },
        price: { type: Number, required: true, min: 0 },
        available: { type: Number, required: true, min: 0 },
        booked: { type: Number, default: 0, min: 0 },
      },
    },
    banner: {
      type: String,
      required: [true, "Event banner is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    bookedSeats: {
      type: Number,
      default: 0,
      min: 0,
    },
    attendees: [attendeeSchema],
    comments: [commentSchema],
    attendanceLogs: [attendanceLogSchema],
    organizerRatings: [organizerRatingSchema],
    summarySent: {
      type: Boolean,
      default: false,
    },
    summarySentAt: Date,
  },
  { timestamps: true }
);

// Calculate total seats and available seats before saving
eventSchema.pre("save", function (next) {
  if (this.seatConfig) {
    this.totalSeats =
      this.seatConfig.front.count +
      this.seatConfig.middle.count +
      this.seatConfig.last.count;

    this.availableSeats =
      this.seatConfig.front.available +
      this.seatConfig.middle.available +
      this.seatConfig.last.available;

    this.bookedSeats =
      this.seatConfig.front.booked +
      this.seatConfig.middle.booked +
      this.seatConfig.last.booked;
  }
  next();
});

// Virtual for average organizer rating
eventSchema.virtual("averageOrganizerRating").get(function () {
  if (!this.organizerRatings || this.organizerRatings.length === 0) {
    return 0;
  }
  const sum = this.organizerRatings.reduce(
    (total, rating) => total + rating.rating,
    0
  );
  return (sum / this.organizerRatings.length).toFixed(1);
});

// Virtual for total revenue
eventSchema.virtual("totalRevenue").get(function () {
  if (!this.attendees || this.attendees.length === 0) {
    return 0;
  }
  return this.attendees.reduce(
    (total, attendee) => total + (attendee.finalPrice || 0),
    0
  );
});

// Virtual for attendance rate
eventSchema.virtual("attendanceRate").get(function () {
  if (!this.attendees || this.attendees.length === 0) {
    return 0;
  }
  const attended = this.attendees.filter((a) => a.attended).length;
  return ((attended / this.attendees.length) * 100).toFixed(1);
});

// Method to check if event is completed
eventSchema.methods.isCompleted = function () {
  const eventEnd = new Date(this.date);
  const [endHour, endMinute] = this.endTime.split(":").map(Number);
  eventEnd.setHours(endHour, endMinute);
  return new Date() > eventEnd;
};

// Method to calculate sentiment statistics
eventSchema.methods.getSentimentStats = function () {
  const comments = this.comments || [];
  const positive = comments.filter((c) => c.sentimentScore > 0).length;
  const negative = comments.filter((c) => c.sentimentScore < 0).length;
  const neutral = comments.filter((c) => c.sentimentScore === 0).length;

  return {
    positive,
    negative,
    neutral,
    total: comments.length,
    positivePercentage: comments.length
      ? ((positive / comments.length) * 100).toFixed(1)
      : 0,
  };
};

export const Event = mongoose.model("Event", eventSchema);

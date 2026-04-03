import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: function () {
        // Event ID is required only for event-specific messages, not admin conversations
        return this.messageType === "event";
      },
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    messageType: {
      type: String,
      enum: ["event", "admin"], // 'event' for event-specific messages, 'admin' for admin inquiries
      default: "event",
    },
    // Additional fields for admin conversations
    subject: {
      type: String,
      required: function () {
        return this.messageType === "admin";
      },
    },
    relatedEntity: {
      type: String,
      enum: ["event", "ad", "general"],
      default: "general",
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      // No ref since it can reference different collections
    },
  },
  { timestamps: true },
);

// Index for better query performance
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ eventId: 1 });
messageSchema.index({ messageType: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ isRead: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;

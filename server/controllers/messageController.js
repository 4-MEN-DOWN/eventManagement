import Message from "../models/Message.js";

// @desc Get all messages for a conversation
// @route GET /api/messages/:eventId/:organizerId
// @access Private
export const getMessages = async (req, res) => {
  try {
    const { eventId, organizerId } = req.params;

    const messages = await Message.find({
      eventId,
      $or: [
        { sender: req.user.id, receiver: organizerId },
        { sender: organizerId, receiver: req.user.id },
      ],
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Send a new message
// @route POST /api/messages
// @access Private
export const sendMessage = async (req, res) => {
  try {
    const { eventId, receiver, content } = req.body;

    const message = new Message({
      eventId,
      sender: req.user.id,
      receiver,
      content,
    });

    const savedMessage = await message.save();
    const populatedMessage = await Message.findById(savedMessage._id).populate(
      "sender",
      "name email",
    );

    // Emit socket event for real-time messaging
    req.app.get("io").to(receiver).emit("newMessage", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Mark messages as read
// @route PATCH /api/messages/read/:eventId/:organizerId
// @access Private
export const markMessagesAsRead = async (req, res) => {
  try {
    const { eventId, organizerId } = req.params;

    await Message.updateMany(
      {
        eventId,
        sender: organizerId,
        receiver: req.user.id,
        isRead: false,
      },
      { $set: { isRead: true } },
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all messages for a user across all events
// @route GET /api/messages/user
// @access Private
export const getUserMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all messages for a specific event
// @route GET /api/messages/event/:eventId
// @access Private
export const getEventMessages = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const messages = await Message.find({
      eventId,
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all messages for the current user
// @route GET /api/messages/user/all
// @access Private
export const getAllUserMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

// Base API URL
const API_URL = "http://localhost:5000/api/messages";

// Async thunks for message operations
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ eventId, organizerId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${eventId}/${organizerId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async ({ eventId, receiver, content }, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          eventId,
          receiver,
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  "messages/markAsRead",
  async ({ eventId, organizerId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/read/${eventId}/${organizerId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark messages as read");
      }

      return { eventId, organizerId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  "messages/getUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/unread/count`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get unread count");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get all messages for the current user
export const getAllUserMessages = createAsyncThunk(
  "messages/getAllUserMessages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/user/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get user messages");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const syncMessagesFromServer = createAsyncThunk(
  "messages/syncMessagesFromServer",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Get all messages for the user
      const response = await fetch("/api/messages/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user messages");
      }

      const messages = await response.json();

      // Group messages by conversation
      const conversations = {};

      messages.forEach((message) => {
        const conversationKey = `${message.eventId}-${
          message.sender._id === user._id
            ? message.receiver._id
            : message.sender._id
        }`;

        if (!conversations[conversationKey]) {
          conversations[conversationKey] = [];
        }

        conversations[conversationKey].push(message);
      });

      // Update state with all conversations
      dispatch(
        hydrateMessages({
          conversations,
          unreadCount: messages.filter(
            (m) => m.receiver === user._id && !m.isRead
          ).length,
        })
      );

      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// Initial state
const initialState = {
  conversations: {},
  activeConversation: null,
  unreadCount: 0,
  loading: false,
  error: null,
  socket: null,
};

// Message slice
const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    clearActiveConversation: (state) => {
      state.activeConversation = null;
    },
    // In messageSlice.js, update the addMessage reducer:
    addMessage: (state, action) => {
      const { eventId, sender, receiver } = action.payload;
      const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;

      // Determine the conversation key consistently
      // For organizer: eventId-organizerId (where organizerId is the organizer's ID)
      // For user: eventId-organizerId (where organizerId is the organizer's ID)
      const otherParticipantId =
        sender._id === currentUserId ? receiver : sender._id;
      const conversationKey = `${eventId}-${otherParticipantId}`;

      if (!state.conversations[conversationKey]) {
        state.conversations[conversationKey] = [];
      }

      // Check if message already exists to avoid duplicates
      const messageExists = state.conversations[conversationKey].some(
        (msg) => msg._id === action.payload._id
      );

      if (!messageExists) {
        state.conversations[conversationKey].push(action.payload);

        // Sort messages by timestamp
        state.conversations[conversationKey].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      }

      // If this is a new message from someone else, increment unread count
      if (sender._id !== currentUserId && !action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    clearMessages: (state) => {
      state.conversations = {};
      state.activeConversation = null;
      state.unreadCount = 0;
    },
    decrementUnreadCount: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    // New action to hydrate state with all messages
    hydrateMessages: (state, action) => {
      const messages = action.payload;

      // Group messages by conversation
      const conversations = {};
      let unreadCount = 0;

      messages.forEach((message) => {
        const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;
        const otherParticipantId =
          message.sender._id === currentUserId
            ? message.receiver
            : message.sender._id;

        const conversationKey = `${message.eventId}-${otherParticipantId}`;

        if (!conversations[conversationKey]) {
          conversations[conversationKey] = [];
        }

        // Check if message already exists to avoid duplicates
        const messageExists = conversations[conversationKey].some(
          (msg) => msg._id === message._id
        );

        if (!messageExists) {
          conversations[conversationKey].push(message);
        }

        // Count unread messages
        if (message.receiver === currentUserId && !message.isRead) {
          unreadCount += 1;
        }
      });

      // Sort each conversation's messages by timestamp
      Object.keys(conversations).forEach((key) => {
        conversations[key].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      });

      state.conversations = conversations;
      state.unreadCount = unreadCount;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { eventId, organizerId } = action.meta.arg;
        const conversationKey = `${eventId}-${organizerId}`;
        state.conversations[conversationKey] = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error("Failed to load messages");
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const { eventId, sender, receiver } = action.payload;
        const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;
        const otherParticipantId =
          sender._id === currentUserId ? receiver : sender._id;
        const conversationKey = `${eventId}-${otherParticipantId}`;

        if (!state.conversations[conversationKey]) {
          state.conversations[conversationKey] = [];
        }

        state.conversations[conversationKey].push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error("Failed to send message");
      })
      // Mark messages as read
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { eventId, organizerId } = action.payload;
        const conversationKey = `${eventId}-${organizerId}`;

        if (state.conversations[conversationKey]) {
          state.conversations[conversationKey] = state.conversations[
            conversationKey
          ].map((message) => ({
            ...message,
            isRead: true,
          }));

          // Recalculate unread count
          state.unreadCount = Object.values(state.conversations).reduce(
            (count, messages) =>
              count +
              messages.filter(
                (m) =>
                  !m.isRead &&
                  m.receiver === JSON.parse(localStorage.getItem("user"))?._id
              ).length,
            0
          );
        }
      })
      // Get unread count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count;
      })
      // Get all user messages
      .addCase(getAllUserMessages.fulfilled, (state, action) => {
        const messages = action.payload;

        // Group messages by conversation
        const conversations = {};
        let unreadCount = 0;
        const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;

        messages.forEach((message) => {
          const otherParticipantId =
            message.sender._id === currentUserId
              ? message.receiver
              : message.sender._id;

          const conversationKey = `${message.eventId}-${otherParticipantId}`;

          if (!conversations[conversationKey]) {
            conversations[conversationKey] = [];
          }

          conversations[conversationKey].push(message);

          // Count unread messages
          if (message.receiver === currentUserId && !message.isRead) {
            unreadCount += 1;
          }
        });

        // Sort each conversation's messages by timestamp
        Object.keys(conversations).forEach((key) => {
          conversations[key].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        });

        state.conversations = conversations;
        state.unreadCount = unreadCount;
      });
  },
});

export const {
  setActiveConversation,
  clearActiveConversation,
  addMessage,
  clearMessages,
  decrementUnreadCount,
  setLoading,
  setError,
  setSocket,
  hydrateMessages,
} = messageSlice.actions;

export default messageSlice.reducer;

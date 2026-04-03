import { io } from "socket.io-client";
import { store } from "../redux/store";
import { addMessage } from "../redux/slices/messageSlice";

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(user) {
    if (this.socket && this.isConnected) return this.socket;

    try {
      const SOCKET_URL =
        import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      this.socket.on("connect", () => {
        console.log("Socket connected");
        this.isConnected = true;

        // Join user's room
        if (user && user._id) {
          this.socket.emit("join", user._id);
        }
      });

      this.socket.on("disconnect", () => {
        console.log("Socket disconnected");
        this.isConnected = false;
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        this.isConnected = false;
      });

      // Listen for new messages
      this.socket.on("newMessage", (message) => {
        store.dispatch(addMessage(message));
      });

      return this.socket;
    } catch (error) {
      console.error("Failed to initialize socket:", error);
      return null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.isConnected;
  }

  // Helper method to emit events
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }
}

// Create a singleton instance
export const socketManager = new SocketManager();

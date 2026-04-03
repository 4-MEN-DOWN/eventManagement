// // import { io } from "socket.io-client";

// // const SOCKET_URL = "http://localhost:5000";

// // let socket;

// // export const initializeSocket = (user) => {
// //   console.log(user);
// //   if (!socket && user) {
// //     socket = io(SOCKET_URL);
// //     socket.emit("join", user._id);
// //   }
// //   return socket;
// // };

// // export const getSocket = () => {
// //   return socket;
// // };

// // export const disconnectSocket = () => {
// //   if (socket) {
// //     socket.disconnect();
// //     socket = null;
// //   }
// // };
// import { io } from "socket.io-client";

// const SOCKET_URL = "http://localhost:5000";

// let socket;

// export const initializeSocket = (user) => {
//   console.log(user);
//   if (!socket && user) {
//     socket = io(SOCKET_URL);
//     socket.emit("join", user._id);
//   }
//   return socket;
// };

// export const getSocket = () => {
//   return socket;
// };

// export const disconnectSocket = () => {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//   }
// };
import { io } from "socket.io-client";

// Use environment variable for flexibility (development vs production)
const SOCKET_URL =
  process.env.REACT_APP_BACKEND_URL ||
  process.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

let socket = null;

export const initializeSocket = (user) => {
  if (!user?._id) {
    console.warn("Cannot initialize socket: No user ID provided");
    return null;
  }

  // If socket already exists and is connected, just re-join
  if (socket && socket.connected) {
    socket.emit("join", user._id);
    console.log(`Re-using existing socket for user: ${user._id}`);
    return socket;
  }

  // Create new socket connection
  socket = io(SOCKET_URL, {
    withCredentials: true, // Important for cookies/auth
    transports: ["websocket", "polling"], // Try websocket first
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  console.log(`Connecting to Socket.IO server: ${SOCKET_URL}`);

  // Connection events for better debugging
  socket.on("connect", () => {
    console.log(`✅ Socket connected successfully! ID: ${socket.id}`);
    socket.emit("join", user._id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected. Reason: ${reason}`);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log("Socket disconnected manually");
    socket = null;
  }
};

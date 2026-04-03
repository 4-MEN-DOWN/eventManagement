// // import { useState, useEffect, useRef } from "react";
// // import { X, Send, User } from "lucide-react";
// // import { useSelector, useDispatch } from "react-redux";
// // import {
// //   fetchMessages,
// //   sendMessage,
// //   markMessagesAsRead,
// //   addMessage,
// //   setActiveConversation,
// // } from "../redux/slices/messageSlice";
// // import { socketManager } from "../utils/socketManager";

// // export function MessageDialog({ organizer, event, isOpen, onClose }) {
// //   const [newMessage, setNewMessage] = useState("");
// //   const messagesEndRef = useRef(null);

// //   const dispatch = useDispatch();
// //   const { conversations, activeConversation, loading } = useSelector(
// //     (state) => state.messages
// //   );
// //   const user = useSelector((state) => state.auth.user);

// //   // Determine conversation key based on who is initiating the conversation
// //   const conversationKey =
// //     user._id === organizer._id
// //       ? `${event._id}-${organizer._id}` // Organizer viewing their own messages
// //       : `${event._id}-${organizer._id}`; // User messaging organizer

// //   const messages = conversations[conversationKey] || [];

// //   // In your MessageDialog component, update the useEffect
// //   useEffect(() => {
// //     if (isOpen && user) {
// //       // Initialize socket connection
// //       socketManager.connect(user);

// //       // Set active conversation
// //       dispatch(
// //         setActiveConversation({
// //           eventId: event._id,
// //           organizerId: organizer._id,
// //         })
// //       );

// //       // Fetch messages for this specific conversation
// //       dispatch(
// //         fetchMessages({
// //           eventId: event._id,
// //           organizerId: organizer._id,
// //         })
// //       );

// //       // Mark messages as read if user is the receiver
// //       if (user._id === organizer._id) {
// //         dispatch(
// //           markMessagesAsRead({
// //             eventId: event._id,
// //             organizerId: organizer._id,
// //           })
// //         );
// //       }
// //     }

// //     return () => {
// //       // Clean up socket listeners when dialog closes
// //       const socket = socketManager.getSocket();
// //       if (socket) {
// //         socket.off("newMessage");
// //       }
// //     };
// //   }, [isOpen, event._id, organizer._id, dispatch, user]);

// //   useEffect(() => {
// //     scrollToBottom();
// //   }, [messages]);

// //   const handleSendMessage = () => {
// //     if (!newMessage.trim()) return;

// //     // Determine receiver - if user is organizer, send to message sender
// //     // Otherwise, send to organizer
// //     const receiver =
// //       user._id === organizer._id
// //         ? messages[0]?.sender._id // Organizer responding to the original sender
// //         : organizer._id; // User messaging organizer

// //     dispatch(
// //       sendMessage({
// //         eventId: event._id,
// //         receiver,
// //         content: newMessage,
// //       })
// //     );

// //     setNewMessage("");
// //   };

// //   const scrollToBottom = () => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
// //   };

// //   const handleKeyPress = (e) => {
// //     if (e.key === "Enter" && !e.shiftKey) {
// //       e.preventDefault();
// //       handleSendMessage();
// //     }
// //   };

// //   if (!isOpen) return null;

// //   return (
// //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
// //       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-96 flex flex-col">
// //         {/* Header */}
// //         <div className="flex items-center justify-between p-4 border-b border-slate-200">
// //           <div className="flex items-center gap-3">
// //             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
// //               <User className="w-5 h-5 text-blue-600" />
// //             </div>
// //             <div>
// //               <h3 className="font-semibold text-slate-800">
// //                 {user._id === organizer._id
// //                   ? "Conversation"
// //                   : "Message Organizer"}
// //               </h3>
// //               <p className="text-sm text-slate-600">
// //                 {user._id === organizer._id
// //                   ? messages[0]?.sender.name
// //                   : organizer.name}
// //               </p>
// //             </div>
// //           </div>
// //           <button
// //             onClick={onClose}
// //             className="p-2 rounded-full hover:bg-slate-100 transition-colors"
// //           >
// //             <X className="w-5 h-5 text-slate-600" />
// //           </button>
// //         </div>

// //         {/* Messages */}
// //         <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
// //           {loading ? (
// //             <div className="flex items-center justify-center h-full">
// //               <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
// //             </div>
// //           ) : messages.length === 0 ? (
// //             <div className="text-center text-slate-500 mt-16">
// //               <p>No messages yet</p>
// //               <p className="text-sm mt-2">Start a conversation</p>
// //             </div>
// //           ) : (
// //             <div className="space-y-3">
// //               {messages.map((message) => (
// //                 <div
// //                   key={message._id || message.tempId}
// //                   className={`flex ${
// //                     message.sender._id === user._id
// //                       ? "justify-end"
// //                       : "justify-start"
// //                   }`}
// //                 >
// //                   <div
// //                     className={`max-w-xs p-3 rounded-2xl ${
// //                       message.sender._id === user._id
// //                         ? "bg-blue-500 text-white"
// //                         : "bg-white text-slate-800 border border-slate-200"
// //                     }`}
// //                   >
// //                     <p className="text-sm">{message.content}</p>
// //                     <p
// //                       className={`text-xs mt-1 ${
// //                         message.sender._id === user._id
// //                           ? "text-blue-100"
// //                           : "text-slate-500"
// //                       }`}
// //                     >
// //                       {new Date(message.createdAt).toLocaleTimeString([], {
// //                         hour: "2-digit",
// //                         minute: "2-digit",
// //                       })}
// //                     </p>
// //                   </div>
// //                 </div>
// //               ))}
// //               <div ref={messagesEndRef} />
// //             </div>
// //           )}
// //         </div>

// //         {/* Input */}
// //         <div className="p-4 border-t border-slate-200">
// //           <div className="flex gap-2">
// //             <textarea
// //               value={newMessage}
// //               onChange={(e) => setNewMessage(e.target.value)}
// //               onKeyPress={handleKeyPress}
// //               placeholder="Type your message..."
// //               className="flex-1 p-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
// //               rows="1"
// //             />
// //             <button
// //               onClick={handleSendMessage}
// //               disabled={!newMessage.trim() || loading}
// //               className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
// //             >
// //               <Send className="w-4 h-4" />
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// import { useState, useEffect, useRef } from "react";
// import { X, Send, User } from "lucide-react";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   fetchMessages,
//   sendMessage,
//   markMessagesAsRead,
//   addMessage,
//   setActiveConversation,
// } from "../redux/slices/messageSlice";
// import { socketManager } from "../utils/socketManager";

// export function MessageDialog({ organizer, event, isOpen, onClose }) {
//   const [newMessage, setNewMessage] = useState("");
//   const messagesEndRef = useRef(null);

//   const dispatch = useDispatch();
//   const { conversations, activeConversation, loading } = useSelector(
//     (state) => state.messages
//   );
//   const user = useSelector((state) => state.auth.user);

//   // Fixed conversation key logic - properly handle both user and organizer perspectives
//   const getConversationKey = () => {
//     if (!user || !organizer || !event) return null;

//     // For organizer viewing messages from users, use the event ID and organizer ID
//     // For user messaging organizer, use the event ID and organizer ID
//     // The key should be consistent regardless of who is viewing
//     return `${event._id}-${organizer._id}`;
//   };

//   const conversationKey = getConversationKey();
//   const messages = conversationKey ? conversations[conversationKey] || [] : [];

//   // Enhanced useEffect for socket and message management
//   useEffect(() => {
//     if (isOpen && user && organizer && event) {
//       console.log("Opening message dialog for:", {
//         user: user._id,
//         organizer: organizer._id,
//         event: event._id,
//         conversationKey,
//       });

//       // Initialize socket connection
//       socketManager.connect(user);

//       // Set active conversation
//       dispatch(
//         setActiveConversation({
//           eventId: event._id,
//           organizerId: organizer._id,
//         })
//       );

//       // Fetch messages for this specific conversation
//       dispatch(
//         fetchMessages({
//           eventId: event._id,
//           organizerId: organizer._id,
//         })
//       );

//       // Mark messages as read if user is the receiver
//       // For organizer: mark as read when they view messages from users
//       // For user: mark as read when they view organizer's replies
//       const shouldMarkAsRead =
//         user._id === organizer._id || // Organizer viewing user messages
//         user._id !== organizer._id; // User viewing organizer messages

//       if (shouldMarkAsRead) {
//         dispatch(
//           markMessagesAsRead({
//             eventId: event._id,
//             organizerId: organizer._id,
//           })
//         );
//       }

//       // Set up socket listener for new messages
//       const socket = socketManager.getSocket();
//       if (socket) {
//         const handleNewMessage = (message) => {
//           // Only add message if it belongs to current conversation
//           if (
//             message.eventId === event._id &&
//             (message.sender._id === organizer._id ||
//               message.receiver === organizer._id)
//           ) {
//             dispatch(addMessage(message));
//           }
//         };

//         socket.on("newMessage", handleNewMessage);

//         // Cleanup
//         return () => {
//           socket.off("newMessage", handleNewMessage);
//         };
//       }
//     }
//   }, [isOpen, event?._id, organizer?._id, dispatch, user]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleSendMessage = () => {
//     if (!newMessage.trim() || !user || !organizer || !event) return;

//     // Determine receiver - if user is organizer, send to the original message sender
//     // Otherwise, send to organizer
//     let receiver;

//     if (user._id === organizer._id) {
//       // Organizer is responding - find the original sender from messages
//       const originalSenderMessage = messages.find(
//         (msg) => msg.sender._id !== user._id
//       );
//       receiver = originalSenderMessage
//         ? originalSenderMessage.sender._id
//         : null;
//     } else {
//       // User is messaging the organizer
//       receiver = organizer._id;
//     }

//     if (!receiver) {
//       console.error("Could not determine message receiver");
//       return;
//     }

//     console.log("Sending message:", {
//       eventId: event._id,
//       receiver,
//       content: newMessage,
//       sender: user._id,
//     });

//     dispatch(
//       sendMessage({
//         eventId: event._id,
//         receiver,
//         content: newMessage,
//       })
//     );

//     setNewMessage("");
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   if (!isOpen) return null;

//   // Determine display names based on user role
//   const getDisplayName = () => {
//     if (user._id === organizer._id) {
//       // Organizer view - show user's name
//       const userMessage = messages.find((msg) => msg.sender._id !== user._id);
//       return userMessage ? userMessage.sender.name : "User";
//     } else {
//       // User view - show organizer's name
//       return organizer.name;
//     }
//   };

//   const getDialogTitle = () => {
//     if (user._id === organizer._id) {
//       return "Conversation";
//     } else {
//       return "Message Organizer";
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-96 flex flex-col">
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b border-slate-200">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
//               <User className="w-5 h-5 text-blue-600" />
//             </div>
//             <div>
//               <h3 className="font-semibold text-slate-800">
//                 {getDialogTitle()}
//               </h3>
//               <p className="text-sm text-slate-600">{getDisplayName()}</p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-full hover:bg-slate-100 transition-colors"
//           >
//             <X className="w-5 h-5 text-slate-600" />
//           </button>
//         </div>

//         {/* Messages */}
//         <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
//           {loading ? (
//             <div className="flex items-center justify-center h-full">
//               <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//             </div>
//           ) : messages.length === 0 ? (
//             <div className="text-center text-slate-500 mt-16">
//               <p>No messages yet</p>
//               <p className="text-sm mt-2">Start a conversation</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {messages.map((message) => (
//                 <div
//                   key={message._id || message.tempId}
//                   className={`flex ${
//                     message.sender._id === user._id
//                       ? "justify-end"
//                       : "justify-start"
//                   }`}
//                 >
//                   <div
//                     className={`max-w-xs p-3 rounded-2xl ${
//                       message.sender._id === user._id
//                         ? "bg-blue-500 text-white"
//                         : "bg-white text-slate-800 border border-slate-200"
//                     }`}
//                   >
//                     <p className="text-sm">{message.content}</p>
//                     <p
//                       className={`text-xs mt-1 ${
//                         message.sender._id === user._id
//                           ? "text-blue-100"
//                           : "text-slate-500"
//                       }`}
//                     >
//                       {new Date(message.createdAt).toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//               <div ref={messagesEndRef} />
//             </div>
//           )}
//         </div>

//         {/* Input */}
//         <div className="p-4 border-t border-slate-200">
//           <div className="flex gap-2">
//             <textarea
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Type your message..."
//               className="flex-1 p-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
//               rows="1"
//             />
//             <button
//               onClick={handleSendMessage}
//               disabled={!newMessage.trim() || loading}
//               className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <Send className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
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

import { useState, useEffect, useRef } from "react";
import { X, Send, User } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchMessages,
  sendMessage,
  markMessagesAsRead,
  addMessage,
  setActiveConversation,
} from "../redux/slices/messageSlice";
import { socketManager } from "../utils/socketManager";

export function MessageDialog({ organizer, event, isOpen, onClose }) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const dispatch = useDispatch();
  const { conversations, activeConversation, loading } = useSelector(
    (state) => state.messages
  );
  const user = useSelector((state) => state.auth.user);

  // Consistent conversation key logic - ALWAYS use eventId-organizerId
  const getConversationKey = () => {
    if (!user || !organizer || !event) return null;

    // The key should ALWAYS be eventId-organizerId regardless of who is viewing
    // This ensures consistency between navbar and event detail components
    return `${event._id}-${organizer._id}`;
  };

  const conversationKey = getConversationKey();
  const messages = conversationKey ? conversations[conversationKey] || [] : [];

  // Enhanced useEffect for socket and message management
  useEffect(() => {
    if (isOpen && user && organizer && event) {
      console.log("Opening message dialog for:", {
        user: user._id,
        organizer: organizer._id,
        event: event._id,
        conversationKey,
      });

      // Initialize socket connection
      socketManager.connect(user);

      // Set active conversation
      dispatch(
        setActiveConversation({
          eventId: event._id,
          organizerId: organizer._id,
        })
      );

      // Fetch messages for this specific conversation
      dispatch(
        fetchMessages({
          eventId: event._id,
          organizerId: organizer._id,
        })
      );

      // Mark messages as read if user is the receiver
      // For organizer: mark as read when they view messages from users
      // For user: mark as read when they view organizer's replies
      const shouldMarkAsRead =
        user._id === organizer._id || // Organizer viewing user messages
        user._id !== organizer._id; // User viewing organizer messages

      if (shouldMarkAsRead) {
        dispatch(
          markMessagesAsRead({
            eventId: event._id,
            organizerId: organizer._id,
          })
        );
      }

      // Set up socket listener for new messages
      const socket = socketManager.getSocket();
      if (socket) {
        const handleNewMessage = (message) => {
          console.log("Received new message via socket:", message);

          // Only add message if it belongs to current conversation
          const messageConversationKey = `${message.eventId}-${organizer._id}`;
          if (messageConversationKey === conversationKey) {
            console.log("Adding message to current conversation");
            dispatch(addMessage(message));
          }
        };

        socket.on("newMessage", handleNewMessage);

        // Cleanup
        return () => {
          socket.off("newMessage", handleNewMessage);
        };
      }
    }
  }, [isOpen, event?._id, organizer?._id, dispatch, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user || !organizer || !event) return;

    // ALWAYS send to organizer when user is replying
    // When organizer is replying, send to the original user
    let receiver;

    if (user._id === organizer._id) {
      // Organizer is responding - find the original sender from messages
      const originalSenderMessage = messages.find(
        (msg) => msg.sender._id !== user._id
      );
      receiver = originalSenderMessage
        ? originalSenderMessage.sender._id
        : null;

      // If no previous messages, we can't determine receiver
      if (!receiver) {
        console.error(
          "Organizer: Could not determine message receiver from existing messages"
        );
        return;
      }
    } else {
      // User is messaging the organizer - ALWAYS send to organizer
      receiver = organizer._id;
    }

    console.log("Sending message:", {
      eventId: event._id,
      receiver,
      content: newMessage,
      sender: user._id,
      conversationKey,
    });

    dispatch(
      sendMessage({
        eventId: event._id,
        receiver,
        content: newMessage,
      })
    )
      .then((result) => {
        if (result.payload) {
          console.log("Message sent successfully:", result.payload);
          // The message should be automatically added to the conversation via socket
          // and also added locally via the fulfilled action
        }
      })
      .catch((error) => {
        console.error("Failed to send message:", error);
      });

    setNewMessage("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  // Determine display names based on user role
  const getDisplayName = () => {
    if (user._id === organizer._id) {
      // Organizer view - show user's name from the first message
      const userMessage = messages.find((msg) => msg.sender._id !== user._id);
      return userMessage ? userMessage.sender.name : "User";
    } else {
      // User view - show organizer's name
      return organizer.name;
    }
  };

  const getDialogTitle = () => {
    if (user._id === organizer._id) {
      return "Conversation";
    } else {
      return "Message Organizer";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                {getDialogTitle()}
              </h3>
              <p className="text-sm text-slate-600">{getDisplayName()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-500 mt-16">
              <p>No messages yet</p>
              <p className="text-sm mt-2">Start a conversation</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message._id || message.tempId}
                  className={`flex ${
                    message.sender._id === user._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-2xl ${
                      message.sender._id === user._id
                        ? "bg-blue-500 text-white"
                        : "bg-white text-slate-800 border border-slate-200"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender._id === user._id
                          ? "text-blue-100"
                          : "text-slate-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 p-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="1"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || loading}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

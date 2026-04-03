import {
  Ticket,
  Menu,
  Plus,
  Search,
  LogIn,
  LogOut,
  User,
  Video,
  Bell,
  MessageCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../redux/slices/authSlice";
import { Toaster, toast } from "sonner";
import {
  fetchMessages,
  markMessagesAsRead,
  getAllUserMessages,
} from "../redux/slices/messageSlice";
import { MessageDialog } from "./MessageDialogue";

export const Navbar = ({ onOpenCreateEventModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const { conversations, unreadCount, isSynced } = useSelector(
    (state) => state.messages
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);

  // Load messages on mount + when user logs in
  useEffect(() => {
    if (user) {
      dispatch(getAllUserMessages());
    }
  }, [user, dispatch]);

  // Optional: Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      dispatch(getAllUserMessages());
    }, 30000);
    return () => clearInterval(interval);
  }, [user, dispatch]);

  const handleNotificationClick = () => {
    if (!isSynced) dispatch(getAllUserMessages()); // Ensure latest
    setIsNotificationMenuOpen(!isNotificationMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      // Critical!
      navigate("/login");
    } catch (error) {
      toast.error(error);
    }
  };

  // In Navbar component, update the getReceivedMessages function:
  const getReceivedMessages = () => {
    if (!user || !conversations) return [];
    const received = [];

    Object.entries(conversations).forEach(([key, messages]) => {
      // Filter conversations where the current user is involved
      const userInvolved = messages.some(
        (msg) => msg.sender._id === user._id || msg.receiver === user._id
      );

      if (userInvolved && messages.length > 0) {
        const latest = messages[messages.length - 1];

        // Determine the other participant
        const otherParticipant =
          latest.sender._id === user._id
            ? { _id: latest.receiver, name: "Organizer" } // User sent message, other is organizer
            : latest.sender; // User received message, other is sender

        // Count unread messages where user is the receiver
        const unread = messages.filter(
          (m) => m.receiver === user._id && !m.isRead
        ).length;

        // Extract eventId and organizerId from key
        const [eventId, organizerId] = key.split("-");

        received.push({
          key,
          eventId,
          organizerId,
          sender: otherParticipant,
          latestMessage: latest,
          unread,
        });
      }
    });

    return received.sort(
      (a, b) =>
        new Date(b.latestMessage.createdAt) -
        new Date(a.latestMessage.createdAt)
    );
  };

  // In the handleOpenMessage function in Navbar component, update it to:
  const handleOpenMessage = async (conversation) => {
    const [eventId, organizerId] = conversation.key.split("-");

    // Fetch messages for this conversation
    await dispatch(fetchMessages({ eventId, organizerId }));

    // Mark messages as read
    await dispatch(markMessagesAsRead({ eventId, organizerId }));

    // Set selected conversation with proper organizer data
    setSelectedConversation({
      eventId,
      organizerId,
      organizer: conversation.sender, // Make sure this contains the organizer data
      sender: conversation.sender, // Keep for compatibility
    });

    setShowMessageDialog(true);
    setIsNotificationMenuOpen(false);
  };

  // And in the MessageDialog usage in navbar:
  {
    showMessageDialog && selectedConversation && (
      <MessageDialog
        organizer={{
          _id: selectedConversation.organizerId,
          name:
            selectedConversation.organizer?.name ||
            selectedConversation.sender?.name ||
            "Organizer",
        }}
        event={{ _id: selectedConversation.eventId }}
        isOpen={showMessageDialog}
        onClose={() => setShowMessageDialog(false)}
      />
    );
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(e.target)
      ) {
        setIsNotificationMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const receivedMessages = getReceivedMessages();
  const hasUnreadMessages = unreadCount > 0;

  return (
    <>
      <Toaster position="top-right" />
      {showMessageDialog && selectedConversation && (
        <MessageDialog
          organizer={selectedConversation.sender}
          event={{ _id: selectedConversation.eventId }}
          isOpen={showMessageDialog}
          onClose={() => setShowMessageDialog(false)}
        />
      )}

      <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <NavLink to="/">
              <div className="cursor-pointer flex items-center space-x-2">
                <Ticket className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Hamro Event
                </span>
              </div>
            </NavLink>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/live">
                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-md hover:from-red-600 hover:to-yellow-600 transition-all">
                  <Video className="h-4 w-4 mr-2" />
                  Live Event
                </button>
              </Link>

              {user ? (
                <>
                  <div className="relative" ref={notificationMenuRef}>
                    <button
                      onClick={handleNotificationClick}
                      className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition"
                    >
                      <Bell className="h-5 w-5" />
                      {hasUnreadMessages && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {isNotificationMenuOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-xl py-3 z-50 border border-gray-100 max-h-96 overflow-y-auto">
                        <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                          <h3 className="font-bold text-gray-800">Messages</h3>
                          {hasUnreadMessages && (
                            <span className="text-xs text-blue-600 font-medium">
                              {unreadCount} new
                            </span>
                          )}
                        </div>

                        {receivedMessages.length > 0 ? (
                          receivedMessages.map((conv) => (
                            <button
                              key={conv.key}
                              onClick={() => handleOpenMessage(conv)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-b-0"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-gray-900 truncate">
                                    {conv.sender.name}
                                  </p>
                                  <p className="text-xs text-gray-600 truncate mt-0.5">
                                    {conv.latestMessage.content}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(
                                      conv.latestMessage.createdAt
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                                {conv.unread > 0 && (
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white font-bold ml-2">
                                    {conv.unread}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-500">
                            <MessageCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm font-medium">
                              No messages yet
                            </p>
                            <p className="text-xs mt-1">
                              Start a conversation!
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Link to="/myevents">
                    <button className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-md transition">
                      My Events
                    </button>
                  </Link>

                  <button
                    onClick={onOpenCreateEventModal}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md shadow-md hover:shadow-xl transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </button>

                  {user?.role?.toLowerCase() === "admin" && (
                    <Link to="/admin">
                      <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                        Admin Panel
                      </button>
                    </Link>
                  )}

                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700 hidden lg:block">
                        {user.name}
                      </span>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl py-2 z-50 border border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition text-sm"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                        <button
                          onClick={() => navigate("/change-password")}
                          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition text-sm"
                        >
                          Change Password
                        </button>
                        <button
                          onClick={() => navigate("/subscription")}
                          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition text-sm"
                        >
                          Subscription
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link to="/login">
                  <button className="flex items-center gap-1 px-4 py-2 text-purple-600 border border-purple-600 rounded-md hover:bg-purple-600 hover:text-white transition">
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                </Link>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-gray-200">
              <div className="px-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    className="pl-10 w-full py-2 px-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>
              </div>

              {user ? (
                <>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                      Messages
                    </h3>
                    {receivedMessages.length > 0 ? (
                      receivedMessages.slice(0, 3).map((conv) => (
                        <button
                          key={conv.key}
                          onClick={() => {
                            handleOpenMessage(conv);
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left p-2 hover:bg-gray-50 rounded-lg mb-1"
                        >
                          <div className="flex items-center justify-between">
                            <div className="truncate flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {conv.sender.name}
                              </p>
                              <p className="text-xs text-gray-600 truncate">
                                {conv.latestMessage.content}
                              </p>
                            </div>
                            {conv.unread > 0 && (
                              <span className="ml-2 h-5 w-5 rounded-full bg-blue-600 text-xs text-white flex items-center justify-center">
                                {conv.unread}
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No messages</p>
                    )}
                  </div>

                  <Link
                    to="/myevents"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    My Events
                  </Link>

                  <button
                    onClick={onOpenCreateEventModal}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </button>

                  {user?.role?.toLowerCase() === "admin" && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 bg-red-600 text-white rounded-lg text-center"
                    >
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block px-4 py-2 text-purple-600 border border-purple-600 rounded-lg text-center hover:bg-purple-600 hover:text-white transition"
                >
                  <LogIn className="h-5 w-5 inline mr-2" />
                  Login
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

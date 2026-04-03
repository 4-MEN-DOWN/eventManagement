import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  Search,
  CheckCircle,
  XCircle,
  Ticket,
  X,
  IndianRupee,
  Filter,
  ChevronDown,
  Image as ImageIcon,
  QrCode,
  Plus,
  Minus,
  CreditCard,
  Loader,
  Shield,
  Bookmark,
  Star,
  BarChart3,
  MoreVertical,
  Check,
  History,
  Award,
  CalendarCheck,
  Map,
  Navigation,
  Camera,
  Heart,
  Share2,
  Download,
  Clock3,
  UserCheck,
  TrendingUp,
  Sparkles,
  Crown,
} from "lucide-react";
import {
  getMyEventsAsync,
  updateTicketQuantityAsync,
  cancelEventAttendanceAsync,
  handlePaymentSuccessAsync,
} from "../../redux/slices/eventSlice";
import { toast } from "sonner";
import "react-toastify/dist/ReactToastify.css";
import { NavLink } from "react-router-dom";
import CryptoJS from "crypto-js";

export function EventsToAttend() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { eventsToAttend, loading, error, paymentProcessing } = useSelector(
    (state) => state.events
  );
  const [pendingPaymentUpdate, setPendingPaymentUpdate] = useState(null);
  console.log(eventsToAttend);
  console.log("Events to attend data:", eventsToAttend);

  useEffect(() => {
    if (user?._id) {
      dispatch(getMyEventsAsync());
    }
  }, [dispatch, user?._id]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [ticketQuantities, setTicketQuantities] = useState({});
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showTicketViewModal, setShowTicketViewModal] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' or 'attended'

  // Helper function to get event from ticket
  const getEventFromTicket = (ticket) => {
    return ticket.event || null;
  };

  // Separate tickets into upcoming and attended
  const { upcomingTickets, attendedTickets } = useMemo(() => {
    const upcoming = [];
    const attended = [];

    eventsToAttend.forEach((ticket) => {
      if (ticket.attendanceStatus === "attended") {
        attended.push(ticket);
      } else {
        upcoming.push(ticket);
      }
    });

    return { upcomingTickets: upcoming, attendedTickets: attended };
  }, [eventsToAttend]);

  // Calculate total attendees across all events
  const calculateTotalAttendees = (event) => {
    if (!event?.attendees || !Array.isArray(event.attendees)) return 0;
    return event.attendees.length;
  };

  // Filter tickets based on active tab, search and filters
  const filteredTickets = useMemo(() => {
    const tickets =
      activeTab === "upcoming" ? upcomingTickets : attendedTickets;

    return tickets.filter((ticket) => {
      const event = getEventFromTicket(ticket);
      if (!event) return false;

      // Add safety checks for undefined properties
      const title = event?.title || "";
      const description = event?.description || "";
      const location = event?.location || "";
      const status = event?.status || "";
      const category = event?.category || "";

      const matchesSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [
    upcomingTickets,
    attendedTickets,
    activeTab,
    searchTerm,
    statusFilter,
    categoryFilter,
  ]);

  // Get unique categories from all tickets
  const uniqueCategories = [
    ...new Set(
      eventsToAttend
        .map((ticket) => {
          const event = getEventFromTicket(ticket);
          return event?.category || "uncategorized";
        })
        .filter((category) => category)
    ),
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      technology: "bg-blue-100 text-blue-800 border-blue-200",
      music: "bg-purple-100 text-purple-800 border-purple-200",
      food: "bg-amber-100 text-amber-800 border-amber-200",
      arts: "bg-pink-100 text-pink-800 border-pink-200",
      business: "bg-indigo-100 text-indigo-800 border-indigo-200",
      wellness: "bg-emerald-100 text-emerald-800 border-emerald-200",
      uncategorized: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getAttendanceBadgeColor = (attendanceStatus) => {
    switch (attendanceStatus) {
      case "attended":
        return "bg-green-500 text-white";
      case "checked-in":
        return "bg-blue-500 text-white";
      default:
        return "bg-amber-500 text-white";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "No date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (time) => {
    if (!time) return "";
    try {
      const [hours, minutes] = time.split(":").map(Number);
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${String(minutes).padStart(2, "0")} ${ampm}`;
    } catch (error) {
      return "Invalid time";
    }
  };

  const getTicketsPurchased = (ticket) => {
    return ticket?.ticketQuantity || 0;
  };

  // Open Ticket View Modal
  const openTicketViewModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketViewModal(true);
  };

  // Open Cancel Attendance modal
  const openCancelModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowCancelModal(true);
  };

  // Handle cancel attendance
  const handleCancelAttendance = async () => {
    if (!selectedTicket) return;

    try {
      const result = await dispatch(
        cancelEventAttendanceAsync(selectedTicket._id)
      );

      if (result.error) {
        throw new Error(result.payload);
      }

      setShowCancelModal(false);
      dispatch(getMyEventsAsync());
      toast.success("Attendance cancelled successfully!");
    } catch (error) {
      console.error("Cancel attendance error:", error);
      toast.error("Failed to cancel attendance");
    }
  };

  // Download Ticket as PDF/Image - ULTRA SIMPLE VERSION
  const downloadTicket = async () => {
    try {
      // Show loading state
      toast.info("Preparing ticket download...");

      // Create a completely separate ticket element with only inline styles
      const ticketContainer = document.createElement("div");
      ticketContainer.style.width = "400px";
      ticketContainer.style.minHeight = "500px";
      ticketContainer.style.backgroundColor = "#1e293b";
      ticketContainer.style.border = "2px solid #f59e0b";
      ticketContainer.style.borderRadius = "12px";
      ticketContainer.style.overflow = "hidden";
      ticketContainer.style.fontFamily = "Arial, sans-serif";
      ticketContainer.style.color = "white";

      // Header
      const header = document.createElement("div");
      header.style.backgroundColor = "#f59e0b";
      header.style.padding = "12px 16px";
      header.style.color = "#1f2937";

      const headerContent = document.createElement("div");
      headerContent.style.display = "flex";
      headerContent.style.justifyContent = "space-between";
      headerContent.style.alignItems = "center";

      const title = document.createElement("h2");
      title.textContent = "EVENT TICKET";
      title.style.fontSize = "18px";
      title.style.fontWeight = "900";
      title.style.margin = "0";
      title.style.letterSpacing = "0.5px";

      const ticketInfo = document.createElement("div");
      ticketInfo.style.textAlign = "right";

      const ticketType = document.createElement("div");
      ticketType.textContent = `${
        selectedTicket.seatDetails?.[0]?.seatType?.toUpperCase() || "GENERAL"
      } ENTRY`;
      ticketType.style.fontSize = "12px";
      ticketType.style.fontWeight = "bold";

      const ticketId = document.createElement("div");
      ticketId.textContent =
        selectedTicket.ticketIds?.[0]?.split("-").slice(0, 3).join("-") ||
        "TICKET-ID";
      ticketId.style.fontSize = "11px";
      ticketId.style.fontWeight = "500";

      ticketInfo.appendChild(ticketType);
      ticketInfo.appendChild(ticketId);
      headerContent.appendChild(title);
      headerContent.appendChild(ticketInfo);
      header.appendChild(headerContent);
      ticketContainer.appendChild(header);

      // Main content
      const content = document.createElement("div");
      content.style.padding = "16px";

      // Event title
      const eventTitle = document.createElement("h1");
      eventTitle.textContent =
        getEventFromTicket(selectedTicket)?.title?.toUpperCase() ||
        "EVENT TITLE";
      eventTitle.style.fontSize = "20px";
      eventTitle.style.fontWeight = "900";
      eventTitle.style.textAlign = "center";
      eventTitle.style.marginBottom = "8px";
      eventTitle.style.color = "#fbbf24";

      const eventDesc = document.createElement("p");
      eventDesc.textContent =
        getEventFromTicket(selectedTicket)?.description || "Event Description";
      eventDesc.style.fontSize = "14px";
      eventDesc.style.textAlign = "center";
      eventDesc.style.color = "#d1d5db";
      eventDesc.style.marginBottom = "16px";

      content.appendChild(eventTitle);
      content.appendChild(eventDesc);

      // Date and time grid
      const grid = document.createElement("div");
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = "1fr 1fr";
      grid.style.gap = "12px";
      grid.style.marginBottom = "16px";

      const dateBox = createInfoBox(
        "DATE",
        formatDate(getEventFromTicket(selectedTicket)?.date) || "TBD",
        "#3b82f6"
      );
      const timeBox = createInfoBox(
        "TIME",
        formatTime(getEventFromTicket(selectedTicket)?.startTime) || "TBD",
        "#8b5cf6"
      );

      grid.appendChild(dateBox);
      grid.appendChild(timeBox);
      content.appendChild(grid);

      // Location
      const locationBox = createInfoBox(
        "VENUE",
        getEventFromTicket(selectedTicket)?.location || "Venue Location",
        "#64748b"
      );
      locationBox.style.marginBottom = "16px";
      content.appendChild(locationBox);

      // Price and seat info
      const infoGrid = document.createElement("div");
      infoGrid.style.display = "grid";
      infoGrid.style.gridTemplateColumns = "1fr 1fr";
      infoGrid.style.gap = "12px";
      infoGrid.style.marginBottom = "16px";

      const price =
        selectedTicket.seatDetails?.[0]?.finalPrice ||
        selectedTicket.seatDetails?.[0]?.seatPrice ||
        selectedTicket.totalAmount;
      const currencyType = price > 1000 ? "INR" : price > 100 ? "USD" : "JPY";
      const priceText =
        currencyType === "INR"
          ? `₹${price}`
          : currencyType === "USD"
          ? `$${price}`
          : `¥${price}`;

      const priceBox = createInfoBox("TICKET PRICE", priceText, "#10b981");
      const seatBox = createInfoBox(
        "SEAT INFO",
        `${
          selectedTicket.seatDetails?.[0]?.seatType?.charAt(0).toUpperCase() +
            selectedTicket.seatDetails?.[0]?.seatType?.slice(1) || "General"
        } • ${selectedTicket.seatDetails?.[0]?.seatNumber || "N/A"}`,
        "#ef4444"
      );

      infoGrid.appendChild(priceBox);
      infoGrid.appendChild(seatBox);
      content.appendChild(infoGrid);

      // User info and QR
      const userSection = document.createElement("div");
      userSection.style.display = "flex";
      userSection.style.justifyContent = "space-between";
      userSection.style.alignItems = "center";
      userSection.style.marginBottom = "16px";

      const userInfo = document.createElement("div");
      userInfo.style.flex = "1";

      const attendeeLabel = document.createElement("div");
      attendeeLabel.textContent = "ATTENDEE";
      attendeeLabel.style.fontSize = "14px";
      attendeeLabel.style.fontWeight = "600";
      attendeeLabel.style.color = "#fbbf24";
      attendeeLabel.style.marginBottom = "4px";

      const userName = document.createElement("div");
      userName.textContent = user?.name || "Guest";
      userName.style.fontSize = "16px";
      userName.style.fontWeight = "900";
      userName.style.marginBottom = "2px";

      const userEmail = document.createElement("div");
      userEmail.textContent = user?.email || "N/A";
      userEmail.style.fontSize = "12px";
      userEmail.style.color = "#d1d5db";

      const ticketCount = document.createElement("div");
      ticketCount.textContent = `Tickets: ${
        selectedTicket.ticketQuantity || 1
      }`;
      ticketCount.style.fontSize = "11px";
      ticketCount.style.color = "#9ca3af";
      ticketCount.style.marginTop = "8px";

      userInfo.appendChild(attendeeLabel);
      userInfo.appendChild(userName);
      userInfo.appendChild(userEmail);
      userInfo.appendChild(ticketCount);

      const qrSection = document.createElement("div");
      qrSection.style.textAlign = "center";

      const qrBox = document.createElement("div");
      qrBox.style.backgroundColor = "white";
      qrBox.style.padding = "8px";
      qrBox.style.borderRadius = "8px";
      qrBox.style.display = "inline-block";

      const qrPlaceholder = document.createElement("div");
      qrPlaceholder.style.width = "64px";
      qrPlaceholder.style.height = "64px";
      qrPlaceholder.style.backgroundColor = "#e5e7eb";
      qrPlaceholder.style.borderRadius = "4px";
      qrPlaceholder.style.display = "flex";
      qrPlaceholder.style.alignItems = "center";
      qrPlaceholder.style.justifyContent = "center";
      qrPlaceholder.style.color = "#6b7280";
      qrPlaceholder.style.fontSize = "10px";
      qrPlaceholder.textContent = "QR CODE";

      qrBox.appendChild(qrPlaceholder);
      qrSection.appendChild(qrBox);

      const scanText = document.createElement("div");
      scanText.textContent = "SCAN FOR ENTRY";
      scanText.style.fontSize = "11px";
      scanText.style.fontWeight = "600";
      scanText.style.color = "#fbbf24";
      scanText.style.marginTop = "4px";

      qrSection.appendChild(scanText);
      userSection.appendChild(userInfo);
      userSection.appendChild(qrSection);
      content.appendChild(userSection);

      // Event type
      const eventTypeBox = createInfoBox(
        "EVENT TYPE",
        getEventFromTicket(selectedTicket)?.category
          ? getEventFromTicket(selectedTicket)
              .category.charAt(0)
              .toUpperCase() +
              getEventFromTicket(selectedTicket).category.slice(1)
          : "General Event",
        "#475569"
      );
      eventTypeBox.style.textAlign = "center";
      content.appendChild(eventTypeBox);

      // Footer
      const footer = document.createElement("div");
      footer.style.textAlign = "center";
      footer.style.marginTop = "16px";
      footer.style.paddingTop = "12px";
      footer.style.borderTop = "1px solid #475569";

      const ticketIdLabel = document.createElement("div");
      ticketIdLabel.textContent = "TICKET ID";
      ticketIdLabel.style.fontSize = "11px";
      ticketIdLabel.style.color = "#9ca3af";
      ticketIdLabel.style.marginBottom = "4px";

      const ticketIdValue = document.createElement("div");
      ticketIdValue.textContent =
        selectedTicket.ticketIds?.[0] || selectedTicket._id;
      ticketIdValue.style.fontFamily = "monospace";
      ticketIdValue.style.fontSize = "11px";
      ticketIdValue.style.fontWeight = "bold";
      ticketIdValue.style.color = "#fbbf24";

      const instruction = document.createElement("div");
      instruction.textContent = "Present this ticket at the venue for entry";
      instruction.style.fontSize = "11px";
      instruction.style.color = "#9ca3af";
      instruction.style.marginTop = "8px";

      footer.appendChild(ticketIdLabel);
      footer.appendChild(ticketIdValue);
      footer.appendChild(instruction);
      content.appendChild(footer);

      ticketContainer.appendChild(content);

      // Add to document temporarily
      document.body.appendChild(ticketContainer);
      ticketContainer.style.position = "fixed";
      ticketContainer.style.left = "-9999px";
      ticketContainer.style.top = "-9999px";

      // Dynamically import html2canvas
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(ticketContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#1e293b",
        width: ticketContainer.scrollWidth,
        height: ticketContainer.scrollHeight,
      });

      // Convert canvas to data URL and download
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `ticket-${selectedTicket?.ticketIds?.[0] || "event"}.png`;
      link.href = dataURL;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      document.body.removeChild(ticketContainer);

      toast.success("Ticket downloaded successfully!");
    } catch (error) {
      console.error("Error downloading ticket:", error);
      toast.error("Failed to download ticket. Please try again.");
    }
  };

  // Helper function to create info boxes
  const createInfoBox = (label, value, color) => {
    const box = document.createElement("div");
    box.style.backgroundColor = color;
    box.style.padding = "12px";
    box.style.borderRadius = "8px";
    box.style.border = `1px solid ${color}66`;
    box.style.textAlign = "center";

    const labelElem = document.createElement("div");
    labelElem.textContent = label;
    labelElem.style.fontSize = "12px";
    labelElem.style.fontWeight = "600";
    labelElem.style.color = "#fbbf24";
    labelElem.style.marginBottom = "4px";

    const valueElem = document.createElement("div");
    valueElem.textContent = value;
    valueElem.style.fontSize = "14px";
    valueElem.style.fontWeight = "900";

    box.appendChild(labelElem);
    box.appendChild(valueElem);

    return box;
  };

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    const totalEvents = eventsToAttend.length;
    const attendedEvents = attendedTickets.length;
    const upcomingEvents = upcomingTickets.length;
    const attendanceRate =
      totalEvents > 0 ? (attendedEvents / totalEvents) * 100 : 0;

    return {
      totalEvents,
      attendedEvents,
      upcomingEvents,
      attendanceRate: attendanceRate.toFixed(1),
    };
  }, [eventsToAttend, attendedTickets, upcomingTickets]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Ticket View Modal */}
      {showTicketViewModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                Your Event Ticket
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={downloadTicket}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition cursor-pointer"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={() => setShowTicketViewModal(false)}
                  className="text-slate-500 hover:text-slate-700 transition-colors cursor-pointer p-1 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* SIMPLE TICKET DESIGN FOR DISPLAY ONLY */}
            <div
              className="bg-slate-800 rounded-xl overflow-hidden shadow-2xl border-2 border-yellow-400"
              style={{ width: "400px", minHeight: "500px" }}
            >
              {/* Ticket Header */}
              <div className="bg-yellow-400 py-3 px-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-black text-gray-900 tracking-tight">
                    EVENT TICKET
                  </h2>
                  <div className="text-right">
                    <div className="text-xs font-bold text-gray-900">
                      {selectedTicket.seatDetails?.[0]?.seatType?.toUpperCase() ||
                        "GENERAL"}{" "}
                      ENTRY
                    </div>
                    <div className="text-xs font-medium text-gray-800">
                      {selectedTicket.ticketIds?.[0]
                        ?.split("-")
                        .slice(0, 3)
                        .join("-") || "TICKET-ID"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Ticket Content */}
              <div className="p-4 text-white">
                {/* Event Title Section */}
                <div className="text-center mb-4">
                  <h1 className="text-xl font-black mb-1 text-yellow-300">
                    {getEventFromTicket(selectedTicket)?.title?.toUpperCase() ||
                      "EVENT TITLE"}
                  </h1>
                  <p className="text-sm text-gray-300">
                    {getEventFromTicket(selectedTicket)?.description ||
                      "Event Description"}
                  </p>
                </div>

                {/* Date and Time Section */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-blue-700 rounded-lg border border-blue-500">
                    <div className="text-xs font-semibold text-yellow-300 mb-1">
                      DATE
                    </div>
                    <div className="text-sm font-black">
                      {formatDate(getEventFromTicket(selectedTicket)?.date) ||
                        "TBD"}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-purple-700 rounded-lg border border-purple-500">
                    <div className="text-xs font-semibold text-yellow-300 mb-1">
                      TIME
                    </div>
                    <div className="text-sm font-black">
                      {formatTime(
                        getEventFromTicket(selectedTicket)?.startTime
                      ) || "TBD"}
                    </div>
                  </div>
                </div>

                {/* Location Section */}
                <div className="text-center p-3 bg-slate-700 rounded-lg border border-slate-500 mb-4">
                  <div className="text-xs font-semibold text-yellow-300 mb-1">
                    VENUE
                  </div>
                  <div className="text-sm font-medium">
                    {getEventFromTicket(selectedTicket)?.location ||
                      "Venue Location"}
                  </div>
                </div>

                {/* Price and Seat Information */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-green-700 rounded-lg border border-green-500">
                    <div className="text-xs font-semibold text-yellow-300 mb-1">
                      TICKET PRICE
                    </div>
                    <div className="text-lg font-black text-yellow-300">
                      {(() => {
                        const price =
                          selectedTicket.seatDetails?.[0]?.finalPrice ||
                          selectedTicket.seatDetails?.[0]?.seatPrice ||
                          selectedTicket.totalAmount;
                        const currencyType =
                          price > 1000 ? "INR" : price > 100 ? "USD" : "JPY";
                        return currencyType === "INR"
                          ? `₹${price}`
                          : currencyType === "USD"
                          ? `$${price}`
                          : `¥${price}`;
                      })()}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-red-700 rounded-lg border border-red-500">
                    <div className="text-xs font-semibold text-yellow-300 mb-1">
                      SEAT INFO
                    </div>
                    <div className="text-sm font-black">
                      {selectedTicket.seatDetails?.[0]?.seatType
                        ?.charAt(0)
                        .toUpperCase() +
                        selectedTicket.seatDetails?.[0]?.seatType?.slice(1) ||
                        "General"}{" "}
                      • {selectedTicket.seatDetails?.[0]?.seatNumber || "N/A"}
                    </div>
                  </div>
                </div>

                {/* QR Code and User Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-yellow-300 mb-1">
                      ATTENDEE
                    </div>
                    <div className="text-base font-black">
                      {user?.name || "Guest"}
                    </div>
                    <div className="text-xs text-gray-300 mt-1">
                      {user?.email || "N/A"}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      Tickets: {selectedTicket.ticketQuantity || 1}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="bg-white p-2 rounded-lg inline-block">
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <QrCode className="w-10 h-10 text-gray-700" />
                      </div>
                    </div>
                    <div className="text-xs text-yellow-300 font-semibold mt-1">
                      SCAN FOR ENTRY
                    </div>
                  </div>
                </div>

                {/* Additional Event Info */}
                <div className="bg-slate-700 rounded-lg p-3 border border-slate-500 text-center">
                  <div className="text-xs text-yellow-300 font-semibold mb-1">
                    EVENT TYPE
                  </div>
                  <div className="text-sm font-medium">
                    {getEventFromTicket(selectedTicket)?.category
                      ? getEventFromTicket(selectedTicket)
                          .category.charAt(0)
                          .toUpperCase() +
                        getEventFromTicket(selectedTicket).category.slice(1)
                      : "General Event"}
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-4 pt-3 border-t border-slate-600">
                  <div className="text-xs text-gray-400">TICKET ID</div>
                  <div className="font-mono text-xs font-bold text-yellow-300">
                    {selectedTicket.ticketIds?.[0] || selectedTicket._id}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Present this ticket at the venue for entry
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-slate-500">
                Download and show this ticket to the event staff for entry
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the component remains the same... */}
      {/* Cancel Attendance Modal */}
      {showCancelModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                Cancel Attendance
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-slate-500 hover:text-slate-700 transition-colors cursor-pointer p-1 hover:bg-slate-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="font-semibold text-slate-700 mb-2">
                  Cancel all tickets for{" "}
                  {getEventFromTicket(selectedTicket)?.title}?
                </h4>
                <p className="text-sm text-slate-500">
                  This will cancel all {getTicketsPurchased(selectedTicket)}{" "}
                  tickets and cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
                >
                  Keep Tickets
                </button>
                <button
                  onClick={handleCancelAttendance}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Cancel All Tickets
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Event Journey
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Track your upcoming events and relive your amazing experiences
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 font-semibold p-4 bg-red-50 rounded-xl">
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500 rounded-lg shadow-md">
                    <Ticket className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {attendanceStats.totalEvents}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-700">
                  Total Events
                </h3>
              </div>

              <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500 rounded-lg shadow-md">
                    <CalendarCheck className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {attendanceStats.upcomingEvents}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-700">
                  Upcoming Events
                </h3>
              </div>

              <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500 rounded-lg shadow-md">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    {attendanceStats.attendedEvents}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-700">
                  Events Attended
                </h3>
              </div>

              <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-500 rounded-lg shadow-md">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-amber-600">
                    {attendanceStats.attendanceRate}%
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-700">
                  Attendance Rate
                </h3>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white/90 backdrop-blur-xl rounded-xl p-2 border border-white/20 shadow-lg">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                    activeTab === "upcoming"
                      ? "bg-blue-500 text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Upcoming Events ({upcomingTickets.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("attended")}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                    activeTab === "attended"
                      ? "bg-green-500 text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Award className="w-4 h-4" />
                    Events Attended ({attendedTickets.length})
                  </div>
                </button>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white/90 backdrop-blur-xl rounded-xl p-5 border border-white/20 shadow-lg">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={`Search ${
                      activeTab === "upcoming" ? "upcoming" : "attended"
                    } events...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 text-black"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedFilters(!expandedFilters)}
                    className="flex items-center px-3 py-2 bg-white/80 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    Filters
                    {expandedFilters ? (
                      <ChevronDown className="w-4 h-4 ml-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-1 transform rotate-180" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Filters */}
              {expandedFilters && (
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                    >
                      <option value="all">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-black"
                    >
                      <option value="all">All Categories</option>
                      {uniqueCategories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-xl p-12 border border-white/20 shadow-lg text-center">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              {activeTab === "upcoming"
                ? "No Upcoming Events"
                : "No Events Attended Yet"}
            </h3>
            <p className="text-slate-500 mb-6">
              {activeTab === "upcoming"
                ? "You don't have any upcoming events. Explore events to get started!"
                : "Attend events to build your event history and memories."}
            </p>
            <NavLink
              to="/events"
              className="px-5 py-2.5 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700 transition-all"
            >
              Browse Events
            </NavLink>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket, index) => {
              const event = getEventFromTicket(ticket);
              if (!event) return null;

              return (
                <div
                  key={ticket._id}
                  className="group bg-white/90 backdrop-blur-xl rounded-xl overflow-hidden border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-40 md:h-auto relative overflow-hidden">
                      {event?.banner ? (
                        <img
                          src={`http://localhost:5000/uploads/event-banners/${event?.banner}`}
                          alt={event?.title || "Event image"}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-indigo-300" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            event?.status
                          )}`}
                        >
                          {(event?.status || "unknown")
                            .charAt(0)
                            .toUpperCase() +
                            (event?.status || "unknown").slice(1)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getAttendanceBadgeColor(
                            ticket.attendanceStatus
                          )}`}
                        >
                          {ticket.attendanceStatus === "attended" ? (
                            <div className="flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Attended
                            </div>
                          ) : (
                            "Upcoming"
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-300">
                            {event?.title || "Untitled Event"}
                          </h3>
                          <div className="flex items-center mt-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                                event?.category
                              )}`}
                            >
                              {(event?.category || "uncategorized")
                                .charAt(0)
                                .toUpperCase() +
                                (event?.category || "uncategorized").slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                            {event?.description || "No description available"}
                          </p>
                        </div>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 ml-2">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="flex items-center text-slate-600">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                          <span>{formatDate(event?.date)}</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                          <span>
                            {`${formatTime(event.startTime)} - ${formatTime(
                              event.endTime
                            )}`}
                          </span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                          <span className="truncate">
                            {event.location
                              ? event.location.split(",").slice(0, 3).join(",")
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <IndianRupee className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                          <span>{event?.price || 0}</span>
                        </div>
                      </div>

                      {/* Enhanced Ticket-specific information */}
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-slate-600">
                              Tickets Purchased:
                            </span>
                            <span className="font-semibold text-indigo-600 ml-1">
                              {getTicketsPurchased(ticket)} tickets
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">
                              Payment Status:
                            </span>
                            <span
                              className={`font-medium ml-1 ${
                                ticket.paymentStatus === "completed"
                                  ? "text-green-600"
                                  : ticket.paymentStatus === "pending"
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {ticket.paymentStatus}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">
                              {ticket.attendanceStatus === "attended"
                                ? "Attended On:"
                                : "Purchase Date:"}
                            </span>
                            <span className="text-slate-500 ml-1">
                              {ticket.attendanceStatus === "attended"
                                ? formatDateTime(ticket.attendanceTime)
                                : formatDate(ticket.purchaseDate)}
                            </span>
                          </div>
                        </div>

                        {/* Seat Information */}
                        {ticket.seatDetails &&
                          ticket.seatDetails.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <span className="text-slate-600 text-xs">
                                Seats:{" "}
                              </span>
                              {ticket.seatDetails.map((seat, index) => (
                                <span
                                  key={seat._id || index}
                                  className="text-xs font-medium text-indigo-600 ml-1"
                                >
                                  {seat.seatType} - {seat.seatNumber}
                                  {index < ticket.seatDetails.length - 1
                                    ? ", "
                                    : ""}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <NavLink
                          to={`/events/${event._id}`}
                          className="flex items-center px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          View Details
                        </NavLink>

                        {/* Different actions based on attendance status */}
                        {ticket.attendanceStatus === "attended" ? (
                          <>
                            <button className="flex items-center px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg">
                              <Award className="w-3.5 h-3.5 mr-1.5" />
                              View Certificate
                            </button>
                            <button className="flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg">
                              <Share2 className="w-3.5 h-3.5 mr-1.5" />
                              Share Memory
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => openTicketViewModal(ticket)}
                              className="flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg"
                            >
                              <Ticket className="w-3.5 h-3.5 mr-1.5" />
                              View Ticket
                            </button>

                            <button
                              onClick={() => openCancelModal(ticket)}
                              className="flex items-center px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg"
                            >
                              <X className="w-3.5 h-3.5 mr-1.5" />
                              Cancel Tickets
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

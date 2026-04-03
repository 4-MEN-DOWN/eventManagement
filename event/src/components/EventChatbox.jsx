import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Ticket, Calendar } from "lucide-react";

const EventChatbot = ({ events = [] }) => {
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hi! 👋 I’m your Event Assistant. Ask me about events, categories, seats, prices, or organizers!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState({
    type: null,
    value: null,
    filtered: [],
    event: null,
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // helpers
  const toggleChat = () => setIsOpen((s) => !s);

  const fmtDate = (iso) => {
    if (!iso) return "N/A";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const fmtTime = (timeStr) => {
    if (!timeStr) return "N/A";
    try {
      const [h, m] = timeStr.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m || 0, 0, 0);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  const toNumber = (v) => {
    if (v == null) return 0;
    if (typeof v === "number") return v;
    const n = Number(String(v).replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const priceFmt = (n) =>
    `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
      toNumber(n)
    )}`;

  const pushMessage = (msg) => setMessages((prev) => [...prev, msg]);

  const handleSend = (valueFromInput) => {
    const raw = typeof valueFromInput === "string" ? valueFromInput : input;
    const text = raw?.trim();
    if (!text) return;
    pushMessage({ type: "user", text });
    setInput("");
    setIsLoading(true);
    setTimeout(() => {
      const reply = getReply(text);
      pushMessage({ type: "bot", text: reply });
      setIsLoading(false);
    }, 600);
  };

  const findEventByTitle = (query) => {
    if (!query) return null;
    const q = query.toLowerCase();
    return events.find((e) => (e.title || "").toLowerCase().includes(q));
  };

  const findCategoryMatch = (msg) => {
    const categories = Array.from(
      new Set(events.map((e) => (e.category || "").toLowerCase()))
    ).filter(Boolean);
    for (const c of categories) {
      if (msg.includes(c)) return c;
    }
    return null;
  };

  const seatDisplayForEvent = (e) => {
    const base = toNumber(e.basePrice ?? e.price ?? 0);
    const sc = e.seatConfig || {};
    const front = sc.front || {};
    const middle = sc.middle || {};
    const last = sc.last || {};

    const lines = [];
    if (front && (front.available != null || front.count != null)) {
      const avail = front.available ?? front.count ?? 0;
      const seatPremium = toNumber(front.price);
      lines.push(`Front: ${avail} @ ${priceFmt(base + seatPremium)}`);
    }
    if (middle && (middle.available != null || middle.count != null)) {
      const avail = middle.available ?? middle.count ?? 0;
      const seatPremium = toNumber(middle.price);
      lines.push(`Middle: ${avail} @ ${priceFmt(base + seatPremium)}`);
    }
    if (last && (last.available != null || last.count != null)) {
      const avail = last.available ?? last.count ?? 0;
      const seatPremium = toNumber(last.price);
      lines.push(`Last: ${avail} @ ${priceFmt(base + seatPremium)}`);
    }
    return lines.join("\n");
  };

  const priceListForEvents = (arr) =>
    arr.length === 0
      ? "No events found."
      : arr
          .map((e) => `• ${e.title}: ${priceFmt(e.basePrice ?? e.price ?? 0)}`)
          .join("\n");

  const getReply = (rawMessage) => {
    const msg = rawMessage.toLowerCase();

    if (/\b(thanks|thank you|thx|ty)\b/.test(msg))
      return "You're welcome! 😊 Anything else I can help with?";
    if (/\b(sorry|apologies|my bad)\b/.test(msg))
      return "No worries at all! How can I help next?";
    if (/\b(hi|hello|hey|namaste)\b/.test(msg))
      return "Hello 👋! Ask me about event categories, prices, or seats.";

    // Category or general event questions
    if (
      /(related to|events in|events about|show me|find|list).*category*/.test(
        msg
      ) ||
      /events.*(related to|in|about|for)/.test(msg)
    ) {
      const cat = findCategoryMatch(msg);
      if (cat) {
        const filtered = events.filter(
          (e) => (e.category || "").toLowerCase() === cat
        );
        setContext({ type: "category", value: cat, filtered, event: null });
        if (filtered.length === 0)
          return `No events found for category "${cat}".`;
        return (
          `Here are *${cat.toUpperCase()}* events:\n\n` +
          filtered
            .map(
              (e) =>
                `• ${e.title}\n  📅 ${fmtDate(e.date)}  🕒 ${fmtTime(
                  e.startTime
                )} - ${fmtTime(e.endTime)}\n  📍 ${e.location}\n  💰 ${priceFmt(
                  e.basePrice ?? e.price ?? 0
                )}`
            )
            .join("\n\n")
        );
      }
      const cats = Array.from(
        new Set(events.map((e) => e.category).filter(Boolean))
      );
      if (cats.length === 0) return "No categories available.";
      return (
        "I couldn’t detect the category. Available categories:\n" +
        cats.map((c) => `• ${c}`).join("\n")
      );
    }

    // Upcoming events
    if (/(upcoming|next|what's happening)/.test(msg)) {
      setContext({ type: "general", filtered: events });
      if (!events.length) return "No upcoming events found.";
      return (
        "Upcoming events:\n\n" +
        events
          .map(
            (e) =>
              `• ${e.title} (${e.category}) — ${fmtDate(e.date)} ${fmtTime(
                e.startTime
              )} - ${fmtTime(e.endTime)} | ${priceFmt(
                e.basePrice ?? e.price ?? 0
              )}`
          )
          .join("\n\n")
      );
    }

    // Event-specific context
    const titleMatch = events.find((e) =>
      msg.includes((e.title || "").toLowerCase())
    );
    if (titleMatch) {
      setContext({
        type: "event",
        value: titleMatch.title.toLowerCase(),
        event: titleMatch,
      });
      if (/(details|about|info|tell me)/.test(msg)) {
        return `🎫 ${titleMatch.title}\n📅 ${fmtDate(
          titleMatch.date
        )}\n🕒 ${fmtTime(titleMatch.startTime)} - ${fmtTime(
          titleMatch.endTime
        )}\n🏷 Category: ${titleMatch.category}\n📍 ${
          titleMatch.location
        }\n💰 ${priceFmt(
          titleMatch.basePrice ?? titleMatch.price ?? 0
        )}\n🎟 Seats: ${titleMatch.availableSeats}/${
          titleMatch.totalSeats
        }\n👤 Organizer: ${titleMatch.createdBy?.name || "Unknown"}`;
      }
      return `Found "${titleMatch.title}". You can ask about "price", "seats", or "location".`;
    }

    // Sequential category context
    if (context.type === "category" && context.filtered?.length) {
      const filtered = context.filtered;
      if (/(price|cost|how much)/.test(msg)) {
        return (
          "Prices:\n" +
          filtered
            .map(
              (e) => `• ${e.title}: ${priceFmt(e.basePrice ?? e.price ?? 0)}`
            )
            .join("\n")
        );
      }
      if (/(seat|availability)/.test(msg)) {
        return filtered
          .map((e) => `• ${e.title}\n  ${seatDisplayForEvent(e)}`)
          .join("\n\n");
      }
      if (/(organizer|host|who)/.test(msg)) {
        return filtered
          .map(
            (e) =>
              `• ${e.title}: ${e.createdBy?.name || "Unknown"} (${
                e.createdBy?.email || "N/A"
              })`
          )
          .join("\n");
      }
    }

    // Sequential event context
    if (context.type === "event" && context.event) {
      const ev = context.event;
      if (/(price|cost|how much)/.test(msg))
        return `Ticket price for "${ev.title}" starts at ${priceFmt(
          ev.basePrice ?? ev.price ?? 0
        )}.`;
      if (/(seat|availability)/.test(msg))
        return `${seatDisplayForEvent(ev)}\nTotal: ${
          ev.totalSeats
        } | Available: ${ev.availableSeats}`;
      if (/(organizer|host)/.test(msg))
        return `Organizer: ${ev.createdBy?.name || "Unknown"} (${
          ev.createdBy?.email || "N/A"
        })`;
      if (/(where|location|venue)/.test(msg)) return `Location: ${ev.location}`;
    }

    // Fallbacks
    if (/(help|commands)/.test(msg))
      return `I can help with:\n• Show events by category\n• Event details\n• Seat and price info\n• Organizer and venue info`;
    return "Sorry, I didn’t get that 😅 Try asking about events, prices, seats, or organizers.";
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    {
      label: "Upcoming Events",
      value: "upcoming events",
      icon: <Calendar size={14} />,
    },
  ];

  return (
    <>
      {!isOpen && (
        <button
          onClick={toggleChat}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            background: "#007bff",
            width: 60,
            height: 60,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
            border: "none",
            zIndex: 9999,
          }}
        >
          <MessageCircle size={28} color="#fff" />
        </button>
      )}

      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: 380,
            maxHeight: 560,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "Inter, Arial, sans-serif",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#007bff",
              color: "#fff",
              padding: "10px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 600 }}>Event Assistant 🤖</div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div
            style={{
              flex: 1,
              padding: 12,
              overflowY: "auto",
              background: "#f7fafc",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  margin: "6px 0",
                  display: "flex",
                  justifyContent: m.type === "bot" ? "flex-start" : "flex-end",
                }}
              >
                <div
                  style={{
                    background: m.type === "bot" ? "#fff" : "#007bff",
                    color: m.type === "bot" ? "#111827" : "#fff",
                    padding: "8px 12px",
                    borderRadius: 12,
                    maxWidth: "78%",
                    whiteSpace: "pre-wrap",
                    boxShadow:
                      m.type === "bot" ? "0 1px 2px rgba(0,0,0,0.04)" : "none",
                    fontSize: 14,
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  margin: "6px 0",
                  color: "#6b7280",
                  fontStyle: "italic",
                }}
              >
                ...typing
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(0,0,0,0.05)",
              background: "#fff",
              padding: "8px 10px",
            }}
          >
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              {quickActions.map((a, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(a.value)}
                  style={{
                    border: "1px solid rgba(0,0,0,0.1)",
                    background: "#f1f5f9",
                    borderRadius: 8,
                    padding: "5px 8px",
                    fontSize: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {a.icon}
                  {a.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.1)",
                  padding: "10px",
                  fontSize: 14,
                }}
              />
              <button
                onClick={() => handleSend()}
                style={{
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  padding: "0 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Temporary icon component (since Lucide doesn’t have MusicNoteIcon export)
const MusicNoteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

export default EventChatbot;

import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { sendMessage, getMessages, markAsRead } from "../apis/chat";

// ─── Component ───────────────────────────────────────────────────────────────
export default function ChatConversationPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { conversationId, userName, profileImage } = location.state || {};

  // ─── States ─────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [convoInfo, setConvoInfo] = useState({
    doctorName: userName || "Doctor",
    doctorInitials: userName
      ? userName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "DR",
    profileImage: profileImage || null,
  });

  const bottomRef = useRef(null);

  // ─── Fetch messages on mount ──────────────────────────────
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);

        // لو عندنا conversationId، بنجيب الرسائل من الـ API
        if (conversationId) {
          try {
            const res = await getMessages(conversationId);
            // بنفترض إن الـ response بيرجع { success: true, data: [...messages] }
            const apiMessages = res.data || [];

            // بنحول الـ API messages للشكل اللي الـ UI بتستخدمه
            const formattedMessages = apiMessages.map((msg) => ({
              id: msg.id,
              sender: msg.sender_id === parseInt(chatId) ? "them" : "me",
              text: msg.body || msg.message,
              time: new Date(msg.created_at).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              seen: msg.is_read || false,
            }));

            setMessages(formattedMessages);

            // بنعلم المحادثة مقروءة
            await markAsRead(conversationId);
          } catch (msgErr) {
            console.log(
              "No existing conversation or messages endpoint not available:",
              msgErr,
            );
            // لو مفيش conversation أو الـ endpoint مش شغال، نبدأ بمحادثة فاضية
            setMessages([]);
          }
        } else {
          // مفيش conversation قبل كده، بنبدأ فاضي
          setMessages([]);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching conversation:", err);
        setError(err.message || "Failed to load conversation");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatId, conversationId]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Send message ─────────────────────────────────────────
  const handleSendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // بنضيف الرسالة في الـ UI على طول (Optimistic UI)
    const tempId = Date.now();
    const newMessage = {
      id: tempId,
      sender: "me",
      text,
      time,
      seen: false,
      pending: true, // ← علامة إنها لسه بتتبعت
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setSending(true);

    try {
      // بنبعت للـ API
      const res = await sendMessage(parseInt(chatId), text);

      // لو نجحت، بنحدث الرسالة من pending لـ sent
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                pending: false,
                seen: true,
                id: res.data?.message?.id || tempId, // بنستخدم الـ ID الحقيقي من API
              }
            : msg,
        ),
      );

      // بنحدث الـ conversationId لو هي أول رسالة
      if (!conversationId && res.data?.conversation?.id) {
        // هنا ممكن تستخدم navigate مع state جديد
        // بس لحد ما نعرف الـ behavior الصح، هنسيبها كده
      }
    } catch (err) {
      console.error("Error sending message:", err);
      // لو فشلت، بنعلم الرسالة إنها failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, pending: false, failed: true } : msg,
        ),
      );
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ─── Retry failed message ─────────────────────────────────
  const retryMessage = async (msg) => {
    if (!msg.failed) return;

    // بنشيل الرسالة الفاشلة وبنبعتها تاني
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    setInput(msg.text);
  };

  // Group messages by date label (simplified — all "TODAY" for now)
  const dateLabel = "TODAY";

  // Avatar جوه الـ topbar وجوه رسايل "them" — صورة حقيقية لو موجودة، وإلا initials
  const renderAvatar = (className) =>
    convoInfo.profileImage ? (
      <img src={convoInfo.profileImage} alt={convoInfo.doctorName} className={className} />
    ) : (
      <div className={className}>{convoInfo.doctorInitials}</div>
    );

  // ─── Loading State ────────────────────────────────────────
  if (loading) {
    return (
      <div className="cc-page d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cc-page">
      {/* ── Top bar ─────────────────────────────────── */}
      <div className="cc-topbar">
        <button className="cc-back-btn" onClick={() => navigate("/chat")}>
          <i className="bi bi-arrow-left" />
        </button>
        <div className="cc-doctor-info">
          {renderAvatar("cc-doc-avatar")}
          <div>
            <div className="cc-doc-name">{convoInfo.doctorName}</div>
          </div>
        </div>
        <div className="cc-topbar-actions">
          <button className="cc-icon-btn" title="Voice call">
            <i className="bi bi-telephone" />
          </button>
          <button className="cc-icon-btn" title="Video call">
            <i className="bi bi-camera-video" />
          </button>
          <button className="cc-icon-btn" title="More">
            <i className="bi bi-three-dots-vertical" />
          </button>
        </div>
      </div>

      {/* ── Error Alert ───────────────────────────── */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show m-3"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* ── Messages area ───────────────────────────── */}
      <div className="cc-messages">
        <div className="cc-date-label">{dateLabel}</div>

        {messages.length === 0 && (
          <div className="cc-no-messages">No messages yet. Say hello!</div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`cc-msg-row ${msg.sender === "me" ? "me" : "them"}`}
          >
            {msg.sender === "them" && renderAvatar("cc-msg-avatar")}
            <div className="cc-msg-block">
              <div
                className={`cc-bubble ${msg.sender === "me" ? "cc-bubble-me" : "cc-bubble-them"}`}
              >
                {msg.text}
                {msg.pending && (
                  <span className="ms-2">
                    <div
                      className="spinner-border spinner-border-sm"
                      role="status"
                      style={{ width: "12px", height: "12px" }}
                    >
                      <span className="visually-hidden">Sending...</span>
                    </div>
                  </span>
                )}
                {msg.failed && (
                  <span
                    className="ms-2 text-danger"
                    title="Failed to send. Click to retry."
                  >
                    <i
                      className="bi bi-exclamation-circle-fill"
                      style={{ cursor: "pointer" }}
                      onClick={() => retryMessage(msg)}
                    ></i>
                  </span>
                )}
              </div>
              <div className="cc-msg-meta">
                <span className="cc-msg-time">{msg.time}</span>
                {msg.sender === "me" && !msg.pending && !msg.failed && (
                  <span className="cc-seen-tick">
                    <i
                      className={`bi ${msg.seen ? "bi-check2-all text-primary" : "bi-check2"}`}
                    />
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ───────────────────────────────── */}
      <div className="cc-input-bar">
        <button className="cc-attach-btn" title="Attach">
          <i className="bi bi-plus-circle-fill" />
        </button>
        <textarea
          className="cc-input"
          placeholder="Write your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          disabled={sending}
        />
        <div className="cc-input-icons">
          <button className="cc-icon-sm" title="Emoji">
            <i className="bi bi-emoji-smile" />
          </button>
          <button className="cc-icon-sm" title="Attachment">
            <i className="bi bi-paperclip" />
          </button>
        </div>
        <button
          className={`cc-send-btn ${input.trim() && !sending ? "active" : ""}`}
          onClick={handleSendMessage}
          disabled={!input.trim() || sending}
          title="Send"
        >
          {sending ? (
            <div
              className="spinner-border spinner-border-sm"
              role="status"
              style={{ width: "16px", height: "16px" }}
            >
              <span className="visually-hidden">Sending...</span>
            </div>
          ) : (
            <i className="bi bi-send-fill" />
          )}
        </button>
      </div>

      {/* Quick replies / Templates */}
      <div className="cc-shortcuts">
        <button className="cc-shortcut-btn active">QUICK REPLIES</button>
        <button className="cc-shortcut-btn">TEMPLATES</button>
      </div>
    </div>
  );
}
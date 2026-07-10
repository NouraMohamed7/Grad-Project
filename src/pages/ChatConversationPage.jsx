import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { sendMessage, getMessages, markAsRead, getConversations } from "../apis/chat";

// كل قد ايه (بالمللي ثانية) نعمل بولينج على الرسايل الجديدة
const POLL_INTERVAL_MS = 6000;

// الشكل الحقيقي اللي بيرجع من الـ API هو:
// { success, data: { conversation: {...}, messages: [...] }, last_page, per_page, total }
// يعني الرسايل تحت data.messages، مش data مباشرة.
const extractMessagesArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data?.messages)) return res.data.messages;
  if (Array.isArray(res?.messages)) return res.messages;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

// بنرجع TODAY / YESTERDAY / أو التاريخ الفعلي بتاريخ الرسالة
const getDateLabel = (dateStr) => {
  if (!dateStr) return "";
  const msgDate = new Date(dateStr);
  if (isNaN(msgDate.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(msgDate, today)) return "TODAY";
  if (isSameDay(msgDate, yesterday)) return "YESTERDAY";

  return msgDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ⚠️ ده الراوت المفروض يودي لتفاصيل المنتج نفسه (مش صفحة المنتجات).
// لو الراوت الحقيقي عندك مختلف، غيّري السطر ده بس.
const buildProductDetailsRoute = (productId) => `/products/info/${productId}`;

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
  const currentUserId = Number(localStorage.getItem("user_id"));

  // بنستخدم activeConversationId في كل حاجة بدل الـ conversationId الجاي من location.state
  // عشان لو محادثة جديدة اتعملت أثناء إرسال أول رسالة، أو لو رجعنا نلاقيها لوحدنا، تتحدث هنا
  const [activeConversationId, setActiveConversationId] = useState(conversationId || null);

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
  // بنسيب مرجع (ref) لآخر id شفناه، ده بيساعدنا نمنع الميساجات تتكرر وقت البولينج
  const messagesRef = useRef([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // ─── Helper: format a raw API message into UI shape ──────
  const formatMessage = useCallback(
    (msg) => ({
      id: msg.id,
      sender: msg.sender_id === currentUserId ? "me" : "them",
      text: msg.body || msg.message,
      time: new Date(msg.created_at).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      rawDate: msg.created_at || null,
      seen: msg.is_read || false,
      // المنتج (لو الرسالة دي بردكت متبعت) بيجي كحقول جاهزة من الـ API
      // نفس مستوى "message" مش جوه الـ text، فمش محتاجين JSON.parse خالص
      productName: msg.product_name || null,
      productImage: msg.product_image || null,
      productId: msg.product_id || null,
    }),
    [currentUserId],
  );

  // ─── Fetch messages (initial load) ────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        let convId = conversationId || null;

        // لو مفيش conversationId جاي من location.state (يعني دخلنا الصفحة بـ refresh
        // أو رابط مباشر من غير navigate)، بنحاول نلاقي المحادثة من قايمة conversations
        // بمطابقة الـ other_user.id مع الـ chatId اللي في الرابط
        if (!convId && chatId) {
          try {
            const convosRes = await getConversations();
            const convosList = convosRes?.data || [];
            const match = convosList.find(
              (c) => String(c.other_user?.id) === String(chatId),
            );
            if (match) convId = match.id;
          } catch (lookupErr) {
            console.log("Could not resolve conversation id:", lookupErr);
          }
        }

        setActiveConversationId(convId || null);

        if (convId) {
          try {
            const res = await getMessages(convId);
            const apiMessages = extractMessagesArray(res);
            setMessages(apiMessages.map(formatMessage));
            await markAsRead(convId);
          } catch (msgErr) {
            console.log(
              "No existing conversation or messages endpoint not available:",
              msgErr,
            );
            setMessages([]);
          }
        } else {
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

    init();
  }, [chatId, conversationId, formatMessage]);

  // ─── Real-time (polling) — setInterval ────────────────────
  // بنسأل السيرفر كل فترة (POLL_INTERVAL_MS) عشان أي رسالة جديدة
  // توصل من غير ما تعمل Reload للصفحة. بنوقف البولينج لو التاب مش فاتحة توفير للريكوستات.
  useEffect(() => {
    if (!activeConversationId) return;

    let isTabVisible = !document.hidden;
    const handleVisibility = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const interval = setInterval(async () => {
      if (!isTabVisible) return;
      try {
        const res = await getMessages(activeConversationId);
        const apiMessages = extractMessagesArray(res);

        const existingIds = new Set(messagesRef.current.map((m) => m.id));
        const newOnes = apiMessages
          .map(formatMessage)
          .filter((m) => !existingIds.has(m.id));

        if (newOnes.length > 0) {
          setMessages((prev) => [...prev, ...newOnes]);
          await markAsRead(activeConversationId);
        }
      } catch (err) {
        console.log("Polling error:", err);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [activeConversationId, formatMessage]);

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

    const tempId = Date.now();
    const newMessage = {
      id: tempId,
      sender: "me",
      text,
      time,
      rawDate: now.toISOString(),
      seen: false,
      pending: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await sendMessage(parseInt(chatId), text);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                pending: false,
                seen: true,
                id: res.data?.message?.id || tempId,
              }
            : msg,
        ),
      );

      // أول رسالة في محادثة جديدة: نمسك الـ conversationId الجديد من الـ response
      // عشان البولينج والـ markAsRead يشتغلوا من غير ما نحتاج refresh للصفحة،
      // وبنحدث location.state عشان لو حصل refresh يفضل موجود.
      const newConvId = res.data?.conversation?.id;
      if (!activeConversationId && newConvId) {
        setActiveConversationId(newConvId);
        navigate(location.pathname, {
          replace: true,
          state: { ...(location.state || {}), conversationId: newConvId },
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
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

  const retryMessage = async (msg) => {
    if (!msg.failed) return;
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    setInput(msg.text);
  };

  // بنجمع الرسايل مع فواصل التاريخ (TODAY / YESTERDAY / تاريخ فعلي)
  const groupedItems = useMemo(() => {
    const groups = [];
    let lastLabel = null;

    messages.forEach((msg) => {
      const label = getDateLabel(msg.rawDate) || "TODAY";
      if (label !== lastLabel) {
        groups.push({ type: "date", label, key: `date-${label}-${msg.id}` });
        lastLabel = label;
      }
      groups.push({ type: "message", msg, key: msg.id });
    });

    return groups;
  }, [messages]);

  const renderAvatar = (className) =>
    convoInfo.profileImage ? (
      <img src={convoInfo.profileImage} alt={convoInfo.doctorName} className={className} />
    ) : (
      <div className={className}>{convoInfo.doctorInitials}</div>
    );

  // ─── Product message card ──────────────────────────────────
  // المنتج بييجي كحقول جاهزة من الـ API (product_name / product_image / product_id)
  // مش JSON متحطوط جوه نص الرسالة، فبنعرض الكارت لو أي واحد منهم موجود.
  const renderMessageBody = (msg) => {
    if (msg.productName || msg.productImage) {
      return (
        <div
          className="cc-product-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            padding: "6px",
          }}
          onClick={() => {
            if (msg.productId) navigate(buildProductDetailsRoute(msg.productId));
          }}
        >
          {msg.productImage && (
            <img
              src={msg.productImage}
              alt={msg.productName || "product"}
              style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover" }}
            />
          )}
          <div>
            <div style={{ fontWeight: 600 }}>{msg.productName}</div>
            {msg.text && (
              <div style={{ fontSize: 12, opacity: 0.8 }}>{msg.text}</div>
            )}
          </div>
        </div>
      );
    }
    return msg.text;
  };

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
        {messages.length === 0 && (
          <div className="cc-no-messages">No messages yet. Say hello!</div>
        )}

        {groupedItems.map((item) => {
          if (item.type === "date") {
            return (
              <div className="cc-date-label" key={item.key}>
                {item.label}
              </div>
            );
          }

          const msg = item.msg;
          return (
            <div
              key={item.key}
              className={`cc-msg-row ${msg.sender === "me" ? "me" : "them"}`}
            >
              {msg.sender === "them" && renderAvatar("cc-msg-avatar")}
              <div className="cc-msg-block">
                <div
                  className={`cc-bubble ${msg.sender === "me" ? "cc-bubble-me" : "cc-bubble-them"}`}
                >
                  {renderMessageBody(msg)}
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
          );
        })}

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
// src/pages/ChatConversationPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './../styles/ChatConversation.css';

// ─── Mock data ───────────────────────────────────────────────────────────────
const mockConversations = {
  'cht-9021': {
    doctorName:    'Dr. Julianne Moore',
    doctorInitials:'JM',
    online:        true,
    messages: [
      { id: 1, sender: 'them', text: 'Good morning. We are reviewing our surgical kit requirements for next month\'s orthopedic procedures.', time: '09:12 AM' },
      { id: 2, sender: 'them', text: 'Could you confirm if the sterile kits with the SKU-900 series are currently in stock for immediate dispatch? We might need an additional 50 units by Friday.', time: '09:13 AM' },
      { id: 3, sender: 'me',   text: 'Hello Dr. Moore. I\'ve just checked our inventory. We have 120 units of the SKU-900 series available at the regional hub.', time: '09:45 AM', seen: true },
      { id: 4, sender: 'me',   text: 'I can lock in those 50 units for you now. Would you like me to process the expedited shipping for a Friday arrival?', time: '09:46 AM', seen: true },
      { id: 5, sender: 'them', text: 'Is the shipment for the sterile kits scheduled?', time: '10:45 AM' },
    ],
  },
  'cht-8954': {
    doctorName:    'Dr. James Wilson',
    doctorInitials:'JW',
    online:        false,
    messages: [
      { id: 1, sender: 'them', text: 'Hello, I need to check on the MRI shielding panels order.', time: '11:00 AM' },
      { id: 2, sender: 'me',   text: 'Hi Dr. Wilson! The panels are being prepared for dispatch.', time: '11:15 AM', seen: true },
    ],
  },
};

const fallbackConvo = {
  doctorName:    'Doctor',
  doctorInitials:'DR',
  online:        false,
  messages: [],
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function ChatConversationPage() {
  const { chatId }    = useParams();
  const navigate      = useNavigate();
  const convo         = mockConversations[chatId] || fallbackConvo;

  const [messages, setMessages] = useState(convo.messages);
  const [input,    setInput]    = useState('');
  const bottomRef               = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const now  = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now(), sender: 'me', text, time, seen: false }]);
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Group messages by date label (simplified — all "TODAY" for mock)
  const dateLabel = 'TODAY';

  return (
    <div className="cc-page">

      {/* ── Top bar ─────────────────────────────────── */}
      <div className="cc-topbar">
        <button className="cc-back-btn" onClick={() => navigate('/chat')}>
          <i className="bi bi-arrow-left" />
        </button>
        <div className="cc-doctor-info">
          <div className="cc-doc-avatar">{convo.doctorInitials}</div>
          <div>
            <div className="cc-doc-name">{convo.doctorName}</div>
            <div className={`cc-doc-status ${convo.online ? 'online' : 'offline'}`}>
              <span className="cc-dot" />
              {convo.online ? 'ONLINE' : 'OFFLINE'}
            </div>
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

      {/* ── Messages area ───────────────────────────── */}
      <div className="cc-messages">
        <div className="cc-date-label">{dateLabel}</div>

        {messages.length === 0 && (
          <div className="cc-no-messages">No messages yet. Say hello!</div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`cc-msg-row ${msg.sender === 'me' ? 'me' : 'them'}`}>
            {msg.sender === 'them' && (
              <div className="cc-msg-avatar">{convo.doctorInitials}</div>
            )}
            <div className="cc-msg-block">
              <div className={`cc-bubble ${msg.sender === 'me' ? 'cc-bubble-me' : 'cc-bubble-them'}`}>
                {msg.text}
              </div>
              <div className="cc-msg-meta">
                <span className="cc-msg-time">{msg.time}</span>
                {msg.sender === 'me' && (
                  <span className="cc-seen-tick">
                    <i className={`bi ${msg.seen ? 'bi-check2-all' : 'bi-check2'}`} />
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
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
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
          className={`cc-send-btn ${input.trim() ? 'active' : ''}`}
          onClick={sendMessage}
          disabled={!input.trim()}
          title="Send"
        >
          <i className="bi bi-send-fill" />
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
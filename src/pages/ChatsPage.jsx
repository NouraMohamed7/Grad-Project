import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConversations } from '../apis/chat';
import '../styles/chats.css';

const ITEMS_PER_PAGE = 5;

// بنجيب صورة البروفايل لو موجودة (سواء دكتور أو supplier)
const getProfileImage = (otherUser) => {
  return (
    otherUser?.doctor?.profile_image_url ||
    otherUser?.supplier?.profile_image_url ||
    otherUser?.supplier?.company_image_url ||
    null
  );
};

export default function ChatsPage() {
  const navigate = useNavigate();

  const [search, setSearch]   = useState('');
  const [page,   setPage]     = useState(1);
  const [chats,  setChats]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);

        const convosRes = await getConversations();
        const convosData = convosRes.data || [];

        // الشكل الحقيقي بيرجع: { id, other_user: { id, fullname, role, doctor/supplier }, last_message_at }
        const formattedChats = convosData.map(convo => {
          const other = convo.other_user || {};

          return {
            id: other.id,                          // ← ID المستخدم التاني (نستخدمه للـ navigate)
            userName: other.fullname || `User #${other.id}`,
            role: other.role || '',
            profileImage: getProfileImage(other),
            lastDate: convo.last_message_at
              ? new Date(convo.last_message_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })
              : 'No messages yet',
            conversationId: convo.id,               // ← ID المحادثة نفسها
          };
        });

        setChats(formattedChats);
        setError(null);
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError(err.message || "Failed to load chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  // بندور بالـ ID زي التصميم
  const filtered = chats.filter(c =>
    String(c.id).toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const goToChat = (chat) => {
    navigate(`/chat/${chat.id}`, {
      state: {
        conversationId: chat.conversationId,
        userName: chat.userName,
        role: chat.role,
        profileImage: chat.profileImage,
      }
    });
  };

  // ─── Loading State ────────────────────────────────────────
  if (loading) {
    return (
      <div className="ch-page">
        <div className="ch-card">
          <div className="ch-card-header">
            <h2 className="ch-title">Chats</h2>
          </div>
          <div className="ch-table-wrap">
            <div className="ch-empty" style={{ padding: '40px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading chats...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────
  if (error) {
    return (
      <div className="ch-page">
        <div className="ch-card">
          <div className="ch-card-header">
            <h2 className="ch-title">Chats</h2>
          </div>
          <div className="ch-table-wrap">
            <div className="ch-empty text-danger" style={{ padding: '40px' }}>
              <i className="bi bi-exclamation-triangle-fill fs-1"></i>
              <p className="mt-3">{error}</p>
              <button
                className="btn btn-primary mt-2"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ch-page">
      <div className="ch-card">

        {/* Header */}
        <div className="ch-card-header">
          <h2 className="ch-title">Chats</h2>
          <div className="ch-header-actions">
            <div className="ch-search-wrap">
              <i className="bi bi-search ch-search-icon" />
              <input
                className="ch-search"
                type="text"
                placeholder="Search by ID..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <button className="ch-new-btn" onClick={() => navigate('/chat/new')}>
              <i className="bi bi-plus" /> New Offer
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="ch-table-wrap">
          <table className="ch-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>USER NAME</th>
                <th>LAST DATE</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={3} className="ch-empty">No chats found.</td>
                </tr>
              ) : paginated.map(chat => (
                <tr
                  key={chat.conversationId ?? chat.id}
                  className="ch-row"
                  onClick={() => goToChat(chat)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="ch-id">#{chat.id}</td>
                  <td className="ch-username">{chat.userName}</td>
                  <td className="ch-date">{chat.lastDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="ch-footer">
          <span className="ch-count">
            Showing{' '}
            <strong>{filtered.length > 0 ? ((page - 1) * ITEMS_PER_PAGE) + 1 : 0}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</strong>
            {' '}of <strong>{filtered.length}</strong> offers
          </span>
          <div className="ch-pagination">
            <button className="ch-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </button>
            <button className="ch-page-btn" disabled={page >= totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}>
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
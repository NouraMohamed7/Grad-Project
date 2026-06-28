import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContacts, getConversations } from '../apis/chat';
import '../styles/Chats.css';

const ITEMS_PER_PAGE = 5;

export default function ChatsPage() {
  const navigate = useNavigate();

  // ─── States ───────────────────────────────────────────────
  const [search, setSearch]     = useState('');
  const [page,   setPage]       = useState(1);
  const [chats,  setChats]      = useState([]);      // ← بيانات حقيقية من API
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);

  // ─── Fetch contacts from API ────────────────────────────────
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);

        // بنجيب الـ contacts من الـ API
        const contactsRes = await getContacts();

        // بنجيب الـ conversations عشان نعرف مين اتكلمه قبل كده
        const convosRes = await getConversations();

        // بندمج الـ contacts مع الـ conversations
        // كل contact هنحوله لشكل الـ chat اللي الصفحة بتستخدمه
        const contactsData = contactsRes.data || [];
        const convosData = convosRes.data || [];

        // بنعمل map للـ contacts ونضيف معلومات من الـ conversations لو موجودة
        const formattedChats = contactsData.map(contact => {
          // بندور على conversation مع الـ contact ده
          const convo = convosData.find(c => 
            c.participant_one === contact.id || c.participant_two === contact.id
          );

          return {
            id: contact.id,                    // ← الـ ID الحقيقي من API
            userName: contact.fullname,         // ← الاسم من API
            role: contact.role,                  // ← doctor أو supplier
            email: contact.email,                // ← الإيميل
            lastDate: convo 
              ? new Date(convo.last_message_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })
              : 'No messages yet',
            conversationId: convo ? convo.id : null, // ← ID المحادثة لو موجودة
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

  // ─── Search filter ────────────────────────────────────────
  const filtered = chats.filter(c =>
    String(c.id).toLowerCase().includes(search.toLowerCase()) ||
    c.userName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // ─── Navigate to chat ─────────────────────────────────────
  const goToChat = (chat) => {
    // بنبعت الـ receiver_id (id بتاع الشخص) والـ conversation_id لو موجودة
    navigate(`/chat/${chat.id}`, { 
      state: { 
        conversationId: chat.conversationId,
        userName: chat.userName,
        role: chat.role,
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
                placeholder="Search by name or email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <button className="ch-new-btn" onClick={() => navigate('/chat/new')}>
              <i className="bi bi-plus" /> New Chat
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
                <th>ROLE</th>
                <th>LAST DATE</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="ch-empty">No chats found.</td>
                </tr>
              ) : paginated.map(chat => (
                <tr
                  key={chat.id}
                  className="ch-row"
                  onClick={() => goToChat(chat)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="ch-id">#{chat.id}</td>
                  <td className="ch-username">
                    <div className="d-flex align-items-center gap-2">
                      <div 
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                        style={{ width: '32px', height: '32px', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        {chat.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <div>{chat.userName}</div>
                        <small className="text-muted">{chat.email}</small>
                      </div>
                    </div>
                  </td>
                  <td className="ch-role">
                    <span className={`badge ${chat.role === 'doctor' ? 'bg-info' : 'bg-success'}`}>
                      {chat.role}
                    </span>
                  </td>
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
            {' '}of <strong>{filtered.length}</strong> contacts
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
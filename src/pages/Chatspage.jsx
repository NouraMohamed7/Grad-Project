// src/pages/ChatsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Chats.css';

const mockChats = [
  { id: '#CHT-9021', userName: 'Dr. Sarah Jenkins', lastDate: 'Oct 24, 2023' },
  { id: '#CHT-8954', userName: 'Dr. James Wilson',  lastDate: 'Oct 23, 2023' },
  { id: '#CHT-8842', userName: 'Dr. Michael Chen',  lastDate: 'Oct 22, 2023' },
  { id: '#CHT-8811', userName: 'Dr. Emily Patel',   lastDate: 'Oct 21, 2023' },
  { id: '#CHT-8790', userName: 'Dr. Robert Smith',  lastDate: 'Oct 20, 2023' },
];

const ITEMS_PER_PAGE = 5;

export default function ChatsPage() {
  const navigate = useNavigate();
  const [search, setSearch]   = useState('');
  const [page,   setPage]     = useState(1);

  const filtered = mockChats.filter(c =>
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.userName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const chatId = (raw) => raw.replace('#', '').toLowerCase(); // e.g. CHT-9021

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
                  key={chat.id}
                  className="ch-row"
                  onClick={() => navigate(`/chat/${chatId(chat.id)}`)}
                >
                  <td className="ch-id">{chat.id}</td>
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
            <strong>{((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</strong>
            {' '}of <strong>{filtered.length}</strong> offers
          </span>
          <div className="ch-pagination">
            <button className="ch-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </button>
            <button className="ch-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
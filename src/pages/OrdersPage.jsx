// src/pages/OrdersPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/order.css';

const allOrders = [
  { id: '#ORD-5501', type: 'Sale',   email: 'dr.sarah.connor@hospital.com', date: 'Oct 24, 2023', status: 'Confirmed', issue: null },
  { id: '#ORD-5498', type: 'Rental', email: 'j.smith.md@clinic.org',         date: 'Oct 23, 2023', status: 'Paid',      issue: 'Late delivery' },
  { id: '#ORD-5492', type: 'Sale',   email: 'robert.chen@medical.edu',       date: 'Oct 22, 2023', status: 'Cancelled', issue: null },
  { id: '#ORD-5480', type: 'Rental', email: 'a.wilson@heartcenter.com',      date: 'Oct 21, 2023', status: 'Delivered', issue: null },
  { id: '#ORD-5475', type: 'Sale',   email: 'm.miller@surgery.com',          date: 'Oct 20, 2023', status: 'Pending',   issue: 'Payment dispute' },
  { id: '#ORD-5470', type: 'Rental', email: 'c.jones@medlab.org',            date: 'Oct 19, 2023', status: 'Confirmed', issue: null },
  { id: '#ORD-5465', type: 'Sale',   email: 'k.patel@healthplus.com',        date: 'Oct 18, 2023', status: 'Delivered', issue: null },
  { id: '#ORD-5460', type: 'Rental', email: 'l.brown@cityhospital.org',      date: 'Oct 17, 2023', status: 'Paid',      issue: 'Wrong item' },
  { id: '#ORD-5455', type: 'Sale',   email: 'n.garcia@surgeons.net',         date: 'Oct 16, 2023', status: 'Pending',   issue: null },
  { id: '#ORD-5450', type: 'Sale',   email: 'p.wong@medcenter.edu',          date: 'Oct 15, 2023', status: 'Confirmed', issue: null },
  { id: '#ORD-5445', type: 'Rental', email: 'r.kim@radiology.org',           date: 'Oct 14, 2023', status: 'Delivered', issue: null },
  { id: '#ORD-5440', type: 'Sale',   email: 'q.ali@clinic.com',              date: 'Oct 13, 2023', status: 'Cancelled', issue: 'Payment dispute' },
  { id: '#ORD-5435', type: 'Rental', email: 'f.hassan@regional.org',        date: 'Oct 12, 2023', status: 'Paid',      issue: null },
  { id: '#ORD-5430', type: 'Sale',   email: 't.evans@trauma.net',            date: 'Oct 11, 2023', status: 'Confirmed', issue: null },
  { id: '#ORD-5425', type: 'Rental', email: 'y.lee@biotech.edu',             date: 'Oct 10, 2023', status: 'Delivered', issue: 'Late delivery' },
];

const ISSUES = ['None', 'Late delivery', 'Payment dispute', 'Wrong item', 'Damaged item'];
const TYPES  = ['All Types', 'Sale', 'Rental'];
const PAGE_SIZE = 5;

const statusColors = {
  Confirmed: { bg: '#eff6ff', color: '#2563eb' },
  Paid:      { bg: '#f0fdf4', color: '#16a34a' },
  Cancelled: { bg: '#fef2f2', color: '#dc2626' },
  Delivered: { bg: '#f0fdf4', color: '#16a34a' },
  Pending:   { bg: '#fffbeb', color: '#d97706' },
};

const issueColors = { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };

export default function OrdersPage() {
  const navigate = useNavigate();
  const [search, setSearch]     = useState('');
  const [typeFilter, setType]   = useState('All Types');
  const [page, setPage]         = useState(1);
  const [issueMap, setIssueMap] = useState(
    Object.fromEntries(allOrders.map(o => [o.id, o.issue]))
  );
  const [statusMap, setStatusMap] = useState(
    Object.fromEntries(allOrders.map(o => [o.id, o.status]))
  );

  const filtered = allOrders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = o.id.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
    const matchType   = typeFilter === 'All Types' || o.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = v => { setSearch(v); setPage(1); };
  const handleType   = v => { setType(v);   setPage(1); };

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div className="page-title">
          <h1>Orders</h1>
          <p>Track, manage, and process all customer orders.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export"><i className="bi bi-download" /> Export Orders</button>
        </div>
      </div>

      <div className="ord-table-card">
        {/* Header */}
        <div className="ord-table-header">
          <span className="ord-table-title">Orders Management with Issue Tracking</span>
          <div className="ord-table-controls">
            <div className="search-bar" style={{ maxWidth: 260 }}>
              <i className="bi bi-search search-icon" />
              <input
                type="text"
                placeholder="Search order ID or email..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
              />
            </div>
            <div className="ord-type-select-wrap">
              <select
                className="ord-type-select"
                value={typeFilter}
                onChange={e => handleType(e.target.value)}
              >
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <i className="bi bi-chevron-down ord-type-chevron" />
            </div>
            <button className="btn-export">
              <i className="bi bi-download" /> Export Orders
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="ord-table-wrap">
          <table className="ord-table">
            <thead>
              <tr>
                <th>ORDER NUMBER</th>
                <th>ORDER TYPE</th>
                <th>DOCTOR EMAIL</th>
                <th>CREATED AT</th>
                <th>STATUS</th>
                <th>ISSUE</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(o => {
                const currentStatus = statusMap[o.id];
                const currentIssue  = issueMap[o.id];
                const sc = statusColors[currentStatus] || { bg: '#f5f7fa', color: '#374151' };
                const hasIssue = currentIssue && currentIssue !== 'None';
                return (
                  <tr
                    key={o.id}
                    className="ord-row"
                    onClick={() => navigate(`/orders/${o.id.replace('#', '')}`)}
                  >
                    <td className="ord-id">{o.id}</td>
                    <td>
                      <span className={`ord-type-badge ${o.type === 'Sale' ? 'sale' : 'rental'}`}>
                        {o.type}
                      </span>
                    </td>
                    <td className="ord-email">{o.email}</td>
                    <td className="ord-date">{o.date}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="ord-status-wrap">
                        <select
                          className="ord-status-select"
                          style={{ background: sc.bg, color: sc.color }}
                          value={currentStatus}
                          onChange={e => setStatusMap(m => ({ ...m, [o.id]: e.target.value }))}
                        >
                          {Object.keys(statusColors).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <i className="bi bi-chevron-down ord-status-chevron" style={{ color: sc.color }} />
                      </div>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      {hasIssue ? (
                        <div className="ord-issue-wrap">
                          <span
                            className="ord-issue-badge"
                            style={{ background: issueColors.bg, color: issueColors.color, border: `1.5px solid ${issueColors.border}` }}
                          >
                            {currentIssue}
                          </span>
                        </div>
                      ) : (
                        <div className="ord-issue-wrap">
                          <select
                            className="ord-issue-select"
                            value={currentIssue || 'None'}
                            onChange={e => setIssueMap(m => ({ ...m, [o.id]: e.target.value === 'None' ? null : e.target.value }))}
                          >
                            {ISSUES.map(i => <option key={i}>{i}</option>)}
                          </select>
                          <i className="bi bi-chevron-down ord-issue-chevron" />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="ord-pagination">
          <span className="ord-pagination-info">
            Showing <b>{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}</b> of <b>{filtered.length}</b> orders
          </span>
          <div className="ord-pagination-btns">
            <button
              className="ord-page-btn"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </button>
            <button
              className="ord-page-btn"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
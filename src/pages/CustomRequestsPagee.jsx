// src/pages/CustomRequestOrdersPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './../styles/Customrequests.css';

const initialOrders = [
  { id: 'REQ-7720', email: 'dr.smith@hospital.com', budget: 12450.00, status: 'shipped' },
  { id: 'REQ-7720', email: 'sarah.jones@clinic.org', budget: 45000.00, status: 'delivered' },
  { id: 'REQ-7720', email: 'm.chen@medcenter.net', budget: 8200.00, status: 'in negotiation' },
  { id: '#ORD-8811', email: 'dr.wilson@health.gov', budget: 18700.00, status: 'cancelled' },
  { id: '#ORD-8790', email: 'a.patel@surgery.com', budget: 22150.00, status: 'shipped' },
];

const ORDER_STATUS_CLASS = {
  shipped: 'ostatus-shipped',
  delivered: 'ostatus-delivered',
  'in negotiation': 'ostatus-negotiation',
  cancelled: 'ostatus-cancelled',
};

const ITEMS_PER_PAGE = 5;

export default function CustomRequestOrdersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = initialOrders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="cr-page">
      <div className="cr-card">
        <div className="cr-card-header">
          <h2 className="cr-title">Custom Request Orders</h2>
          <div className="cr-header-actions">
            <div className="cr-search-wrap">
              <i className="bi bi-search cr-search-icon" />
              <input
                className="cr-search"
                type="text"
                placeholder="Search by ID..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <button className="cr-new-btn" onClick={() => navigate('/requests/make-offer')}>
              <i className="bi bi-plus" /> New Offer
            </button>
          </div>
        </div>

        <div className="cr-table-wrap">
          <table className="cr-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>DOCTOR EMAIL</th>
                <th>BUDGET</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="cr-empty">No orders found.</td>
                </tr>
              ) : paginated.map(order => (
                <tr
                  key={order.id}
                  className="cr-row"
                  onClick={() => navigate(`/requests/order-details/${order.id}`)}
                >
                  <td className="cr-id">{order.id}</td>
                  <td className="cr-email">{order.email}</td>
                  <td className="cr-budget">${order.budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <span className={`cr-ostatus ${ORDER_STATUS_CLASS[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cr-footer">
          <span className="cr-count">
            Showing <strong>{((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</strong> of <strong>{filtered.length}</strong> offers
          </span>
          <div className="cr-pagination">
            <button
              className="cr-page-btn"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >Previous</button>
            <button
              className="cr-page-btn"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(p => p + 1)}
            >Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
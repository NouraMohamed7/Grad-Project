// src/pages/CustomRequestOrdersPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupplierOfferOrders } from '../apis/requests';

const STATUS_CLASS = {
  shipped:          'ostatus-shipped',
  delivered:        'ostatus-delivered',
  'in negotiation': 'ostatus-negotiation',
  cancelled:        'ostatus-cancelled',
  pending:          'ostatus-negotiation',
  accepted:         'ostatus-delivered',
  rejected:         'ostatus-cancelled',
  paid:             'ostatus-delivered',
  open:             'ostatus-negotiation',
};

const ITEMS_PER_PAGE = 5;

export default function CustomRequestOrdersPage() {
  const navigate = useNavigate();
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total,    setTotal]    = useState(0);

  const fetchOrders = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSupplierOfferOrders(p, ITEMS_PER_PAGE);
      const raw  = res?.data ?? [];
      const list = raw.map((item, i) => ({ ...item, _rowKey: `${item.id ?? 'row'}-${i}` }));
      setOrders(list);
      setLastPage(res.last_page ?? 1);
      setTotal(res.total ?? 0);
    } catch (err) {
      setError(err?.response?.data?.error ?? err?.message ?? 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(page); }, [page]);

  const getId     = (o) => o.id ?? o.request_id ?? '—';
  const getEmail  = (o) => o.custom_request?.doctor?.all_user?.email ?? '—';
  const getPrice  = (o) => Number(o.price ?? o.budget ?? o.total ?? 0);
  const getStatus = (o) => (o.status ?? 'pending').toLowerCase();

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return (
      String(getId(o)).toLowerCase().includes(q) ||
      getEmail(o).toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, lastPage);
  const from       = total === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const to         = Math.min(page * ITEMS_PER_PAGE, total);

  if (loading) return (
    <div className="cr-page">
      <div className="cr-card">
        <div className="cr-loading">Loading orders...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="cr-page">
      <div className="cr-card">
        <div className="cr-error">{error}</div>
        <button className="cr-new-btn" style={{ marginTop: 12 }} onClick={() => fetchOrders(page)}>Retry</button>
      </div>
    </div>
  );

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
                placeholder="Search by ID or email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <button className="cr-new-btn" onClick={() => navigate('/requests/open')}>
              <i className="bi bi-eye" /> View Open Requests
            </button>
          </div>
        </div>

        <div className="cr-table-wrap">
          <table className="cr-table">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>REQUEST ID</th>
                <th>DOCTOR EMAIL</th>
                <th>PRICE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="cr-empty">No orders found.</td>
                </tr>
              ) : filtered.map(order => {
                const id        = getId(order);
                const requestId = order.request_id ?? '—';
                const email     = getEmail(order);
                const price     = getPrice(order);
                const status    = getStatus(order);

                return (
                  <tr
                    key={order._rowKey}
                    className="cr-row"
                    onClick={() => navigate(`/requests/order-details/${order.id ?? order._rowKey}`)}
                  >
                    <td className="cr-id">#{id}</td>
                    <td className="cr-id" style={{ color: 'var(--cr-muted, #888)' }}>#{requestId}</td>
                    <td className="cr-email">{email}</td>
                    <td className="cr-budget">
                      {price > 0
                        ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                        : <span style={{ color: 'var(--cr-muted, #aaa)', fontStyle: 'italic' }}>No price yet</span>
                      }
                    </td>
                    <td>
                      <span className={`cr-ostatus ${STATUS_CLASS[status] ?? 'ostatus-negotiation'}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="cr-footer">
          <span className="cr-count">
            Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> orders
          </span>
          <div className="cr-pagination">
            <button
              className="cr-page-btn"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >Previous</button>
            <button
              className="cr-page-btn"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}
// src/pages/CustomRequestOffersPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSupplierOffers, getErrorMessage } from '../apis/requests';

const STATUS_CLASS = {
  pending: 'ostatus-negotiation',
  accepted: 'ostatus-delivered',
  rejected: 'ostatus-cancelled',
  cancelled: 'ostatus-cancelled',
  shipped: 'ostatus-shipped',
  delivered: 'ostatus-delivered',
  open: 'ostatus-negotiation',
};

const STATUS_LABEL = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  shipped: 'Shipped',
  delivered: 'Delivered',
  open: 'Open',
};

const fmtMoney = (value) => {
  if (value === null || value === undefined || value === '') return 'Open budget';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

export default function CustomRequestOffersPage() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const perPage = 8;

  const fetchOffers = async (activePage = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await getSupplierOffers(activePage, perPage);
      const list = Array.isArray(response?.data) ? response.data : [];
      setOffers(list);
      setLastPage(response?.last_page || 1);
      setTotal(response?.total || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers(page);
  }, [page]);

  const filtered = offers.filter((offer) => {
    const query = search.toLowerCase();
    const requestId = `${offer.request_id ?? ''}`.toLowerCase();
    const offerId = `${offer.id ?? ''}`.toLowerCase();
    const title = `${offer.custom_request?.item?.join(' ') || ''}`.toLowerCase();
    return offerId.includes(query) || requestId.includes(query) || title.includes(query);
  });

  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  // customRequest/cancel/{id} is documented under doctor_token auth only —
  // there is no supplier-facing cancel endpoint in the API yet, so the
  // action is disabled here instead of calling an endpoint that will 401/403.

  if (loading) {
    return (
      <div className="cr-page">
        <div className="cr-card">
          <div className="cr-loading">Loading your submitted offers...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cr-page">
        <div className="cr-card">
          <div className="cr-error">{error}</div>
          <button className="cr-new-btn" style={{ margin: '12px auto 0', display: 'block' }} onClick={() => fetchOffers(page)}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cr-page">
      <div className="cr-card">
        <div className="cr-card-header">
          <h2 className="cr-title">Custom Requests Offers</h2>
          <div className="cr-header-actions">
            <div className="cr-search-wrap">
              <i className="bi bi-search cr-search-icon" />
              <input
                className="cr-search"
                type="text"
                placeholder="Search by ID..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <button className="cr-new-btn" onClick={() => navigate('/requests/open')}>
              <i className="bi bi-plus" /> New Offer
            </button>
          </div>
        </div>

        <div className="cr-table-wrap">
          <table className="cr-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Request ID</th>
                <th>Status</th>
                <th>Budget</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="cr-empty">
                    No offers found for your account yet.
                  </td>
                </tr>
              ) : (
                filtered.map((offer) => {
                  const status = (offer.status || 'pending').toLowerCase();
                  const requestTitle = offer.custom_request?.item?.[0] || `Request #${offer.request_id ?? offer.id}`;
                  const isCancellable = ['pending', 'open', 'in negotiation'].includes(status);
                  return (
                    <tr key={offer.id} className="cr-row">
                      <td className="cr-id">#OFF-{offer.id}</td>
                      <td>
                        <div className="cr-email">REQ-{offer.request_id ?? '—'}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{requestTitle}</div>
                      </td>
                      <td>
                        <span className={`cr-ostatus ${STATUS_CLASS[status] || 'ostatus-negotiation'}`}>
                          {STATUS_LABEL[status] || status}
                        </span>
                      </td>
                      <td className="cr-budget">{fmtMoney(offer.price ?? offer.budget)}</td>
                      <td>
                        {isCancellable ? (
                          <button
                            className="cr-cancel-btn"
                            disabled
                            title="Cancelling isn't available for suppliers yet"
                            style={{ opacity: 0.45, cursor: 'not-allowed' }}
                          >
                            <i className="bi bi-x-circle-fill" style={{ fontSize: 14 }} />
                            Cancel
                          </button>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="cr-footer">
          <span className="cr-count">
            Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> offers
          </span>
          <div className="cr-pagination">
            <button className="cr-page-btn" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
              Previous
            </button>
            <button className="cr-page-btn" disabled={page === lastPage} onClick={() => setPage((current) => current + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
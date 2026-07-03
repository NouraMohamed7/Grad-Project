// src/pages/OpenRequestsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getOpenRequests } from '../apis/requests';

// API returns type: "rental" | "tools" | "paid"
// Each type has its own tag style, price label/suffix, and details-box label
// to match the target design (rental = monthly rate, tools = per-unit budget
// with "procurement requirements" copy, paid = flat budget).
const TYPE_CONFIG = {
  rental: {
    label: 'RENTAL SUITE',
    className: 'tag-rental',
    priceLabel: 'ESTIMATED MONTHLY',
    priceSuffix: '/mo',
    detailsLabel: 'ADDITIONAL DETAILS',
  },
  tools: {
    label: 'TOOLS',
    className: 'tag-tools',
    priceLabel: 'EXPECTED BUDGET',
    priceSuffix: '/ unit',
    detailsLabel: 'PROCUREMENT REQUIREMENTS',
  },
  paid: {
    label: 'PAID DEVICES',
    className: 'tag-paid',
    priceLabel: 'EXPECTED BUDGET',
    priceSuffix: '',
    detailsLabel: 'ADDITIONAL DETAILS',
  },
};

const getTypeConf = (type = '') => TYPE_CONFIG[type.toLowerCase()] ?? TYPE_CONFIG.paid;

const getInitials = (id) => `D${id}`; // doctor_id used as fallback since API doesn't return name here

// Formats the urgency label the way the design does:
// "Expires in 48 Hours" when close to expiry, otherwise "Expires: Mon D, YYYY"
const formatExpiry = (expiresAt) => {
  if (!expiresAt) return { text: 'No expiry set', isUrgent: false };

  const expiry = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiry - now;
  const isUrgent = diffMs < 48 * 60 * 60 * 1000; // less than 48h

  if (isUrgent && diffMs > 0) {
    const hoursLeft = Math.max(1, Math.round(diffMs / (60 * 60 * 1000)));
    return { text: `Expires in ${hoursLeft} Hours`, isUrgent: true };
  }

  const dateStr = expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return { text: `Expires: ${dateStr}`, isUrgent: diffMs < 0 ? false : isUrgent };
};

export default function OpenRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [page,     setPage]     = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total,    setTotal]    = useState(0);

  const fetchRequests = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      // ✅ FIXED: status param removed — not supported by the supplier/show endpoint
      const res = await getOpenRequests(p, 15);
      // Real shape: { success, message, data: [], last_page, per_page, total }
      setRequests(res.data ?? []);
      setLastPage(res.last_page ?? 1);
      setTotal(res.total ?? 0);
    } catch (err) {
      setError(err?.response?.data?.error ?? err?.message ?? 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(page); }, [page]);

  if (loading) return (
    <div className="or-page">
      <div className="or-loading">Loading open requests...</div>
    </div>
  );

  if (error) return (
    <div className="or-page">
      <div className="or-error">{error}</div>
      <button className="or-offer-btn" onClick={() => fetchRequests(page)}>Retry</button>
    </div>
  );

  return (
    <div className="or-page">
      <div className="or-page-header">
        <h1 className="or-page-title">Open Requests</h1>
        <p className="or-page-sub">
          Review and respond to active procurement requests from our clinical partners.
          {total > 0 && <span className="or-total-badge">{total} active</span>}
        </p>
      </div>

      <div className="or-list">
        {requests.length === 0 ? (
          <div className="or-empty">No open requests available.</div>
        ) : requests.map((req) => {
          const typeConf = getTypeConf(req.type);
          const { text: expiryText, isUrgent } = formatExpiry(req.expires_at);
          // item[] from API: ["produc1", "produc2", "produc3"]
          const items = Array.isArray(req.item) ? req.item : [];

          return (
            <div key={`${req.id}-${req.doctor_id}`} className="or-card">
              <div className="or-card-top">
                <div className="or-card-tags">
                  <span className={`or-type-tag ${typeConf.className}`}>{typeConf.label}</span>
                  <span className={`or-urgency ${isUrgent ? 'urgency-urgent' : 'urgency-normal'}`}>
                    {isUrgent
                      ? <i className="bi bi-clock-fill" style={{ marginRight: 5, fontSize: 12 }} />
                      : <i className="bi bi-calendar3"  style={{ marginRight: 5, fontSize: 12 }} />
                    }
                    {expiryText}
                  </span>
                </div>
                <div className="or-price-block">
                  <span className="or-price-label">{typeConf.priceLabel}</span>
                  <span className="or-price">
                    {req.budget
                      ? <>${Number(req.budget).toLocaleString()} <span className="or-price-suffix">{typeConf.priceSuffix}</span></>
                      : 'Open Budget'
                    }
                  </span>
                </div>
              </div>

              {/* Items list (API sends item[] array of strings) */}
              <h3 className="or-card-title">
                {items.length > 0 ? items[0] : `Request #${req.id}`}
              </h3>

              {/* Rental dates */}
              {req.rent_start_date && (
                <div className="or-dates">
                  <span className="or-date">
                    <i className="bi bi-calendar3" /> Start:{' '}
                    <strong>
                      {new Date(req.rent_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </strong>
                  </span>
                  {req.rent_end_date && (
                    <span className="or-date">
                      <i className="bi bi-calendar3" /> End:{' '}
                      <strong>
                        {new Date(req.rent_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </strong>
                    </span>
                  )}
                </div>
              )}

              {items.length > 1 && (
                <div className="or-subtags">
                  {items.slice(1).map((t, i) => (
                    <span key={i} className="or-subtag">{t}</span>
                  ))}
                </div>
              )}

              {/* Additional details / procurement requirements */}
              {req.additionalDetails && (
                <div className="or-details-box">
                  <span className="or-details-label">{typeConf.detailsLabel}</span>
                  <p className="or-details-text">{req.additionalDetails}</p>
                </div>
              )}

              <div className="or-card-footer">
                <div className="or-requester">
                  <div className="or-avatar">{getInitials(req.doctor_id)}</div>
                  <div>
                    <div className="or-req-name">Doctor #{req.doctor_id}</div>
                    <div className="or-req-org">Request #{req.id} · {req.status}</div>
                  </div>
                </div>
                <div className="or-footer-actions">
                  <button
                    className="or-offer-btn"
                    onClick={() => navigate('/requests/make-offer', {
                      state: { requestId: req.id, request: req }
                    })}
                  >
                    Make Offer
                  </button>
                  <button className="or-more-btn">
                    <i className="bi bi-three-dots" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {lastPage > 1 && (
        <div className="or-pagination">
          <button
            className="or-page-btn"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span className="or-page-info">{page} / {lastPage}</span>
          <button
            className="or-page-btn"
            disabled={page === lastPage}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
// src/pages/RequestDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getSupplierOrderById } from '../apis/requests';

const STATUS_CLASS = {
  pending:          'ostatus-negotiation',
  accepted:         'ostatus-delivered',
  rejected:         'ostatus-cancelled',
  'in negotiation': 'ostatus-negotiation',
  open:             'ostatus-negotiation',
  cancelled:        'ostatus-cancelled',
  paid:             'ostatus-delivered',
};

const fmt = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

const fmtMoney = (val) =>
  val != null && val !== ''
    ? `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    : 'Open Budget';

export default function RequestDetailsPage() {
  const navigate  = useNavigate();
  const { id }    = useParams();

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSupplierOrderById(id);
      // API returns: { success, message, data: [ { ...orderFields, custom_request: {...} } ] }
      const item = Array.isArray(res?.data) ? res.data[0] : res?.data ?? res;
      if (!item) throw new Error('Order not found.');
      setOrder(item);
    } catch (err) {
      setError(err?.response?.data?.error ?? err?.message ?? 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchOrder(); }, [id]);

  if (loading) return (
    <div className="rd-page">
      <div className="rd-header">
        <button className="rd-back-btn" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left" />
        </button>
        <h2 className="rd-title">Request Details</h2>
      </div>
      <div className="cr-loading" style={{ margin: '40px auto' }}>Loading order details...</div>
    </div>
  );

  if (error) return (
    <div className="rd-page">
      <div className="rd-header">
        <button className="rd-back-btn" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left" />
        </button>
        <h2 className="rd-title">Request Details</h2>
      </div>
      <div className="cr-error" style={{ margin: '40px auto', maxWidth: 500 }}>
        {error}
        <button className="cr-new-btn" style={{ marginTop: 12, display: 'block' }} onClick={fetchOrder}>
          Retry
        </button>
      </div>
    </div>
  );

  // order shape: { id, request_id, supplier_id, price, delivery_days, notes, status,
  //   created_at, updated_at, custom_request: { id, doctor_id, item[], type, budget,
  //   additionalDetails, expires_at, rent_start_date, rent_end_date, status,
  //   doctor: { id, user_table_id, all_user: { id, email, fullname, address } } } }

  const cr           = order?.custom_request ?? {};
  const doctor       = cr?.doctor?.all_user ?? {};
  const items        = Array.isArray(cr?.item) ? cr.item : [];
  const orderStatus  = (order?.status ?? 'pending').toLowerCase();
  const crStatus     = (cr?.status ?? '').toLowerCase();
  const fullname     = doctor?.fullname ?? `Doctor #${cr?.doctor_id ?? '—'}`;
  const initials     = fullname.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'DR';

  return (
    <div className="rd-page">
      <div className="rd-header">
        <button className="rd-back-btn" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left" />
        </button>
        <h2 className="rd-title">Order Details</h2>
        <div className="rd-actions">
          <span className={`cr-ostatus ${STATUS_CLASS[orderStatus] ?? 'ostatus-negotiation'}`}
            style={{ fontSize: 13, padding: '4px 14px' }}>
            Offer: {orderStatus}
          </span>
        </div>
      </div>

      <div className="rd-body">
        {/* ── Left: Order + Request Information ─────────────────────────── */}
        <div className="rd-main">

          {/* Offer Details */}
          <div className="rd-card">
            <div className="rd-card-head">
              <h3 className="rd-card-title">Offer Information</h3>
              <span className={`cr-ostatus ${STATUS_CLASS[orderStatus] ?? 'ostatus-negotiation'}`}>
                {orderStatus}
              </span>
            </div>
            <div className="rd-info-grid">
              <div className="rd-info-group">
                <span className="rd-label">OFFER ID</span>
                <span className="rd-value">#{order?.id ?? '—'}</span>
              </div>
              <div className="rd-info-group">
                <span className="rd-label">REQUEST ID</span>
                <span className="rd-value">#{order?.request_id ?? cr?.id ?? '—'}</span>
              </div>
              <div className="rd-info-group">
                <span className="rd-label">YOUR PRICE</span>
                <span className="rd-value rd-budget">{fmtMoney(order?.price)}</span>
              </div>
              <div className="rd-info-group">
                <span className="rd-label">DELIVERY DAYS</span>
                <span className="rd-value">
                  <i className="bi bi-truck" style={{ marginRight: 6 }} />
                  {order?.delivery_days != null ? `${order.delivery_days} days` : '—'}
                </span>
              </div>
              <div className="rd-info-group">
                <span className="rd-label">SUBMITTED ON</span>
                <span className="rd-value">{fmt(order?.created_at)}</span>
              </div>
              <div className="rd-info-group">
                <span className="rd-label">LAST UPDATED</span>
                <span className="rd-value">{fmt(order?.updated_at)}</span>
              </div>
            </div>

            {order?.notes && (
              <div className="rd-notes-section">
                <span className="rd-label">YOUR OFFER NOTES</span>
                <div className="rd-notes-box">{order.notes}</div>
              </div>
            )}
          </div>

          {/* Custom Request Details */}
          <div className="rd-card" style={{ marginTop: 16 }}>
            <div className="rd-card-head">
              <h3 className="rd-card-title">Request Information</h3>
              {crStatus && (
                <span className={`cr-ostatus ${STATUS_CLASS[crStatus] ?? 'ostatus-negotiation'}`}>
                  {crStatus}
                </span>
              )}
            </div>
            <div className="rd-info-grid">
              {items.length > 0 && (
                <div className="rd-info-group" style={{ gridColumn: '1 / -1' }}>
                  <span className="rd-label">ITEMS REQUESTED</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                    {items.map((item, i) => (
                      <span key={i} style={{
                        background: 'var(--rd-tag-bg, #f0f4ff)',
                        color: 'var(--rd-tag-color, #3b5bdb)',
                        borderRadius: 6,
                        padding: '4px 12px',
                        fontSize: 13,
                        fontWeight: 500,
                      }}>{item}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rd-info-group">
                <span className="rd-label">REQUEST TYPE</span>
                <span className="rd-value" style={{ textTransform: 'capitalize' }}>
                  {cr?.type ?? '—'}
                </span>
              </div>

              <div className="rd-info-group">
                <span className="rd-label">DOCTOR'S BUDGET</span>
                <span className="rd-value rd-budget">{fmtMoney(cr?.budget)}</span>
              </div>

              {cr?.expires_at && (
                <div className="rd-info-group">
                  <span className="rd-label">EXPIRES AT</span>
                  <span className="rd-value">
                    <i className="bi bi-calendar-x" style={{ marginRight: 6 }} />
                    {fmt(cr.expires_at)}
                  </span>
                </div>
              )}

              {cr?.rent_start_date && (
                <div className="rd-info-group">
                  <span className="rd-label">RENTAL PERIOD</span>
                  <span className="rd-value">
                    <i className="bi bi-calendar3" style={{ marginRight: 6 }} />
                    {fmt(cr.rent_start_date)} → {fmt(cr.rent_end_date)}
                  </span>
                </div>
              )}
            </div>

            {cr?.additionalDetails && (
              <div className="rd-notes-section">
                <span className="rd-label">ADDITIONAL DETAILS</span>
                <div className="rd-notes-box">{cr.additionalDetails}</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Status + Doctor Contact ───────────────────────────── */}
        <div className="rd-sidebar">
          <div className="rd-card rd-status-card">
            <h3 className="rd-card-title">Offer Status</h3>
            <div className="rd-status-badge">
              <i className={`bi ${
                orderStatus === 'accepted' ? 'bi-check-circle-fill' :
                orderStatus === 'rejected' ? 'bi-x-circle-fill' :
                'bi-clock-history'
              }`} style={{ marginRight: 8 }} />
              {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
            </div>
            {crStatus && crStatus !== orderStatus && (
              <div style={{ marginTop: 12 }}>
                <span className="rd-label">REQUEST STATUS</span>
                <div className="rd-status-badge" style={{ marginTop: 8, fontSize: 13 }}>
                  <i className="bi bi-arrow-repeat" style={{ marginRight: 8 }} />
                  {crStatus.charAt(0).toUpperCase() + crStatus.slice(1)}
                </div>
              </div>
            )}
          </div>

          <div className="rd-card rd-contact-card">
            <h3 className="rd-card-title">Doctor Contact</h3>
            <div className="rd-contact">
              <div className="rd-avatar">{initials}</div>
              <div>
                <div className="rd-contact-name">{fullname}</div>
                {doctor?.email && (
                  <div className="rd-contact-email">{doctor.email}</div>
                )}
                {doctor?.address && (
                  <div className="rd-contact-email" style={{ marginTop: 4 }}>
                    <i className="bi bi-geo-alt" style={{ marginRight: 4 }} />
                    {doctor.address}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// src/pages/RequestDetailsPage.jsx
import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const STATUS_LABEL = {
  pending: "Pending Decision",
  "in negotiation": "In Negotiation",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  accepted: "Accepted",
  rejected: "Rejected",
  open: "Pending Decision",
};

const fmtDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

const fmtMoney = (value) =>
  value || value === 0
    ? `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : null;

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

export default function RequestDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Populated when navigating from CustomRequestOrdersPage / OpenRequestsPage /
  // CustomRequestOffersPage row click: navigate(path, { state: { order } }) or { state: { request } }
  const order = location.state?.order ?? null;
  const request = location.state?.request ?? order?.custom_request ?? null;

  // ── No data guard ─────────────────────────────────────────────────────
  // There is no single "get request/order by id" endpoint in the API, so
  // this page relies entirely on data passed via navigation state. If the
  // user lands here directly (refresh, deep link), we can't refetch it.
  if (!order && !request) {
    return (
      <div className="rd-page">
        <div className="rd-header">
          <button className="rd-back-btn" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left" />
          </button>
          <h1 className="rd-title">Request Details</h1>
        </div>
        <div className="rd-card" style={{ textAlign: "center", padding: 48 }}>
          <i
            className="bi bi-exclamation-triangle-fill"
            style={{ fontSize: 36, color: "#f59e0b", display: "block", marginBottom: 14 }}
          />
          <p style={{ color: "#6b7280", marginBottom: 20 }}>
            No details available for this request. Please go back and open it
            from the list.
          </p>
          <button className="rd-share-btn" onClick={() => navigate("/requests/orders")}>
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const items = Array.isArray(request?.item) ? request.item : [];
  const productNames = items.length > 0 ? items.join(", ") : `Request #${request?.id ?? id ?? "—"}`;

  const email = order?.custom_request?.doctor?.all_user?.email
    ?? request?.doctor?.all_user?.email
    ?? "—";
  const fullname = order?.custom_request?.doctor?.all_user?.fullname
    ?? request?.doctor?.all_user?.fullname
    ?? null;

  const budget = fmtMoney(order?.price ?? order?.budget ?? request?.budget);
  const status = (order?.status ?? request?.status ?? "pending").toLowerCase();

  const deliveryDays = order?.delivery_days
    ? `${order.delivery_days} Business Days`
    : null;
  const rentStart = fmtDate(request?.rent_start_date);
  const rentEnd = fmtDate(request?.rent_end_date);

  const notes = order?.notes ?? request?.additionalDetails ?? null;

  return (
    <div className="rd-page">
      <div className="rd-header">
        <button className="rd-back-btn" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left" />
        </button>
        <h1 className="rd-title">Request Details</h1>
        <div className="rd-actions">
        
          
        </div>
      </div>

      <div className="rd-body">
        <div className="rd-card">
          <div className="rd-card-head">
            <h3 className="rd-card-title">Order Information</h3>
            <span className="rd-status-badge" style={{ padding: '4px 12px' }}>
              {STATUS_LABEL[status] ?? status}
            </span>
          </div>

          <div className="rd-info-grid">
            <div className="rd-info-group">
              <span className="rd-label">Product Names</span>
              <span className="rd-value">{productNames}</span>
            </div>
            <div className="rd-info-group">
              <span className="rd-label">Client Email</span>
              <span className="rd-value">{email}</span>
            </div>
            <div className="rd-info-group">
              <span className="rd-label">Budget Estimate</span>
              <span className="rd-value rd-budget">{budget ?? 'Open budget'}</span>
            </div>
            <div className="rd-info-group">
              <span className="rd-label">Requested Delivery</span>
              <span className="rd-value">
                {deliveryDays ?? (rentStart ? `${rentStart} → ${rentEnd ?? '—'}` : '—')}
              </span>
            </div>
          </div>

          {notes && (
            <div className="rd-notes-section">
              <span className="rd-label">Request Notes</span>
              <div className="rd-notes-box">{notes}</div>
            </div>
          )}
        </div>

        <div className="rd-sidebar">
          <div className="rd-card rd-status-card">
            <h3 className="rd-card-title">Request Status</h3>
            <div className="rd-status-badge">
              <i className="bi bi-clock-history" style={{ marginRight: 8 }} />
              {STATUS_LABEL[status] ?? status}
            </div>
          </div>

          <div className="rd-card rd-contact-card">
            <h3 className="rd-card-title">Client Contact</h3>
            <div className="rd-contact">
              <div className="rd-avatar">{getInitials(fullname ?? email)}</div>
              <div>
                <div className="rd-contact-name">{fullname ?? 'Doctor'}</div>
                <div className="rd-contact-email">{email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
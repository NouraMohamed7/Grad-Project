// src/pages/RequestDetailsPage.jsx
//
// ⚠️ FIX: previously this page ONLY worked when navigated to with
// `navigate(path, { state: { order } })`. A refresh, a shared link, or
// opening in a new tab landed on an empty "no details" screen even though
// the data exists on the server. Now it falls back to fetching by id via
// GET /offerRequest/supplier/show/order/{id} (confirmed endpoint) when no
// navigation state is present.
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { getSupplierOrderById, getErrorMessage } from "../apis/requests";

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

  const stateOrder = location.state?.order ?? null;
  const [order, setOrder] = useState(stateOrder);
  const [loading, setLoading] = useState(!stateOrder && !!id);
  const [error, setError] = useState("");

  useEffect(() => {
    // Already have data from navigation state — nothing to fetch.
    if (stateOrder) {
      setOrder(stateOrder);
      return;
    }
    // No state and no id at all — nothing we can do.
    if (!id) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    getSupplierOrderById(id)
      .then((res) => {
        if (cancelled) return;
        const fresh = Array.isArray(res?.data) ? res.data[0] : res?.data;
        if (fresh) {
          setOrder(fresh);
        } else {
          setError("Request not found.");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const request = order?.custom_request ?? null;

  if (loading) {
    return (
      <div className="rd-page">
        <div className="rd-header">
          <button className="rd-back-btn" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left" />
          </button>
          <h1 className="rd-title">Request Details</h1>
        </div>
        <div className="rd-card" style={{ textAlign: "center", padding: 48 }}>
          Loading request details...
        </div>
      </div>
    );
  }

  if (!order || error) {
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
            {error || "No details available for this request. Please go back and open it from the list."}
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

  const email = request?.doctor?.all_user?.email ?? "—";
  const fullname = request?.doctor?.all_user?.fullname ?? null;

  const budget = fmtMoney(order?.price ?? request?.budget);
  const status = (order?.status ?? request?.status ?? "pending").toLowerCase();

  const deliveryDays = order?.delivery_days ? `${order.delivery_days} Business Days` : null;
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
          <button className="rd-edit-btn" onClick={() => navigate("/requests/open")}>
            Edit Request
          </button>
          <button
            className="rd-share-btn"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
            }}
          >
            Share Details
          </button>
        </div>
      </div>

      <div className="rd-body">
        <div className="rd-card">
          <div className="rd-card-head">
            <h3 className="rd-card-title">Order Information</h3>
            <span className="rd-status-badge" style={{ padding: "4px 12px" }}>
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
              <span className="rd-value rd-budget">{budget ?? "Open budget"}</span>
            </div>
            <div className="rd-info-group">
              <span className="rd-label">Requested Delivery</span>
              <span className="rd-value">
                {deliveryDays ?? (rentStart ? `${rentStart} → ${rentEnd ?? "—"}` : "—")}
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
                <div className="rd-contact-name">{fullname ?? "Doctor"}</div>
                <div className="rd-contact-email">{email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
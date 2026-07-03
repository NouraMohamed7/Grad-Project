// src/pages/CustomRequestOrdersPage.jsx
//
// ⚠️ FIX: this file was previously pasted TWICE with conflicting content
// (different columns, different ITEMS_PER_PAGE, different button labels).
// This is the single merged/canonical version — delete any other copy.
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSupplierOfferOrders,
  getSupplierOrderById,
  updateOfferOrderStatus,
} from "../apis/requests";

const STATUS_CLASS = {
  shipped: "ostatus-shipped",
  delivered: "ostatus-delivered",
  "in negotiation": "ostatus-negotiation",
  cancelled: "ostatus-cancelled",
  pending: "ostatus-negotiation",
  accepted: "ostatus-delivered",
  rejected: "ostatus-cancelled",
  paid: "ostatus-delivered",
  open: "ostatus-negotiation",
};

// ✅ CONFIRMED via API error message (July 2026):
// "Status must not be open and must be one of: in negotiation, shipped, delivered"
// Only these 3 statuses are accepted by POST /v1/offerRequest/supplier/order/status/{id}
const AVAILABLE_STATUSES = ["in negotiation", "shipped", "delivered"];

const ITEMS_PER_PAGE = 8;

export default function CustomRequestOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [openingId, setOpeningId] = useState(null);

  const fetchOrders = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSupplierOfferOrders(p, ITEMS_PER_PAGE);
      // API shape: { success, message, data: [{ id, status, request_id, supplier_id,
      //   price, notes, custom_request: { doctor: { all_user: { email, fullname } } } }],
      //   last_page, per_page, total }
      const raw = res?.data ?? [];
      const list = raw.map((item, i) => ({
        ...item,
        _rowKey: `${item.id ?? "row"}-${i}`,
      }));
      setOrders(list);
      setLastPage(res.last_page ?? 1);
      setTotal(res.total ?? 0);
    } catch (err) {
      setError(
        err?.response?.data?.error ?? err?.message ?? "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  // ── Field normalizers matching real API response shape ──────────────────
  const getId = (o) => o.id ?? o.request_id ?? "—";
  const getRequestId = (o) => o.request_id ?? o.custom_request?.id ?? "—";
  const getEmail = (o) => o.custom_request?.doctor?.all_user?.email ?? "—";

  // ✅ FIX: Get status from custom_request.status (the order status), NOT o.status (offer status)
  const getStatus = (o) => (o.custom_request?.status ?? o.status ?? "pending").toLowerCase();

  // POST /v1/offerRequest/supplier/order/status/{id}  body: { status }
  // (confirmed endpoint, previously named "assignOrder" in the docs tree)
  const handleStatusChange = async (order, newStatus) => {
    const currentStatus = getStatus(order);
    if (newStatus === currentStatus) return;

    setUpdatingId(order.id);
    try {
      const res = await updateOfferOrderStatus(order.id, newStatus);
      if (res.success !== false) {
        // ✅ FIX: Update custom_request.status in local state (not order.status)
        setOrders((prev) =>
          prev.map((o) =>
            o._rowKey === order._rowKey
              ? {
                  ...o,
                  custom_request: {
                    ...o.custom_request,
                    status: newStatus,
                  },
                }
              : o
          )
        );
      } else {
        alert(
          "Failed to update status: " +
            (res.message || res.error || "Unknown error")
        );
      }
    } catch (err) {
      const msg =
        err.response?.data?.error || err.response?.data?.message || err.message;
      alert("Failed to update status: " + msg);
    } finally {
      setUpdatingId(null);
    }
  };

  // Cancel is UI-only — there is NO documented supplier-facing cancel/delete
  // endpoint for offer orders yet (only customRequest/cancel/{id} exists,
  // and that's doctor_token-only). Kept visually disabled/local so nothing
  // silently 401s in production.
  const handleLocalCancel = (order) => {
    setOrders((prev) =>
      prev.map((o) =>
        o._rowKey === order._rowKey
          ? {
              ...o,
              custom_request: {
                ...o.custom_request,
                status: "cancelled",
              },
            }
          : o
      )
    );
  };

  // ✅ FIX: instead of relying only on the row data (which may be stale or
  // incomplete for the detail view), re-fetch the single order by id using
  // the confirmed GET /offerRequest/supplier/show/order/{id} endpoint, then
  // pass the fresh object forward. This also makes the details page work
  // even if the row that was clicked didn't carry the full custom_request.
  const openDetails = async (order) => {
    const id = order.id;
    setOpeningId(id);
    try {
      const res = await getSupplierOrderById(id);
      const fresh = Array.isArray(res?.data) ? res.data[0] : res?.data;
      navigate(`/requests/order-details/${id}`, {
        state: { order: fresh ?? order },
      });
    } catch (err) {
      // Fall back to whatever we already have in the row rather than
      // blocking navigation entirely
      navigate(`/requests/order-details/${id}`, { state: { order } });
    } finally {
      setOpeningId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      String(getId(o)).toLowerCase().includes(q) ||
      String(getRequestId(o)).toLowerCase().includes(q) ||
      getEmail(o).toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, lastPage);
  const from = total === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const to = Math.min(page * ITEMS_PER_PAGE, total);

  if (loading)
    return (
      <div className="cr-page">
        <div className="cr-card">
          <div className="cr-loading">Loading orders...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="cr-page">
        <div className="cr-card">
          <div className="cr-error">{error}</div>
          <button
            className="cr-new-btn"
            style={{ marginTop: 12 }}
            onClick={() => fetchOrders(page)}
          >
            Retry
          </button>
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <button className="cr-new-btn" onClick={() => navigate("/requests/open")}>
              <i className="bi bi-plus" /> New Offer
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
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="cr-empty">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const id = getId(order);
                  const requestId = getRequestId(order);
                  const email = getEmail(order);
                  const status = getStatus(order);

                  return (
                    <tr
                      key={order._rowKey}
                      className="cr-row"
                      style={{ cursor: openingId === order.id ? "wait" : "pointer" }}
                      onClick={() => openDetails(order)}
                    >
                      <td className="cr-id">#ORD-{id}</td>
                      <td className="cr-id" style={{ color: "var(--cr-muted, #888)" }}>
                        #{requestId}
                      </td>
                      <td className="cr-email">{email}</td>
                      
                      <td onClick={(e) => e.stopPropagation()}>
                        <div
                          style={{
                            position: "relative",
                            display: "inline-flex",
                            gap: 6,
                            alignItems: "center",
                          }}
                        >
                          <select
                            value={status}
                            disabled={updatingId === order.id}
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                            className={`cr-ostatus ${STATUS_CLASS[status] ?? "ostatus-negotiation"}`}
                            style={{
                              border: "none",
                              cursor: updatingId === order.id ? "not-allowed" : "pointer",
                              appearance: "none",
                              WebkitAppearance: "none",
                              paddingRight: 20,
                            }}
                          >
                            {AVAILABLE_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>

                         
                        </div>
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
            Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> orders
          </span>
          <div className="cr-pagination">
            <button
              className="cr-page-btn"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              className="cr-page-btn"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
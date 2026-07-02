// src/pages/OrdersPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSupplierOrders } from "../apis/orders";

const TYPES = ["All Types", "Sale", "Rent"];
const PAGE_SIZE = 5;

const subStatusColors = {
  pending: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  processing: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  ready: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  delivered: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  cancelled: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  paid: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  confirmed: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
};

const issueColors = { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" };
const noIssueColor = { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" };

function formatDate(isoString) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// API returns 'sale' | 'rental'
function getOrderTypeLabel(order_type) {
  if (order_type === "sale") return "Sale";
  if (order_type === "rental") return "Rent";
  return order_type ?? "-";
}

// Doctor email — from doctor.all_user.email (may be absent in some responses)
function getDoctorEmail(doctor) {
  return doctor?.all_user?.email || "-";
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setType] = useState("All Types");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    getSupplierOrders()
      .then((res) => {
        if (!mounted) return;
        if (!res.success) {
          setError(res.error || res.message || "Failed to load orders");
          setLoading(false);
          return;
        }
        setOrders(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to load orders";
        setError(msg);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

 const filtered = orders.filter((o) => {
  const q = search.toLowerCase();
  const orderIdStr = `ORD-${o.id}`;
  const email = getDoctorEmail(o.doctor);
  const matchSearch =
    orderIdStr.toLowerCase().includes(q) ||
    email.toLowerCase().includes(q);
  const matchType =
    typeFilter === "All Types" ||
    getOrderTypeLabel(o.order_type) === typeFilter;
  return matchSearch && matchType;
});

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v) => {
    setSearch(v);
    setPage(1);
  };
  const handleType = (v) => {
    setType(v);
    setPage(1);
  };

  if (loading)
    return (
      <div
        className="dashboard-content"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 300,
        }}
      >
        <span>Loading orders…</span>
      </div>
    );

  if (error)
    return (
      <div
        className="dashboard-content"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 300,
        }}
      >
        <span style={{ color: "#dc2626" }}>Error: {error}</span>
      </div>
    );

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div className="page-title">
          <h1>Orders</h1>
          <p>Track, manage, and process all customer orders.</p>
        </div>
      </div>

      <div className="ord-table-card">
        <div className="ord-table-header">
          <span className="ord-table-title">
            Orders Management with Issue Tracking
          </span>
          <div className="ord-table-controls">
            <div className="ord-type-select-wrap">
              <select
                className="ord-type-select"
                value={typeFilter}
                onChange={(e) => handleType(e.target.value)}
              >
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <i className="bi bi-chevron-down ord-type-chevron" />
            </div>
          </div>
        </div>

        <div className="ord-table-wrap">
          <table className="ord-table">
            <thead>
              <tr>
                <th>ORDER NUMBER</th>
                <th>ORDER TYPE</th>
                <th>DOCTOR EMAIL</th>
                <th>CREATED AT</th>
                <th>SUB STATUS</th>
                <th>ISSUE</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((o) => {
                const items = o.items || [];
                const firstItemStatus =
                  items[0]?.sub_status ||
                  items[0]?.status ||
                  o.status ||
                  "pending";
                const ssc = subStatusColors[firstItemStatus?.toLowerCase()] || {
                  bg: "#f5f7fa",
                  color: "#374151",
                  border: "#e5e7eb",
                };
                const orderHasIssue =
                  o.order_issue &&
                  o.order_issue !== "None" &&
                  o.order_issue !== "none";
                const typeLabel = getOrderTypeLabel(o.order_type);
                const doctorEmail = getDoctorEmail(o.doctor);
                return (
                  <tr
                    key={o.id}
                    className="ord-row"
                    onClick={() => navigate(`/orders/${o.id}`)}
                  >
                    <td className="ord-id">#ORD-{o.id}</td>
                    <td>
                      {/* class matches API value: 'sale' or 'rent' */}
                      <span className={`ord-type-badge ${o.order_type}`}>
                        {typeLabel}
                      </span>
                    </td>
                    <td className="ord-email">{doctorEmail}</td>
                    <td className="ord-date">{formatDate(o.created_at)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <span
                        style={{
                          background: ssc.bg,
                          color: ssc.color,
                          border: `1.5px solid ${ssc.border}`,
                          padding: "4px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          display: "inline-block",
                          textTransform: "capitalize",
                        }}
                      >
                        {firstItemStatus}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {orderHasIssue ? (
                        <span
                          style={{
                            background: issueColors.bg,
                            color: issueColors.color,
                            border: `1.5px solid ${issueColors.border}`,
                            padding: "4px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            display: "inline-block",
                          }}
                        >
                          {o.order_issue}
                        </span>
                      ) : (
                        <span
                          style={{
                            background: noIssueColor.bg,
                            color: noIssueColor.color,
                            border: `1.5px solid ${noIssueColor.border}`,
                            padding: "4px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            display: "inline-block",
                          }}
                        >
                          No Issue
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: 40,
                      color: "#9ca3af",
                    }}
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ord-pagination">
          <span className="ord-pagination-info">
            Showing{" "}
            <b>
              {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
              {Math.min(page * PAGE_SIZE, filtered.length)}
            </b>{" "}
            of <b>{filtered.length}</b> orders
          </span>
          <div className="ord-pagination-btns">
            <button
              className="ord-page-btn"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              className="ord-page-btn"
              disabled={page >= totalPages}
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

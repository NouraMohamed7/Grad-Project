import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getSupplierOrderById,
  assignOrderStatus,
  getErrorMessage,
} from "../apis/orders";

const STATUS_LABEL = {
  pending: "Pending",
  processing: "Processing",
  confirmed: "Confirmed",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
  paid: "Paid",
};

const STATUS_DOT = {
  pending:    "#d97706",
  processing: "#2563eb",
  confirmed:  "#2563eb",
  ready:      "#16a34a",
  delivered:  "#16a34a",
  cancelled:  "#dc2626",
  paid:       "#16a34a",
};

// الحالات المسموح بالتحويل ليها فعليًا من الباك (حسب الـ Postman: processing/ready بس)
const SELECTABLE_STATUSES = ["pending", "processing", "ready"];

const fmtDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "-";

const fmtMoney = (value) =>
  value || value === 0
    ? `EGP ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : "—";

// ── Styles ──────────────────────────────────────────────────────────
const S = {
  page: { background: "#f5f6f8", minHeight: "100vh", padding: "20px 32px 60px" },
  topBar: { display: "flex", alignItems: "center", gap: 10, marginBottom: 24 },
  backBtn: {
    display: "flex", alignItems: "center", gap: 6, background: "none",
    border: "none", color: "#6b7280", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0,
  },
  headerCard: {
    background: "#fff", borderRadius: 14, border: "1px solid #eef0f3",
    padding: "22px 26px", marginBottom: 20,
  },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 22 },
  orderTitle: { fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 },
  orderSubtitle: { fontSize: 13.5, color: "#9ca3af", margin: "4px 0 0" },
  headerActions: { display: "flex", gap: 10 },
  primaryBtn: {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
    borderRadius: 9, border: "none", background: "#2563eb", color: "#fff",
    fontSize: 13.5, fontWeight: 700, cursor: "pointer",
  },
  secondaryBtn: {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
    borderRadius: 9, border: "1px solid #e5e7eb", background: "#fff", color: "#374151",
    fontSize: 13.5, fontWeight: 700, cursor: "pointer",
  },
  secondaryBtnDisabled: {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
    borderRadius: 9, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#c1c5cc",
    fontSize: 13.5, fontWeight: 700, cursor: "not-allowed",
  },
  infoGrid: {
    display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0,
    borderTop: "1px solid #f0f2f5", paddingTop: 20,
  },
  infoCol: { padding: "0 20px", borderRight: "1px solid #f0f2f5" },
  infoColLast: { padding: "0 20px" },
  infoLabel: { fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8, display: "block" },
  infoValue: { fontSize: 15, color: "#111827", fontWeight: 700 },
  statusRow: { display: "flex", alignItems: "center", gap: 7, fontSize: 15, fontWeight: 700, color: "#111827" },
  dot: (color) => ({ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }),
  typeBadge: {
    display: "inline-block", padding: "4px 12px", borderRadius: 20,
    background: "#eff6ff", color: "#2563eb", fontSize: 13, fontWeight: 700, textTransform: "capitalize",
  },
  card: { background: "#fff", borderRadius: 14, border: "1px solid #eef0f3", padding: "22px 26px", marginBottom: 20 },
  cardTitle: { fontSize: 17, fontWeight: 800, color: "#111827", margin: "0 0 18px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left", padding: "10px 14px", fontSize: 11, color: "#9ca3af",
    fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3,
    background: "#fafbfc", borderBottom: "1px solid #eef0f3",
  },
  td: { padding: "16px 14px", borderBottom: "1px solid #f4f5f7", fontSize: 14, color: "#1f2937", verticalAlign: "middle" },
  productCell: { display: "flex", alignItems: "center", gap: 12 },
  productIcon: {
    width: 38, height: 38, borderRadius: 9, background: "#eff6ff",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
  },
  productName: { fontWeight: 700, color: "#111827" },
  subBadge: (color) => ({
    display: "inline-block", padding: "3px 10px", borderRadius: 12,
    fontSize: 11.5, fontWeight: 700, textTransform: "capitalize",
    background: `${color}18`, color,
  }),
  bottomRow: { display: "flex", justifyContent: "flex-end", gap: 20, flexWrap: "wrap" },
  summaryCard: {
    background: "#fff", borderRadius: 14, border: "1px solid #eef0f3",
    padding: "20px 26px", minWidth: 300,
  },
  summaryRow: { display: "flex", justifyContent: "space-between", padding: "9px 0", fontSize: 14, color: "#374151" },
  summaryDivider: { borderTop: "1px solid #f0f2f5", margin: "6px 0" },
  summaryFinalRow: { display: "flex", justifyContent: "space-between", padding: "10px 0 4px", fontSize: 17, fontWeight: 800, color: "#111827" },
  finalTotal: { color: "#2563eb" },
  statusUpdateCard: {
    background: "#fff", borderRadius: 14, border: "1px solid #eef0f3",
    padding: "20px 26px", minWidth: 280,
  },
  statusSelect: (color, disabled) => ({
    width: "100%",
    marginTop: 12,
    padding: "10px 14px",
    borderRadius: 9,
    border: `1.5px solid ${color}55`,
    background: `${color}12`,
    color,
    fontSize: 13.5,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    outline: "none",
    appearance: "auto",
  }),
  centerBox: { textAlign: "center", padding: 48, background: "#fff", borderRadius: 14, border: "1px solid #eef0f3" },
  emailNote: { fontSize: 11, color: "#9ca3af", marginTop: 4, fontStyle: "italic" },
};

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchOrder = (silent = false) => {
    if (!id) {
      setLoading(false);
      setError("No order id found in the URL.");
      return;
    }
    if (!silent) setLoading(true);
    setError("");
    getSupplierOrderById(id)
      .then((res) => {
        const fresh = Array.isArray(res?.data) ? res.data[0] : res?.data;
        if (fresh) setOrder(fresh);
        else setError("Order not found.");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => { if (!silent) setLoading(false); });
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === status) return;
    setUpdating(true);
    try {
      await assignOrderStatus(id, newStatus);
      toast.success(`Order marked as "${newStatus}"`);
      fetchOrder(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.topBar}>
          <button style={S.backBtn} onClick={() => navigate(-1)}>← Back to Orders</button>
        </div>
        <div style={S.centerBox}>Loading order details...</div>
      </div>
    );
  }

  if (!order || error) {
    return (
      <div style={S.page}>
        <div style={S.topBar}>
          <button style={S.backBtn} onClick={() => navigate(-1)}>← Back to Orders</button>
        </div>
        <div style={S.centerBox}>
          <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: 14 }}>
            {error || "No details available for this order."}
          </p>
          <button style={S.secondaryBtn} onClick={() => navigate("/orders")}>
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const status = (order.status || "pending").toLowerCase();
  const statusColor = STATUS_DOT[status] || "#6b7280";

  const items = order.items || [];

  // ── الإيميل: من الـ API الأصلي، ولو مش موجود بناخده من navigation state
  // اللي جاي من صفحة الأوردرات (لأن single-order endpoint حاليًا مش بيرجع
  // doctor.all_user من الباك) ──
  const email =
    order.doctor?.all_user?.email ??
    order.doctor?.email ??
    location.state?.doctorEmail ??
    null;

  const emailFromFallback =
    !order.doctor?.all_user?.email &&
    !order.doctor?.email &&
    !!location.state?.doctorEmail;

  const phone = order.doctor?.phone ?? "—";

  const orderHasIssue =
    order.order_issue && order.order_issue !== "None" && order.order_issue !== "none";

  // الخيارات المعروضة في السلكت: الحالة الحالية (حتى لو مش من ضمن SELECTABLE_STATUSES) + الحالات المسموحة
  const selectOptions = Array.from(new Set([status, ...SELECTABLE_STATUSES]));

  return (
    <div style={S.page}>
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={() => navigate(-1)}>← Back to Orders</button>
      </div>

      {/* Header card */}
      <div style={S.headerCard}>
        <div style={S.headerTop}>
          <div>
            <h1 style={S.orderTitle}>Order #ORD-{order.id}</h1>
            <p style={S.orderSubtitle}>Details and item breakdown for this order</p>
          </div>
          <div style={S.headerActions}>
            <button style={S.primaryBtn} onClick={() => window.print()}>
              🖨️ Print Invoice
            </button>
            <button
              style={email ? S.secondaryBtn : S.secondaryBtnDisabled}
              disabled={!email}
              title={email ? `Email ${email}` : "Doctor email not available"}
              onClick={() => {
                if (email) window.location.href = `mailto:${email}`;
              }}
            >
              ✉️ Email Doctor
            </button>
          </div>
        </div>

        <div style={S.infoGrid}>
          <div style={S.infoCol}>
            <span style={S.infoLabel}>Order Number</span>
            <span style={S.infoValue}>#ORD-{order.id}</span>
          </div>
          <div style={S.infoCol}>
            <span style={S.infoLabel}>Order Type</span>
            <span style={S.typeBadge}>{order.order_type}</span>
          </div>
          <div style={S.infoCol}>
            <span style={S.infoLabel}>Order Status</span>
            <span style={S.statusRow}>
              <span style={S.dot(statusColor)} />
              {STATUS_LABEL[status] ?? status}
            </span>
          </div>
          <div style={S.infoCol}>
            <span style={S.infoLabel}>Order Issue</span>
            <span style={{ ...S.infoValue, fontStyle: orderHasIssue ? "normal" : "italic", color: orderHasIssue ? "#dc2626" : "#9ca3af", fontWeight: orderHasIssue ? 700 : 500 }}>
              {orderHasIssue ? order.order_issue : "None reported"}
            </span>
          </div>
          <div style={S.infoColLast}>
            <span style={S.infoLabel}>Created At</span>
            <span style={S.infoValue}>{fmtDate(order.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Doctor info */}
      <div style={S.headerCard}>
        <div style={S.infoGrid}>
          <div style={S.infoCol}>
            <span style={S.infoLabel}>Doctor Email</span>
            <span style={S.infoValue}>{email ?? "—"}</span>
            {emailFromFallback && (
              <span style={S.emailNote}>from orders list</span>
            )}
          </div>
          <div style={S.infoCol}>
            <span style={S.infoLabel}>Doctor Phone</span>
            <span style={S.infoValue}>{phone}</span>
          </div>
          <div style={S.infoCol}>
            <span style={S.infoLabel}>Invoice Number</span>
            <span style={S.infoValue}>{order.invoice_number ?? "—"}</span>
          </div>
          <div style={S.infoColLast}>
            <span style={S.infoLabel}>Invoice Key</span>
            <span style={S.infoValue}>{order.invoice_key ?? "—"}</span>
          </div>
        </div>
      </div>

      {/* Product items */}
      <div style={S.card}>
        <h3 style={S.cardTitle}>Product Items</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Product Name</th>
                <th style={S.th}>Unit Price</th>
                <th style={S.th}>Quantity</th>
                <th style={S.th}>Sub Status</th>
                <th style={S.th}>Rental Period</th>
                <th style={S.th}>Final Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td style={S.td}>
                    <div style={S.productCell}>
                      <div style={S.productIcon}>📦</div>
                      <span style={S.productName}>{it.product?.name ?? `#${it.product_id}`}</span>
                    </div>
                  </td>
                  <td style={S.td}>{fmtMoney(it.unit_price)}</td>
                  <td style={S.td}>{it.quantity}</td>
                  <td style={S.td}>
                    <span style={S.subBadge(STATUS_DOT[it.sub_status] || "#6b7280")}>
                      {it.sub_status ?? "-"}
                    </span>
                  </td>
                  <td style={S.td}>
                    {it.rental_start
                      ? `${fmtDate(it.rental_start)} → ${fmtDate(it.rental_end)}`
                      : "—"}
                  </td>
                  <td style={{ ...S.td, fontWeight: 700 }}>{fmtMoney(it.final_price)}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td style={S.td} colSpan={6}>No items found for this order.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom: status update + summary */}
      <div style={S.bottomRow}>
        <div style={S.statusUpdateCard}>
          <h3 style={S.cardTitle}>Update Status</h3>
          <span style={S.statusRow}>
            <span style={S.dot(statusColor)} />
            {STATUS_LABEL[status] ?? status}
          </span>

          <select
            style={S.statusSelect(statusColor, updating)}
            value={status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {selectOptions.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s] ?? s}
              </option>
            ))}
          </select>

          {updating && (
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "10px 0 0" }}>
              Updating status...
            </p>
          )}
        </div>

        <div style={S.summaryCard}>
          <div style={S.summaryRow}>
            <span>Subtotal</span>
            <span>{fmtMoney(order.subtotal)}</span>
          </div>
          <div style={S.summaryDivider} />
          <div style={S.summaryFinalRow}>
            <span>Final Total</span>
            <span style={S.finalTotal}>{fmtMoney(order.total)}</span>
          </div>
          <p style={{ fontSize: 11, color: "#9ca3af", margin: "10px 0 0" }}>
            * Values shown exactly as returned by the order API.
          </p>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getSupplierOrderById,
  assignOrderStatus,
  returnRentalProduct,
  cancelOrderSupplier,
  getErrorMessage,
} from "../apis/orders";

// ── Order status labels/colors (موسّعة عشان تغطي أي status يرجع من الباك) ──
const STATUS_LABEL = {
  pending: "Pending",
  processing: "Processing",
  confirmed: "Confirmed",
  ready: "Ready",
  delivered: "Delivered",
  paid: "Paid",
  cancelled: "Cancelled",
  canceled: "Cancelled",
  rejected: "Rejected",
  returned: "Returned",
  refunded: "Refunded",
  completed: "Completed",
  active: "Active",
  overdue: "Overdue",
  partial_ready: "Partially Ready",
  partial_processing: "Partially Processing",
};

const STATUS_DOT = {
  pending:    "#9ca3af",
  processing: "#2563eb",
  confirmed:  "#2563eb",
  ready:      "#16a34a",
  delivered:  "#16a34a",
  paid:       "#16a34a",
  completed:  "#16a34a",
  active:     "#16a34a",
  cancelled:  "#dc2626",
  canceled:   "#dc2626",
  rejected:   "#dc2626",
  overdue:    "#dc2626",
  returned:   "#d97706",
  refunded:   "#d97706",
  partial_ready:      "#d97706",
  partial_processing: "#d97706",
};

// ── Sub-status (بتاعة كل item) ليها ماب لوحدها عشان مش بالضرورة نفس قيم الـ order status ──
const SUB_STATUS_LABEL = {
  pending: "Pending",
  processing: "Processing",
  active: "Active",
  ready: "Ready",
  delivered: "Delivered",
  returned: "Returned",
  overdue: "Overdue",
  cancelled: "Cancelled",
  canceled: "Cancelled",
  rejected: "Rejected",
  refunded: "Refunded",
  completed: "Completed",
};

const SUB_STATUS_DOT = {
  pending:    "#9ca3af",
  processing: "#2563eb",
  active:     "#2563eb",
  ready:      "#16a34a",
  delivered:  "#16a34a",
  completed:  "#16a34a",
  returned:   "#d97706",
  overdue:    "#dc2626",
  cancelled:  "#dc2626",
  canceled:   "#dc2626",
  rejected:   "#dc2626",
  refunded:   "#6b7280",
};

const DEFAULT_DOT = "#6b7280";

// أي status مش موجود في الماب، بنعمله fallback: نلوّنه رمادي ونعرضه بحروف كابيتال بدل ما نكسر الشكل
const humanizeFallback = (raw) => {
  if (!raw && raw !== 0) return "-";
  const str = String(raw).replace(/[_-]+/g, " ").trim();
  return str.length ? str.charAt(0).toUpperCase() + str.slice(1) : "-";
};

// الحالات المسموح بالتحويل ليها فعليًا من الباك (حسب الـ Postman: processing/ready بس)
const SELECTABLE_STATUSES = ["processing", "ready"];

// الحالات اللي مسموح فيها للسابلير يعمل Cancel للأوردر
const CANCELLABLE_STATUSES = [
  "paid",
  "confirmed",
  "ready",
  "processing",
  "partial_ready",
  "partial_processing",
];

// أنواع الأوردر اللي بتتعامل مع rental (الباك بيرجعها كـ "rental" حسب صفحة الأوردرات)
const RENTAL_TYPES = ["rental", "rent"];

const fmtDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

// بيقبل أي حاجة ممكن الباك يرجعها كرقم (string, number, null, undefined) ويرجّع فورمات فلوس آمن
const fmtMoney = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return `EGP ${num.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
};

// بيدور على أول قيمة موجودة (مش null/undefined/"") من كذا مصدر محتمل لنفس الحقل
const firstDefined = (...vals) => {
  for (const v of vals) {
    if (v !== null && v !== undefined && v !== "") return v;
  }
  return undefined;
};

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
  dangerBtn: {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
    borderRadius: 9, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626",
    fontSize: 13.5, fontWeight: 700, cursor: "pointer",
  },
  dangerBtnDisabled: {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
    borderRadius: 9, border: "1px solid #f3d4d4", background: "#fdf5f5", color: "#e29a9a",
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
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, overflow: "hidden",
  },
  productImg: { width: "100%", height: "100%", objectFit: "cover" },
  productName: { fontWeight: 700, color: "#111827" },
  subBadge: (color) => ({
    display: "inline-block", padding: "3px 10px", borderRadius: 12,
    fontSize: 11.5, fontWeight: 700, textTransform: "capitalize",
    background: `${color}18`, color,
  }),
  returnBtn: {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px",
    borderRadius: 20, border: "1.5px solid #93c5fd", background: "#eff6ff", color: "#2563eb",
    fontSize: 11.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
  },
  returnBtnDisabled: {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px",
    borderRadius: 20, border: "1.5px solid #e5e7eb", background: "#f9fafb", color: "#c1c5cc",
    fontSize: 11.5, fontWeight: 700, cursor: "not-allowed", whiteSpace: "nowrap",
  },
  rentalEndWrap: { display: "flex", flexDirection: "column", gap: 2 },
  rentalEndLabel: { fontSize: 10.5, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3 },
  rentalEndValue: { fontWeight: 700 },
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
  doctorNameRow: { display: "flex", alignItems: "center", gap: 8 },
  doctorAvatar: { width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 },
  verifiedBadge: {
    display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 8px", borderRadius: 10,
    fontSize: 10.5, fontWeight: 700, background: "#ecfdf5", color: "#16a34a",
  },
  // ── Cancel box (inline reason panel, no modal needed → faster to render) ──
  cancelBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    border: "1.5px solid #fecaca",
    background: "#fff5f5",
  },
  cancelLabel: {
    fontSize: 12.5, fontWeight: 700, color: "#991b1b", marginBottom: 8, display: "block",
  },
  cancelTextarea: {
    width: "100%",
    minHeight: 70,
    borderRadius: 8,
    border: "1.5px solid #fca5a5",
    padding: "10px 12px",
    fontSize: 13.5,
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
  },
  cancelActions: { display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" },
};

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [returningItemId, setReturningItemId] = useState(null);

  // Cancel-order UI state
  const [showCancelBox, setShowCancelBox] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

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
        // بعض الـ endpoints بترجع array وبعضها بيرجع object لوحده، وده بيتغطى هنا
        const raw = res?.data;
        const fresh = Array.isArray(raw) ? raw[0] : raw;
        if (fresh && typeof fresh === "object") setOrder(fresh);
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
    if (!newStatus || newStatus === status) return;
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

  // بيرجع المنتج بعد ما يتسلم (الباك بيرفض الريتيرن لو الأوردر لسه مش delivered)
  const handleReturnProduct = async (productId) => {
    if (productId === null || productId === undefined) {
      toast.error("Missing product id for this item.");
      return;
    }
    setReturningItemId(productId);
    try {
      await returnRentalProduct(id, productId);
      toast.success("Product returned successfully");
      fetchOrder(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setReturningItemId(null);
    }
  };

  // ── Cancel order ──────────────────────────────────────────────────
  // للسرعة: بنعمل optimistic update فورًا (الأوردر يتحوّل "cancelled" في الواجهة
  // على طول من غير ما ننتظر رد السيرفر أو نعمل إعادة تحميل كاملة للصفحة)، وبعدين
  // بنبعت الريكوست في الخلفية. لو فشل، بنرجّع الحالة القديمة ونعرض رسالة خطأ.
  const handleCancelOrder = async () => {
    const reason = cancelReason.trim();
    if (!reason) {
      toast.error("Please enter a cancellation reason.");
      return;
    }

    const previousOrder = order;
    setCancelling(true);

    // Optimistic UI update — instant feedback, no waiting on the network
    setOrder((prev) => (prev ? { ...prev, status: "cancelled", order_issue: reason } : prev));
    setShowCancelBox(false);

    try {
      await cancelOrderSupplier(id, reason);
      toast.success("Order cancelled successfully");
      setCancelReason("");
      // sync silently in background in case the backend returns extra fields (e.g. sub_status)
      fetchOrder(true);
    } catch (err) {
      // rollback on failure
      setOrder(previousOrder);
      setShowCancelBox(true);
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
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

  // status ممكن ييجي null/undefined أو بحروف كابيتال أو فيه مسافات زيادة
  const status = String(order.status ?? "pending").toLowerCase().trim();
  const statusColor = STATUS_DOT[status] || DEFAULT_DOT;
  const statusLabel = STATUS_LABEL[status] ?? humanizeFallback(status);

  // items ممكن تيجي null أو مش array أصلاً
  const items = Array.isArray(order.items) ? order.items : [];

  // نوع الأوردر ممكن يكون null أو casing مختلف
  const orderTypeRaw = order.order_type ?? order.type ?? null;
  const isRentalOrder = RENTAL_TYPES.includes(String(orderTypeRaw ?? "").toLowerCase().trim());

  // زرار الريترن بيتفعل بس لو الأوردر delivered (حسب رسالة الباك:
  // "Rental products can only be returned after the order is delivered.")
  const canReturn = status === "delivered";

  // زرار الكانسل بيظهر بس لو الأوردر في واحدة من الحالات دي
  const canCancel = CANCELLABLE_STATUSES.includes(status);

  // ── الإيميل والاسم: من الـ API الأصلي، ولو مش موجود بناخده من navigation state
  // اللي جاي من صفحة الأوردرات (لأن single-order endpoint حاليًا ممكن ميرجعش
  // doctor.all_user كامل من الباك) ──
  const email = firstDefined(
    order.doctor?.all_user?.email,
    order.doctor?.email,
    order.email,
    location.state?.doctorEmail
  ) ?? null;

  const emailFromFallback =
    !firstDefined(order.doctor?.all_user?.email, order.doctor?.email, order.email) &&
    !!location.state?.doctorEmail;

  // ملاحظة: الـ doctor object الراجع فعليًا من endpoint الأوردرات (single و list)
  // مفيهوش email ولا name خالص — بس فيه phone / profile_image_url / is_verified.
  // فالاسم والإيميل بيعتمدوا بالكامل على navigation state الجاي من صفحة الأوردرات.
  const doctorName = firstDefined(
    order.doctor?.all_user?.name,
    order.doctor?.name,
    location.state?.doctorName
  );

  const phone = firstDefined(order.doctor?.phone, order.doctor?.all_user?.phone, order.phone) ?? "—";

  const doctorAvatar = order.doctor?.profile_image_url ?? null;
  const doctorIsVerified = order.doctor?.is_verified === true;

  const orderIssueRaw = order.order_issue;
  const orderHasIssue =
    orderIssueRaw !== null &&
    orderIssueRaw !== undefined &&
    String(orderIssueRaw).trim() !== "" &&
    String(orderIssueRaw).toLowerCase() !== "none";

  const orderId = firstDefined(order.id, order.order_id) ?? id ?? "—";

  // الخيارات المعروضة في السلكت: الحالة الحالية (حتى لو مش من ضمن SELECTABLE_STATUSES) + الحالات المسموحة
  const selectOptions = Array.from(new Set([status, ...SELECTABLE_STATUSES]));

  // بنود السمّري: بنعرض القيم المعروفة زي القديم، وأي حقل مالي إضافي يرجع من الباك
  // (discount / tax / shipping / delivery fee...) بنعرضه لو موجود وبس، من غير ما نغيّر الشكل الأساسي
  const optionalMoneyFields = [
    { key: "discount", label: "Discount" },
    { key: "tax", label: "Tax" },
    { key: "shipping_fee", label: "Shipping Fee" },
    { key: "delivery_fee", label: "Delivery Fee" },
  ].filter(
    (f) => order[f.key] !== null && order[f.key] !== undefined && order[f.key] !== ""
  );

  const total = firstDefined(order.total, order.total_price, order.grand_total);
  const subtotal = firstDefined(order.subtotal, order.sub_total);

  return (
    <div style={S.page}>
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={() => navigate(-1)}>← Back to Orders</button>
      </div>

      {/* Header card */}
      <div style={S.headerCard}>
        <div style={S.headerTop}>
          <div>
            <h1 style={S.orderTitle}>Order #ORD-{orderId}</h1>
            <p style={S.orderSubtitle}>Details and item breakdown for this order</p>
          </div>
          <div style={S.headerActions}>
            <button style={S.primaryBtn} onClick={() => window.print()}>
              🖨️ Print Invoice
            </button>
            {canCancel && (
              <button
                style={cancelling ? S.dangerBtnDisabled : S.dangerBtn}
                disabled={cancelling}
                onClick={() => setShowCancelBox((v) => !v)}
              >
                ✕ Cancel Order
              </button>
            )}
          </div>
        </div>

        {canCancel && showCancelBox && (
          <div style={S.cancelBox}>
            <span style={S.cancelLabel}>Reason for cancellation *</span>
            <textarea
              style={S.cancelTextarea}
              placeholder="e.g. device is not working well"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              disabled={cancelling}
              autoFocus
            />
            <div style={S.cancelActions}>
              <button
                style={S.secondaryBtn}
                disabled={cancelling}
                onClick={() => { setShowCancelBox(false); setCancelReason(""); }}
              >
                Keep Order
              </button>
              <button
                style={cancelling ? S.dangerBtnDisabled : S.dangerBtn}
                disabled={cancelling}
                onClick={handleCancelOrder}
              >
                {cancelling ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        )}

        <div style={S.infoGrid}>
          <div style={S.infoCol}>
            <span style={S.infoLabel}>Order Number</span>
            <span style={S.infoValue}>#ORD-{orderId}</span>
          </div>
          <div style={S.infoCol}>
            <span style={S.infoLabel}>Order Type</span>
            <span style={S.typeBadge}>{orderTypeRaw ?? "—"}</span>
          </div>
          <div style={S.infoCol}>
            <span style={S.infoLabel}>Order Status</span>
            <span style={S.statusRow}>
              <span style={S.dot(statusColor)} />
              {statusLabel}
            </span>
          </div>
          <div style={S.infoCol}>
            <span style={S.infoLabel}>Order Issue</span>
            <span style={{ ...S.infoValue, fontStyle: orderHasIssue ? "normal" : "italic", color: orderHasIssue ? "#dc2626" : "#9ca3af", fontWeight: orderHasIssue ? 700 : 500 }}>
              {orderHasIssue ? String(orderIssueRaw) : "No Issue"}
            </span>
          </div>
          <div style={S.infoColLast}>
            <span style={S.infoLabel}>Created At</span>
            <span style={S.infoValue}>{fmtDate(order.created_at ?? order.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Doctor info */}
      <div style={S.headerCard}>
        <div style={S.infoGrid}>
          <div style={S.infoCol}>
            <span style={S.infoLabel}>Doctor Name</span>
            <span style={S.doctorNameRow}>
              {doctorAvatar && (
                <img
                  src={doctorAvatar}
                  alt=""
                  style={S.doctorAvatar}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
              <span style={S.infoValue}>{doctorName ?? "—"}</span>
              {doctorIsVerified && <span style={S.verifiedBadge}>✓ Verified</span>}
            </span>
          </div>
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
                {isRentalOrder && <th style={S.th}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                // فترة الإيجار: بندعم أسماء حقول بديلة، ولو مفيش تاريخ بداية أصلاً منعرضش حاجة
                const rentalStart = firstDefined(it.rental_start, it.start_date);
                const rentalEnd = firstDefined(it.rental_end, it.end_date);
                const hasRentalPeriod = !!rentalStart;

                const productId = firstDefined(it.product_id, it.product?.id, it.id);
                const isReturning = returningItemId === productId;

                const productName = firstDefined(it.product?.name, it.product_name, it.name) ?? `#${productId ?? "—"}`;
                const productImg = firstDefined(it.product?.image, it.product?.image_url, it.product?.thumbnail);

                const subStatusRaw = it.sub_status ?? null;
                const subStatusKey = subStatusRaw ? String(subStatusRaw).toLowerCase().trim() : null;
                const subStatusColor = subStatusKey ? (SUB_STATUS_DOT[subStatusKey] || DEFAULT_DOT) : DEFAULT_DOT;
                const subStatusLabel = subStatusKey ? (SUB_STATUS_LABEL[subStatusKey] ?? humanizeFallback(subStatusKey)) : "-";

                const unitPrice = firstDefined(it.unit_price, it.price);
                const finalPrice = firstDefined(it.final_price, it.total_price, it.subtotal);
                const quantity = firstDefined(it.quantity, it.qty) ?? "—";

                return (
                  <tr key={firstDefined(it.id, `${productId}-${idx}`)}>
                    <td style={S.td}>
                      <div style={S.productCell}>
                        <div style={S.productIcon}>
                          {productImg ? (
                            <img
                              src={productImg}
                              alt={productName}
                              style={S.productImg}
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          ) : (
                            "📦"
                          )}
                        </div>
                        <span style={S.productName}>{productName}</span>
                      </div>
                    </td>
                    <td style={S.td}>{fmtMoney(unitPrice)}</td>
                    <td style={S.td}>{quantity}</td>
                    <td style={S.td}>
                      <span style={S.subBadge(subStatusColor)}>
                        {subStatusLabel}
                      </span>
                    </td>
                    <td style={S.td}>
                      {hasRentalPeriod ? (
                        <div style={S.rentalEndWrap}>
                          <span style={S.rentalEndLabel}>Until</span>
                          <span style={S.rentalEndValue}>{fmtDate(rentalEnd)}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={{ ...S.td, fontWeight: 700 }}>{fmtMoney(finalPrice)}</td>
                    {isRentalOrder && (
                      <td style={S.td}>
                        {hasRentalPeriod ? (
                          <button
                            style={canReturn && !isReturning ? S.returnBtn : S.returnBtnDisabled}
                            disabled={!canReturn || isReturning}
                            title={
                              canReturn
                                ? "Return this rented product"
                                : "Rental products can only be returned after the order is delivered."
                            }
                            onClick={() => handleReturnProduct(productId)}
                          >
                            ↩️ {isReturning ? "Returning..." : "Return"}
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td style={S.td} colSpan={isRentalOrder ? 7 : 6}>No items found for this order.</td>
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
            {statusLabel}
          </span>

          <select
            style={S.statusSelect(statusColor, updating)}
            value={status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {selectOptions.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s] ?? humanizeFallback(s)}
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
            <span>{fmtMoney(subtotal)}</span>
          </div>
          {optionalMoneyFields.map((f) => (
            <div style={S.summaryRow} key={f.key}>
              <span>{f.label}</span>
              <span>{fmtMoney(order[f.key])}</span>
            </div>
          ))}
          <div style={S.summaryDivider} />
          <div style={S.summaryFinalRow}>
            <span>Final Total</span>
            <span style={S.finalTotal}>{fmtMoney(total)}</span>
          </div>
          <p style={{ fontSize: 11, color: "#9ca3af", margin: "10px 0 0" }}>
            * Values shown exactly as returned by the order API.
          </p>
        </div>
      </div>
    </div>
  );
}
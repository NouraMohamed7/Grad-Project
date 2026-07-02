// src/pages/ProductsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllProducts, deleteProduct, updateProductArchive } from "../apis/products";

// API returns: create_pending | create_accepted | create_rejected
// + any edit_pending / edit_accepted / edit_rejected states
const STATUS_MAP = {
  create_pending:  { bg: "#fffbeb", color: "#d97706", label: "Pending",  icon: "bi-clock-history"      },
  create_accepted: { bg: "#f0fdf4", color: "#16a34a", label: "Active",   icon: "bi-check-circle-fill"  },
  create_rejected: { bg: "#fef2f2", color: "#dc2626", label: "Rejected", icon: "bi-x-circle-fill"      },
  edit_pending:    { bg: "#fffbeb", color: "#d97706", label: "Edit Review", icon: "bi-clock-history"   },
  edit_accepted:   { bg: "#f0fdf4", color: "#16a34a", label: "Updated",  icon: "bi-check-circle-fill"  },
  edit_rejected:   { bg: "#fef2f2", color: "#dc2626", label: "Edit Rejected", icon: "bi-x-circle-fill" },
  default:         { bg: "#f3f4f6", color: "#6b7280", label: "Unknown",  icon: "bi-question-circle"    },
};

const getStatusStyle = (s) => STATUS_MAP[s] || STATUS_MAP.default;

const getImage = (images) =>
  images && images.length > 0
    ? images[0].image
    : "https://placehold.co/40x40?text=No+Img";

// ── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onCancel }) {
  return (
    <>
      <div className="dialog-backdrop" onClick={onCancel} />
      <div className="dialog-box">
        <div className="dialog-icon-wrap">
          <i className="bi bi-trash3-fill dialog-icon" />
        </div>
        <div className="dialog-title">{title}</div>
        <div className="dialog-message">{message}</div>
        <div className="dialog-divider" />
        <div className="dialog-actions">
          <button className="dialog-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="dialog-btn-confirm" onClick={onConfirm}>
            <i className="bi bi-trash3" /> {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="skeleton-row">
    {[80, 55, 40, 50, 45, 55, 70].map((w, i) => (
      <td key={i}><div className="skeleton-cell" style={{ width: `${w}%` }} /></td>
    ))}
  </tr>
);

// ── Sort icon ─────────────────────────────────────────────────────────────────
const SortIcon = ({ field, sortField, sortDir }) => {
  if (sortField !== field) return <i className="bi bi-chevron-expand prod-sort-neutral" />;
  return sortDir === "asc"
    ? <i className="bi bi-chevron-up prod-sort-active" />
    : <i className="bi bi-chevron-down prod-sort-active" />;
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const navigate = useNavigate();
  const PER_PAGE = 8;

  const [products,      setProducts]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirm,       setConfirm]       = useState(null);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [lastPage,      setLastPage]      = useState(1);
  const [total,         setTotal]         = useState(0);
  const [search,        setSearch]        = useState("");
  const [sortField,     setSortField]     = useState("id");
  const [sortDir,       setSortDir]       = useState("asc");
  const [statusFilter,  setStatusFilter]  = useState("");

 // القيم المسموح بيها من الباك اند فقط
const BACKEND_SORTABLE = ["id", "name", "description", "created_at"];

// ── Fetch ───────────────────────────────────────────────────────────────────
const fetchProducts = useCallback(async () => {
  setLoading(true);
  try {
    const params = {
      page:     currentPage,
      per_page: PER_PAGE,
    };

    // مبعتش sort_by للباك إلا لو كانت القيمة مسموح بيها
    if (BACKEND_SORTABLE.includes(sortField)) {
      params.sort_by    = sortField;
      params.sort_order = sortDir;
    }
    // ملاحظة: مفيش filter_by=status نهائي، الباك اند مش بيدعمها.
    // الفلترة بالـ status هتتعمل محليًا في الـ processed useMemo تحت.

    const data = await getAllProducts(params);

    // API: { success, message, data: [...], last_page, per_page, total }
    if (data.success) {
      setProducts(data.data || []);
      setLastPage(data.last_page || 1);
      setTotal(data.total || 0);
    } else {
      toast.error(data.message || "Failed to load products");
    }
  } catch (err) {
    toast.error(err?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
}, [currentPage, sortField, sortDir]); // لاحظ: statusFilter اتشال من هنا لأنه بقى محلي

useEffect(() => { fetchProducts(); }, [fetchProducts]);

// ── Client-side search + local sort/filter for unsupported backend fields ──
const processed = useMemo(() => {
  let list = [...products];

  // فلترة الـ status محليًا (الباك اند مش بيدعمها كـ filter_by)
  if (statusFilter) {
    list = list.filter(p => p.status === statusFilter);
  }

  // ترتيب محلي لو الحقل مش من ضمن اللي الباك اند بيدعمه (price / stock)
  if (!BACKEND_SORTABLE.includes(sortField)) {
    list.sort((a, b) => {
      const av = sortField === "price" ? parseFloat(a.price || 0) : (a.stock || 0);
      const bv = sortField === "price" ? parseFloat(b.price || 0) : (b.stock || 0);
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }

  // البحث بالاسم
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(p => p.name?.toLowerCase().includes(q));
  }

  return list;
}, [products, search, statusFilter, sortField, sortDir]);

  // ── Stats from current page data ────────────────────────────────────────────
  const lowStock   = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const outStock   = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((s, p) => s + parseFloat(p.price || 0) * (p.stock || 0), 0);

  // ── Sort ────────────────────────────────────────────────────────────────────
  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  // ── Archive Toggle ──────────────────────────────────────────────────────────
  const handleArchiveToggle = async (product) => {
    setActionLoading(product.id);
    try {
      const newArchive = product.is_archive ? 0 : 1;
      await updateProductArchive(product.id, newArchive);
      toast.success(product.is_archive ? "Product unarchived" : "Product archived");
      fetchProducts();
    } catch (err) {
      toast.error(err?.message || "Failed to update archive status");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = (product) => {
    setConfirm({
      title:        "Delete Product",
      message:      `Are you sure you want to permanently delete "${product.name}"? This action cannot be undone.`,
      confirmLabel: "Delete Product",
      onConfirm: async () => {
        setConfirm(null);
        setActionLoading(product.id);
        try {
          await deleteProduct(product.id);
          toast.success("Product deleted successfully");
          fetchProducts();
        } catch (err) {
          toast.error(err?.message || "Failed to delete product", { autoClose: 6000 });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-content">

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Products</h1>
          <p>Manage your medical equipment inventory.</p>
        </div>
        <div className="header-actions">
          <button className="btn-add" onClick={() => navigate("/products/create")}>
            <i className="bi bi-plus" /> Add Product
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 20 }}>
        {[
          { label: "Total Products",  value: total,                                icon: "bi-box-seam",             bg: "#eff6ff", color: "#2563eb" },
          { label: "Low Stock",       value: lowStock,                             icon: "bi-exclamation-triangle", bg: "#fffbeb", color: "#d97706" },
          { label: "Out of Stock",    value: outStock,                             icon: "bi-x-circle",             bg: "#fef2f2", color: "#dc2626" },
          { label: "Inventory Value", value: `$${(totalValue/1000).toFixed(1)}k`, icon: "bi-currency-dollar",      bg: "#f0fdf4", color: "#16a34a" },
        ].map(c => (
          <div className="stat-card" key={c.label}>
            <div>
              <div className="stat-label">{c.label}</div>
              <div className="stat-value">{loading ? "—" : c.value}</div>
            </div>
            <div className="stat-icon-wrap" style={{ background: c.bg, color: c.color }}>
              <i className={`bi ${c.icon}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="orders-card">

        {/* Toolbar */}
        <div className="orders-header">
          <span className="orders-title">
            All Products
            {!loading && (
              <span className="prod-count-label">
                ({processed.length}{processed.length !== total ? ` of ${total}` : ""})
              </span>
            )}
          </span>
          <div className="prod-toolbar">
            <div className="search-bar" style={{ maxWidth: 220 }}>
              <i className="bi bi-search search-icon" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="chart-select"
              value={`${sortField}_${sortDir}`}
              onChange={e => {
                const val   = e.target.value;
                const dir   = val.endsWith("_desc") ? "desc" : "asc";
                const field = val.replace(/_desc$|_asc$/, "");
                setSortField(field); setSortDir(dir);
              }}
            >
              <option value="id_asc">Sort: Default</option>
              <option value="name_asc">Name: A → Z</option>
              <option value="name_desc">Name: Z → A</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="stock_asc">Stock: Low → High</option>
              <option value="stock_desc">Stock: High → Low</option>
            </select>
            <select
              className="chart-select"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Status</option>
              <option value="create_accepted">Active</option>
              <option value="create_pending">Pending</option>
              <option value="create_rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="products-table-wrap">
          <table className="prod-table">
            <thead>
              <tr>
                <th className="prod-th" onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                  Product <SortIcon field="name" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className="prod-th col-hide-mobile">Category</th>
                <th className="prod-th" onClick={() => handleSort("price")} style={{ cursor: "pointer" }}>
                  Price <SortIcon field="price" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className="prod-th" onClick={() => handleSort("stock")} style={{ cursor: "pointer" }}>
                  Stock <SortIcon field="stock" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className="prod-th col-hide-mobile">Rentable</th>
                <th className="prod-th">Status</th>
                <th className="prod-th prod-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
                : processed.map(p => {
                    // Status comes directly from API: create_pending / create_accepted / create_rejected
                    const ss          = getStatusStyle(p.status);
                    const isActioning = actionLoading === p.id;

                    return (
                      <tr
                        key={p.id}
                        className={`prod-row${isActioning ? " prod-row-faded" : ""}${p.is_archive ? " prod-row-archived" : ""}`}
                      >
                        <td className="prod-td">
                          <div className="prod-name-cell">
                            <img
                              src={getImage(p.image)}
                              alt={p.name}
                              className="prod-thumb"
                              onError={e => { e.target.src = "https://placehold.co/38x38?text=No+Img"; }}
                            />
                            <div className="prod-name-info">
                              <span
                                className="prod-name"
                                title={p.name}
                                onClick={() => navigate(`/products/info/${p.id}`)}
                              >
                                {p.name}
                                {p.is_archive && (
                                  <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: 6 }}>(Archived)</span>
                                )}
                              </span>
                              <span className="prod-id">ID: {p.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="prod-td col-hide-mobile">
                          <span className="status-badge" style={{ background: "#eff6ff", color: "#2563eb" }}>
                            {/* category not returned in list — show category_id */}
                            {p.category?.name || `Cat #${p.category_id}`}
                          </span>
                        </td>

                        <td className="prod-td prod-price">
                          EGP {parseFloat(p.price || 0).toLocaleString()}
                        </td>

                        <td className="prod-td">
                          <div className="prod-stock-wrap">
                            <div className="prod-stock-bar">
                              <div
                                className="prod-stock-fill"
                                style={{
                                  width: `${Math.min(100, ((p.stock || 0) / 100) * 100)}%`,
                                  background: p.stock === 0 ? "#dc2626" : p.stock < 10 ? "#d97706" : "#16a34a",
                                }}
                              />
                            </div>
                            <span
                              className="prod-stock-num"
                              style={{ color: p.stock === 0 ? "#dc2626" : p.stock < 10 ? "#d97706" : "#374151" }}
                            >
                              {p.stock ?? 0}
                            </span>
                          </div>
                        </td>

                        <td className="prod-td col-hide-mobile">
                          <span className="status-badge" style={{
                            background: p.is_rentable ? "#f0fdf4" : "#f3f4f6",
                            color:      p.is_rentable ? "#16a34a" : "#6b7280",
                          }}>
                            {p.is_rentable ? "Yes" : "No"}
                          </span>
                        </td>

                        <td className="prod-td">
                          {/* Status as returned from API */}
                          <span
                            className="status-badge"
                            style={{
                              background: ss.bg,
                              color:      ss.color,
                              cursor: p.status === "create_rejected" ? "pointer" : "default",
                            }}
                            onClick={() => p.status === "create_rejected" && navigate(`/products/rejection/${p.id}`)}
                            title={
                              p.status === "create_rejected" ? "Click to view rejection" :
                              p.status === "create_pending"  ? "Awaiting admin approval" : ""
                            }
                          >
                            <i className={`bi ${ss.icon}`} style={{ fontSize: 10 }} /> {ss.label}
                          </span>
                        </td>

                        <td className="prod-td">
                          <div className="prod-actions">
                            <button
                              className="action-btn prod-btn-view"
                              title="View"
                              disabled={isActioning}
                              onClick={() => navigate(`/products/info/${p.id}`)}
                            >
                              <i className="bi bi-eye" />
                            </button>
                            <button
                              className="action-btn"
                              title="Edit"
                              disabled={isActioning}
                              onClick={() => navigate(`/products/edit/${p.id}`)}
                            >
                              <i className="bi bi-pencil" />
                            </button>
                            <button
                              className="action-btn"
                              title={p.is_archive ? "Unarchive" : "Archive"}
                              disabled={isActioning}
                              onClick={() => handleArchiveToggle(p)}
                              style={{
                                color:       p.is_archive ? "#16a34a" : "#d97706",
                                borderColor: p.is_archive ? "#bbf7d0" : "#fde68a",
                              }}
                            >
                              {isActioning
                                ? <i className="bi bi-hourglass-split prod-spin" />
                                : <i className={`bi bi-${p.is_archive ? "arrow-counterclockwise" : "archive"}`} />
                              }
                            </button>
                            <button
                              className="action-btn prod-btn-delete"
                              title="Delete"
                              disabled={isActioning}
                              onClick={() => handleDelete(p)}
                            >
                              {isActioning
                                ? <i className="bi bi-hourglass-split prod-spin" />
                                : <i className="bi bi-trash" />
                              }
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              }
              {!loading && processed.length === 0 && (
                <tr>
                  <td colSpan={7} className="prod-empty">
                    <i className="bi bi-inbox prod-empty-icon" />
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderTop: "1px solid #f0f2f5",
        }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            {loading ? "..." : (
              <>
                Showing{" "}
                <strong style={{ color: "#1a1d23" }}>
                  {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, total)}
                </strong>
                {" "}of{" "}
                <strong style={{ color: "#1a1d23" }}>{total}</strong>
                {" "}products
              </>
            )}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1 || loading}
              className="ord-page-btn"
            >
              <i className="bi bi-chevron-left" style={{ fontSize: 12 }} /> Previous
            </button>
            <span style={{
              padding: "7px 14px", borderRadius: 8,
              background: "#2563eb", color: "#fff",
              fontSize: 13, fontWeight: 600, fontFamily: "DM Sans, sans-serif",
            }}>
              {currentPage} / {lastPage}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === lastPage || loading}
              className="ord-page-btn"
            >
              Next <i className="bi bi-chevron-right" style={{ fontSize: 12 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
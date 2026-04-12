// src/pages/ProductsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getAllProducts,
  deleteProduct,
  updateProductArchive,
} from '../apis/Products';
import'../styles/Dashboard.css'

const statusStyle = {
  create_pending:  { bg: '#fffbeb', color: '#d97706', label: 'Pending',  icon: 'bi-clock-history' },
  create_accepted: { bg: '#f0fdf4', color: '#16a34a', label: 'Active',   icon: 'bi-check-circle-fill' },
  create_rejected: { bg: '#fef2f2', color: '#dc2626', label: 'Rejected', icon: 'bi-x-circle-fill' },
  default:         { bg: '#f3f4f6', color: '#6b7280', label: 'Unknown',  icon: 'bi-question-circle' },
};
const getStatusStyle = (s) => statusStyle[s] || statusStyle.default;
const getImage = (images) =>
  images && images.length > 0
    ? images[0].image
    : 'https://placehold.co/40x40?text=No+Img';

// ── Confirm Dialog ────────────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel = 'Delete', confirmColor = '#dc2626', onConfirm, onCancel }) {
  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeInBackdrop 0.18s ease',
        }}
        onClick={onCancel}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#ffffff',
          borderRadius: 16,
          padding: '28px 28px 24px',
          width: 400,
          maxWidth: '92vw',
          boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
          zIndex: 9999,
          animation: 'slideUpDialog 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: '#fef2f2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <i className="bi bi-trash3-fill" style={{ fontSize: 20, color: '#dc2626' }} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.65, marginBottom: 24 }}>{message}</div>
        <div style={{ height: 1, background: '#f3f4f6', margin: '0 -28px 18px' }} />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 18px', borderRadius: 8,
              border: '1px solid #e5e7eb', background: '#fff',
              color: '#374151', cursor: 'pointer', fontSize: 13.5, fontWeight: 500,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
          >Cancel</button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: confirmColor, color: '#fff', cursor: 'pointer',
              fontSize: 13.5, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            <i className="bi bi-trash3" /> {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[...Array(8)].map((_, i) => (
      <td key={i} style={{ padding: '12px 16px' }}>
        <div style={{
          height: 13, borderRadius: 5, background: '#f0f2f5',
          width: i === 0 ? '80%' : '55%',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      </td>
    ))}
  </tr>
);

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirm, setConfirm]             = useState(null);
  const [currentPage, setCurrentPage]     = useState(1);
  const [lastPage, setLastPage]           = useState(1);
  const [total, setTotal]                 = useState(0);
  const [search, setSearch]               = useState('');
  const [sortField, setSortField]         = useState('id');
  const [sortDir, setSortDir]             = useState('asc');
  const [statusFilter, setStatusFilter]   = useState('');
  const perPage = 15;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllProducts({ page: currentPage, per_page: perPage });
      if (data.success || data.data) {
        setProducts(data.data || []);
        setLastPage(data.last_page || 1);
        setTotal(data.total || 0);
      } else {
        toast.error('Failed to load products');
      }
    } catch (err) {
      toast.error(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const processed = useMemo(() => {
    let list = [...products];
    if (statusFilter) list = list.filter(p => p.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (sortField === 'name') {
        const va = (a.name || '').toLowerCase();
        const vb = (b.name || '').toLowerCase();
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      const va = parseFloat(a[sortField]) || 0;
      const vb = parseFloat(b[sortField]) || 0;
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return list;
  }, [products, search, sortField, sortDir, statusFilter]);

  const lowStock   = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const outStock   = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((s, p) => s + parseFloat(p.price || 0) * (p.stock || 0), 0);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <i className="bi bi-chevron-expand" style={{ opacity: 0.3, marginLeft: 4, fontSize: 11 }} />;
    return sortDir === 'asc'
      ? <i className="bi bi-chevron-up" style={{ marginLeft: 4, color: '#2563eb', fontSize: 11 }} />
      : <i className="bi bi-chevron-down" style={{ marginLeft: 4, color: '#2563eb', fontSize: 11 }} />;
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = (product) => {
    setConfirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete Product',
      confirmColor: '#dc2626',
      onConfirm: async () => {
        setConfirm(null);
        setActionLoading(product.id);
        try {
          await deleteProduct(product.id);
          toast.success('Product deleted successfully');
          fetchProducts();
        } catch (err) {
          const raw = err?.message || '';
          const isCloudinaryBug = raw.toLowerCase().includes('cloudinary') || raw.includes('500');
          if (isCloudinaryBug) {
            toast.error('Cannot delete: please add an image to this product first, then delete.', { autoClose: 6000 });
          } else {
            toast.error(raw || 'Failed to delete product');
          }
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  // ── Archive ───────────────────────────────────────────────────────
  const handleArchive = (product) => {
    const isArchived = product.is_archive === 1 || product.is_archive === true;
    const action = isArchived ? 'Unarchive' : 'Archive';
    const newVal = isArchived ? 0 : 1;

    setConfirm({
      title: `${action} Product`,
      message: `Are you sure you want to ${action.toLowerCase()} "${product.name}"? ${isArchived ? 'It will be restored and visible again.' : 'It will be hidden from the storefront.'}`,
      confirmLabel: `${action} Product`,
      confirmColor: isArchived ? '#2563eb' : '#d97706',
      onConfirm: async () => {
        setConfirm(null);
        setActionLoading(product.id);
        try {
          await updateProductArchive(product.id, newVal);
          toast.success(`Product ${action.toLowerCase()}d successfully`);
          fetchProducts();
        } catch (err) {
          toast.error(err?.message || `Failed to ${action.toLowerCase()} product`);
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const getPaginationPages = () => {
    if (lastPage <= 7) return [...Array(lastPage)].map((_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', lastPage];
    if (currentPage >= lastPage - 3) return [1, '...', lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', lastPage];
  };

  return (
    <div className="dashboard-content">
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          confirmColor={confirm.confirmColor}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Products</h1>
          <p>Manage your medical equipment inventory.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={fetchProducts} disabled={loading}>
            <i className={`bi bi-arrow-clockwise${loading ? ' spin' : ''}`} /> Refresh
          </button>
          <button className="btn-add" onClick={() => navigate('/products/create')}>
            <i className="bi bi-plus" /> Add Product
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        {[
          { label: 'Total Products',  value: total,                                 icon: 'bi-box-seam',             bg: '#eff6ff', color: '#2563eb' },
          { label: 'Low Stock',       value: lowStock,                               icon: 'bi-exclamation-triangle', bg: '#fffbeb', color: '#d97706' },
          { label: 'Out of Stock',    value: outStock,                               icon: 'bi-x-circle',             bg: '#fef2f2', color: '#dc2626' },
          { label: 'Inventory Value', value: `$${(totalValue / 1000).toFixed(1)}k`, icon: 'bi-currency-dollar',      bg: '#f0fdf4', color: '#16a34a' },
        ].map(c => (
          <div className="stat-card" key={c.label}>
            <div>
              <div className="stat-label">{c.label}</div>
              <div className="stat-value">{loading ? '—' : c.value}</div>
            </div>
            <div className="stat-icon-wrap" style={{ background: c.bg, color: c.color }}>
              <i className={`bi ${c.icon}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="orders-card">
        <div className="orders-header">
          <span className="orders-title">
            All Products
            {!loading && (
              <span style={{ fontSize: 12.5, color: '#9ca3af', marginLeft: 6, fontWeight: 400 }}>
                ({processed.length}{processed.length !== total ? ` of ${total}` : ''})
              </span>
            )}
          </span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
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
                const dir   = val.endsWith('_desc') ? 'desc' : 'asc';
                const field = val.replace(/_desc$|_asc$/, '');
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
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="create_accepted">Active</option>
              <option value="create_pending">Pending</option>
              <option value="create_rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* ── Responsive table wrapper ── */}
        <div className="products-table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                  Product <SortIcon field="name" />
                </th>
                <th className="col-hide-mobile">Category</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('price')}>
                  Price <SortIcon field="price" />
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('stock')}>
                  Stock <SortIcon field="stock" />
                </th>
                <th className="col-hide-mobile">Rentable</th>
                <th>Status</th>
                <th className="col-hide-mobile">Archive</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                : processed.map(p => {
                    const ss          = getStatusStyle(p.status);
                    const isArchived  = p.is_archive === 1 || p.is_archive === true;
                    const isActioning = actionLoading === p.id;

                    return (
                      <tr
                        key={p.id}
                        style={{ opacity: isActioning ? 0.5 : 1, transition: 'opacity 0.2s' }}
                      >
                        {/* Product name + image */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img
                              src={getImage(p.image)}
                              alt={p.name}
                              style={{
                                width: 38, height: 38,
                                borderRadius: 8,
                                objectFit: 'cover',
                                border: '1px solid #e5e7eb',
                                flexShrink: 0,
                              }}
                              onError={e => { e.target.src = 'https://placehold.co/38x38?text=No+Img'; }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{ fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#1a1d23', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}
                                onClick={() => navigate(`/products/info/${p.id}`)}
                                title={p.name}
                              >
                                {p.name}
                              </div>
                              <div style={{ fontSize: 11.5, color: '#9ca3af' }}>ID: {p.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="col-hide-mobile">
                          <span className="status-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>
                            {p.category?.name || `Cat #${p.category_id}`}
                          </span>
                        </td>

                        {/* Price */}
                        <td style={{ fontWeight: 600 }}>
                          ${parseFloat(p.price || 0).toLocaleString()}
                        </td>

                        {/* Stock */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{
                              flex: 1, height: 4, background: '#f0f2f5',
                              borderRadius: 10, minWidth: 50,
                            }}>
                              <div style={{
                                height: '100%', borderRadius: 10,
                                width: `${Math.min(100, ((p.stock || 0) / 100) * 100)}%`,
                                background: p.stock === 0 ? '#dc2626' : p.stock < 10 ? '#d97706' : '#16a34a',
                                transition: 'width 0.4s',
                              }} />
                            </div>
                            <span style={{
                              fontSize: 12.5, fontWeight: 700, minWidth: 22,
                              color: p.stock === 0 ? '#dc2626' : p.stock < 10 ? '#d97706' : '#374151',
                            }}>
                              {p.stock ?? 0}
                            </span>
                          </div>
                        </td>

                        {/* Rentable */}
                        <td className="col-hide-mobile">
                          <span className="status-badge" style={{
                            background: p.is_rentable ? '#f0fdf4' : '#f3f4f6',
                            color:      p.is_rentable ? '#16a34a' : '#6b7280',
                          }}>
                            {p.is_rentable ? 'Yes' : 'No'}
                          </span>
                        </td>

                        {/* Status — active is GREEN */}
                        <td>
                          <span
                            className="status-badge"
                            style={{ background: ss.bg, color: ss.color, cursor: p.status === 'create_rejected' ? 'pointer' : 'default' }}
                            onClick={() => p.status === 'create_rejected' && navigate(`/products/rejection/${p.id}`)}
                            title={p.status === 'create_rejected' ? 'Click to view rejection details' : ''}
                          >
                            <i className={`bi ${ss.icon}`} style={{ fontSize: 10 }} />
                            {ss.label}
                          </span>
                        </td>

                        {/* Archive toggle */}
                        <td className="col-hide-mobile">
                          <span
                            className="status-badge"
                            title={isArchived ? 'Click to unarchive' : 'Click to archive'}
                            style={{
                              background: isArchived ? '#fef3c7' : '#f0fdf4',
                              color:      isArchived ? '#92400e' : '#16a34a',
                              cursor: 'pointer',
                              userSelect: 'none',
                            }}
                            onClick={() => !isActioning && handleArchive(p)}
                          >
                            {isArchived ? '📦 Archived' : '✅ Active'}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td>
                          <div style={{ display: 'flex', gap: 5 }}>
                            {/* View */}
                            <button
                              className="action-btn"
                              title="View product details"
                              disabled={isActioning}
                              style={{ color: '#2563eb', borderColor: '#bfdbfe' }}
                              onClick={() => navigate(`/products/info/${p.id}`)}
                            >
                              <i className="bi bi-eye" />
                            </button>
                            {/* Edit */}
                            <button
                              className="action-btn"
                              title="Edit product"
                              disabled={isActioning}
                              onClick={() => navigate(`/products/edit/${p.id}`)}
                            >
                              <i className="bi bi-pencil" />
                            </button>
                            {/* Delete */}
                            <button
                              className="action-btn"
                              title="Delete product"
                              disabled={isActioning}
                              style={{ color: '#dc2626', borderColor: '#fecaca' }}
                              onClick={() => handleDelete(p)}
                            >
                              {isActioning
                                ? <i className="bi bi-hourglass-split spin" />
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
                  <td colSpan={8} style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
                    <i className="bi bi-inbox" style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="pagination-wrap">
            <button
              className="action-btn"
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <i className="bi bi-chevron-left" />
            </button>
            {getPaginationPages().map((page, i) =>
              page === '...'
                ? <span key={`e${i}`} style={{ padding: '0 4px', color: '#9ca3af' }}>…</span>
                : (
                  <button
                    key={page}
                    className="action-btn"
                    disabled={loading}
                    style={{
                      background:   currentPage === page ? '#2563eb' : '',
                      color:        currentPage === page ? '#fff' : '',
                      borderColor:  currentPage === page ? '#2563eb' : '',
                      minWidth: 34,
                    }}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
            )}
            <button
              className="action-btn"
              disabled={currentPage === lastPage || loading}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <i className="bi bi-chevron-right" />
            </button>
          </div>
        )}

        {!loading && total > 0 && (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', paddingBottom: 8 }}>
            Page {currentPage} of {lastPage} — {total} products total
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInBackdrop { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpDialog {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 16px)) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
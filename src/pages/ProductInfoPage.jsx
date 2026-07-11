// src/pages/ProductInfoPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProductById, getCategories, deleteProduct } from '../apis/products';

// Status map — keys match API values exactly
const statusConfig = {
  create_pending:  { label: 'PENDING',      badgeBg: '#fffbeb', badgeColor: '#d97706', dot: '#d97706' },
  create_accepted: { label: 'ACTIVE',       badgeBg: '#f0fdf4', badgeColor: '#16a34a', dot: '#16a34a' },
  create_rejected: { label: 'REJECTED',     badgeBg: '#fef2f2', badgeColor: '#dc2626', dot: '#dc2626' },
  edit_pending:    { label: 'EDIT REVIEW',  badgeBg: '#fffbeb', badgeColor: '#d97706', dot: '#d97706' },
  edit_accepted:   { label: 'UPDATED',      badgeBg: '#f0fdf4', badgeColor: '#16a34a', dot: '#16a34a' },
  edit_rejected:   { label: 'EDIT REJECTED',badgeBg: '#fef2f2', badgeColor: '#dc2626', dot: '#dc2626' },
};
const getStatusCfg = (s) =>
  statusConfig[s] || { label: s || 'UNKNOWN', badgeBg: '#f3f4f6', badgeColor: '#6b7280', dot: '#9ca3af' };

const Skel = ({ h = 38, w = '100%', mb = 14 }) => (
  <div style={{
    height: h, borderRadius: 9, background: '#f0f2f5',
    width: w, marginBottom: mb,
    animation: 'pulse 1.5s ease-in-out infinite',
  }} />
);

export default function ProductInfoPage() {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [loading,    setLoading]    = useState(true);
  const [categories, setCategories] = useState([]);
  const [product,    setProduct]    = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getProductById(id), getCategories()])
      .then(([pRes, cRes]) => {
        setCategories(cRes.data || []);
        // API: { success, message, data: { ... } }
        setProduct(pRes.data || pRes);
      })
      .catch(err => {
        toast.error(err?.message || 'Failed to load product');
        navigate('/products');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const statusCfg    = getStatusCfg(product?.status);
  const categoryName =
    categories.find(c => c.id === product?.category_id)?.name ||
    (product?.category_id ? `Category #${product.category_id}` : '—');

  // ── Delete ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully');
      navigate('/products');
    } catch (err) {
      toast.error(err?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  return (
    <div className="dashboard-content" style={{ animation: 'fadeInPage 0.3s ease both' }}>

      {/* Breadcrumb */}
      <div className="breadcrumb-row">
        <span className="bc-link" onClick={() => navigate('/')}><i className="bi bi-grid-fill" /> Dashboard</span>
        <i className="bi bi-chevron-right bc-sep" />
        <span className="bc-link" onClick={() => navigate('/products')}>Products</span>
        <i className="bi bi-chevron-right bc-sep" />
        <span className="bc-current">Product Info</span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            Product Info
            {!loading && product && (
              <span
                className="pinfo-status-pill"
                style={{
                  background: statusCfg.badgeBg,
                  color:      statusCfg.badgeColor,
                  border:     `1.5px solid ${statusCfg.badgeColor}44`,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusCfg.dot }} />
                {/* Raw status value shown in badge */}
                {statusCfg.label}
              </span>
            )}
          </h1>
          {!loading && product && (
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>
              Status from API: <code style={{ fontSize: 11 }}>{product.status}</code>
            </p>
          )}
        </div>
        <div className="header-actions">
          <button className="btn-delete-header" onClick={() => setShowDelete(true)} disabled={loading}>
            <i className="bi bi-trash3-fill" /> Delete
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="form-card">
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
            <div><Skel h={14} w={180} mb={20} /><Skel /><Skel /><Skel /><Skel h={100} /></div>
            <div><Skel h={14} w={140} mb={20} /><Skel h={100} /><Skel h={100} /></div>
          </div>
        ) : product ? (
          <>
            <div className="form-two-col">

              {/* LEFT — General Info */}
              <div>
                <div className="section-heading">
                  <div className="section-icon blue"><i className="bi bi-info-circle-fill" /></div>
                  General Information
                </div>

                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input className="form-input" value={product.name || ''} disabled readOnly />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input className="form-input" value={categoryName} disabled readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Warranty</label>
                    <input className="form-input" value={product.warranty || 'N/A'} disabled readOnly />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Price (EGP)</label>
                    <input
                      className="form-input"
                      value={parseFloat(product.price || 0).toLocaleString()}
                      disabled readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      className="form-input"
                      value={`${product.stock ?? 0} units`}
                      disabled readOnly
                      style={{
                        fontWeight: 600,
                        color: product.stock === 0 ? '#dc2626' : product.stock < 10 ? '#d97706' : undefined,
                      }}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Setup Duration</label>
                    <input className="form-input" value={product.setup_duration || 'N/A'} disabled readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Restock Date</label>
                    <input className="form-input" value={product.restock_date || 'N/A'} disabled readOnly />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Configuration / Box Contents</label>
                  <input className="form-input" value={product.configuration || 'N/A'} disabled readOnly />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input form-textarea"
                    value={product.description || 'No description provided.'}
                    disabled readOnly rows={5}
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>

              {/* RIGHT — Images */}
              <div>
                <div className="section-heading">
                  <div className="section-icon blue"><i className="bi bi-images" /></div>
                  Product Images
                </div>

                {product.image && product.image.length > 0 ? (
                  <div className="current-images-grid">
                    {product.image.map((img, i) => (
                      <div key={img.id || i} className="current-image-wrap" style={{ background: '#f3f4f6' }}>
                        {i === 0 && <span className="img-main-badge">Main</span>}
                        <img
                          src={img.image}
                          alt={`img-${i}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                          onError={e => { e.target.src = 'https://placehold.co/100x100?text=No'; }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pinfo-no-images">
                    <span>No images uploaded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rental Options */}
            <div className="rental-section">
              <div className="rental-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="section-icon blue" style={{ width: 36, height: 36, fontSize: 16 }}>
                    <i className="bi bi-calendar-week" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1d23' }}>Rental Options</div>
                    <div style={{ fontSize: 12.5, color: '#9ca3af' }}>Rental pricing and availability</div>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={!!product.is_rentable} disabled readOnly />
                  <span className="toggle-slider" />
                </label>
              </div>

              {product.is_rentable && (
  <div className="rental-fields">
    {[
      { label: 'DAILY RATE', value: product.rental_details?.price_daily ? `EGP ${product.rental_details.price_daily}` : 'N/A' },
      { label: 'MIN DAYS',        value: product.rental_details?.minimum_rental_days ?? 'N/A' },
      { label: 'MAX DAYS',        value: product.rental_details?.maximum_rental_days ?? 'N/A' },
      { label: 'AVAILABLE UNITS', value: product.rental_details?.available_units     ?? 'N/A' },
      { label: 'STOCK UNIT',      value: product.stock ?? 'N/A' },
      { label: 'PREP DURATION',   value: product.rental_details?.preparation_duration ?? 'N/A' },
      { label: 'RENTAL STOCK UNITS', value: product.rental_details?.stock_units ?? 'N/A' },
      { label: 'EXTEND DAYS RENT',   value: product.rental_details?.extends_days_rent ?? 'N/A' },
    ].map(f => (
      <div key={f.label} className="rental-field">
        <label className="rental-label">{f.label}</label>
        <div className="rental-input-wrap">
          <input className="form-input rental-input" value={f.value} disabled readOnly />
        </div>
      </div>
    ))}
  </div>
)}
            </div>

            {/* Specifications */}
            {product.specification && product.specification.length > 0 && (
              <>
                <div className="section-heading" style={{ marginTop: 24 }}>
                  <div className="section-icon blue"><i className="bi bi-cpu-fill" /></div>
                  Specifications
                </div>
                <div className="pinfo-spec-box">
                  {product.specification.map((spec, i) =>
                    Object.entries(spec).map(([key, value]) => (
                      <div key={`${i}-${key}`} className="pinfo-spec-row">
                        <span className="pinfo-spec-key">{key}</span>
                        <span className="pinfo-spec-value">{value}</span>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* Archive Status */}
            <div className="section-heading" style={{ marginTop: 24 }}>
              <div className="section-icon blue"><i className="bi bi-archive-fill" /></div>
              Archive Status
            </div>
            <div className="pinfo-spec-box" style={{ marginBottom: 8 }}>
              <div className="pinfo-spec-row" style={{ borderBottom: 'none' }}>
                <span className="pinfo-spec-key">IS ARCHIVED</span>
                <span
                  className="pinfo-status-pill"
                  style={{
                    background: product.is_archive ? '#fef2f2' : '#f0fdf4',
                    color:      product.is_archive ? '#dc2626' : '#16a34a',
                    border:     `1.5px solid ${product.is_archive ? '#dc262644' : '#16a34a44'}`,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: product.is_archive ? '#dc2626' : '#16a34a' }} />
                  {product.is_archive ? 'ARCHIVED' : 'NOT ARCHIVED'}
                </span>
              </div>
            </div>

            {/* Reviews */}
            {product.reviews && product.reviews.length > 0 && (
              <>
                <div className="section-heading" style={{ marginTop: 24 }}>
                  <div className="section-icon blue"><i className="bi bi-star-fill" /></div>
                  Reviews ({product.reviews.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {product.reviews.map((rev) => (
                    <div key={rev.id} className="pinfo-spec-box" style={{ padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i
                              key={i}
                              className={i < (rev.rating || 0) ? 'bi bi-star-fill' : 'bi bi-star'}
                              style={{ color: '#d97706', fontSize: 13 }}
                            />
                          ))}
                          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginLeft: 4 }}>
                            {rev.rating ?? 'N/A'}/5
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>
                          Doctor #{rev.doctor_id} · {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: '#374151' }}>
                        {rev.comment || 'No comment provided.'}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Bottom actions */}
            <div className="form-actions">
              <button className="btn-export" onClick={() => navigate('/products')}>
                <i className="bi bi-arrow-left" /> Back
              </button>
              {product?.status === 'create_rejected' && (
                <button
                  className="btn-export"
                  style={{ color: '#d97706', borderColor: '#fde68a', background: '#fffbeb' }}
                  onClick={() => navigate(`/products/rejection/${id}`)}
                >
                  <i className="bi bi-arrow-repeat" /> View Rejection
                </button>
              )}
              <button className="btn-add" onClick={() => navigate(`/products/edit/${id}`)}>
                <i className="bi bi-pencil" /> Edit Product
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <i className="bi bi-exclamation-circle" style={{ fontSize: 32, color: '#9ca3af', display: 'block', marginBottom: 12 }} />
            <p style={{ color: '#6b7280', fontSize: 14 }}>Product not found.</p>
            <button className="btn-add" onClick={() => navigate('/products')} style={{ marginTop: 16 }}>
              Back to Products
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {showDelete && (
        <>
          <div className="dialog-backdrop" onClick={() => !deleting && setShowDelete(false)} />
          <div className="dialog-box">
            <div className="dialog-icon-wrap">
              <i className="bi bi-trash3-fill dialog-icon" />
            </div>
            <div className="dialog-title">Delete this product?</div>
            <div className="dialog-message">
              This will permanently remove <strong>{product?.name}</strong> from your catalog. This action cannot be undone.
            </div>
            <div className="dialog-divider" />
            <div className="dialog-actions">
              <button className="dialog-btn-cancel" onClick={() => setShowDelete(false)} disabled={deleting}>
                Cancel
              </button>
              <button className="dialog-btn-confirm" onClick={handleDelete} disabled={deleting}>
                {deleting
                  ? <><i className="bi bi-hourglass-split" /> Deleting...</>
                  : <><i className="bi bi-trash3-fill" /> Delete</>
                }
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
        @keyframes fadeInPage { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }

        .pinfo-status-pill {
          display: inline-flex; align-items: center; gap: 6px;
          border-radius: 20px; font-size: 11px; font-weight: 700;
          padding: 4px 12px; letter-spacing: 0.05em;
        }
        .btn-delete-header {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 18px; border-radius: 9px; border: none;
          background: #dc2626; color: #fff; font-size: 13.5px;
          font-weight: 600; cursor: pointer; transition: opacity 0.15s;
        }
        .btn-delete-header:hover { opacity: 0.88; }
        .btn-delete-header:disabled { opacity: 0.5; cursor: not-allowed; }

        .form-input:disabled, .form-input[readonly] {
          background: #f9fafb; color: #374151; cursor: default;
        }
        .pinfo-no-images {
          height: 120px; display: flex; align-items: center; justify-content: center;
          background: #f8f9fb; border-radius: 10px;
          border: 1.5px dashed #e0e3e8; font-size: 12.5px; color: #9ca3af;
        }
        .pinfo-spec-box {
          background: #f8f9fb; border-radius: 10px;
          padding: 16px; border: 1px solid #f0f0f0;
        }
        .pinfo-spec-row {
          display: flex; justify-content: space-between;
          padding: 8px 0; border-bottom: 1px solid #f0f0f0;
        }
        .pinfo-spec-row:last-child { border-bottom: none; }
        .pinfo-spec-key   { font-size: 12px; color: #9ca3af; font-weight: 600; text-transform: uppercase; }
        .pinfo-spec-value { font-size: 13px; color: #374151; font-weight: 500; }
      `}</style>
    </div>
  );
}
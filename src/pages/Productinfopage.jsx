// src/pages/ProductInfoPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProductById, updateProduct, deleteProduct, getCategories } from '../apis/Products';

const statusConfig = {
  create_pending:  { label: 'PENDING',  badgeBg: '#fffbeb', badgeColor: '#d97706', dot: '#d97706' },
  create_accepted: { label: 'ACTIVE',   badgeBg: '#f0fdf4', badgeColor: '#16a34a', dot: '#16a34a' },
  create_rejected: { label: 'REJECTED', badgeBg: '#fef2f2', badgeColor: '#dc2626', dot: '#dc2626' },
};
const getStatusCfg = (s) => statusConfig[s] || { label: 'UNKNOWN', badgeBg: '#f3f4f6', badgeColor: '#6b7280', dot: '#9ca3af' };

function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', zIndex: 9998 }} onClick={onCancel} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 16, padding: '28px 28px 24px', width: 400, maxWidth: '92vw', boxShadow: '0 24px 80px rgba(0,0,0,0.16)', zIndex: 9999, animation: 'slideUpDialog 0.22s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <i className="bi bi-trash3-fill" style={{ fontSize: 20, color: '#dc2626' }} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.65, marginBottom: 24 }}>{message}</div>
        <div style={{ height: 1, background: '#f3f4f6', margin: '0 -28px 18px' }} />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 13.5, fontWeight: 500, fontFamily: 'DM Sans,sans-serif' }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'DM Sans,sans-serif' }}>
            <i className="bi bi-trash3" /> Delete
          </button>
        </div>
      </div>
    </>
  );
}

const Skel = ({ h = 38, w = '100%', mb = 14 }) => (
  <div style={{ height: h, borderRadius: 9, background: '#f0f2f5', width: w, marginBottom: mb, animation: 'pulse 1.5s ease-in-out infinite' }} />
);

export default function ProductInfoPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [categories, setCategories] = useState([]);
  const [product, setProduct]       = useState(null);
  const [confirm, setConfirm]       = useState(false);
  const [originalForm, setOriginalForm] = useState({});

  const [form, setForm] = useState({
    name: '', category_id: '', discount_code: '',
    price: '', stock: '', description: '',
    is_rentable: false,
    price_daily: '', deposit: '', setup_fee: '',
    available_units: '', minimum_rental_days: '', maximum_rental_days: '',
    preparation_duration: '',
    warranty: '', configuration: '',
    setup_duration: '', restock_date: '',
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages]           = useState([]);
  const [newPreviews, setNewPreviews]       = useState([]);
  const [dragOver, setDragOver]             = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getProductById(id), getCategories()])
      .then(([pRes, cRes]) => {
        setCategories(cRes.data || []);
        const p = pRes.data || pRes;
        setProduct(p);
        setExistingImages(p.image || []);
        const rental = p.rental_details || {};
        const d = {
          name: p.name || '', category_id: p.category_id || '',
          discount_code: p.discount_code || '',
          price: p.price || '', stock: p.stock ?? '',
          description: p.description || '',
          is_rentable: !!p.is_rentable,
          price_daily: rental.price_daily || p.price_daily || '',
          deposit: rental.deposit || p.deposit || '',
          setup_fee: rental.setup_fee || p.setup_fee || '',
          available_units: rental.available_units ?? p.available_units ?? '',
          minimum_rental_days: rental.minimum_rental_days || p.minimum_rental_days || '',
          maximum_rental_days: rental.maximum_rental_days || p.maximum_rental_days || '',
          preparation_duration: rental.preparation_duration || p.preparation_duration || '',
          warranty: p.warranty || '', configuration: p.configuration || '',
          setup_duration: p.setup_duration || '', restock_date: p.restock_date || '',
        };
        setForm(d); setOriginalForm(d);
      })
      .catch(err => { toast.error(err?.message || 'Failed to load product'); navigate('/products'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addImages = (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!valid.length) return;
    valid.forEach(f => { const r = new FileReader(); r.onload = ev => setNewPreviews(p => [...p, ev.target.result]); r.readAsDataURL(f); });
    setNewImages(p => [...p, ...valid]);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Product name is required');
    const changed = {};
    Object.keys(form).forEach(k => {
      const nv = k === 'is_rentable' ? (form[k] ? 1 : 0) : form[k];
      const ov = k === 'is_rentable' ? (originalForm[k] ? 1 : 0) : originalForm[k];
      if (String(nv) !== String(ov)) changed[k] = nv;
    });
    if (Object.keys(changed).length === 0 && newImages.length === 0) return toast.info('No changes detected');
    setSaving(true);
    try {
      await updateProduct(id, { ...changed, images: newImages }, originalForm);
      toast.success('Product updated successfully!');
      const pRes = await getProductById(id);
      const p = pRes.data || pRes;
      setProduct(p); setExistingImages(p.image || []);
      setNewImages([]); setNewPreviews([]);
      setOriginalForm(form);
    } catch (err) { toast.error(err?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setConfirm(false); setDeleting(true);
    try { await deleteProduct(id); toast.success('Product deleted'); navigate('/products'); }
    catch (err) { toast.error(err?.message || 'Failed to delete'); setDeleting(false); }
  };

  const statusCfg = getStatusCfg(product?.status);

  return (
    <div className="dashboard-content" style={{ animation: 'fadeInPage 0.3s ease both' }}>

      {confirm && <ConfirmDialog title="Delete Product" message={`Permanently delete "${product?.name}"? This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setConfirm(false)} />}

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
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: statusCfg.badgeBg, color: statusCfg.badgeColor,
                border: `1.5px solid ${statusCfg.badgeColor}44`,
                borderRadius: 20, fontSize: 11, fontWeight: 700,
                padding: '4px 12px', letterSpacing: '0.05em',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusCfg.dot }} />
                {statusCfg.label}
              </span>
            )}
          </h1>
        </div>
        <div className="header-actions">
          <button
            style={{
              padding: '8px 18px', borderRadius: 9, border: 'none',
              background: '#dc2626', color: 'white', cursor: deleting || loading ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'DM Sans,sans-serif', opacity: deleting || loading ? 0.6 : 1,
              transition: 'all 0.15s',
            }}
            onClick={() => !deleting && !loading && setConfirm(true)}
            onMouseEnter={e => { if (!deleting && !loading) e.currentTarget.style.background = '#b91c1c'; }}
            onMouseLeave={e => e.currentTarget.style.background = '#dc2626'}
          >
            {deleting ? <><i className="bi bi-hourglass-split spin" /> Deleting...</> : <><i className="bi bi-trash3-fill" /> Delete</>}
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
        ) : (
          <>
            {/* ══ General Info + Images ══ */}
            <div className="pinfo-two-col">

              {/* LEFT */}
              <div>
                <div className="section-heading">
                  <div className="section-icon blue"><i className="bi bi-info-circle-fill" /></div>
                  General Information
                </div>

                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Product name" />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input form-select" name="category_id" value={form.category_id} onChange={handleChange}>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Code</label>
                    <div style={{ position: 'relative' }}>
                      <i className="bi bi-tag" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 13, pointerEvents: 'none' }} />
                      <input className="form-input" name="discount_code" value={form.discount_code} onChange={handleChange} placeholder="e.g. MED-OFF-10" style={{ paddingLeft: 30 }} />
                    </div>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Price ($)</label>
                    <input className="form-input" name="price" value={form.price} onChange={handleChange} type="number" min="0" placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input className="form-input" name="stock" value={form.stock} onChange={handleChange} type="number" min="0" placeholder="0" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input form-textarea" name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Detailed product description..." />
                </div>
              </div>

              {/* RIGHT: Images */}
              <div>
                <div className="section-heading">
                  <div className="section-icon blue"><i className="bi bi-images" /></div>
                  Current Images
                </div>

                {existingImages.length > 0 ? (
                  <div className="current-images-grid" style={{ marginBottom: 14 }}>
                    {existingImages.map((img, i) => (
                      <div key={img.id || i} className="current-image-wrap" style={{ background: '#f3f4f6', height: 100 }}>
                        {i === 0 && <span className="img-main-badge">Main</span>}
                        <img src={img.image} alt={`img-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9 }} onError={e => { e.target.src = 'https://placehold.co/100x100?text=No'; }} />
                        <button className="img-delete-btn" onClick={() => setExistingImages(p => p.filter((_, x) => x !== i))}>
                          <i className="bi bi-trash3-fill" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fb', borderRadius: 10, border: '1.5px dashed #e0e3e8', marginBottom: 14 }}>
                    <span style={{ fontSize: 12.5, color: '#9ca3af' }}>No images uploaded</span>
                  </div>
                )}

                <div className={`dropzone${dragOver ? ' dragover' : ''}`} style={{ height: 120 }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); addImages(e.dataTransfer.files); }}
                  onClick={() => document.getElementById('piFileInput').click()}
                >
                  <input id="piFileInput" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => addImages(e.target.files)} />
                  <div className="dropzone-inner">
                    <div className="dropzone-icon" style={{ fontSize: 22, marginBottom: 6 }}><i className="bi bi-cloud-arrow-up" /></div>
                    <div className="dropzone-text" style={{ fontSize: 12 }}><span className="dropzone-link">Upload files</span> or drag and drop</div>
                    <div className="dropzone-hint">PNG, JPG, WEBP up to 5MB</div>
                  </div>
                </div>

                {newPreviews.length > 0 && (
                  <div className="current-images-grid" style={{ marginTop: 10 }}>
                    {newPreviews.map((src, i) => (
                      <div key={i} className="current-image-wrap" style={{ background: '#f3f4f6', height: 100 }}>
                        <span className="img-main-badge" style={{ background: '#2563eb' }}>New</span>
                        <img src={src} alt={`new-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9 }} />
                        <button className="img-delete-btn" onClick={e => { e.stopPropagation(); setNewImages(p => p.filter((_, x) => x !== i)); setNewPreviews(p => p.filter((_, x) => x !== i)); }}>
                          <i className="bi bi-trash3-fill" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ══ Rental Options ══ */}
            <div className="rental-section" style={{ marginBottom: 28 }}>
              <div className="rental-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="section-icon blue" style={{ width: 36, height: 36, fontSize: 16 }}>
                    <i className="bi bi-calendar-week" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1d23' }}>Rental Options</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Configure rental pricing and availability</div>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" name="is_rentable" checked={form.is_rentable} onChange={handleChange} />
                  <span className="toggle-slider" />
                </label>
              </div>

              {form.is_rentable && (
                <div className="rental-fields">
                  {[
                    { label: 'DAILY RATE', name: 'price_daily',         prefix: '$', ph: '500' },
                    { label: 'DEPOSIT',    name: 'deposit',             prefix: '$', ph: '5000' },
                    { label: 'SETUP FEE',  name: 'setup_fee',           prefix: '$', ph: '1000' },
                    { label: 'UNITS',      name: 'available_units',     prefix: '',  ph: '2' },
                    { label: 'MIN DAYS',   name: 'minimum_rental_days', prefix: '',  ph: '7' },
                    { label: 'MAX DAYS',   name: 'maximum_rental_days', prefix: '',  ph: '365' },
                  ].map(f => (
                    <div key={f.name} className="rental-field">
                      <label className="rental-label">{f.label}</label>
                      <div className="rental-input-wrap">
                        {f.prefix && <span className="rental-prefix">{f.prefix}</span>}
                        <input className={`form-input rental-input${f.prefix ? ' has-prefix' : ''}`} name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.ph} type={f.prefix === '$' ? 'number' : 'text'} min="0" />
                      </div>
                    </div>
                  ))}
                  <div style={{ width: '100%', marginTop: 6, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <label style={{ fontSize: 13, color: '#374151', fontWeight: 500, whiteSpace: 'nowrap' }}>Preparation Duration:</label>
                    <input className="form-input" name="preparation_duration" value={form.preparation_duration} onChange={handleChange} placeholder="48" style={{ width: 80 }} type="number" min="0" />
                    <span style={{ fontSize: 13, color: '#6b7280' }}>hours (for cleaning &amp; checks)</span>
                  </div>
                </div>
              )}
            </div>

            {/* ══ Technical Details ══ */}
            <div style={{ borderTop: '1px solid #f0f2f5', paddingTop: 24, marginBottom: 8 }}>
              <div className="section-heading">
                <div className="section-icon blue"><i className="bi bi-cpu-fill" /></div>
                Technical Details
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Warranty Information</label>
                  <input className="form-input" name="warranty" value={form.warranty} onChange={handleChange} placeholder="e.g. 3 years full service and parts replacement." />
                </div>
                <div className="form-group">
                  <label className="form-label">Configuration / Box Contents</label>
                  <input className="form-input" name="configuration" value={form.configuration} onChange={handleChange} placeholder="e.g. 1x MRI Unit, 1x Control Station, 2x Patient Coils" />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Setup Duration</label>
                  <input className="form-input" name="setup_duration" value={form.setup_duration} onChange={handleChange} placeholder="e.g. 30min" />
                </div>
                <div className="form-group">
                  <label className="form-label">Restock Date</label>
                  <input className="form-input" name="restock_date" value={form.restock_date} onChange={handleChange} type="date" />
                </div>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="form-actions">
              <button className="btn-export" onClick={() => navigate('/products')} disabled={saving}>
                <i className="bi bi-arrow-left" /> Back
              </button>
              {product?.status === 'create_rejected' && (
                <button className="btn-export" style={{ color: '#d97706', borderColor: '#fde68a', background: '#fffbeb' }} onClick={() => navigate(`/products/rejection/${id}`)}>
                  <i className="bi bi-arrow-repeat" /> View Rejection
                </button>
              )}
              <button className="btn-add" onClick={handleSave} disabled={saving}
                style={{ background: '#16a34a' }}
                onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
                onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}
              >
                {saving ? <><i className="bi bi-hourglass-split spin" /> Saving...</> : <><i className="bi bi-floppy-fill" /> Save Changes</>}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeInPage { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
        @keyframes slideUpDialog {
          from{opacity:0;transform:translate(-50%,calc(-50%+14px))scale(0.96)}
          to{opacity:1;transform:translate(-50%,-50%)scale(1)}
        }
        .pinfo-two-col {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 36px;
          margin-bottom: 28px;
        }
        @media (max-width: 1024px) { .pinfo-two-col { grid-template-columns: 1fr; gap: 20px; } }
        @media (max-width: 768px)  { .pinfo-two-col { grid-template-columns: 1fr; gap: 16px; } }
      `}</style>
    </div>
  );
}
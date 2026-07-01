// src/pages/ProductRejectionPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProductById, updateProduct, getCategories } from '../apis/Products';

export default function ProductRejectionPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [categories, setCategories]   = useState([]);
  const [product, setProduct]         = useState(null);
  const [reply, setReply]             = useState('');
  const [dragOver, setDragOver]       = useState(false);

  const [newImages, setNewImages]       = useState([]);
  const [newPreviews, setNewPreviews]   = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [form, setForm] = useState({
    name: '', category_id: '', price: '', stock: '',
    description: '', is_rentable: false,
    price_daily: '', minimum_rental_days: '', maximum_rental_days: '',
    available_units: '', preparation_duration: '',
    setup_duration: '', warranty: '', configuration: '', restock_date: '',
    discount_code: '',
  });
  const [originalForm, setOriginalForm] = useState({});

  useEffect(() => {
    if (!id) return;
    Promise.all([getProductById(id), getCategories()])
      .then(([productRes, catRes]) => {
        setCategories(catRes.data || []);
        const p = productRes.data || productRes;
        setProduct(p);
        setExistingImages(p.image || []);
        const rental = p.rental_details || {};
        const d = {
          name: p.name || '',
          category_id: p.category_id || '',
          price: p.price || '',
          stock: p.stock ?? '',
          description: p.description || '',
          is_rentable: !!p.is_rentable,
          setup_duration: p.setup_duration || '',
          warranty: p.warranty || '',
          configuration: p.configuration || '',
          restock_date: p.restock_date || '',
          discount_code: p.discount_code || '',
          price_daily: rental.price_daily || p.price_daily || '',
          minimum_rental_days: rental.minimum_rental_days || p.minimum_rental_days || '',
          maximum_rental_days: rental.maximum_rental_days || p.maximum_rental_days || '',
          available_units: rental.available_units ?? p.available_units ?? '',
          preparation_duration: rental.preparation_duration || p.preparation_duration || '',
        };
        setForm(d);
        setOriginalForm(d);
      })
      .catch(err => {
        toast.error(err?.message || 'Failed to load product');
        navigate('/products');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addImages = (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!valid.length) return;
    valid.forEach(f => {
      const r = new FileReader();
      r.onload = ev => setNewPreviews(p => [...p, ev.target.result]);
      r.readAsDataURL(f);
    });
    setNewImages(p => [...p, ...valid]);
  };

  const removeNewImage = (i) => {
    setNewImages(p => p.filter((_, x) => x !== i));
    setNewPreviews(p => p.filter((_, x) => x !== i));
  };

  const handleResend = async () => {
    if (!form.name.trim()) return toast.error('Product name is required');
    if (!form.price)       return toast.error('Price is required');

    const changedFields = {};
    Object.keys(form).forEach(key => {
      const nv = key === 'is_rentable' ? (form[key] ? 1 : 0) : form[key];
      const ov = key === 'is_rentable' ? (originalForm[key] ? 1 : 0) : originalForm[key];
      if (String(nv) !== String(ov)) changedFields[key] = nv;
    });

    const payload = {
      ...changedFields,
      images: newImages,
      ...(reply.trim() ? { rejection_reply: reply.trim() } : {}),
    };

    setSubmitting(true);
    try {
      await updateProduct(id, payload, originalForm);
      toast.success('Product resubmitted successfully!');
      navigate('/products');
    } catch (err) {
      toast.error(err?.message || 'Failed to resubmit product');
    } finally {
      setSubmitting(false);
    }
  };

  const rejectionReason = product?.rejection_reason || product?.reject_reason || product?.rejection_message
    || 'The admin rejected this product. Please review the details and make the necessary corrections before resubmitting.';

  return (
    <div className="dashboard-content fade-in">
      {/* Breadcrumb */}
      <div className="breadcrumb-row">
        <span className="bc-link" onClick={() => navigate('/')}>
          <i className="bi bi-grid-fill" /> Dashboard
        </span>
        <i className="bi bi-chevron-right bc-sep" />
        <span className="bc-link" onClick={() => navigate('/products')}>Products</span>
        <i className="bi bi-chevron-right bc-sep" />
        <span className="bc-current">Product Rejection</span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            Product Rejection
            <span className="status-badge cancelled">
              <i className="bi bi-x-circle-fill" style={{ fontSize: 11 }} /> REJECTED
            </span>
          </h1>
          <p>Fix issues and resubmit your product for review.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={() => navigate('/products')} disabled={submitting}>
            Cancel
          </button>
          <button className="btn-add" onClick={handleResend} disabled={submitting || loading}>
            {submitting
              ? <><i className="bi bi-hourglass-split spin" /> Resubmitting...</>
              : <><i className="bi bi-send-fill" /> Resend Product</>}
          </button>
        </div>
      </div>

      {/* Rejection Banner */}
      <div className="rejection-banner">
        <div className="rejection-banner-title">
          <i className="bi bi-exclamation-circle-fill" /> Rejection Reason from Admin
        </div>
        <div className="rejection-banner-text">{rejectionReason}</div>
      </div>

      {/* Reply Box */}
      <div className="reply-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div className="section-icon blue" style={{ width: 28, height: 28, fontSize: 12 }}>
            <i className="bi bi-reply-fill" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1d23' }}>Reply to Admin</div>
        </div>
        <textarea
          placeholder="Explain the changes you've made or provide additional context..."
          value={reply}
          onChange={e => setReply(e.target.value)}
          rows={4}
          style={{
            width: '100%', resize: 'vertical',
            border: '1.5px solid #e0e3e8', borderRadius: 9,
            padding: '10px 13px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 13.5, color: '#1a1d23',
            outline: 'none',
            transition: 'border-color 0.18s, box-shadow 0.18s',
          }}
          onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
          onBlur={e => { e.target.style.borderColor = '#e0e3e8'; e.target.style.boxShadow = 'none'; }}
        />
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
          <i className="bi bi-info-circle" /> You can only send one reply for this rejection.
        </div>
      </div>

      {/* Main form */}
      <div className="form-card">
        <div className="form-two-col">

          {/* LEFT */}
          <div>
            <div className="section-heading">
              <div className="section-icon blue"><i className="bi bi-pencil-fill" /></div>
              General Information
            </div>

            <div className="form-group">
              <label className="form-label">Product Name *</label>
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
                  <i className="bi bi-tag" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 13 }} />
                  <input className="form-input" name="discount_code" value={form.discount_code} onChange={handleChange} placeholder="e.g. MED-OFF-10" style={{ paddingLeft: 30 }} />
                </div>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input className="form-input" name="price" value={form.price} onChange={handleChange} type="number" min="0" placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input className="form-input" name="stock" value={form.stock} onChange={handleChange} type="number" min="0" placeholder="0" />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Warranty</label>
                <input className="form-input" name="warranty" value={form.warranty} onChange={handleChange} placeholder="e.g. 2 Years" />
              </div>
              <div className="form-group">
                <label className="form-label">Setup Duration</label>
                <input className="form-input" name="setup_duration" value={form.setup_duration} onChange={handleChange} placeholder="e.g. 15min" />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Configuration / Box Contents</label>
                <input className="form-input" name="configuration" value={form.configuration} onChange={handleChange} placeholder="e.g. 1x Device, 2x Batteries" />
              </div>
              <div className="form-group">
                <label className="form-label">Restock Date</label>
                <input className="form-input" name="restock_date" value={form.restock_date} onChange={handleChange} type="date" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input form-textarea" name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Detailed product description..." />
            </div>
          </div>

          {/* RIGHT: Images */}
          <div>
            {/* Upload New */}
            <div className="section-heading">
              <div className="section-icon blue"><i className="bi bi-cloud-arrow-up-fill" /></div>
              Product Image Upload
            </div>

            <div
              className={`dropzone ${dragOver ? 'dragover' : ''}`}
              style={{ height: 160 }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addImages(e.dataTransfer.files); }}
              onClick={() => document.getElementById('rejFileInput').click()}
            >
              <input id="rejFileInput" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => addImages(e.target.files)} />
              <div className="dropzone-inner">
                <div className="dropzone-icon"><i className="bi bi-cloud-arrow-up" /></div>
                <div className="dropzone-text"><span className="dropzone-link">Drop your image here, or browse</span></div>
                <div className="dropzone-hint">Supports: JPG, PNG, WEBP (Max 5MB)</div>
              </div>
            </div>

            {/* New Previews */}
            {newPreviews.length > 0 && (
              <div className="current-images-grid" style={{ marginTop: 12 }}>
                {newPreviews.map((src, i) => (
                  <div key={i} className="current-image-wrap" style={{ background: '#f3f4f6' }}>
                    <span className="img-main-badge" style={{ background: '#2563eb' }}>New</span>
                    <img src={src} alt={`new-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9 }} />
                    <button className="img-delete-btn" onClick={e => { e.stopPropagation(); removeNewImage(i); }}>
                      <i className="bi bi-trash3-fill" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <>
                <div className="section-heading" style={{ marginTop: 20 }}>
                  <div className="section-icon blue" style={{ width: 28, height: 28, fontSize: 12 }}>
                    <i className="bi bi-images" />
                  </div>
                  Current Images
                </div>
                <div className="current-images-grid">
                  {existingImages.map((img, i) => (
                    <div key={img.id || i} className="current-image-wrap" style={{ background: '#f3f4f6' }}>
                      {i === 0 && <span className="img-main-badge">Main</span>}
                      <img
                        src={img.image}
                        alt={`img-${i}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9 }}
                        onError={e => { e.target.src = 'https://placehold.co/80x80?text=No+Img'; }}
                      />
                      <button
                        className="img-delete-btn"
                        onClick={() => setExistingImages(p => p.filter((_, x) => x !== i))}
                      >
                        <i className="bi bi-trash3-fill" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Rental Section */}
        <div className="rental-section" style={{ marginBottom: 24 }}>
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
                { label: 'DAILY RATE',      name: 'price_daily',          prefix: '$', placeholder: '0.00' },
                { label: 'MIN DAYS',        name: 'minimum_rental_days',  prefix: '',  placeholder: '1' },
                { label: 'MAX DAYS',        name: 'maximum_rental_days',  prefix: '',  placeholder: '30' },
                { label: 'UNITS',           name: 'available_units',      prefix: '',  placeholder: '0' },
                { label: 'PREP DURATION',   name: 'preparation_duration', prefix: '',  placeholder: '0min' },
              ].map(f => (
                <div key={f.name} className="rental-field">
                  <label className="rental-label">{f.label}</label>
                  <div className="rental-input-wrap">
                    {f.prefix && <span className="rental-prefix">{f.prefix}</span>}
                    <input
                      className={`form-input rental-input ${f.prefix ? 'has-prefix' : ''}`}
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleChange}
                      placeholder={f.placeholder}
                      type={f.prefix === '$' ? 'number' : 'text'}
                      min="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button className="btn-export" onClick={() => navigate('/products')} disabled={submitting}>Cancel</button>
          <button className="btn-add" onClick={handleResend} disabled={submitting}>
            {submitting
              ? <><i className="bi bi-hourglass-split spin" /> Resubmitting...</>
              : <><i className="bi bi-send-fill" /> Resend Product</>}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn .3s ease both}
      `}</style>
    </div>
  );
}
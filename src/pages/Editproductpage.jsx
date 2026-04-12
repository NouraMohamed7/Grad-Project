// src/pages/EditProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProductById, updateProduct, getCategories } from '../apis/Products';

// ── Skeleton loader ───────────────────────────────────────────────────
const FieldSkeleton = ({ wide }) => (
  <div style={{
    height: 40, borderRadius: 8, background: '#f0f2f5',
    width: wide ? '100%' : '60%',
    animation: 'pulse 1.5s ease-in-out infinite',
    marginBottom: 16,
  }} />
);

export default function EditProductPage() {
  const navigate  = useNavigate();
  const { id }    = useParams();   // /products/edit/:id

  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [categories, setCategories]   = useState([]);
  const [dragOver, setDragOver]       = useState(false);
  const [originalForm, setOriginalForm] = useState({});

  // New images picked by the user
  const [newImages, setNewImages]     = useState([]);   // File objects
  const [newPreviews, setNewPreviews] = useState([]);   // base64

  // Existing images from the server
  const [existingImages, setExistingImages] = useState([]);   // { id, image }

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    price: '',
    stock: '',
    description: '',
    is_rentable: false,
    // rental
    price_daily: '',
    minimum_rental_days: '',
    maximum_rental_days: '',
    available_units: '',
    preparation_duration: '',
    // other
    setup_duration: '',
    warranty: '',
    configuration: '',
    restock_date: '',
  });

  // ── Load product + categories ────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    Promise.all([
      getProductById(id),
      getCategories(),
    ])
      .then(([productRes, catRes]) => {
        setCategories(catRes.data || []);

        const p = productRes.data || productRes;

        setExistingImages(p.image || []);

        // Merge rental_details into the form if present
        const rental = p.rental_details || {};

        const productData = {
          name:                 p.name              || '',
          category_id:          p.category_id       || '',
          price:                p.price             || '',
          stock:                p.stock             ?? '',
          description:          p.description       || '',
          is_rentable:          !!p.is_rentable,
          setup_duration:       p.setup_duration    || '',
          warranty:             p.warranty          || '',
          configuration:        p.configuration     || '',
          restock_date:         p.restock_date      || '',
          // rental fields (from rental_details if present)
          price_daily:          rental.price_daily          || p.price_daily          || '',
          minimum_rental_days:  rental.minimum_rental_days  || p.minimum_rental_days  || '',
          maximum_rental_days:  rental.maximum_rental_days  || p.maximum_rental_days  || '',
          available_units:      rental.available_units      ?? p.available_units      ?? '',
          preparation_duration: rental.preparation_duration || p.preparation_duration || '',
        };

        setForm(productData);
        setOriginalForm(productData);
      })
      .catch((err) => {
        toast.error(err?.message || 'Failed to load product');
        navigate('/products');
      })
      .finally(() => setPageLoading(false));
  }, [id]);

  // ── Field change ─────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // ── New image handling ───────────────────────────────────────────
  const addImages = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!validFiles.length) return;
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewPreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
    setNewImages(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addImages(e.dataTransfer.files);
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Product name is required');
    if (!form.price)       return toast.error('Price is required');

    // Build only changed fields
    const changedFields = {};
    Object.keys(form).forEach((key) => {
      // Coerce boolean to int for is_rentable comparison
      const newVal = key === 'is_rentable' ? (form[key] ? 1 : 0) : form[key];
      const oldVal = key === 'is_rentable' ? (originalForm[key] ? 1 : 0) : originalForm[key];
      if (String(newVal) !== String(oldVal)) {
        changedFields[key] = newVal;
      }
    });

    const payload = {
      ...changedFields,
      images: newImages,
    };

    if (Object.keys(changedFields).length === 0 && newImages.length === 0) {
      return toast.info('No changes detected');
    }

    setSubmitting(true);
    try {
      await updateProduct(id, payload, originalForm);
      toast.success('Product updated successfully!');
      navigate('/products');
    } catch (err) {
      toast.error(err?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-content">
      {/* Breadcrumb */}
      <div className="breadcrumb-row">
        <span className="bc-link" onClick={() => navigate('/')}>
          <i className="bi bi-grid-fill" /> Dashboard
        </span>
        <i className="bi bi-chevron-right bc-sep" />
        <span className="bc-link" onClick={() => navigate('/products')}>Products</span>
        <i className="bi bi-chevron-right bc-sep" />
        <span className="bc-current">Edit Product</span>
      </div>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-title">
          <h1>Edit Product</h1>
          {!pageLoading && (
            <p style={{ fontSize: 13, color: '#9ca3af', margin: '2px 0 0' }}>ID: {id}</p>
          )}
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={() => navigate('/products')} disabled={submitting}>
            Cancel
          </button>
          <button className="btn-add" onClick={handleSubmit} disabled={submitting || pageLoading}>
            {submitting
              ? <><i className="bi bi-hourglass-split" /> Updating...</>
              : <><i className="bi bi-arrow-repeat" /> Update Product</>
            }
          </button>
        </div>
      </div>

      <div className="form-card">
        {pageLoading ? (
          /* ── Skeleton while loading ───────────────────────────── */
          <div>
            <FieldSkeleton wide />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FieldSkeleton /><FieldSkeleton />
              <FieldSkeleton /><FieldSkeleton />
            </div>
            <FieldSkeleton wide />
            <div style={{
              height: 100, borderRadius: 8, background: '#f0f2f5',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          </div>
        ) : (
          <>
            {/* ── General Info + Images ─────────────────────────── */}
            <div className="form-two-col">

              {/* LEFT */}
              <div>
                <div className="section-heading">
                  <div className="section-icon blue"><i className="bi bi-pencil-fill" /></div>
                  General Information
                </div>

                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    className="form-input"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-input form-select"
                      name="category_id"
                      value={form.category_id}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Warranty</label>
                    <input
                      className="form-input"
                      name="warranty"
                      value={form.warranty}
                      onChange={handleChange}
                      placeholder="e.g. 2 Years"
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Price ($) *</label>
                    <input
                      className="form-input"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      type="number"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      className="form-input"
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                      type="number"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Setup Duration</label>
                    <input
                      className="form-input"
                      name="setup_duration"
                      value={form.setup_duration}
                      onChange={handleChange}
                      placeholder="e.g. 15min"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Restock Date</label>
                    <input
                      className="form-input"
                      name="restock_date"
                      value={form.restock_date}
                      onChange={handleChange}
                      type="date"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Configuration / Box Contents</label>
                  <input
                    className="form-input"
                    name="configuration"
                    value={form.configuration}
                    onChange={handleChange}
                    placeholder="e.g. 1x Device, 2x Batteries"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input form-textarea"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                  />
                </div>
              </div>

              {/* RIGHT: Images */}
              <div>
                {/* Existing images */}
                {existingImages.length > 0 && (
                  <>
                    <div className="section-heading">
                      <div className="section-icon blue" style={{ width: 28, height: 28, fontSize: 13 }}>
                        <i className="bi bi-images" />
                      </div>
                      Current Images
                    </div>
                    <div className="current-images-grid" style={{ marginBottom: 20 }}>
                      {existingImages.map((img, i) => (
                        <div key={img.id || i} className="current-image-wrap" style={{ background: '#f3f4f6' }}>
                          {i === 0 && <span className="img-main-badge">Main</span>}
                          <img
                            src={img.image}
                            alt={`product-${i}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                            onError={e => { e.target.src = 'https://placehold.co/80x80?text=No+Img'; }}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Upload new images */}
                <div className="section-heading">
                  <div className="section-icon blue">
                    <i className="bi bi-cloud-arrow-up-fill" />
                  </div>
                  Upload New Images
                </div>

                <div
                  className={`dropzone ${dragOver ? 'dragover' : ''}`}
                  style={{ height: 140 }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('editFileInput').click()}
                >
                  <input
                    id="editFileInput"
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => addImages(e.target.files)}
                  />
                  <div className="dropzone-inner">
                    <div className="dropzone-icon"><i className="bi bi-cloud-arrow-up" /></div>
                    <div className="dropzone-text">
                      <span className="dropzone-link">Browse</span> or drag &amp; drop
                    </div>
                    <div className="dropzone-hint">Supports: JPG, PNG, WEBP (Max 5MB)</div>
                  </div>
                </div>

                {/* New image previews */}
                {newPreviews.length > 0 && (
                  <div className="current-images-grid" style={{ marginTop: 12 }}>
                    {newPreviews.map((src, i) => (
                      <div key={i} className="current-image-wrap" style={{ background: '#f3f4f6' }}>
                        <span className="img-main-badge" style={{ background: '#2563eb' }}>New</span>
                        <img
                          src={src}
                          alt={`new-${i}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                        />
                        <button
                          className="img-delete-btn"
                          onClick={(e) => { e.stopPropagation(); removeNewImage(i); }}
                        >
                          <i className="bi bi-trash3-fill" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Rental Options ─────────────────────────────────── */}
            <div className="rental-section">
              <div className="rental-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="section-icon blue" style={{ width: 36, height: 36, fontSize: 16 }}>
                    <i className="bi bi-calendar-week" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1d23' }}>Rental Options</div>
                    <div style={{ fontSize: 12.5, color: '#9ca3af' }}>
                      Configure rental pricing and availability
                    </div>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="is_rentable"
                    checked={form.is_rentable}
                    onChange={handleChange}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              {form.is_rentable && (
                <div className="rental-fields">
                  {[
                    { label: 'DAILY RATE',       name: 'price_daily',          prefix: '$', placeholder: '0.00' },
                    { label: 'MIN DAYS',         name: 'minimum_rental_days',  prefix: '',  placeholder: '1' },
                    { label: 'MAX DAYS',         name: 'maximum_rental_days',  prefix: '',  placeholder: '30' },
                    { label: 'AVAILABLE UNITS',  name: 'available_units',      prefix: '',  placeholder: '0' },
                    { label: 'PREP DURATION',    name: 'preparation_duration', prefix: '',  placeholder: '0min' },
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

            {/* Bottom actions */}
            <div className="form-actions">
              <button
                className="btn-export"
                onClick={() => navigate('/products')}
                disabled={submitting}
              >
                Cancel
              </button>
              <button className="btn-add" onClick={handleSubmit} disabled={submitting}>
                {submitting
                  ? <><i className="bi bi-hourglass-split" /> Updating...</>
                  : <><i className="bi bi-arrow-repeat" /> Update Product</>
                }
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
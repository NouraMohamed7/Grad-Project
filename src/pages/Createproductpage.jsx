// src/pages/CreateProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createProduct, getCategories } from '../apis/Products';

export default function CreateProductPage() {
  const navigate    = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dragOver, setDragOver]     = useState(false);
  const [images, setImages]         = useState([]);   // File objects
  const [previews, setPreviews]     = useState([]);   // base64 strings

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    price: '',
    stock: '',
    description: '',
    is_rentable: false,
    price_daily: '',
    minimum_rental_days: '',
    maximum_rental_days: '',
    available_units: '',
    preparation_duration: '',
    setup_duration: '',
    warranty: '',
    configuration: '',
    restock_date: '',
  });

  // ── Load categories ──────────────────────────────────────────────
  useEffect(() => {
    getCategories()
      .then(data => setCategories(data.data || []))
      .catch(() => toast.error('Failed to load categories'));
  }, []);

  // ── Field change ─────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // ── Image handling ───────────────────────────────────────────────
  const addImages = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!validFiles.length) return;
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
    setImages(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addImages(e.dataTransfer.files);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim())   return toast.error('Product name is required');
    if (!form.category_id)   return toast.error('Please select a category');
    if (!form.price)         return toast.error('Price is required');
    if (!form.stock && form.stock !== 0) return toast.error('Stock is required');

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        is_rentable: form.is_rentable ? 1 : 0,
        images,
      };
      await createProduct(payload);
      toast.success('Product created successfully!');
      navigate('/products');
    } catch (err) {
      toast.error(err?.message || 'Failed to create product');
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
        <span className="bc-current">New Product</span>
      </div>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-title"><h1>Create Product</h1></div>
        <div className="header-actions">
          <button className="btn-export" onClick={() => navigate('/products')} disabled={submitting}>
            Cancel
          </button>
          <button className="btn-add" onClick={handleSubmit} disabled={submitting}>
            {submitting
              ? <><i className="bi bi-hourglass-split" /> Publishing...</>
              : <><i className="bi bi-send" /> Publish Product</>
            }
          </button>
        </div>
      </div>

      <div className="form-card">
        {/* ── General Info + Images ─────────────────────────────── */}
        <div className="form-two-col">

          {/* LEFT: General Info */}
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
                placeholder="e.g. Digital Stethoscope X2"
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
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
                  placeholder="0.00"
                  type="number"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity *</label>
                <input
                  className="form-input"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
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
                placeholder="e.g. 1x Device, 2x Batteries, 1x Manual"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Detailed product description..."
                rows={5}
              />
            </div>
          </div>

          {/* RIGHT: Images */}
          <div>
            <div className="section-heading">
              <div className="section-icon blue"><i className="bi bi-image-fill" /></div>
              Product Images
            </div>

            {/* Dropzone */}
            <div
              className={`dropzone ${dragOver ? 'dragover' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('createFileInput').click()}
            >
              <input
                id="createFileInput"
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => addImages(e.target.files)}
              />
              <div className="dropzone-inner">
                <div className="dropzone-icon"><i className="bi bi-cloud-arrow-up" /></div>
                <div className="dropzone-text">
                  <span className="dropzone-link">Upload files</span> or drag and drop
                </div>
                <div className="dropzone-hint">PNG, JPG, GIF up to 10MB — multiple allowed</div>
              </div>
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="current-images-grid" style={{ marginTop: 16 }}>
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="current-image-wrap"
                    style={{ background: '#f3f4f6', position: 'relative' }}
                  >
                    {i === 0 && <span className="img-main-badge">Main</span>}
                    <img
                      src={src}
                      alt={`preview-${i}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                    />
                    <button
                      className="img-delete-btn"
                      onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                    >
                      <i className="bi bi-trash3-fill" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Rental Options ─────────────────────────────────────── */}
        <div className="rental-section">
          <div className="rental-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="section-icon blue" style={{ width: 36, height: 36, fontSize: 16 }}>
                <i className="bi bi-calendar-week" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1d23' }}>Rental Options</div>
                <div style={{ fontSize: 12.5, color: '#9ca3af' }}>Configure rental pricing and availability</div>
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
          <button className="btn-export" onClick={() => navigate('/products')} disabled={submitting}>
            Cancel
          </button>
          <button className="btn-add" onClick={handleSubmit} disabled={submitting}>
            {submitting
              ? <><i className="bi bi-hourglass-split" /> Publishing...</>
              : <><i className="bi bi-send" /> Publish Product</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
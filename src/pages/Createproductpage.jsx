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
  const [images, setImages]         = useState([]);
  const [previews, setPreviews]     = useState([]);
  const [errors, setErrors]         = useState({});

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
    specification: [],
  });

  // ── Load categories ─────────────────────────────────────────────────
  useEffect(() => {
    getCategories()
      .then(data => setCategories(data.data || []))
      .catch(() => toast.error('Failed to load categories'));
  }, []);

  // ── Field change ───────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  // ── Image handling ─────────────────────────────────────────────────
  const addImages = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!validFiles.length) {
      toast.error('Please upload valid image files (JPG, PNG, WEBP)');
      return;
    }
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

  // ── Validation ─────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Product name is required';
    if (!form.category_id) newErrors.category_id = 'Please select a category';
    if (!form.price || parseFloat(form.price) <= 0) newErrors.price = 'Valid price is required';
    if (form.stock === '' || form.stock < 0) newErrors.stock = 'Valid stock quantity is required';

    if (form.is_rentable) {
      if (!form.price_daily || parseFloat(form.price_daily) <= 0) newErrors.price_daily = 'Daily rate is required for rental products';
      if (!form.minimum_rental_days) newErrors.minimum_rental_days = 'Minimum rental days required';
      if (!form.maximum_rental_days) newErrors.maximum_rental_days = 'Maximum rental days required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fix the highlighted errors');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        is_rentable: form.is_rentable ? 1 : 0,
        images,
      };

      // Add default specification if empty (API might require it)
      if (!payload.specification || payload.specification.length === 0) {
        payload.specification = [{ type: 'Standard' }];
      }

      await createProduct(payload);
      toast.success('📋 Product submitted! Awaiting admin approval.', { autoClose: 4000 });
      setTimeout(() => navigate('/products'), 2000);
    } catch (err) {
      toast.error(err?.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Button content ─────────────────────────────────────────────────
  const btnContent = submitting
    ? <><i className="bi bi-hourglass-split" /> Publishing...</>
    : <><i className="bi bi-send" /> Publish Product</>;

  // ── Error helper ───────────────────────────────────────────────────
  const ErrorField = ({ name }) => {
    if (!errors[name]) return null;
    return (
      <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4, display: 'block' }}>
        <i className="bi bi-exclamation-circle" /> {errors[name]}
      </span>
    );
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
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div className="page-title"><h1>Create Product</h1></div>
        <div className="header-actions">
          <button className="btn-export" onClick={() => navigate('/products')} disabled={submitting}>
            Cancel
          </button>
          <button className="btn-add" onClick={handleSubmit} disabled={submitting}>
            {btnContent}
          </button>
        </div>
      </div>

      {/* Notice */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#fffbeb', border: '1.5px solid #fde68a',
        borderRadius: 10, padding: '12px 16px', marginBottom: 20,
        fontSize: 13, color: '#92400e',
      }}>
        <i className="bi bi-info-circle-fill" style={{ fontSize: 16, color: '#d97706', flexShrink: 0 }} />
        <span>
          After submission, your product will be <strong>reviewed by admin</strong> before
          appearing to doctors. You can track its status in the Products page.
        </span>
      </div>

      {/* Form Card */}
      <div className="form-card">

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
                className={`form-input ${errors.name ? 'is-invalid' : ''}`} 
                name="name" 
                value={form.name}
                onChange={handleChange} 
                placeholder="e.g. Digital Stethoscope X2" 
              />
              <ErrorField name="name" />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select 
                  className={`form-input form-select ${errors.category_id ? 'is-invalid' : ''}`} 
                  name="category_id"
                  value={form.category_id} 
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ErrorField name="category_id" />
              </div>
              <div className="form-group">
                <label className="form-label">Warranty</label>
                <input 
                  className="form-input" 
                  name="warranty" 
                  value={form.warranty}
                  onChange={handleChange} 
                  placeholder="e.g. 2 Years Manufacturer Warranty" 
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input 
                  className={`form-input ${errors.price ? 'is-invalid' : ''}`} 
                  name="price" 
                  value={form.price}
                  onChange={handleChange} 
                  placeholder="0.00" 
                  type="number" 
                  min="0" 
                />
                <ErrorField name="price" />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity *</label>
                <input 
                  className={`form-input ${errors.stock ? 'is-invalid' : ''}`} 
                  name="stock" 
                  value={form.stock}
                  onChange={handleChange} 
                  placeholder="0" 
                  type="number" 
                  min="0" 
                />
                <ErrorField name="stock" />
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

          {/* RIGHT: Image */}
          <div>
            <div className="section-heading">
              <div className="section-icon blue"><i className="bi bi-image-fill" /></div>
              Product Image
            </div>

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
                  <span className="dropzone-link">Upload a file</span> or drag and drop
                </div>
                <div className="dropzone-hint">PNG, JPG, GIF up to 10MB — multiple allowed</div>
              </div>
            </div>

            {previews.length > 0 && (
              <div className="current-images-grid" style={{ marginTop: 16 }}>
                {previews.map((src, i) => (
                  <div key={i} className="current-image-wrap"
                    style={{ background: '#f3f4f6', position: 'relative' }}>
                    {i === 0 && <span className="img-main-badge">Main</span>}
                    <img src={src} alt={`preview-${i}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                    <button className="img-delete-btn"
                      onClick={(e) => { e.stopPropagation(); removeImage(i); }}>
                      <i className="bi bi-trash3-fill" />
                    </button>
                  </div>
                ))}
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
                <div style={{ fontSize: 12.5, color: '#9ca3af' }}>Configure rental pricing and availability</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" name="is_rentable"
                checked={form.is_rentable} onChange={handleChange} />
              <span className="toggle-slider" />
            </label>
          </div>

          {form.is_rentable && (
            <div className="rental-fields">
              {[
                { label: 'DAILY RATE',      name: 'price_daily',          prefix: '$', placeholder: '0.00', error: errors.price_daily },
                { label: 'MIN DAYS',        name: 'minimum_rental_days',  prefix: '',  placeholder: '1',    error: errors.minimum_rental_days },
                { label: 'MAX DAYS',        name: 'maximum_rental_days',  prefix: '',  placeholder: '30',   error: errors.maximum_rental_days },
                { label: 'AVAILABLE UNITS', name: 'available_units',      prefix: '',  placeholder: '0' },
                { label: 'PREP DURATION',   name: 'preparation_duration', prefix: '',  placeholder: '0min' },
              ].map(f => (
                <div key={f.name} className="rental-field">
                  <label className="rental-label">{f.label}</label>
                  <div className="rental-input-wrap">
                    {f.prefix && <span className="rental-prefix">{f.prefix}</span>}
                    <input
                      className={`form-input rental-input ${f.prefix ? 'has-prefix' : ''} ${f.error ? 'is-invalid' : ''}`}
                      name={f.name} 
                      value={form[f.name]} 
                      onChange={handleChange}
                      placeholder={f.placeholder}
                      type={f.prefix === '$' ? 'number' : 'text'} 
                      min="0"
                    />
                  </div>
                  {f.error && <span style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{f.error}</span>}
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
            {btnContent}
          </button>
        </div>

      </div>
    </div>
  );
}
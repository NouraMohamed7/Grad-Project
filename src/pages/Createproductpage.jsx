import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateProductPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    category: '',
    discountCode: 'PROMO-2024',
    price: '',
    stock: '',
    description: '',
    rentalEnabled: true,
    dailyRate: '',
    deposit: '',
    setupFee: '',
    units: '',
    minDays: '1',
    maxDays: '30',
    prepDuration: '',
    warranty: '',
    boxContents: '',
    dimensions: '',
    weight: '',
    certifications: '',
    madeIn: '',
  });

  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files[0] || e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="dashboard-content">
      {/* Breadcrumb */}
      <div className="breadcrumb-row">
        <span className="bc-link" onClick={() => navigate('/')}><i className="bi bi-grid-fill" /> Dashboard</span>
        <i className="bi bi-chevron-right bc-sep" />
        <span className="bc-link" onClick={() => navigate('/products')}>Products</span>
        <i className="bi bi-chevron-right bc-sep" />
        <span className="bc-current">New Product</span>
      </div>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-title">
          <h1>Create Product</h1>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={() => navigate('/products')}>Cancel</button>
          <button className="btn-add"><i className="bi bi-send" /> Publish Product</button>
        </div>
      </div>

      {/* Main form card */}
      <div className="form-card">

        {/* ── General Information + Product Image ── */}
        <div className="form-two-col">

          {/* Left: General Info */}
          <div>
            <div className="section-heading">
              <div className="section-icon blue"><i className="bi bi-pencil-fill" /></div>
              General Information
            </div>

            <div className="form-group">
              <label className="form-label">Product Name</label>
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
                <label className="form-label">Category</label>
                <select className="form-input form-select" name="category" value={form.category} onChange={handleChange}>
                  <option value="">Select Category</option>
                  <option>Surgical</option>
                  <option>Imaging</option>
                  <option>Lab</option>
                  <option>Diagnostic Equipment</option>
                  <option>Monitoring</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Discount Code</label>
                <div className="input-with-icon">
                  <i className="bi bi-tag input-icon" />
                  <input className="form-input has-icon" name="discountCode" value={form.discountCode} onChange={handleChange} placeholder="PROMO-2024" />
                </div>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input className="form-input" name="price" value={form.price} onChange={handleChange} placeholder="0.00" type="number" min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input className="form-input" name="stock" value={form.stock} onChange={handleChange} placeholder="0" type="number" min="0" />
              </div>
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

          {/* Right: Product Image */}
          <div>
            <div className="section-heading">
              <div className="section-icon blue"><i className="bi bi-image-fill" /></div>
              Product Image
            </div>

            <div
              className={`dropzone ${dragOver ? 'dragover' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleImageDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input id="fileInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageDrop} />
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }} />
              ) : (
                <div className="dropzone-inner">
                  <div className="dropzone-icon"><i className="bi bi-cloud-arrow-up" /></div>
                  <div className="dropzone-text">
                    <span className="dropzone-link">Upload a file</span> or drag and drop
                  </div>
                  <div className="dropzone-hint">PNG, JPG, GIF up to 10MB</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Rental Options ── */}
        <div className="rental-section">
          <div className="rental-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="section-icon blue" style={{ width: 36, height: 36, fontSize: 16 }}><i className="bi bi-calendar-week" /></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1d23' }}>Rental Options</div>
                <div style={{ fontSize: 12.5, color: '#9ca3af' }}>Configure rental pricing and availability</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" name="rentalEnabled" checked={form.rentalEnabled} onChange={handleChange} />
              <span className="toggle-slider" />
            </label>
          </div>

          {form.rentalEnabled && (
            <div className="rental-fields">
              {[
                { label: 'DAILY RATE',  name: 'dailyRate',     prefix: '$', placeholder: '0.00' },
                { label: 'DEPOSIT',     name: 'deposit',       prefix: '$', placeholder: '0.00' },
                { label: 'SETUP FEE',   name: 'setupFee',      prefix: '$', placeholder: '0.00' },
                { label: 'UNITS',       name: 'units',         prefix: '',  placeholder: '0' },
                { label: 'MIN DAYS',    name: 'minDays',       prefix: '',  placeholder: '1' },
                { label: 'MAX DAYS',    name: 'maxDays',       prefix: '',  placeholder: '30' },
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
                      type="number"
                      min="0"
                    />
                  </div>
                </div>
              ))}
              <div className="form-group" style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <label className="form-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Preparation Duration:</label>
                <input className="form-input" name="prepDuration" value={form.prepDuration} onChange={handleChange} placeholder="0" type="number" min="0" style={{ width: 80 }} />
                <span style={{ fontSize: 13.5, color: '#6b7280' }}>hours (for cleaning &amp; checks)</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Technical Details ── */}
        <div style={{ marginTop: 28 }}>
          <div className="section-heading">
            <div className="section-icon blue"><i className="bi bi-clipboard2-check-fill" /></div>
            Technical Details
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Warranty Information</label>
              <input className="form-input" name="warranty" value={form.warranty} onChange={handleChange} placeholder="e.g. 2 Years Manufacturer Warranty" />
            </div>
            <div className="form-group">
              <label className="form-label">Configuration / Box Contents</label>
              <input className="form-input" name="boxContents" value={form.boxContents} onChange={handleChange} placeholder="e.g. 1x Device, 2x Batteries, 1x Manual" />
            </div>
          </div>

          <div className="form-row-4">
            <div className="form-group">
              <label className="form-label">Dimensions</label>
              <input className="form-input" name="dimensions" value={form.dimensions} onChange={handleChange} placeholder="e.g. 30x20x10 cm" />
            </div>
            <div className="form-group">
              <label className="form-label">Weight</label>
              <input className="form-input" name="weight" value={form.weight} onChange={handleChange} placeholder="e.g. 1.5 kg" />
            </div>
            <div className="form-group">
              <label className="form-label">Certifications</label>
              <input className="form-input" name="certifications" value={form.certifications} onChange={handleChange} placeholder="e.g. CE, FDA, ISO" />
            </div>
            <div className="form-group">
              <label className="form-label">Made In</label>
              <input className="form-input" name="madeIn" value={form.madeIn} onChange={handleChange} placeholder="e.g. Germany" />
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="form-actions">
          <button className="btn-export" onClick={() => navigate('/products')}>Cancel</button>
          <button className="btn-add"><i className="bi bi-send" /> Publish Product</button>
        </div>
      </div>
    </div>
  );
}
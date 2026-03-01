import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Simulated existing product data (in real app this would come from props/API)
const existingProduct = {
  name: 'Advanced MRI Scanner X1',
  category: 'Diagnostic Equipment',
  discountCode: 'MED-OFF-10',
  price: '150000',
  stock: '5',
  description: 'High-resolution MRI scanner with advanced imaging capabilities for neurological and cardiac diagnostics.',
  rentalEnabled: true,
  dailyRate: '500',
  deposit: '5000',
  setupFee: '1000',
  units: '2',
  minDays: '7',
  maxDays: '365',
  prepDuration: '48',
  warranty: '3 years full service and parts replacement.',
  boxContents: '1x MRI Unit, 1x Control Station, 2x Patient Coils',
  dimensions: '220x180x150 cm',
  weight: '1800 kg',
  certifications: 'CE, FDA, ISO 13485',
  madeIn: 'Germany',
};

// Placeholder product images matching the design
const existingImages = [
  { id: 1, main: true,  bg: '#e8f0e8', url: null },
  { id: 2, main: false, bg: '#1a1a2e', url: null },
  { id: 3, main: false, bg: '#0f4c5c', url: null },
];

export default function EditProductPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(existingProduct);
  const [dragOver, setDragOver] = useState(false);
  const [images, setImages] = useState(existingImages);
  const [newPreview, setNewPreview] = useState(null);

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
      reader.onload = (ev) => setNewPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (id) => setImages(prev => prev.filter(img => img.id !== id));
  const setMain = (id) => setImages(prev => prev.map(img => ({ ...img, main: img.id === id })));

  return (
    <div className="dashboard-content">
      {/* Breadcrumb */}
      <div className="breadcrumb-row">
        <span className="bc-link" onClick={() => navigate('/')}><i className="bi bi-grid-fill" /> Dashboard</span>
        <i className="bi bi-chevron-right bc-sep" />
        <span className="bc-link" onClick={() => navigate('/products')}>Products</span>
        <i className="bi bi-chevron-right bc-sep" />
        <span className="bc-current">Edit Product</span>
      </div>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-title">
          <h1>Edit Product</h1>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={() => navigate('/products')}>Cancel</button>
          <button className="btn-add"><i className="bi bi-arrow-repeat" /> Update Product</button>
        </div>
      </div>

      {/* Main form card */}
      <div className="form-card">

        {/* ── General Information + Image Upload ── */}
        <div className="form-two-col">

          {/* Left: General Info */}
          <div>
            <div className="section-heading">
              <div className="section-icon blue"><i className="bi bi-pencil-fill" /></div>
              General Information
            </div>

            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input className="form-input" name="name" value={form.name} onChange={handleChange} />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input form-select" name="category" value={form.category} onChange={handleChange}>
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
                  <input className="form-input has-icon" name="discountCode" value={form.discountCode} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input className="form-input" name="price" value={form.price} onChange={handleChange} type="number" min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input className="form-input" name="stock" value={form.stock} onChange={handleChange} type="number" min="0" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input form-textarea" name="description" value={form.description} onChange={handleChange} rows={5} />
            </div>
          </div>

          {/* Right: Image Upload + Current Images */}
          <div>
            <div className="section-heading">
              <div className="section-icon blue"><i className="bi bi-image-fill" /></div>
              Product Image Upload
            </div>

            {/* Drop zone for new image */}
            <div
              className={`dropzone ${dragOver ? 'dragover' : ''}`}
              style={{ height: 160, marginBottom: 20 }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleImageDrop}
              onClick={() => document.getElementById('editFileInput').click()}
            >
              <input id="editFileInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageDrop} />
              {newPreview ? (
                <img src={newPreview} alt="New" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }} />
              ) : (
                <div className="dropzone-inner">
                  <div className="dropzone-icon"><i className="bi bi-cloud-arrow-up" /></div>
                  <div className="dropzone-text">
                    Drop your image here, or <span className="dropzone-link">browse</span>
                  </div>
                  <div className="dropzone-hint">Supports: JPG, PNG, WEBP (Max 5MB)</div>
                </div>
              )}
            </div>

            {/* Current Images */}
            <div className="section-heading" style={{ marginTop: 0 }}>
              <div className="section-icon blue" style={{ width: 28, height: 28, fontSize: 13 }}><i className="bi bi-images" /></div>
              Current Images
            </div>

            <div className="current-images-grid">
              {images.map(img => (
                <div key={img.id} className="current-image-wrap" style={{ background: img.bg }}>
                  {img.main && <span className="img-main-badge">Main</span>}
                  <button className="img-delete-btn" onClick={() => removeImage(img.id)}>
                    <i className="bi bi-trash3-fill" />
                  </button>
                  {!img.main && (
                    <div className="img-set-main" onClick={() => setMain(img.id)}>Set Main</div>
                  )}
                  {/* Visual placeholder shapes */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: img.bg === '#e8f0e8' ? '#c8dcc8' : '#ffffff30',
                    margin: 'auto'
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Rental Options ── */}
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
              <input type="checkbox" name="rentalEnabled" checked={form.rentalEnabled} onChange={handleChange} />
              <span className="toggle-slider" />
            </label>
          </div>

          {form.rentalEnabled && (
            <div className="rental-fields">
              {[
                { label: 'DAILY RATE',  name: 'dailyRate',  prefix: '$' },
                { label: 'DEPOSIT',     name: 'deposit',    prefix: '$' },
                { label: 'SETUP FEE',   name: 'setupFee',   prefix: '$' },
                { label: 'UNITS',       name: 'units',      prefix: '' },
                { label: 'MIN DAYS',    name: 'minDays',    prefix: '' },
                { label: 'MAX DAYS',    name: 'maxDays',    prefix: '' },
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
                      type="number"
                      min="0"
                    />
                  </div>
                </div>
              ))}
              <div className="form-group" style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <label className="form-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Preparation Duration:</label>
                <input className="form-input" name="prepDuration" value={form.prepDuration} onChange={handleChange} type="number" min="0" style={{ width: 80 }} />
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
              <input className="form-input" name="warranty" value={form.warranty} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Configuration / Box Contents</label>
              <input className="form-input" name="boxContents" value={form.boxContents} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row-4">
            <div className="form-group">
              <label className="form-label">Dimensions</label>
              <input className="form-input" name="dimensions" value={form.dimensions} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Weight</label>
              <input className="form-input" name="weight" value={form.weight} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Certifications</label>
              <input className="form-input" name="certifications" value={form.certifications} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Made In</label>
              <input className="form-input" name="madeIn" value={form.madeIn} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="form-actions">
          <button className="btn-export" onClick={() => navigate('/products')}>Cancel</button>
          <button className="btn-add"><i className="bi bi-arrow-repeat" /> Update Product</button>
        </div>
      </div>
    </div>
  );
}
// src/pages/MakeOfferPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/Makeoffer.css';

const requestDetails = {
  priority: 'Priority Urgent',
  ref: 'PR-4092-2024',
  expiry: '4H 12M',
  products: [
    'Precision C-Arm Imaging System Bundle',
    'Nano-Scalpel Elite Series 7',
    'Quantum-Heart Monitor Hub',
  ],
};

export default function MakeOfferPage() {
  const navigate = useNavigate();
  const [budget, setBudget] = useState('');
  const [days, setDays] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!budget || !days) {
      toast.error('Please fill in the budget and delivery timeline.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    toast.success('Offer sent successfully!');
    navigate('/requests');
  };

  return (
    <div className="mo-page">
      {/* Breadcrumb */}
      <div className="mo-breadcrumb">
        <span className="mo-bc-item" onClick={() => navigate('/requests')}>Marketplace</span>
        <i className="bi bi-chevron-right mo-bc-sep" />
        <span className="mo-bc-item" onClick={() => navigate('/requests')}>Open Requests</span>
        <i className="bi bi-chevron-right mo-bc-sep" />
        <span className="mo-bc-active">Make Offer</span>
      </div>

      <div className="mo-layout">
        {/* Left: Form */}
        <div className="mo-form-card">
          <h2 className="mo-form-title">Make an Offer</h2>

          <div className="mo-row">
            <div className="mo-field">
              <label className="mo-label">
                <i className="bi bi-currency-dollar mo-label-icon" /> Proposed Budget ($)
              </label>
              <input
                className="mo-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={budget}
                onChange={e => setBudget(e.target.value)}
              />
            </div>
            <div className="mo-field">
              <label className="mo-label">
                <i className="bi bi-clock mo-label-icon" /> Delivery Timeline (Days)
              </label>
              <input
                className="mo-input"
                type="number"
                min="1"
                placeholder="Enter days"
                value={days}
                onChange={e => setDays(e.target.value)}
              />
            </div>
          </div>

          <div className="mo-field mo-field-full">
            <label className="mo-label">
              <i className="bi bi-file-text mo-label-icon" /> Additional Notes
            </label>
            <textarea
              className="mo-textarea"
              placeholder="Provide details about your supply capacity, logistics specifics, or volume discounts..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={7}
            />
          </div>

          <button
            className={`mo-submit-btn${loading ? ' mo-loading' : ''}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="mo-spinner" />
            ) : (
              <>Send Offer <i className="bi bi-arrow-right-circle-fill" /></>
            )}
          </button>
        </div>

        {/* Right: Request Details */}
        <div className="mo-details-card">
          <div className="mo-details-head">
            <h3 className="mo-details-title">Request Details</h3>
            <span className="mo-priority-badge">{requestDetails.priority}</span>
          </div>

          <div className="mo-requester-row">
            <div className="mo-req-avatar">
              <i className="bi bi-person-fill" />
            </div>
            <span className="mo-req-label">MEDICAL REQUESTER</span>
          </div>

          <div className="mo-products-section">
            <span className="mo-products-label">PRODUCTS REQUIRED</span>
            <ul className="mo-products-list">
              {requestDetails.products.map(p => (
                <li key={p} className="mo-product-item">{p}</li>
              ))}
            </ul>
          </div>

          <div className="mo-details-footer">
            <span className="mo-ref">REF: {requestDetails.ref}</span>
            <span className="mo-expiry">EXPIRING IN {requestDetails.expiry}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
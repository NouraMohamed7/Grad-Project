// src/pages/MakeOfferPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import { createOffer } from '../apis/requests';

export default function MakeOfferPage() {
  const navigate   = useNavigate();
  const location   = useLocation();

  // Passed via: navigate('/requests/make-offer', { state: { requestId, request } })
  const requestId   = location.state?.requestId  ?? null;
  const requestInfo = location.state?.request    ?? null;

  const [price,   setPrice]   = useState('');
  const [days,    setDays]    = useState('');
  const [notes,   setNotes]   = useState('');
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});   // field-level validation errors

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};

    if (!requestId) {
      errs.requestId = 'No request selected. Please go back and pick a request.';
    }

    if (price === '' || price === null) {
      errs.price = 'Price is required.';
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      errs.price = 'Price must be a positive number.';
    } else if (Number(price) > 10_000_000) {
      errs.price = 'Price seems too high. Please double-check.';
    }

    if (days === '' || days === null) {
      errs.days = 'Delivery days is required.';
    } else if (!Number.isInteger(Number(days)) || Number(days) < 1) {
      errs.days = 'Delivery days must be a whole number ≥ 1.';
    } else if (Number(days) > 365) {
      errs.days = 'Delivery days cannot exceed 365.';
    }

    if (notes && notes.length > 1000) {
      errs.notes = `Notes too long (${notes.length}/1000 characters).`;
    }

    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error(Object.values(errs)[0]);
      return;
    }

    setLoading(true);
    try {
      await createOffer(requestId, {
        price:         Number(price),
        delivery_days: Number(days),
        notes:         notes.trim() || undefined,
      });
      toast.success('Offer sent successfully!');
      navigate('/requests/orders');
    } catch (err) {
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors && typeof backendErrors === 'object') {
        const mapped = {};
        if (backendErrors.price)         mapped.price = backendErrors.price[0];
        if (backendErrors.delivery_days) mapped.days  = backendErrors.delivery_days[0];
        if (backendErrors.notes)         mapped.notes = backendErrors.notes[0];
        setErrors(mapped);
        toast.error('Please fix the errors below.');
      } else {
        const msg = err?.response?.data?.error ?? err?.message ?? 'Something went wrong.';
        toast.error(`Failed: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Derived display values ────────────────────────────────────────────────
  const items     = Array.isArray(requestInfo?.item) ? requestInfo.item : [];
  const reqType   = requestInfo?.type ?? 'paid';
  const isUrgent  = requestInfo?.expires_at
    ? (new Date(requestInfo.expires_at) - new Date()) < 48 * 60 * 60 * 1000
    : false;
  const expiryStr = requestInfo?.expires_at
    ? new Date(requestInfo.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  // ── No requestId guard ────────────────────────────────────────────────────
  if (!requestId) {
    return (
      <div className="mo-page">
        <div className="mo-form-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: 40, color: '#f59e0b', display: 'block', marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8 }}>No Request Selected</h3>
          <p style={{ color: '#888', marginBottom: 24 }}>
            Please go back to Open Requests and click "Make Offer" on a specific request.
          </p>
          <button className="mo-submit-btn" onClick={() => navigate('/requests/open')}>
            <i className="bi bi-arrow-left-circle-fill" /> Go to Open Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mo-page">
      {/* Breadcrumb */}
      <div className="mo-breadcrumb">
        <span className="mo-bc-item" onClick={() => navigate('/requests')}>Marketplace</span>
        <i className="bi bi-chevron-right mo-bc-sep" />
        <span className="mo-bc-item" onClick={() => navigate('/requests/open')}>Open Requests</span>
        <i className="bi bi-chevron-right mo-bc-sep" />
        <span className="mo-bc-active">Make Offer</span>
      </div>

      <div className="mo-layout">

        {/* ── LEFT: Form ──────────────────────────────────────────────── */}
        <div className="mo-form-card">
          <h2 className="mo-form-title">Make an Offer</h2>

          {errors.requestId && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              <i className="bi bi-exclamation-circle-fill" style={{ marginRight: 6 }} />
              {errors.requestId}
            </div>
          )}

          <div className="mo-row">
            {/* Price */}
            <div className="mo-field">
              <label className="mo-label">
  <i className="bi bi-currency-dollar mo-label-icon" /> Proposed Price (EGP)
  <span style={{ color: '#e53e3e', marginLeft: 3 }}>*</span>
</label>
              <input
                className={`mo-input${errors.price ? ' mo-input-error' : ''}`}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={e => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors(prev => ({ ...prev, price: undefined }));
                }}
              />
              {errors.price && (
                <span className="mo-field-error">
                  <i className="bi bi-exclamation-circle" style={{ marginRight: 4 }} />
                  {errors.price}
                </span>
              )}
            </div>

            {/* Delivery Days */}
            <div className="mo-field">
              <label className="mo-label">
                <i className="bi bi-clock mo-label-icon" /> Delivery Days
                <span style={{ color: '#e53e3e', marginLeft: 3 }}>*</span>
              </label>
              <input
                className={`mo-input${errors.days ? ' mo-input-error' : ''}`}
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 7"
                value={days}
                onChange={e => {
                  setDays(e.target.value);
                  if (errors.days) setErrors(prev => ({ ...prev, days: undefined }));
                }}
              />
              {errors.days && (
                <span className="mo-field-error">
                  <i className="bi bi-exclamation-circle" style={{ marginRight: 4 }} />
                  {errors.days}
                </span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="mo-field mo-field-full">
            <label className="mo-label">
              <i className="bi bi-file-text mo-label-icon" /> Notes (optional)
            </label>
            <textarea
              className={`mo-textarea${errors.notes ? ' mo-input-error' : ''}`}
              placeholder="Supply capacity, logistics, volume discounts..."
              value={notes}
              onChange={e => {
                setNotes(e.target.value);
                if (errors.notes) setErrors(prev => ({ ...prev, notes: undefined }));
              }}
              rows={7}
              maxLength={1000}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {errors.notes
                ? <span className="mo-field-error"><i className="bi bi-exclamation-circle" style={{ marginRight: 4 }} />{errors.notes}</span>
                : <span />
              }
              <span style={{ fontSize: 12, color: notes.length > 900 ? '#e53e3e' : '#aaa' }}>
                {notes.length}/1000
              </span>
            </div>
          </div>

          <button
            className={`mo-submit-btn${loading ? ' mo-loading' : ''}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <span className="mo-spinner" />
              : <>Send Offer <i className="bi bi-arrow-right-circle-fill" /></>
            }
          </button>
        </div>

        {/* ── RIGHT: Request Details ───────────────────────────────────── */}
        <div className="mo-details-card">
          <div className="mo-details-head">
            <h3 className="mo-details-title">Request Details</h3>
            <span className={`mo-priority-badge ${isUrgent ? 'mo-urgent' : ''}`}>
              {isUrgent ? 'Priority Urgent' : reqType.toUpperCase()}
            </span>
          </div>

          <div className="mo-requester-row">
            <div className="mo-req-avatar">
              <i className="bi bi-person-fill" />
            </div>
            <div>
              <span className="mo-req-label">DOCTOR #{requestInfo?.doctor_id ?? '—'}</span>
              <div className="mo-req-status">{requestInfo?.status ?? ''}</div>
            </div>
          </div>

          {items.length > 0 && (
            <div className="mo-products-section">
              <span className="mo-products-label">ITEMS REQUESTED</span>
              <ul className="mo-products-list">
                {items.map((item, i) => (
                  <li key={i} className="mo-product-item">{item}</li>
                ))}
              </ul>
            </div>
          )}

        {requestInfo?.budget && (
  <div className="mo-products-section">
    <span className="mo-products-label">DOCTOR'S BUDGET</span>
    <p style={{ color: 'var(--mo-text,#555)', fontSize: 14, marginTop: 6, fontWeight: 600 }}>
      EGP {Number(requestInfo.budget).toLocaleString('en-US', { minimumFractionDigits: 2 })}
    </p>
  </div>
)}

          {requestInfo?.additionalDetails && (
            <div className="mo-products-section">
              <span className="mo-products-label">ADDITIONAL DETAILS</span>
              <p style={{ color: 'var(--mo-text,#555)', fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
                {requestInfo.additionalDetails}
              </p>
            </div>
          )}

          {requestInfo?.rent_start_date && (
            <div className="mo-products-section">
              <span className="mo-products-label">RENTAL PERIOD</span>
              <p style={{ color: 'var(--mo-text,#555)', fontSize: 13, marginTop: 6 }}>
                {new Date(requestInfo.rent_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {' → '}
                {new Date(requestInfo.rent_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}

          <div className="mo-details-footer">
            <span className="mo-ref">REF: #{requestId ?? '—'}</span>
            <span className="mo-expiry">EXPIRES: {expiryStr}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
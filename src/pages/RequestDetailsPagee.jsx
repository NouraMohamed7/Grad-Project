// src/pages/RequestDetailsPage.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './../styles/Customrequests.css';

const mockDetails = {
  'REQ-7720': {
    productNames: 'Portable Ventilators (Model X-200), Lab Sterilization Units',
    clientEmail: 'contact@medtech-solutions.org',
    budgetEstimate: 31150.00,
    requestedDelivery: '15 Business Days',
    requestNotes: 'Equipment is required for the new emergency wing expansion. Must meet ISO 13485 standards. Prefer units with internal battery backup of at least 4 hours. Delivery must be coordinated with facility management for dock access.',
    status: 'Pending Review',
    requestStatus: 'Pending Decision',
    clientName: 'John Doe',
    clientInitials: 'JD',
  },
};

const fallbackDetail = {
  productNames: 'Medical Equipment',
  clientEmail: 'client@hospital.com',
  budgetEstimate: 25000.00,
  requestedDelivery: '10 Business Days',
  requestNotes: 'Standard procurement request.',
  status: 'Pending Review',
  requestStatus: 'Pending Decision',
  clientName: 'Client',
  clientInitials: 'CL',
};

export default function RequestDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const detail = mockDetails[id] || fallbackDetail;

  return (
    <div className="rd-page">
      <div className="rd-header">
        <button className="rd-back-btn" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left" />
        </button>
        <h2 className="rd-title">Request Details</h2>
        <div className="rd-actions">
          <button className="rd-edit-btn">Edit Request</button>
          <button className="rd-share-btn">Share Details</button>
        </div>
      </div>

      <div className="rd-body">
        {/* Left: Order Information */}
        <div className="rd-main">
          <div className="rd-card">
            <div className="rd-card-head">
              <h3 className="rd-card-title">Order Information</h3>
              <span className="rd-order-status">{detail.status}</span>
            </div>
            <div className="rd-info-grid">
              <div className="rd-info-group">
                <span className="rd-label">PRODUCT NAMES</span>
                <span className="rd-value">{detail.productNames}</span>
              </div>
              <div className="rd-info-group">
                <span className="rd-label">CLIENT EMAIL</span>
                <span className="rd-value">{detail.clientEmail}</span>
              </div>
              <div className="rd-info-group">
                <span className="rd-label">BUDGET ESTIMATE</span>
                <span className="rd-value rd-budget">
                  ${detail.budgetEstimate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="rd-info-group">
                <span className="rd-label">REQUESTED DELIVERY</span>
                <span className="rd-value">
                  <i className="bi bi-calendar3" style={{ marginRight: 6, fontSize: 13 }} />
                  {detail.requestedDelivery}
                </span>
              </div>
            </div>

            <div className="rd-notes-section">
              <span className="rd-label">REQUEST NOTES</span>
              <div className="rd-notes-box">
                {detail.requestNotes}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status + Contact */}
        <div className="rd-sidebar">
          <div className="rd-card rd-status-card">
            <h3 className="rd-card-title">Request Status</h3>
            <div className="rd-status-badge">
              <i className="bi bi-clock-history" style={{ marginRight: 8 }} />
              {detail.requestStatus}
            </div>
          </div>

          <div className="rd-card rd-contact-card">
            <h3 className="rd-card-title">Client Contact</h3>
            <div className="rd-contact">
              <div className="rd-avatar">{detail.clientInitials}</div>
              <div>
                <div className="rd-contact-name">{detail.clientName}</div>
                <div className="rd-contact-email">{detail.clientEmail}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
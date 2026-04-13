// src/pages/OpenRequestsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Openrequests.css';

const openRequests = [
  {
    id: 'req-1',
    type: 'RENTAL SUITE',
    typeClass: 'tag-rental',
    urgency: 'Expires in 48 Hours',
    urgencyClass: 'urgency-urgent',
    title: 'Precision C-Arm Imaging System Bundle',
    startDate: 'Oct 12, 2023',
    endDate: 'Jan 15, 2024',
    priceLabel: 'ESTIMATED MONTHLY',
    price: '$18,500',
    priceUnit: '/mo',
    details: '"Requirement for immediate deployment following system failure in Wing B. Professional setup and calibration services requested for all equipment in the bundle."',
    detailsLabel: 'ADDITIONAL DETAILS',
    requester: 'Dr. Sarah Jenkins',
    requesterOrg: "St. Mary's Orthopedic Center",
    requesterInitials: 'SJ',
  },
  {
    id: 'req-2',
    type: 'TOOLS',
    typeClass: 'tag-tools',
    urgency: 'Expires: Oct 30, 2023',
    urgencyClass: 'urgency-normal',
    title: 'Nano-Scalpel Elite Series 7',
    priceLabel: 'EXPECTED BUDGET',
    price: '$4,200',
    priceUnit: '/ unit',
    details: '"Inventory needed for upcoming cardiac surgeries scheduled for November 1st. Looking for a supplier with stock ready for next-day shipping."',
    detailsLabel: 'PROCUREMENT REQUIREMENTS',
    requester: 'Markus Vane',
    requesterOrg: 'Vanguard Surgical Group',
    requesterInitials: 'MV',
  },
  {
    id: 'req-3',
    type: 'PAID DEVICES',
    typeClass: 'tag-paid',
    urgency: 'Expires: Nov 15, 2023',
    urgencyClass: 'urgency-normal',
    title: 'Quantum-Heart Monitor Hub (Full Suite)',
    tags: ['ICU Ward Expansion', 'Bulk Order'],
    priceLabel: 'EXPECTED BUDGET',
    price: '$85,000',
    priceUnit: '',
    details: '"Procurement for a new 20-bed ICU ward. Requires seamless integration with existing Precision & Care database systems. On-site training for staff and a minimum 3-year warranty package should be included in the proposal."',
    detailsLabel: 'ADDITIONAL DETAILS',
    requester: 'Elena Rossi',
    requesterOrg: 'Metropolitan Health Trust',
    requesterInitials: 'ER',
  },
];

export default function OpenRequestsPage() {
  const navigate = useNavigate();

  return (
    <div className="or-page">
      <div className="or-page-header">
        <h1 className="or-page-title">Open Requests</h1>
        <p className="or-page-sub">Review and respond to active procurement requests from our clinical partners.</p>
      </div>

      <div className="or-list">
        {openRequests.map(req => (
          <div key={req.id} className="or-card">
            <div className="or-card-top">
              <div className="or-card-tags">
                <span className={`or-type-tag ${req.typeClass}`}>{req.type}</span>
                <span className={`or-urgency ${req.urgencyClass}`}>
                  {req.urgencyClass === 'urgency-urgent' && (
                    <i className="bi bi-clock-fill" style={{ marginRight: 5, fontSize: 12 }} />
                  )}
                  {req.urgencyClass === 'urgency-normal' && (
                    <i className="bi bi-calendar3" style={{ marginRight: 5, fontSize: 12 }} />
                  )}
                  {req.urgency}
                </span>
              </div>
              <div className="or-price-block">
                <span className="or-price-label">{req.priceLabel}</span>
                <span className="or-price">
                  {req.price}
                  <span className="or-price-unit">{req.priceUnit}</span>
                </span>
              </div>
            </div>

            <h3 className="or-card-title">{req.title}</h3>

            {/* Dates */}
            {req.startDate && (
              <div className="or-dates">
                <span className="or-date">
                  <i className="bi bi-calendar3" /> Start: <strong>{req.startDate}</strong>
                </span>
                <span className="or-date">
                  <i className="bi bi-calendar3" /> End: <strong>{req.endDate}</strong>
                </span>
              </div>
            )}

            {/* Sub tags */}
            {req.tags && (
              <div className="or-subtags">
                {req.tags.map(t => (
                  <span key={t} className="or-subtag">{t}</span>
                ))}
              </div>
            )}

            {/* Details box */}
            <div className="or-details-box">
              <span className="or-details-label">{req.detailsLabel}</span>
              <p className="or-details-text">{req.details}</p>
            </div>

            {/* Footer */}
            <div className="or-card-footer">
              <div className="or-requester">
                <div className="or-avatar">{req.requesterInitials}</div>
                <div>
                  <div className="or-req-name">{req.requester}</div>
                  <div className="or-req-org">{req.requesterOrg}</div>
                </div>
              </div>
              <div className="or-footer-actions">
                <button
                  className="or-offer-btn"
                  onClick={() => navigate('/requests/make-offer')}
                >
                  Make Offer
                </button>
                <button className="or-more-btn">
                  <i className="bi bi-three-dots" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
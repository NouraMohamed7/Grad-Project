// src/pages/OrderDetailPage.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/order.css';

const saleItems = [
  { icon: 'bi-activity',      name: 'Multi-Parameter Patient Monitor v2', category: 'Monitoring Equipment',   unitPrice: 1250,  qty: 2,  discount: 10,  final: 2250  },
  { icon: 'bi-stethoscope',   name: 'Digital Stethoscope Elite',          category: 'Diagnostic Tools',        unitPrice: 450,   qty: 5,  discount: 0,   final: 2250  },
  { icon: 'bi-mask',          name: 'N95 Surgical Masks (Box of 50)',      category: 'PPE & Consumables',       unitPrice: 75,    qty: 10, discount: 5,   final: 712.5 },
];

const rentalItems = [
  { icon: 'bi-activity',    name: 'Multi-Parameter Patient Monitor v2', category: 'Monitoring Equipment', unitPriceDay: 45,  qty: 2,  discount: 10, final: 2430  },
  { icon: 'bi-stethoscope', name: 'Digital Stethoscope Elite',          category: 'Diagnostic Tools',      unitPriceDay: 15,  qty: 5,  discount: 0,  final: 2250  },
  { icon: 'bi-mask',        name: 'N95 Surgical Masks (Box of 50)',      category: 'PPE & Consumables',     unitPriceDay: 2.5, qty: 10, discount: 5,  final: 712.5 },
];

const iconsMap = {
  'bi-activity':    '📈',
  'bi-stethoscope': '🩺',
  'bi-mask':        '😷',
};

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const isRental    = orderId === 'ORD-5498';
  const items       = isRental ? rentalItems : saleItems;

  const subtotal   = isRental ? 5700   : 5500;
  const discount   = isRental ? 307.5  : 287.5;
  const extra      = isRental ? 500    : 45;
  const extraLabel = isRental ? 'Security Deposit (Refundable)' : 'Shipping & Handling';
  const total      = isRental ? 5892.5 : 5257.5;
  const totalDays  = 30;

  return (
    <div className="dashboard-content">

      {/* Back */}
      <button className="ord-back-btn" onClick={() => navigate('/orders')}>
        <i className="bi bi-arrow-left" /> Back to Orders
      </button>

      {/* Header card */}
      <div className="ord-detail-header-card">
        <div>
          <h2 className="ord-detail-title">Order #{orderId}</h2>
          <p className="ord-detail-sub">
            Details and item breakdown for this {isRental ? 'rental ' : ''}order
          </p>
        </div>
        <div className="ord-detail-actions">
          <button className="btn-add"><i className="bi bi-printer" /> Print Invoice</button>
          <button className="btn-export"><i className="bi bi-envelope" /> Email Customer</button>
        </div>
      </div>

      {/* Meta row */}
      <div className="ord-meta-row">
        <div className="ord-meta-cell">
          <span className="ord-meta-label">ORDER NUMBER</span>
          <span className="ord-meta-value">#{orderId}</span>
        </div>
        <div className="ord-meta-cell">
          <span className="ord-meta-label">ORDER TYPE</span>
          <span className={`ord-type-badge ${isRental ? 'rental' : 'sale'}`}>
            {isRental ? 'Rental' : 'Sale'}
          </span>
        </div>
        {isRental && (
          <>
            <div className="ord-meta-cell">
              <span className="ord-meta-label">RENTAL START DATE</span>
              <span className="ord-meta-value">Nov 01, 2023</span>
            </div>
            <div className="ord-meta-cell">
              <span className="ord-meta-label">RENTAL END DATE</span>
              <span className="ord-meta-value">Nov 30, 2023</span>
            </div>
          </>
        )}
        <div className="ord-meta-cell">
          <span className="ord-meta-label">ORDER STATUS</span>
          <span className="ord-status-confirmed">
            <span className="ord-status-dot" /> Confirmed
          </span>
        </div>
        <div className="ord-meta-cell">
          <span className="ord-meta-label">ORDER ISSUE</span>
          <span className="ord-meta-muted">None reported</span>
        </div>
        <div className="ord-meta-cell">
          <span className="ord-meta-label">CREATED AT</span>
          <span className="ord-meta-value">Oct 24, 2023 10:45 AM</span>
        </div>
      </div>

      {/* Product Items */}
      <div className="ord-items-card">
        <h3 className="ord-items-title">Product Items</h3>
        <table className="ord-items-table">
          <thead>
            <tr>
              <th>PRODUCT NAME</th>
              <th>CATEGORY TYPE</th>
              <th>{isRental ? 'UNIT PRICE / DAY' : 'UNIT PRICE'}</th>
              <th>QUANTITY</th>
              <th>DISCOUNT APPLIED</th>
              <th>FINAL PRICE</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>
                  <div className="ord-product-name">
                    <div className="ord-product-icon">{iconsMap[item.icon]}</div>
                    <span>{item.name}</span>
                  </div>
                </td>
                <td className="ord-category">{item.category}</td>
                <td>${isRental ? item.unitPriceDay.toFixed(2) : item.unitPrice.toLocaleString()}.{isRental && item.unitPriceDay % 1 === 0 ? '00' : ''}</td>
                <td>{item.qty}</td>
                <td>
                  {item.discount > 0 ? (
                    <span className="ord-discount">
                      −${item.discount === 10 ? (isRental ? '270.00' : '250.00') : '37.50'} ({item.discount}%)
                    </span>
                  ) : (
                    <span className="ord-no-discount">—</span>
                  )}
                </td>
                <td className="ord-final-price">${item.final.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="ord-summary-wrap">
          <div className="ord-summary-box">
            <div className="ord-summary-row">
              <span>Subtotal{isRental ? ` (${totalDays} Days)` : ''}</span>
              <span>${subtotal.toLocaleString()}.00</span>
            </div>
            <div className="ord-summary-row discount">
              <span>Total Discount Amount</span>
              <span>−${discount.toLocaleString()}</span>
            </div>
            <div className="ord-summary-row">
              <span>{extraLabel}</span>
              <span>${extra.toLocaleString()}.00</span>
            </div>
            <div className="ord-summary-row total">
              <span>Final Total</span>
              <span className="ord-total-amount">${total.toLocaleString()}</span>
            </div>
            <p className="ord-summary-note">
              * {isRental
                ? `Rental duration calculated: ${totalDays} days. Tax included where applicable.`
                : 'Tax included in final price where applicable.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
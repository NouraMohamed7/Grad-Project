// src/pages/OrderDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSupplierOrderById, assignOrderStatus, returnRentalProduct } from '../apis/orders';

const statusColors = {
  pending:    { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  processing: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  ready:      { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  delivered:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  cancelled:  { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  paid:       { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  confirmed:  { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
};

const issueColors  = { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
const noIssueColor = { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };

const AVAILABLE_STATUSES = ['processing', 'ready'];

function formatDateTime(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );
}

function formatDate(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getRentalDuration(start, end) {
  if (!start || !end) return null;
  const diffTime = new Date(end) - new Date(start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

// API returns 'sale' | 'rental'
function getOrderTypeLabel(order_type) {
  if (order_type === 'sale') return 'Sale';
  if (order_type === 'rental') return 'Rent';
  return order_type ?? '-';
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate    = useNavigate();

  const [order,            setOrder]            = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [updatingStatus,   setUpdatingStatus]   = useState(false);
  const [returningProduct, setReturningProduct] = useState(null); // product_id being returned
  const [returnError,      setReturnError]      = useState(null);

  useEffect(() => {
    let mounted = true;
    getSupplierOrderById(orderId)
      .then(res => {
        if (!mounted) return;
        if (!res.success) {
          setError(res.error || res.message || 'Failed to load order details');
          setLoading(false);
          return;
        }
        setOrder(res.data);
        setLoading(false);
      })
      .catch(err => {
        if (!mounted) return;
        const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load order details';
        setError(msg);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [orderId]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === order.status) return;
    setUpdatingStatus(true);
    try {
      const res = await assignOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrder(prev => ({ ...prev, status: newStatus }));
      } else {
        alert('Failed to update status: ' + (res.message || res.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleReturnProduct = async (productId) => {
    setReturningProduct(productId);
    setReturnError(null);
    try {
      const res = await returnRentalProduct(orderId, productId);
      if (res.success) {
        alert('Product returned successfully!');
        const refreshed = await getSupplierOrderById(orderId);
        if (refreshed.success) setOrder(refreshed.data);
      } else {
        const msg = res.error || res.message || 'Failed to return product';
        setReturnError(msg);
        alert('Failed to return product: ' + msg);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      setReturnError(msg);
      alert('Failed to return product: ' + msg);
    } finally {
      setReturningProduct(null);
    }
  };

  // ─── Loading / error states ───────────────────────────────────────────────
  if (loading) return (
    <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <span>Loading order details…</span>
    </div>
  );

  if (error) return (
    <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <span style={{ color: '#dc2626' }}>Error: {error}</span>
    </div>
  );

  if (!order) return (
    <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <span>Order not found.</span>
    </div>
  );

  // ─── Derived values ───────────────────────────────────────────────────────
  // API returns order_type as 'sale' or 'rent'
 const isRental = order.order_type === 'rental';
  const typeLabel     = getOrderTypeLabel(order.order_type);
  const items         = order.items || [];
  const subtotal      = parseFloat(order.subtotal) || 0;
  const total         = parseFloat(order.total)    || 0;
  const orderHasIssue = order.order_issue && order.order_issue !== 'None' && order.order_issue !== 'none';
  const orderStatus   = order.status || 'pending';
  const sc            = statusColors[orderStatus?.toLowerCase()] || { bg: '#f5f7fa', color: '#374151', border: '#e5e7eb' };

  // Doctor contact — API only returns phone in both list and detail responses
  const doctorPhone = order.doctor?.phone || '-';

  const discount = items.reduce((sum, it) => {
    const raw = parseFloat(it.unit_price || 0) * (it.quantity || 0);
    const fin = parseFloat(it.final_price || 0);
    return sum + (raw - fin);
  }, 0);

  const extra      = total - (subtotal - discount);
  const extraLabel = isRental ? 'Security Deposit (Refundable)' : 'Shipping & Handling';

  // Any item with is_rentable = true shows a Return button
  const hasAnyRentable = items.some(it => it.product?.is_rentable);

  return (
    <div className="dashboard-content">

      <button className="ord-back-btn" onClick={() => navigate('/orders')}>
        <i className="bi bi-arrow-left" /> Back to Orders
      </button>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="ord-detail-header-card">
        <div>
          <h2 className="ord-detail-title">Order #{orderId}</h2>
          <p className="ord-detail-sub">
            Details and item breakdown for this {isRental ? 'rental ' : ''}order
          </p>
        </div>
      </div>

      {/* ── Meta row ───────────────────────────────────────────────────────── */}
      <div className="ord-meta-row">
        <div className="ord-meta-cell">
          <span className="ord-meta-label">ORDER NUMBER</span>
          <span className="ord-meta-value">#{order.invoice_number || orderId}</span>
        </div>

        <div className="ord-meta-cell">
          <span className="ord-meta-label">ORDER TYPE</span>
          {/* class matches API value: 'sale' or 'rent' */}
         <span className={`ord-type-badge ${order.order_type}`}>
            {typeLabel}
          </span>
        </div>

        {isRental && (
          <>
            <div className="ord-meta-cell">
              <span className="ord-meta-label">RENTAL START DATE</span>
              <span className="ord-meta-value">{formatDate(items[0]?.rental_start)}</span>
            </div>
            <div className="ord-meta-cell">
              <span className="ord-meta-label">RENTAL END DATE</span>
              <span className="ord-meta-value">{formatDate(items[0]?.rental_end)}</span>
            </div>
            <div className="ord-meta-cell">
              <span className="ord-meta-label">RENTAL DURATION</span>
              <span className="ord-meta-value">
                {getRentalDuration(items[0]?.rental_start, items[0]?.rental_end)} days
              </span>
            </div>
          </>
        )}

        <div className="ord-meta-cell">
          <span className="ord-meta-label">ORDER STATUS</span>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <select
              value={orderStatus}
              onChange={e => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              style={{
                background: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}`,
                padding: '6px 28px 6px 12px', borderRadius: '6px', fontSize: '12px',
                fontWeight: 600, textTransform: 'capitalize',
                cursor: updatingStatus ? 'not-allowed' : 'pointer',
                appearance: 'none', WebkitAppearance: 'none', minWidth: 120,
              }}
            >
              {AVAILABLE_STATUSES.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            {updatingStatus ? (
              <i className="bi bi-arrow-repeat spin" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: sc.color }} />
            ) : (
              <i className="bi bi-chevron-down" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: sc.color, pointerEvents: 'none' }} />
            )}
          </div>
        </div>

        <div className="ord-meta-cell">
          <span className="ord-meta-label">ORDER ISSUE</span>
          {orderHasIssue ? (
            <span style={{ background: issueColors.bg, color: issueColors.color, border: `1.5px solid ${issueColors.border}`, padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}>
              {order.order_issue}
            </span>
          ) : (
            <span style={{ background: noIssueColor.bg, color: noIssueColor.color, border: `1.5px solid ${noIssueColor.border}`, padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}>
              No Issue
            </span>
          )}
        </div>

        <div className="ord-meta-cell">
          <span className="ord-meta-label">CREATED AT</span>
          <span className="ord-meta-value">{formatDateTime(order.created_at)}</span>
        </div>
      </div>

      {/* ── Rental Details card ────────────────────────────────────────────── */}
      {isRental && items.length > 0 && (
        <div className="ord-items-card" style={{ marginBottom: 20 }}>
          <h3 className="ord-items-title">Rental Details</h3>
          <div className="ord-meta-row" style={{ margin: 0, padding: '16px 0' }}>
            {items.map((item, i) => {
              const duration  = getRentalDuration(item.rental_start, item.rental_end);
              const unitPrice = parseFloat(item.unit_price || 0);
              const qty       = item.quantity || 0;
              return (
                <div key={i} className="ord-meta-cell" style={{ flex: '1 1 200px' }}>
                  <span className="ord-meta-label">PRODUCT #{i + 1}: {item.product?.name || 'Unknown'}</span>
                  <span className="ord-meta-value">
                    {duration} days × ${unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} = ${(unitPrice * qty * duration).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Doctor Information ─────────────────────────────────────────────── */}
      <div className="ord-items-card" style={{ marginBottom: 20 }}>
        <h3 className="ord-items-title">Doctor Information</h3>
        <div className="ord-meta-row" style={{ margin: 0, padding: '16px 0' }}>
          <div className="ord-meta-cell">
            <span className="ord-meta-label">DOCTOR ID</span>
            <span className="ord-meta-value">#{order.doctor?.id || '-'}</span>
          </div>
          <div className="ord-meta-cell">
            <span className="ord-meta-label">LICENSE ID</span>
            <span className="ord-meta-value">{order.doctor?.license_table_id || '-'}</span>
          </div>
          <div className="ord-meta-cell">
            <span className="ord-meta-label">PHONE</span>
            <span className="ord-meta-value">{doctorPhone}</span>
          </div>
          <div className="ord-meta-cell">
            <span className="ord-meta-label">VERIFIED</span>
            <span className="ord-meta-value">{order.doctor?.is_verified ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {/* ── Product Items ──────────────────────────────────────────────────── */}
      <div className="ord-items-card">
        <h3 className="ord-items-title">Product Items</h3>
        <table className="ord-items-table">
          <thead>
            <tr>
              <th>PRODUCT NAME</th>
              <th>CATEGORY</th>
              <th>{isRental ? 'UNIT PRICE / DAY' : 'UNIT PRICE'}</th>
              <th>QUANTITY</th>
              {isRental && <th>RENTAL DURATION</th>}
              <th>STATUS</th>
              <th>FINAL PRICE</th>
              {/* ACTION column appears whenever at least one product is_rentable */}
              {hasAnyRentable && <th>ACTION</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const product   = item.product || {};
              const unitPrice = parseFloat(item.unit_price  || 0);
              const qty       = item.quantity || 0;
              const finalPrice= parseFloat(item.final_price || 0);
              const duration  = getRentalDuration(item.rental_start, item.rental_end);
              const ssc       = statusColors[orderStatus?.toLowerCase()] || { bg: '#f5f7fa', color: '#374151', border: '#e5e7eb' };

              return (
                <tr key={i}>
                  <td>
                    <div className="ord-product-name">
                      <div className="ord-product-icon">📦</div>
                      <span>{product.name || 'Unknown Product'}</span>
                    </div>
                  </td>
                  <td className="ord-category">{product.category?.name || 'General'}</td>
                  <td>${unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>{qty}</td>
                  {isRental && <td>{duration ? `${duration} days` : '-'}</td>}
                  <td>
                    <span style={{
                      background: ssc.bg, color: ssc.color, border: `1.5px solid ${ssc.border}`,
                      padding: '4px 12px', borderRadius: '6px', fontSize: '12px',
                      fontWeight: 600, display: 'inline-block', textTransform: 'capitalize',
                    }}>
                      {orderStatus}
                    </span>
                  </td>
                  <td className="ord-final-price">
                    ${finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Return button — driven by product.is_rentable from API */}
                  {hasAnyRentable && (
                    <td>
                      {product.is_rentable ? (
                        <button
                          onClick={() => handleReturnProduct(product.id)}
                          disabled={returningProduct === product.id}
                          style={{
                            background: '#dc2626', color: '#fff', border: 'none',
                            padding: '6px 14px', borderRadius: '6px', fontSize: '12px',
                            fontWeight: 600,
                            cursor: returningProduct === product.id ? 'not-allowed' : 'pointer',
                            opacity: returningProduct === product.id ? 0.6 : 1,
                          }}
                        >
                          {returningProduct === product.id ? 'Returning…' : 'Return'}
                        </button>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td colSpan={hasAnyRentable ? (isRental ? 8 : 7) : (isRental ? 7 : 6)}
                    style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                  No items in this order.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ── Order summary ────────────────────────────────────────────────── */}
        <div className="ord-summary-wrap">
          <div className="ord-summary-box">
            <div className="ord-summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="ord-summary-row discount">
              <span>Total Discount Amount</span>
              <span>−${discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="ord-summary-row">
              <span>{extraLabel}</span>
              <span>${extra.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="ord-summary-row total">
              <span>Final Total</span>
              <span className="ord-total-amount">
                ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="ord-summary-note">
              * {isRental
                ? 'Rental duration calculated based on order dates. Tax included where applicable.'
                : 'Tax included in final price where applicable.'}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to   { transform: translateY(-50%) rotate(360deg); }
        }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
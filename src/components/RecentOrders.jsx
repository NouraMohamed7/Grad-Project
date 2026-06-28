// src/components/RecentOrders.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupplierOrders } from '../apis/orders';

const STATUS_MAP = {
  pending:    { bg: '#fffbeb', color: '#d97706', label: 'Pending' },
  processing: { bg: '#eff6ff', color: '#2563eb', label: 'Processing' },
  ready:      { bg: '#f0fdf4', color: '#16a34a', label: 'Ready' },
  confirmed:  { bg: '#eff6ff', color: '#2563eb', label: 'Confirmed' },
  paid:       { bg: '#f0fdf4', color: '#16a34a', label: 'Paid' },
  delivered:  { bg: '#f0fdf4', color: '#16a34a', label: 'Delivered' },
  cancelled:  { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled' },
};
const getStatus = (s) => STATUS_MAP[s] || { bg: '#f3f4f6', color: '#6b7280', label: s || 'Unknown' };

export default function RecentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getSupplierOrders()
      .then(res => {
        const list = res?.data || [];
        setOrders(list.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const SkeletonRow = () => (
    <tr>
      {[120, 90, 70, 60, 80].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div style={{
            height: 14, borderRadius: 6,
            background: '#f0f2f5', width: w,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        </td>
      ))}
    </tr>
  );

  return (
    <div className="orders-card">
      <div className="orders-header">
        <span className="orders-title">Recent Orders</span>
        <button
          className="btn-export"
          style={{ fontSize: 12 }}
          onClick={() => navigate('/orders')}
        >
          View All <i className="bi bi-arrow-right" />
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0f2f5' }}>
              {['Invoice', 'Doctor', 'Type', 'Total', 'Status'].map(h => (
                <th key={h} style={{
                  padding: '10px 16px', textAlign: 'left',
                  fontSize: 11, fontWeight: 600,
                  color: '#9ca3af', textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              : orders.length === 0
                ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                      <i className="bi bi-inbox" style={{ fontSize: 24, display: 'block', marginBottom: 8 }} />
                      No orders yet
                    </td>
                  </tr>
                )
                : orders.map(order => {
                    const ss = getStatus(order.status);
                    return (
                      <tr
                        key={order.id}
                        style={{ borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
                        onClick={() => navigate(`/orders/${order.id}`)}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontWeight: 600, color: '#1a1d23' }}>
                            #{order.invoice_number || order.id}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#374151' }}>
                          {order.doctor?.fullname || order.doctor?.name || `Doctor #${order.doctor_id}`}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                          {order.order_type || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1a1d23' }}>
                          ${parseFloat(order.total || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: ss.bg, color: ss.color,
                            border: `1px solid ${ss.color}33`,
                            borderRadius: 20, fontSize: 11, fontWeight: 600,
                            padding: '3px 10px',
                          }}>
                            {ss.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
            }
          </tbody>
        </table>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
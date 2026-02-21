import React, { useState } from 'react';

const allOrders = [
  { id: '#ORD-2841', product: 'Surgical Forceps Set',  customer: 'City Medical Center',   date: 'Feb 20, 2026', amount: 1240,  status: 'shipped',    items: 2, payment: 'Paid' },
  { id: '#ORD-2840', product: 'MRI Contrast Agent',    customer: 'RadiologyPlus Inc.',    date: 'Feb 20, 2026', amount: 3500,  status: 'pending',    items: 1, payment: 'Paid' },
  { id: '#ORD-2839', product: 'Lab Centrifuge X200',   customer: 'BioResearch Labs',      date: 'Feb 19, 2026', amount: 8900,  status: 'delivered',  items: 1, payment: 'Paid' },
  { id: '#ORD-2838', product: 'Ultrasound Probe',      customer: 'Westside Hospital',     date: 'Feb 19, 2026', amount: 2150,  status: 'processing', items: 1, payment: 'Pending' },
  { id: '#ORD-2837', product: 'Sterile Gloves Pack',   customer: 'QuickCare Clinic',      date: 'Feb 18, 2026', amount: 320,   status: 'cancelled',  items: 5, payment: 'Refunded' },
  { id: '#ORD-2836', product: 'Bone Saw Electric',     customer: 'Regional Trauma Unit',  date: 'Feb 18, 2026', amount: 6800,  status: 'shipped',    items: 2, payment: 'Paid' },
  { id: '#ORD-2835', product: 'Hematology Analyzer',  customer: 'Central Diagnostics',   date: 'Feb 17, 2026', amount: 9800,  status: 'delivered',  items: 1, payment: 'Paid' },
  { id: '#ORD-2834', product: 'Suture Kit — Advanced', customer: 'St. Luke\'s Hospital',  date: 'Feb 17, 2026', amount: 725,   status: 'delivered',  items: 5, payment: 'Paid' },
  { id: '#ORD-2833', product: 'CT Scan Calibrator',   customer: 'NovaScan Imaging',      date: 'Feb 16, 2026', amount: 13000, status: 'processing', items: 2, payment: 'Pending' },
  { id: '#ORD-2832', product: 'Microscope Slide Set', customer: 'GreenPath Labs',        date: 'Feb 15, 2026', amount: 190,   status: 'pending',    items: 2, payment: 'Paid' },
  { id: '#ORD-2831', product: 'Surgical Forceps Set', customer: 'Eastside Clinic',       date: 'Feb 14, 2026', amount: 480,   status: 'cancelled',  items: 2, payment: 'Refunded' },
  { id: '#ORD-2830', product: 'MRI Contrast Agent',   customer: 'Sunrise Hospital',      date: 'Feb 13, 2026', amount: 1740,  status: 'delivered',  items: 3, payment: 'Paid' },
];

const statusList = ['All', 'shipped', 'pending', 'delivered', 'processing', 'cancelled'];

const statusStyle = {
  shipped:    'shipped',
  pending:    'pending',
  delivered:  'delivered',
  processing: 'processing',
  cancelled:  'cancelled',
};

const statusLabels = {
  shipped: 'Shipped', pending: 'Pending', delivered: 'Delivered',
  processing: 'Processing', cancelled: 'Cancelled',
};

export default function OrdersPage() {
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = allOrders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.product.toLowerCase().includes(q);
    const matchStatus = status === 'All' || o.status === status;
    return matchSearch && matchStatus;
  });

  const total   = allOrders.length;
  const pending = allOrders.filter(o => o.status === 'pending').length;
  const shipped = allOrders.filter(o => o.status === 'shipped').length;
  const revenue = allOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.amount, 0);

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div className="page-title">
          <h1>Orders</h1>
          <p>Track, manage, and process all customer orders.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export"><i className="bi bi-download" /> Export Orders</button>
          <button className="btn-add"><i className="bi bi-plus" /> New Order</button>
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Orders',   value: total,                      icon: 'bi-cart3',            bg: '#eff6ff', color: '#2563eb' },
          { label: 'Pending',        value: pending,                     icon: 'bi-clock',            bg: '#fffbeb', color: '#d97706' },
          { label: 'Shipped',        value: shipped,                     icon: 'bi-truck',            bg: '#f5f3ff', color: '#7c3aed' },
          { label: 'Revenue',        value: `$${(revenue/1000).toFixed(1)}k`, icon: 'bi-cash-stack', bg: '#f0fdf4', color: '#16a34a' },
        ].map(c => (
          <div className="stat-card" key={c.label}>
            <div>
              <div className="stat-label">{c.label}</div>
              <div className="stat-value">{c.value}</div>
            </div>
            <div className="stat-icon-wrap" style={{ background: c.bg, color: c.color }}>
              <i className={`bi ${c.icon}`} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: 16 }}>
        {/* Table */}
        <div className="orders-card">
          <div className="orders-header" style={{ flexWrap: 'wrap', gap: 10 }}>
            <span className="orders-title">All Orders</span>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div className="search-bar" style={{ maxWidth: 240 }}>
                <i className="bi bi-search search-icon" />
                <input type="text" placeholder="Search ID, customer..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="chart-select" value={status} onChange={e => setStatus(e.target.value)}>
                {statusList.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : statusLabels[s]}</option>)}
              </select>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} style={{ cursor: 'pointer', background: selected?.id === o.id ? '#f5f7fa' : undefined }}
                  onClick={() => setSelected(selected?.id === o.id ? null : o)}>
                  <td className="order-id">{o.id}</td>
                  <td style={{ maxWidth: 160 }}>{o.product}</td>
                  <td>{o.customer}</td>
                  <td style={{ color: '#6b7280', fontSize: 13 }}>{o.date}</td>
                  <td style={{ textAlign: 'center' }}>{o.items}</td>
                  <td style={{ fontWeight: 700 }}>${o.amount.toLocaleString()}</td>
                  <td>
                    <span className="status-badge" style={{
                      background: o.payment === 'Paid' ? '#f0fdf4' : o.payment === 'Refunded' ? '#fef2f2' : '#fffbeb',
                      color:      o.payment === 'Paid' ? '#16a34a' : o.payment === 'Refunded' ? '#dc2626' : '#d97706',
                    }}>{o.payment}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${statusStyle[o.status]}`}>{statusLabels[o.status]}</span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="action-btn">View</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Order Detail Panel */}
        {selected && (
          <div className="chart-card" style={{ height: 'fit-content', position: 'sticky', top: 80 }}>
            <div className="chart-header">
              <span className="chart-title">Order Detail</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18 }}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['Order ID',  selected.id],
                ['Product',   selected.product],
                ['Customer',  selected.customer],
                ['Date',      selected.date],
                ['Items',     selected.items],
                ['Amount',    `$${selected.amount.toLocaleString()}`],
                ['Payment',   selected.payment],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f2f5', paddingBottom: 10 }}>
                  <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>{k}</span>
                  <span style={{ fontSize: 13, color: '#1a1d23', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>Status</span>
                <span className={`status-badge ${statusStyle[selected.status]}`}>{statusLabels[selected.status]}</span>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button className="btn-add" style={{ flex: 1, justifyContent: 'center' }}><i className="bi bi-pencil" /> Edit</button>
                <button className="btn-export" style={{ flex: 1, justifyContent: 'center', color: '#dc2626', borderColor: '#fecaca' }}>
                  <i className="bi bi-trash" /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
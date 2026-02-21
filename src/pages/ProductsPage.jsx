import React, { useState } from 'react';

const allProducts = [
  { id: 'P-001', name: 'Surgical Forceps Set',  category: 'Surgical', price: 240,  stock: 85,  status: 'active',   sku: 'SUR-FS-001', sold: 142 },
  { id: 'P-002', name: 'MRI Contrast Agent',    category: 'Imaging',  price: 580,  stock: 32,  status: 'active',   sku: 'IMG-MC-002', sold: 67 },
  { id: 'P-003', name: 'Lab Centrifuge X200',   category: 'Lab',      price: 4200, stock: 4,   status: 'low',      sku: 'LAB-CX-003', sold: 21 },
  { id: 'P-004', name: 'Ultrasound Probe',       category: 'Imaging',  price: 1800, stock: 18,  status: 'active',   sku: 'IMG-UP-004', sold: 39 },
  { id: 'P-005', name: 'Sterile Gloves Pack',   category: 'Surgical', price: 28,   stock: 600, status: 'active',   sku: 'SUR-GP-005', sold: 410 },
  { id: 'P-006', name: 'Microscope Slide Set',  category: 'Lab',      price: 95,   stock: 0,   status: 'out',      sku: 'LAB-MS-006', sold: 88 },
  { id: 'P-007', name: 'Bone Saw Electric',      category: 'Surgical', price: 3400, stock: 7,   status: 'low',      sku: 'SUR-BS-007', sold: 14 },
  { id: 'P-008', name: 'CT Scan Calibrator',    category: 'Imaging',  price: 6500, stock: 2,   status: 'low',      sku: 'IMG-CC-008', sold: 8 },
  { id: 'P-009', name: 'Hematology Analyzer',   category: 'Lab',      price: 9800, stock: 5,   status: 'active',   sku: 'LAB-HA-009', sold: 11 },
  { id: 'P-010', name: 'Suture Kit — Advanced', category: 'Surgical', price: 145,  stock: 230, status: 'active',   sku: 'SUR-SK-010', sold: 198 },
];

const categories = ['All', 'Surgical', 'Imaging', 'Lab'];
const statusFilters = ['All', 'active', 'low', 'out'];

const statusStyle = {
  active: { bg: '#f0fdf4', color: '#16a34a', label: 'Active' },
  low:    { bg: '#fffbeb', color: '#d97706', label: 'Low Stock' },
  out:    { bg: '#fef2f2', color: '#dc2626', label: 'Out of Stock' },
};

const catColors = {
  Surgical: { bg: '#eff6ff', color: '#2563eb' },
  Imaging:  { bg: '#f5f3ff', color: '#7c3aed' },
  Lab:      { bg: '#f0fdf4', color: '#16a34a' },
};

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('id');

  let filtered = allProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    const matchStatus = status === 'All' || p.status === status;
    return matchSearch && matchCat && matchStatus;
  });

  if (sortBy === 'price') filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === 'stock') filtered = [...filtered].sort((a, b) => b.stock - a.stock);
  if (sortBy === 'sold')  filtered = [...filtered].sort((a, b) => b.sold - a.sold);

  const totalProducts = allProducts.length;
  const lowStock = allProducts.filter(p => p.status === 'low').length;
  const outOfStock = allProducts.filter(p => p.status === 'out').length;
  const totalValue = allProducts.reduce((s, p) => s + p.price * p.stock, 0);

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div className="page-title">
          <h1>Products</h1>
          <p>Manage your medical equipment inventory.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export"><i className="bi bi-download" /> Export</button>
          <button className="btn-add"><i className="bi bi-plus" /> Add Product</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        {[
          { label: 'Total Products', value: totalProducts, icon: 'bi-box-seam', bg: '#eff6ff', color: '#2563eb' },
          { label: 'Low Stock',      value: lowStock,      icon: 'bi-exclamation-triangle', bg: '#fffbeb', color: '#d97706' },
          { label: 'Out of Stock',   value: outOfStock,    icon: 'bi-x-circle', bg: '#fef2f2', color: '#dc2626' },
          { label: 'Inventory Value', value: `$${(totalValue/1000).toFixed(0)}k`, icon: 'bi-currency-dollar', bg: '#f0fdf4', color: '#16a34a' },
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

      {/* Filters */}
      <div className="orders-card">
        <div className="orders-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <span className="orders-title">All Products</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-bar" style={{ maxWidth: 220 }}>
              <i className="bi bi-search search-icon" />
              <input type="text" placeholder="Search name or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="chart-select" value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="chart-select" value={status} onChange={e => setStatus(e.target.value)}>
              {statusFilters.map(s => <option key={s}>{s === 'All' ? 'All Status' : statusStyle[s]?.label}</option>)}
            </select>
            <select className="chart-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="id">Sort: Default</option>
              <option value="price">Sort: Price</option>
              <option value="stock">Sort: Stock</option>
              <option value="sold">Sort: Best Selling</option>
            </select>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Sold</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const ss = statusStyle[p.status];
              const cc = catColors[p.category];
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{p.id}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12.5, color: '#6b7280' }}>{p.sku}</td>
                  <td>
                    <span className="status-badge" style={{ background: cc.bg, color: cc.color }}>{p.category}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>${p.price.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 5, background: '#f0f2f5', borderRadius: 10, minWidth: 60 }}>
                        <div style={{
                          height: '100%', borderRadius: 10,
                          width: `${Math.min(100, (p.stock / 100) * 100)}%`,
                          background: p.stock === 0 ? '#dc2626' : p.stock < 10 ? '#d97706' : '#16a34a',
                        }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', minWidth: 24 }}>{p.stock}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#374151' }}>{p.sold}</td>
                  <td>
                    <span className="status-badge" style={{ background: ss.bg, color: ss.color }}>{ss.label}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="action-btn"><i className="bi bi-pencil" /></button>
                      <button className="action-btn" style={{ color: '#dc2626', borderColor: '#fecaca' }}><i className="bi bi-trash" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
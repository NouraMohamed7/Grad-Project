import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const monthlyRevenue = [
  { month: 'Aug', revenue: 62000, expenses: 41000 },
  { month: 'Sep', revenue: 71000, expenses: 44000 },
  { month: 'Oct', revenue: 68000, expenses: 43000 },
  { month: 'Nov', revenue: 79000, expenses: 47000 },
  { month: 'Dec', revenue: 91000, expenses: 52000 },
  { month: 'Jan', revenue: 85000, expenses: 49000 },
  { month: 'Feb', revenue: 124500, expenses: 58000 },
];

const categoryData = [
  { category: 'Surgical', units: 142, revenue: 56000 },
  { category: 'Imaging',  units: 98,  revenue: 37000 },
  { category: 'Lab',      units: 88,  revenue: 31500 },
];

const orderTrend = [
  { week: 'W1 Jan', orders: 38 },
  { week: 'W2 Jan', orders: 45 },
  { week: 'W3 Jan', orders: 41 },
  { week: 'W4 Jan', orders: 53 },
  { week: 'W1 Feb', orders: 49 },
  { week: 'W2 Feb', orders: 61 },
  { week: 'W3 Feb', orders: 57 },
];

const kpis = [
  { label: 'Total Revenue',   value: '$124,500', change: '+12.5%', up: true,  icon: 'bi-currency-dollar', bg: '#eff6ff', color: '#2563eb' },
  { label: 'Gross Profit',    value: '$66,500',  change: '+9.2%',  up: true,  icon: 'bi-graph-up-arrow',  bg: '#f0fdf4', color: '#16a34a' },
  { label: 'Total Orders',    value: '302',      change: '+7.4%',  up: true,  icon: 'bi-cart-check',      bg: '#f5f3ff', color: '#7c3aed' },
  { label: 'Avg Order Value', value: '$412',     change: '-2.1%',  up: false, icon: 'bi-receipt',         bg: '#fffbeb', color: '#d97706' },
];

const fmtK = v => `$${(v/1000).toFixed(0)}k`;

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid #e8eaed', borderRadius: 8, padding: '8px 14px', fontSize: 12.5, fontFamily: 'DM Sans,sans-serif', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ color: '#9ca3af', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? `$${p.value.toLocaleString()}` : p.value}
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div className="page-title">
          <h1>Analytics</h1>
          <p>Revenue, orders, and performance insights for your business.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export"><i className="bi bi-download" /> Export Report</button>
          <button className="btn-add"><i className="bi bi-calendar3" /> Feb 2026</button>
        </div>
      </div>

      {/* KPI row */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {kpis.map(k => (
          <div className="stat-card" key={k.label}>
            <div>
              <div className="stat-label">{k.label}</div>
              <div className="stat-value">{k.value}</div>
              <div className={`stat-meta ${k.up ? 'positive' : 'danger'}`}>
                <i className={`bi ${k.up ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}`} />
                {k.change} vs last month
              </div>
            </div>
            <div className="stat-icon-wrap" style={{ background: k.bg, color: k.color }}>
              <i className={`bi ${k.icon}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Revenue vs Expenses */}
      <div className="chart-card" style={{ marginBottom: 16 }}>
        <div className="chart-header">
          <span className="chart-title">Revenue vs Expenses — Last 7 Months</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={monthlyRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtK} tick={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} width={44} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 13, fontFamily: 'DM Sans' }} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#2563eb', r: 3, strokeWidth: 2, stroke: 'white' }} />
            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#dc2626" strokeWidth={2} strokeDasharray="4 3" fill="url(#expGrad)" dot={{ fill: '#dc2626', r: 3, strokeWidth: 2, stroke: 'white' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Sales by Category */}
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Sales by Category</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtK} tick={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} width={44} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="units" name="Units Sold" fill="#a5b4fc" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Weekly Order Trend</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={orderTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="orders" name="Orders" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: '#7c3aed', r: 4, stroke: 'white', strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
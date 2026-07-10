import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getSupplierOrders } from '../apis/orders';
import { getAllProducts } from '../apis/products';
import { buildCategorySeries, buildMonthlyRevenueSeries, buildWeeklyOrderSeries, getDashboardMetrics } from '../utils/dashboardMetrics';

const fmtK = (v) => `EGP${(v / 1000).toFixed(0)}k`;

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const moneyKeys = ['revenue', 'expenses']; // الحقول اللي بتمثل فلوس فقط
  return (
    <div style={{ background: 'white', border: '1px solid #e8eaed', borderRadius: 8, padding: '8px 14px', fontSize: 12.5, fontFamily: 'DM Sans,sans-serif', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ color: '#9ca3af', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => {
        const isMoney = moneyKeys.includes(p.dataKey);
        return (
          <div key={i} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {isMoney ? `EGP${Number(p.value).toLocaleString()}` : p.value}
          </div>
        );
      })}
    </div>
  );
};

export default function AnalyticsPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.allSettled([
          getSupplierOrders(),
          getAllProducts({ page: 1, per_page: 100 }),
        ]);

        if (active) {
          setOrders(Array.isArray(ordersRes.value?.data) ? ordersRes.value.data : []);
          setProducts(Array.isArray(productsRes.value?.data) ? productsRes.value.data : []);
        }
      } catch (error) {
        console.error('AnalyticsPage load error:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, []);

  const metrics = useMemo(() => getDashboardMetrics({ orders, products }), [orders, products]);
  const monthlyRevenue = useMemo(() => buildMonthlyRevenueSeries(orders), [orders]);
  const categoryData = useMemo(() => buildCategorySeries({ orders, products }), [orders, products]);
  const orderTrend = useMemo(() => buildWeeklyOrderSeries(orders), [orders]);

 const kpis = [
  {
    label: 'Total Revenue',
    value: loading ? '...' : `EGP${metrics.totalRevenue.toLocaleString()}`,
    change: metrics.totalOrders ? `${((metrics.averageOrderValue / Math.max(1, metrics.totalRevenue || 1)) * 100).toFixed(1)}%` : '0%',
    up: true,
    icon: 'bi-currency-dollar',
    bg: '#eff6ff',
    color: '#2563eb',
  },
  {
    label: 'Total Discount',
    value: loading ? '...' : `EGP${metrics.totalDiscount.toLocaleString()}`,
    change: metrics.totalDiscount > 0 ? '+0.0%' : '0%',
    up: metrics.totalDiscount > 0,
    icon: 'bi-graph-up-arrow',
    bg: '#f0fdf4',
    color: '#16a34a',
  },
  {
    label: 'Total Orders',
    value: loading ? '...' : String(metrics.totalOrders),
    change: metrics.totalOrders > 0 ? `${metrics.completedOrders}/${metrics.totalOrders} completed` : '0 completed',
    up: true,
    icon: 'bi-cart-check',
    bg: '#f5f3ff',
    color: '#7c3aed',
  },
  {
    label: 'Avg Order Value',
    value: loading ? '...' : `EGP${metrics.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    change: metrics.averageOrderValue > 0 ? 'Based on successful orders' : 'No orders yet',
    up: metrics.averageOrderValue > 0,
    icon: 'bi-receipt',
    bg: '#fffbeb',
    color: '#d97706',
  },
];

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
        {loading ? (
          <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>Loading analytics...</div>
        ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={monthlyRevenue.length ? monthlyRevenue : [{ month: 'No data', revenue: 0, expenses: 0 }]} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
        )}
      </div>

      {/* Bottom row */}
      <div className="analytics-bottom-row">

        {/* Sales by Category */}
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Sales by Category</span>
          </div>
          {loading ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>Loading category data...</div>
          ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData.length ? categoryData : [{ name: 'No data', revenue: 0, units: 0 }]} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtK} tick={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} width={44} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="units" name="Units Sold" fill="#a5b4fc" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>

        {/* Order Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Weekly Order Trend</span>
          </div>
          {loading ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>Loading trend data...</div>
          ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={orderTrend.length ? orderTrend : [{ week: 'No data', orders: 0 }]} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="orders" name="Orders" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: '#7c3aed', r: 4, stroke: 'white', strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
}
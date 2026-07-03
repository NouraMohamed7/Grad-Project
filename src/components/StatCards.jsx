// src/components/StatCards.jsx
import React, { useEffect, useState } from 'react';
import { getSupplierOrders } from '../apis/orders';
import { getAllProducts } from '../apis/products';
import { getSupplierOffers } from '../apis/requests';
import { getDashboardMetrics } from '../utils/dashboardMetrics';

export default function StatCards() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
    customRequests: 0,
    lowStock: 0,
    completedRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Run all calls in parallel
        const [ordersRes, offersRes, productsRes] = await Promise.allSettled([
          getSupplierOrders(),
          getSupplierOffers(),
          getAllProducts({ page: 1, per_page: 100 }), // 👈 uses logged-in supplier token
        ]);

        console.log('📦 ordersRes:', ordersRes);
        console.log('📦 offersRes:', offersRes);
        console.log('📦 productsRes:', productsRes);

        const orders = ordersRes.status === 'fulfilled' ? (Array.isArray(ordersRes.value?.data) ? ordersRes.value.data : []) : [];
        const offers = offersRes.status === 'fulfilled' ? (Array.isArray(offersRes.value?.data) ? offersRes.value.data : []) : [];
        const products = productsRes.status === 'fulfilled' ? (Array.isArray(productsRes.value?.data) ? productsRes.value.data : []) : [];

        const derived = getDashboardMetrics({ orders, products, offers });

        setStats({
          totalRevenue: derived.totalRevenue,
          pendingOrders: derived.pendingOrders,
          totalProducts: derived.totalProducts,
          customRequests: derived.customRequests,
          lowStock: derived.lowStock,
          completedRequests: derived.completedRequests,
        });
      } catch (err) {
        console.error('StatCards fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (val) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val.toFixed(0)}`;
  };

  const cards = [
    {
      label: 'Total Revenue',
      value: loading ? '...' : formatCurrency(stats.totalRevenue),
      meta: loading ? 'Loading...' : (stats.totalRevenue > 0 ? 'From paid & confirmed orders' : 'No revenue yet'),
      metaType: stats.totalRevenue > 0 ? 'positive' : 'neutral',
      metaIcon: stats.totalRevenue > 0 ? 'bi-arrow-up-right' : 'bi-dash',
      iconClass: 'blue',
      icon: 'bi-credit-card',
    },
    {
      label: 'Pending Orders',
      value: loading ? '...' : String(stats.pendingOrders),
      meta: loading ? 'Loading...' : (stats.pendingOrders > 0 ? `${stats.pendingOrders} awaiting action` : 'All clear'),
      metaType: stats.pendingOrders > 0 ? 'warning' : 'positive',
      metaIcon: stats.pendingOrders > 0 ? 'bi-clock' : 'bi-check-circle',
      iconClass: 'yellow',
      icon: 'bi-clipboard-check',
    },
    {
      label: 'Total Products',
      value: loading ? '...' : String(stats.totalProducts),
      meta: loading ? 'Loading...' : (stats.lowStock > 0 ? `${stats.lowStock} Low Stock` : 'Stock OK'),
      metaType: stats.lowStock > 0 ? 'danger' : 'positive',
      metaIcon: stats.lowStock > 0 ? 'bi-exclamation-triangle' : 'bi-check-circle',
      iconClass: 'purple',
      icon: 'bi-box-seam',
    },
    {
      label: 'Custom Requests',
      value: loading ? '...' : String(stats.customRequests),
      meta: loading ? 'Loading...' : `${stats.completedRequests} Accepted`,
      metaType: 'success',
      metaIcon: 'bi-check-circle',
      iconClass: 'green',
      icon: 'bi-list-check',
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((s) => (
        <div className="stat-card" key={s.label}>
          <div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-meta ${s.metaType}`}>
              <i className={`bi ${s.metaIcon}`} />
              <span>{s.meta}</span>
            </div>
          </div>
          <div className={`stat-icon-wrap ${s.iconClass}`}>
            <i className={`bi ${s.icon}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
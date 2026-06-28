// src/components/StatCards.jsx
import React, { useEffect, useState } from 'react';
import { getSupplierOrders } from '../apis/orders';
import { getAllProducts } from '../apis/products';
import { getSupplierOffers } from '../apis/requests';

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

        // ── Orders stats ──
        let totalRevenue = 0;
        let pendingOrders = 0;
        if (ordersRes.status === 'fulfilled' && ordersRes.value?.data) {
          const orders = ordersRes.value.data;
          orders.forEach((o) => {
            if (['paid', 'confirmed', 'delivered'].includes(o.status)) {
              totalRevenue += parseFloat(o.total || 0);
            }
            if (o.status === 'pending') pendingOrders++;
          });
        }

        // ── Custom requests (offers) stats ──
        let customRequests = 0;
        let completedRequests = 0;
        if (offersRes.status === 'fulfilled' && offersRes.value?.data) {
          const offers = offersRes.value.data;
          customRequests = offers.length;
          completedRequests = offers.filter((o) => o.status === 'accepted').length;
        }

        // ── Products stats ──
        let totalProducts = 0;
        let lowStock = 0;

        if (productsRes.status === 'fulfilled' && productsRes.value) {
          console.log('🔍 productsRes.value:', productsRes.value);

          // Try all possible locations for total
          totalProducts = 
            productsRes.value?.total ?? 
            productsRes.value?.data?.total ?? 
            productsRes.value?.meta?.total ?? 
            0;

          // Fallback: count data array length
          const products = productsRes.value?.data || [];
          if (totalProducts === 0 && Array.isArray(products) && products.length > 0) {
            totalProducts = products.length;
          }

          lowStock = products.filter((p) => p.stock <= 5).length;
        }

        console.log('✅ Final stats:', { totalRevenue, pendingOrders, totalProducts, customRequests, lowStock, completedRequests });

        setStats({
          totalRevenue,
          pendingOrders,
          totalProducts,
          customRequests,
          lowStock,
          completedRequests,
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
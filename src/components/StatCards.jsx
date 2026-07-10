// src/components/StatCards.jsx
import React, { useEffect, useState } from 'react';
import { getSupplierOrders } from '../apis/orders';
import { getAllProducts } from '../apis/products';
import { getSupplierOffers } from '../apis/requests';

const CACHE_KEY = 'dashboard_stats_cache';
const CACHE_TTL = 60 * 1000; // دقيقة واحدة

export default function StatCards() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    customRequests: 0,
    lowStock: 0,
    completedRequests: 0,
  });

  // loading منفصل لكل كارت عشان كل واحد يظهر لوحده
  const [loading, setLoading] = useState({
    orders: true,
    products: true,
    offers: true,
  });

  useEffect(() => {
    let mounted = true;

    // 1) هات آخر بيانات مخزنة (لو موجودة ولسه صالحة) وأعرضها فورًا
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setStats(data);
          setLoading({ orders: false, products: false, offers: false });
        }
      }
    } catch (e) {
      // تجاهل أي خطأ في قراءة الكاش
    }

    const updateCache = (newStats) => {
      try {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: newStats, timestamp: Date.now() })
        );
      } catch (e) {
        // تجاهل أي خطأ في الكتابة
      }
    };

    // 2) كل كول لوحده، يحدّث بس الجزء بتاعه من الـ stats أول ما يوصل
    getSupplierOrders()
      .then((res) => {
        if (!mounted) return;
        const orders = Array.isArray(res?.data) ? res.data : [];
        setStats((prev) => {
          const next = {
            ...prev,
            totalOrders: orders.length,
            pendingOrders: orders.filter(
              (o) => (o.status || '').toLowerCase() === 'pending'
            ).length,
          };
          updateCache(next);
          return next;
        });
      })
      .catch((err) => console.error('orders fetch error:', err))
      .finally(() => {
        if (mounted) setLoading((p) => ({ ...p, orders: false }));
      });

    getAllProducts({ page: 1, per_page: 100 })
      .then((res) => {
        if (!mounted) return;
        const products = Array.isArray(res?.data) ? res.data : [];
        setStats((prev) => {
          const next = {
            ...prev,
            totalProducts: products.length,
            lowStock: products.filter((p) => (p.stock ?? 0) < 10).length,
          };
          updateCache(next);
          return next;
        });
      })
      .catch((err) => console.error('products fetch error:', err))
      .finally(() => {
        if (mounted) setLoading((p) => ({ ...p, products: false }));
      });

    getSupplierOffers()
      .then((res) => {
        if (!mounted) return;
        const offers = Array.isArray(res?.data) ? res.data : [];
        setStats((prev) => {
          const next = {
            ...prev,
            customRequests: offers.length,
            completedRequests: offers.filter(
              (o) => (o.status || '').toLowerCase() === 'accepted'
            ).length,
          };
          updateCache(next);
          return next;
        });
      })
      .catch((err) => console.error('offers fetch error:', err))
      .finally(() => {
        if (mounted) setLoading((p) => ({ ...p, offers: false }));
      });

    return () => {
      mounted = false;
    };
  }, []);

  const cards = [
    {
      label: 'Total Orders',
      value: loading.orders ? '...' : String(stats.totalOrders),
      meta: loading.orders
        ? 'Loading...'
        : stats.totalOrders > 0
        ? `${stats.totalOrders} orders total`
        : 'No orders yet',
      metaType: stats.totalOrders > 0 ? 'positive' : 'neutral',
      metaIcon: stats.totalOrders > 0 ? 'bi-arrow-up-right' : 'bi-dash',
      iconClass: 'blue',
      icon: 'bi-bag-check',
    },
    {
      label: 'Pending Orders',
      value: loading.orders ? '...' : String(stats.pendingOrders),
      meta: loading.orders
        ? 'Loading...'
        : stats.pendingOrders > 0
        ? `${stats.pendingOrders} awaiting action`
        : 'All clear',
      metaType: stats.pendingOrders > 0 ? 'warning' : 'positive',
      metaIcon: stats.pendingOrders > 0 ? 'bi-clock' : 'bi-check-circle',
      iconClass: 'yellow',
      icon: 'bi-clipboard-check',
    },
    {
      label: 'Total Products',
      value: loading.products ? '...' : String(stats.totalProducts),
      meta: loading.products
        ? 'Loading...'
        : stats.lowStock > 0
        ? `${stats.lowStock} Low Stock`
        : 'Stock OK',
      metaType: stats.lowStock > 0 ? 'danger' : 'positive',
      metaIcon: stats.lowStock > 0 ? 'bi-exclamation-triangle' : 'bi-check-circle',
      iconClass: 'purple',
      icon: 'bi-box-seam',
    },
    {
      label: 'Custom Requests',
      value: loading.offers ? '...' : String(stats.customRequests),
      meta: loading.offers ? 'Loading...' : `${stats.completedRequests} Accepted`,
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
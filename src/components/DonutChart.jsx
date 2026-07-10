import React, { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getSupplierOrders } from '../apis/orders';
import { getAllProducts, getCategories } from '../apis/products';
import { buildCategorySeries, buildCategoryMap } from '../utils/dashboardMetrics';

const CACHE_KEY = 'donut_chart_cache';
const CACHE_TTL = 60 * 1000;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e8eaed',
        borderRadius: 8,
        padding: '8px 14px',
        fontSize: 13,
        fontFamily: 'DM Sans, sans-serif',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}>
        <span style={{ fontWeight: 600 }}>{payload[0].name}: </span>
        <span>{payload[0].value}%</span>
      </div>
    );
  }
  return null;
};

export default function DonutChart() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  // loading بيتفصل عن orders/products (الأساسيين) عن categoriesMap (تحسين خلفي)
  const [coreLoading, setCoreLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // 1) اعرض آخر نسخة متكاشة فورًا لو موجودة
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { orders: o, products: p, categoriesMap: c, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setOrders(o || []);
          setProducts(p || []);
          setCategoriesMap(c || {});
          setCoreLoading(false);
        }
      }
    } catch (e) {}

    const updateCache = (partial) => {
      try {
        const prevRaw = sessionStorage.getItem(CACHE_KEY);
        const prev = prevRaw ? JSON.parse(prevRaw) : {};
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...prev, ...partial, timestamp: Date.now() }));
      } catch (e) {}
    };

    // 2) orders و products هما الأساس — أول ما الاتنين يوصلوا نوقف اللودينج
    Promise.allSettled([getSupplierOrders(), getAllProducts({ page: 1, per_page: 100 })])
      .then(([ordersRes, productsRes]) => {
        if (!active) return;
        const nextOrders = ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value?.data) ? ordersRes.value.data : [];
        const nextProducts = productsRes.status === 'fulfilled' && Array.isArray(productsRes.value?.data) ? productsRes.value.data : [];
        setOrders(nextOrders);
        setProducts(nextProducts);
        setCoreLoading(false);
        updateCache({ orders: nextOrders, products: nextProducts });
      })
      .catch((err) => {
        console.error('DonutChart core load error:', err);
        if (active) setCoreLoading(false);
      });

    // 3) categoriesMap تحسين إضافي — يتحدث لوحده لما يوصل، من غير ما يعطّل عرض الشارت
    getCategories(1, 100)
      .then((res) => {
        if (!active) return;
        const nextMap = buildCategoryMap(res);
        setCategoriesMap(nextMap);
        updateCache({ categoriesMap: nextMap });
      })
      .catch((err) => console.error('DonutChart categories load error:', err));

    return () => { active = false; };
  }, []);

  const data = useMemo(() => {
    const series = buildCategorySeries({ orders, products, categoriesMap });
    const total = series.reduce((sum, item) => sum + item.revenue, 0);
    if (!total) return [];
    return series.map((item) => ({ ...item, value: Number(((item.revenue / total) * 100).toFixed(1)) }));
  }, [orders, products, categoriesMap]);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <span className="chart-title">Top Performing Categories</span>
      </div>

      {coreLoading ? (
        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
          Loading category data...
        </div>
      ) : (
        <>
          <div className="donut-wrap">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            {data.length ? data.map((item) => (
              <div className="legend-item" key={item.name}>
                <div className="legend-label">
                  <div className="legend-dot" style={{ backgroundColor: item.color }} />
                  {item.name}
                </div>
                <div className="legend-pct">{item.value}%</div>
              </div>
            )) : <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No category data yet</div>}
          </div>
        </>
      )}
    </div>
  );
}
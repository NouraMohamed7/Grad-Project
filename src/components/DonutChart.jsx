import React, { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getSupplierOrders } from '../apis/orders';
import { getAllProducts } from '../apis/products';
import { buildCategorySeries } from '../utils/dashboardMetrics';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.allSettled([
          getSupplierOrders(),
          getAllProducts({ page: 1, per_page: 100 }),
        ]);

        const nextOrders = Array.isArray(ordersRes.value?.data) ? ordersRes.value.data : [];
        const nextProducts = Array.isArray(productsRes.value?.data) ? productsRes.value.data : [];

        if (active) {
          setOrders(nextOrders);
          setProducts(nextProducts);
        }
      } catch (error) {
        console.error('DonutChart load error:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, []);

  const data = useMemo(() => {
    const series = buildCategorySeries({ orders, products });
    const total = series.reduce((sum, item) => sum + item.revenue, 0);
    if (!total) return [];
    return series.map((item) => ({ ...item, value: Number(((item.revenue / total) * 100).toFixed(1)) }));
  }, [orders, products]);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <span className="chart-title">Top Performing Categories</span>
      </div>

      {loading ? (
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
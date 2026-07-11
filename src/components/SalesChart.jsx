import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getSupplierOrders } from '../apis/orders';
import { buildSalesSeries } from '../utils/dashboardMetrics';

const CACHE_KEY = 'sales_chart_orders_cache';
const CACHE_TTL = 60 * 1000;

const formatYAxis = (v) => `EGP ${(v / 1000).toFixed(0)}k`;

const CustomTooltip = ({ active, payload, label }) => {
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
        <div style={{ color: '#6b7280', marginBottom: 2 }}>{label}</div>
        <div style={{ color: '#1a1d23', fontWeight: 700 }}>
          EGP{payload[0].value.toLocaleString()}
        </div>
      </div>
    );
  }
  return null;
};

export default function SalesChart() {
  const [range, setRange] = useState('7');
  const [orders, setOrders] = useState([]);
  // loading بيبقى false على طول لو عندنا كاش صالح، وبيتحدث في الخلفية
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // 1) اعرض الكاش فورًا لو موجود وصالح
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setOrders(data || []);
          setLoading(false);
        }
      }
    } catch (e) {}

    // 2) هات البيانات الجديدة في الخلفية (تحدّث الشارت لما توصل، من غير ما ترجّع Loading تاني)
    getSupplierOrders()
      .then((res) => {
        if (!active) return;
        const nextOrders = Array.isArray(res?.data) ? res.data : [];
        setOrders(nextOrders);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: nextOrders, timestamp: Date.now() }));
        } catch (e) {}
      })
      .catch((error) => {
        console.error('SalesChart load error:', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const data = useMemo(() => buildSalesSeries(orders, range), [orders, range]);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <span className="chart-title">Sales Analytics</span>
        <select
          className="chart-select"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
        </select>
      </div>
      {loading ? (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
          Loading sales data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.length ? data : [{ label: 'No data', value: 0 }]} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'DM Sans' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'DM Sans' }}
              axisLine={false}
              tickLine={false}
              width={54}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e8eaed', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={2.5}
              fill="url(#salesGradient)"
              dot={false}
              activeDot={{ r: 6, fill: '#2563eb', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
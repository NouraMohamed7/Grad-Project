import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data7Days = [
  { day: 'Mon', value: 11000 },
  { day: 'Tue', value: 19500 },
  { day: 'Wed', value: 15200 },
  { day: 'Thu', value: 25500 },
  { day: 'Fri', value: 21000 },
  { day: 'Sat', value: 29000 },
  { day: 'Sun', value: 27200 },
];

const data30Days = [
  { day: 'W1', value: 58000 },
  { day: 'W2', value: 72000 },
  { day: 'W3', value: 65000 },
  { day: 'W4', value: 81000 },
];

const formatYAxis = (v) => `$${v / 1000}k`;

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
          ${payload[0].value.toLocaleString()}
        </div>
      </div>
    );
  }
  return null;
};

export default function SalesChart() {
  const [range, setRange] = useState('7');
  const data = range === '7' ? data7Days : data30Days;

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
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e8eaed', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2.5}
            fill="url(#salesGradient)"
            dot={{ fill: '#2563eb', r: 4, strokeWidth: 2, stroke: 'white' }}
            activeDot={{ r: 6, fill: '#2563eb', stroke: 'white', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
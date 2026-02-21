import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Surgical', value: 45, color: '#3b82f6' },
  { name: 'Imaging', value: 30, color: '#22c55e' },
  { name: 'Lab', value: 25, color: '#a855f7' },
];

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
  return (
    <div className="chart-card">
      <div className="chart-header">
        <span className="chart-title">Top Performing Categories</span>
      </div>

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
        {data.map((item) => (
          <div className="legend-item" key={item.name}>
            <div className="legend-label">
              <div className="legend-dot" style={{ backgroundColor: item.color }} />
              {item.name}
            </div>
            <div className="legend-pct">{item.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
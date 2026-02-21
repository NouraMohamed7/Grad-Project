import React from 'react';

const stats = [
  {
    label: 'Total Revenue',
    value: '$124,500',
    meta: '+12.5% vs last month',
    metaType: 'positive',
    metaIcon: 'bi-arrow-up-right',
    iconClass: 'blue',
    icon: 'bi-credit-card',
  },
  {
    label: 'Pending Orders',
    value: '45',
    meta: '12 Urgent',
    metaType: 'warning',
    metaIcon: 'bi-clock',
    iconClass: 'yellow',
    icon: 'bi-clipboard-check',
  },
  {
    label: 'Total Products',
    value: '328',
    meta: '5 Low Stock',
    metaType: 'danger',
    metaIcon: 'bi-exclamation-triangle',
    iconClass: 'purple',
    icon: 'bi-box-seam',
  },
  {
    label: 'Custom Requests',
    value: '8',
    meta: '2 Completed',
    metaType: 'success',
    metaIcon: 'bi-check-circle',
    iconClass: 'green',
    icon: 'bi-list-check',
  },
];

export default function StatCards() {
  return (
    <div className="stats-grid">
      {stats.map((s) => (
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
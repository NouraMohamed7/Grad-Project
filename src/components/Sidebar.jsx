import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { icon: 'bi-grid-fill',        label: 'Dashboard',         to: '/' },
  { icon: 'bi-shield-lock-fill', label: 'Admin',             to: '/admin' },
  { icon: 'bi-bar-chart-fill',   label: 'Analytics',         to: '/analytics' },
  { icon: 'bi-box-seam',         label: 'Products',          to: '/products' },
  { icon: 'bi-cart3',            label: 'Orders',            to: '/orders', badge: 12 },
  { icon: 'bi-percent',          label: 'Discount & Promos', to: '/promos' },
  { icon: 'bi-tools',            label: 'Custom Requests',   to: '/requests' },
  { icon: 'bi-chat-dots',        label: 'Chat',              to: '/chat' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <i className="bi bi-plus-lg" />
        </div>
        <span>MediEquip</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <i className={`bi ${item.icon} nav-icon`} />
            {item.label}
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} style={{ marginBottom: '12px' }}>
          <i className="bi bi-gear nav-icon" />
          Account Settings
        </NavLink>
        <div className="user-profile">
          <div className="avatar"><span>DR</span></div>
          <div className="user-info">
            <div className="user-name">Dr. Alex Ray</div>
            <div className="user-org">MedTech Solutions</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
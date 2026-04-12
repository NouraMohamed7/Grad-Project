// src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/home',     icon: 'bi-grid-fill',       label: 'Dashboard' },
  { to: '/products', icon: 'bi-box-seam-fill',    label: 'Products' },
  { to: '/orders',   icon: 'bi-cart3',            label: 'Orders',   badge: 12 },
  { to: '/promos',   icon: 'bi-percent',          label: 'Discount & Promos' },
  { to: '/requests', icon: 'bi-tools',            label: 'Custom Requests' },
  { to: '/chat',     icon: 'bi-chat-dots-fill',   label: 'Chat' },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Get user info from localStorage if available
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const userName = user?.fullname || user?.name || 'Dr. Alex Ray';
  const userOrg  = user?.organization || 'MedTech Solutions';
  const userInitial = (userName[0] || 'D').toUpperCase();

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <i className="bi bi-plus-circle-fill" />
        </div>
        <span>MediEquip</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <i className={`bi ${item.icon} nav-icon`} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </NavLink>
        ))}

        <div className="nav-section-label" style={{ marginTop: 12 }}>Account</div>
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          onClick={onClose}
        >
          <i className="bi bi-gear-fill nav-icon" />
          <span>Account Settings</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-profile" onClick={handleLogout} title="Click to logout">
          <div className="avatar">
            {userInitial}
          </div>
          <div className="user-info">
            <div className="user-name">{userName}</div>
            <div className="user-org">{userOrg}</div>
          </div>
          <i className="bi bi-box-arrow-right" style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 15, flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}
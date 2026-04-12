// src/components/Topbar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const pageTitles = {
  '/home':      'Dashboard',
  '/products':  'Products',
  '/orders':    'Orders',
  '/promos':    'Discount & Promos',
  '/requests':  'Custom Requests',
  '/chat':      'Chat',
  '/settings':  'Account Settings',
  '/analytics': 'Analytics',
};

export default function Topbar({ onMenuToggle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTitle = Object.entries(pageTitles).find(([path]) => location.pathname.startsWith(path))?.[1] || 'Dashboard';

  return (
    <header className="topbar">
      {/* Mobile menu toggle */}
      <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
        <i className="bi bi-list" />
      </button>

      {/* Search */}
      <div className="search-bar">
        <i className="bi bi-search search-icon" />
        <input type="text" placeholder="Search orders, products, or customers..." />
      </div>

      {/* Actions */}
      <div className="topbar-actions">
        <button className="icon-btn" title="Notifications">
          <i className="bi bi-bell" />
          <span className="notif-dot" />
        </button>
        <button className="icon-btn" title="Help">
          <i className="bi bi-question-circle" />
        </button>
      </div>
    </header>
  );
}
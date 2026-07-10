// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { logoutUser } from '../apis/auth';
import { toast } from 'react-toastify';

const navItems = [
  { to: '/home', icon: 'bi-grid-fill', label: 'Dashboard' },
  { to: '/products', icon: 'bi-box-seam-fill', label: 'Products' },
  { to: '/orders', icon: 'bi-cart3', label: 'Orders' },
  {
    type: 'parent',
    icon: 'bi-tools',
    label: 'Custom Requests',
    children: [
      { to: '/requests/open', label: 'Open Requests' },
      { to: '/requests/offers', label: 'My Offers' },
      { to: '/requests/orders', label: 'Orders' },
    ],
  },
  { to: '/chat', icon: 'bi-chat-dots-fill', label: 'Chat' },
];

function LogoutDialog({ onConfirm, onCancel }) {
  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
        }}
        onClick={onCancel}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        background: '#fff', borderRadius: 16,
        padding: '28px 28px 24px',
        width: 380, maxWidth: '92vw',
        boxShadow: '0 24px 80px rgba(0,0,0,0.16)',
        zIndex: 9999,
        fontFamily: 'DM Sans, sans-serif',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: '#fef2f2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <i className="bi bi-box-arrow-right" style={{ fontSize: 22, color: '#dc2626' }} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 8 }}>
          Sign out?
        </div>
        <div style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.65, marginBottom: 24 }}>
          Are you sure you want to sign out of MediEquip? You&apos;ll need to log in again to access your dashboard.
        </div>
        <div style={{ height: 1, background: '#f3f4f6', margin: '0 -28px 18px' }} />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 18px', borderRadius: 8,
              border: '1.5px solid #e5e7eb',
              background: '#fff', color: '#374151',
              cursor: 'pointer', fontSize: 13.5, fontWeight: 500,
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            Stay signed in
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 18px', borderRadius: 8,
              border: 'none', background: '#dc2626',
              color: '#fff', cursor: 'pointer',
              fontSize: 13.5, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            <i className="bi bi-box-arrow-right" /> Sign out
          </button>
        </div>
      </div>
    </>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogout, setShowLogout] = useState(false);
  const [customRequestsOpen, setCustomRequestsOpen] = useState(location.pathname.startsWith('/requests'));

  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const userName = user?.fullname || user?.name || 'Supplier';
  const userOrg = user?.company_name || user?.organization || 'MedEquip';
  const userInitial = (userName[0] || 'S').toUpperCase();

  const handleLogoutConfirm = async () => {
    setShowLogout(false);
    try {
      await logoutUser();
    } catch {
      // token already cleared in logoutUser's finally block
    }
    localStorage.removeItem('user');
    localStorage.removeItem('supplierId');
    toast.success('Signed out successfully');
    navigate('/login', { replace: true });
  };

  const isPathActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <>
      {showLogout && (
        <LogoutDialog
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogout(false)}
        />
      )}

      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <i className="bi bi-plus-circle-fill" />
          </div>
          <span>MediEquip</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {navItems.map((item) => {
            if (item.type === 'parent') {
              return (
                <div key={item.label}>
                  <button
                    type="button"
                    className={`nav-item nav-parent${customRequestsOpen ? ' expanded' : ''}${isPathActive('/requests') ? ' active' : ''}`}
                    onClick={() => setCustomRequestsOpen((value) => !value)}
                  >
                    <i className={`bi ${item.icon} nav-icon`} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <i className={`bi bi-chevron-right nav-chevron${customRequestsOpen ? ' open' : ''}`} />
                  </button>
                  {customRequestsOpen && (
                    <div className="nav-children">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={({ isActive }) => `nav-child${isActive ? ' active' : ''}`}
                          onClick={onClose}
                        >
                          <span className="nav-child-dot" />
                          <span>{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                onClick={onClose}
              >
                <i className={`bi ${item.icon} nav-icon`} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="nav-section-label" style={{ marginTop: 12 }}>Account</div>
          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <i className="bi bi-gear-fill nav-icon" />
            <span>Account </span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div
            className="user-profile"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowLogout(true)}
            title="Click to sign out"
          >
            <div className="avatar">{userInitial}</div>
            <div className="user-info">
              <div className="user-name">{userName}</div>
              <div className="user-org">{userOrg}</div>
            </div>
            <i
              className="bi bi-box-arrow-right"
              style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 15, flexShrink: 0 }}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
import React, { useState } from 'react';

const adminUsers = [
  { id: 1, name: 'Dr. Alex Ray',      email: 'alex@medtech.com',    role: 'Super Admin', status: 'active',   lastLogin: 'Today, 9:14 AM',  avatar: 'AR' },
  { id: 2, name: 'Sara Kimani',       email: 'sara@medtech.com',    role: 'Manager',     status: 'active',   lastLogin: 'Today, 8:02 AM',  avatar: 'SK' },
  { id: 3, name: 'John Osei',         email: 'john@medtech.com',    role: 'Analyst',     status: 'inactive', lastLogin: 'Feb 18, 2026',    avatar: 'JO' },
  { id: 4, name: 'Mia Zhang',         email: 'mia@medtech.com',     role: 'Support',     status: 'active',   lastLogin: 'Yesterday',       avatar: 'MZ' },
  { id: 5, name: 'Carlos Mendez',     email: 'carlos@medtech.com',  role: 'Viewer',      status: 'pending',  lastLogin: 'Never',           avatar: 'CM' },
];

const activityLog = [
  { user: 'Dr. Alex Ray',  action: 'Added new product — Surgical Forceps Set',  time: '9:14 AM',  type: 'add' },
  { user: 'Sara Kimani',   action: 'Updated order #ORD-2841 to Shipped',         time: '8:45 AM',  type: 'edit' },
  { user: 'Mia Zhang',     action: 'Responded to Custom Request #CR-008',        time: '8:20 AM',  type: 'chat' },
  { user: 'Dr. Alex Ray',  action: 'Exported February sales report',             time: 'Yesterday',type: 'export' },
  { user: 'John Osei',     action: 'Deleted expired promo code SAVE20',          time: 'Feb 18',   type: 'delete' },
];

const roleColors = { 'Super Admin': 'purple', Manager: 'blue', Analyst: 'indigo', Support: 'green', Viewer: 'gray' };

const avatarColors = {
  AR: '#7c3aed', SK: '#2563eb', JO: '#16a34a', MZ: '#d97706', CM: '#dc2626',
};

const activityIcons = {
  add: { icon: 'bi-plus-circle-fill', color: '#16a34a', bg: '#f0fdf4' },
  edit: { icon: 'bi-pencil-fill', color: '#2563eb', bg: '#eff6ff' },
  chat: { icon: 'bi-chat-dots-fill', color: '#7c3aed', bg: '#f5f3ff' },
  export: { icon: 'bi-download', color: '#d97706', bg: '#fffbeb' },
  delete: { icon: 'bi-trash-fill', color: '#dc2626', bg: '#fef2f2' },
};

const systemCards = [
  { label: 'Active Users',     value: '4', icon: 'bi-people-fill',      iconBg: '#eff6ff', iconColor: '#2563eb', sub: '1 pending invite' },
  { label: 'System Uptime',    value: '99.8%', icon: 'bi-activity',     iconBg: '#f0fdf4', iconColor: '#16a34a', sub: 'Last 30 days' },
  { label: 'Total Roles',      value: '5',  icon: 'bi-shield-fill',     iconBg: '#f5f3ff', iconColor: '#7c3aed', sub: 'Super Admin to Viewer' },
  { label: 'Pending Actions',  value: '3',  icon: 'bi-exclamation-circle-fill', iconBg: '#fffbeb', iconColor: '#d97706', sub: 'Requires attention' },
];

export default function AdminPage() {
  const [search, setSearch] = useState('');
  const filtered = adminUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Admin Dashboard</h1>
          <p>Manage users, roles, and monitor system activity.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export"><i className="bi bi-download" /> Export Log</button>
          <button className="btn-add"><i className="bi bi-person-plus" /> Invite User</button>
        </div>
      </div>

      {/* System Cards */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {systemCards.map(c => (
          <div className="stat-card" key={c.label}>
            <div>
              <div className="stat-label">{c.label}</div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-meta" style={{ color: '#9ca3af' }}>{c.sub}</div>
            </div>
            <div className="stat-icon-wrap" style={{ background: c.iconBg, color: c.iconColor }}>
              <i className={`bi ${c.icon}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Users Table + Activity Log */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>

        {/* Users Table */}
        <div className="orders-card">
          <div className="orders-header">
            <span className="orders-title">Team Members</span>
            <div className="search-bar" style={{ maxWidth: 220 }}>
              <i className="bi bi-search search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ width: 34, height: 34, fontSize: 12, background: avatarColors[user.avatar] || '#6b7280' }}>
                        {user.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge`} style={{
                      background: roleColors[user.role] === 'purple' ? '#f5f3ff' :
                                  roleColors[user.role] === 'blue' ? '#eff6ff' :
                                  roleColors[user.role] === 'indigo' ? '#eef2ff' :
                                  roleColors[user.role] === 'green' ? '#f0fdf4' : '#f9fafb',
                      color: roleColors[user.role] === 'purple' ? '#7c3aed' :
                             roleColors[user.role] === 'blue' ? '#2563eb' :
                             roleColors[user.role] === 'indigo' ? '#4338ca' :
                             roleColors[user.role] === 'green' ? '#16a34a' : '#6b7280',
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.status === 'active' ? 'delivered' : user.status === 'pending' ? 'pending' : 'cancelled'}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: '#6b7280' }}>{user.lastLogin}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="action-btn"><i className="bi bi-pencil" /></button>
                      <button className="action-btn" style={{ color: '#dc2626', borderColor: '#fecaca' }}>
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Activity Log */}
        <div className="chart-card" style={{ height: 'fit-content' }}>
          <div className="chart-header">
            <span className="chart-title">Recent Activity</span>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Today</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {activityLog.map((log, i) => {
              const { icon, color, bg } = activityIcons[log.type];
              return (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                    <i className={`bi ${icon}`} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1d23', marginBottom: 2 }}>{log.user}</div>
                    <div style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.4 }}>{log.action}</div>
                    <div style={{ fontSize: 11.5, color: '#c4c9d4', marginTop: 2 }}>{log.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
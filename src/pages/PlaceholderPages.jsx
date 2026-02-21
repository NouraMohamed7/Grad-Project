import React from 'react';

function PlaceholderPage({ title, icon, description }) {
  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div className="page-title">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 400, background: 'white', borderRadius: 14, border: '1px solid #edf0f4',
      }}>
        <div style={{ fontSize: 60, marginBottom: 20, opacity: 0.18 }}>
          <i className={`bi ${icon}`} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1d23', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 14, color: '#9ca3af' }}>This page is coming soon.</div>
      </div>
    </div>
  );
}

export function PromosPage()   { return <PlaceholderPage title="Discount & Promos"  icon="bi-percent"     description="Manage discount codes and promotional campaigns." />; }
export function RequestsPage() { return <PlaceholderPage title="Custom Requests"    icon="bi-tools"       description="Handle custom product and service requests." />; }
export function ChatPage()     { return <PlaceholderPage title="Chat"               icon="bi-chat-dots"   description="Communicate with customers and your team." />; }
export function SettingsPage() { return <PlaceholderPage title="Account Settings"   icon="bi-gear"        description="Manage your account and preferences." />; }
import React from 'react';

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="search-bar">
        <i className="bi bi-search search-icon" />
        <input type="text" placeholder="Search orders, products, or customers..." />
      </div>
      <div className="topbar-actions">
        <button className="icon-btn">
          <i className="bi bi-bell" />
          <span className="notif-dot" />
        </button>
        <button className="icon-btn">
          <i className="bi bi-question-circle" />
        </button>
      </div>
    </header>
  );
}
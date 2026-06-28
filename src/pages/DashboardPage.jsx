// src/pages/DashboardPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCards from '../components/StatCards';
import SalesChart from '../components/SalesChart';
import DonutChart from '../components/DonutChart';
import RecentOrders from '../components/RecentOrders';

export default function DashboardPage() {
  const navigate = useNavigate();

  // Get supplier name from localStorage
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const supplierName = user?.fullname || user?.name || 'Supplier';

  return (
    <div className="dashboard-content">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Supplier Overview</h1>
          <p>Welcome back, {supplierName}. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="header-actions">
         
          <button className="btn-add" onClick={() => navigate('/products/create')}>
            <i className="bi bi-plus" /> Add Product
          </button>
        </div>
      </div>

      {/* Stat Cards — fetches orders, products, custom requests */}
      <StatCards />

      {/* Charts row — SalesChart & DonutChart still static for now */}
      <div className="charts-row">
        <SalesChart />
        <DonutChart />
      </div>

      {/* Recent Orders — fetches from GET /v1/order/supplier/show */}
      <RecentOrders />
    </div>
  );
}
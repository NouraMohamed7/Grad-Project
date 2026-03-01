import React from 'react';
import StatCards from '../components/StatCards';
import SalesChart from '../components/SalesChart';
import DonutChart from '../components/DonutChart';
import RecentOrders from '../components/RecentOrders';

export default function DashboardPage() {
  return (
    <div className="dashboard-content ">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Supplier Overview</h1>
          <p>Here&apos;s what&apos;s happening with your inventory and sales today.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export">
            <i className="bi bi-download" /> Export Report
          </button>
          <button className="btn-add">
            <i className="bi bi-plus" /> Add Product
          </button>
        </div>
      </div>

      <StatCards />

      <div className="charts-row">
        <SalesChart />
        <DonutChart />
      </div>

      <RecentOrders />
    </div>
  );
}
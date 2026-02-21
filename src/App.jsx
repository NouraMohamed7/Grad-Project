import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Pages
import Dashboard from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import { PromosPage, RequestsPage, ChatPage, SettingsPage } from './pages/PlaceholderPages';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/admin"     element={<AdminPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/products"  element={<ProductsPage />} />
            <Route path="/orders"    element={<OrdersPage />} />
            <Route path="/promos"    element={<PromosPage />} />
            <Route path="/requests"  element={<RequestsPage />} />
            <Route path="/chat"      element={<ChatPage />} />
            <Route path="/settings"  element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Pages
import DashboardPage     from './pages/DashboardPage';
import AnalyticsPage     from './pages/AnalyticsPage';
import ProductsPage      from './pages/ProductsPage';
import CreateProductPage from './pages/CreateProductPage';
import EditProductPage   from './pages/EditProductPage';
import OrdersPage        from './pages/OrdersPage';
import { PromosPage, RequestsPage, ChatPage, SettingsPage } from './pages/PlaceholderPages';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <Routes>
            <Route path="/"                  element={<DashboardPage />} />
            <Route path="/analytics"         element={<AnalyticsPage />} />
            <Route path="/products"          element={<ProductsPage />} />
            <Route path="/products/create"   element={<CreateProductPage />} />
            <Route path="/products/edit/:id" element={<EditProductPage />} />
            <Route path="/orders"            element={<OrdersPage />} />
            <Route path="/promos"            element={<PromosPage />} />
            <Route path="/requests"          element={<RequestsPage />} />
            <Route path="/chat"              element={<ChatPage />} />
            <Route path="/settings"          element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
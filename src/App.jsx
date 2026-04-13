// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from './pages/Login';
import Register from './pages/Register';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProductsPage from "./pages/ProductsPage";
import CreateProductPage from "./pages/CreateProductPage";
import EditProductPage from "./pages/EditProductPage";
import ProductInfoPage from "./pages/ProductInfoPage";
import ProductRejectionPage from "./pages/ProductRejectionPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from './pages/Orderdetailpage';
import {
  PromosPage,
  RequestsPage,
  ChatPage,
  SettingsPage,
} from "./pages/PlaceholderPages";

// Layout with Sidebar + Topbar
function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
      {/* Sidebar overlay for mobile */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main */}
      <div className="main-content">
        <Topbar onMenuToggle={toggleSidebar} />
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard */}
          <Route element={<DashboardLayout />}>
            <Route path="/home" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/create" element={<CreateProductPage />} />
            <Route path="/products/edit/:id" element={<EditProductPage />} />
            <Route path="/products/info/:id" element={<ProductInfoPage />} />
            <Route path="/products/rejection/:id" element={<ProductRejectionPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            <Route path="/promos" element={<PromosPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
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
import OrdersPage from "./pages/OrdersPage";
import {
  PromosPage,
  RequestsPage,
  ChatPage,
  SettingsPage,
} from "./pages/PlaceholderPages";

// Layout مع Sidebar وTopbar — للداشبورد بس
function DashboardLayout() {
  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
   

     <>
      <ToastContainer />
       <BrowserRouter>
      <Routes>

        {/* ── Auth pages: بدون Sidebar أو Topbar ── */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Dashboard pages: مع Sidebar وTopbar ── */}
        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/create" element={<CreateProductPage />} />
          <Route path="/products/edit/:id" element={<EditProductPage />} />
          <Route path="/orders" element={<OrdersPage />} />
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
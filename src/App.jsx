import OpenRequestsPage from "./pages/OpenRequestsPagee";
import MakeOfferPage from "./pages/MakeOfferPagee";
import CustomRequestsPage from "./pages/CustomRequestsPagee";
import CustomRequestOrdersPage from "./pages/CustomRequestOrdersPagee";
import RequestDetailsPage from "./pages/RequestDetailsPagee";

//chats
import ChatsPage from "./pages/Chatspage";
import ChatConversationPage from "./pages/Chatconversationpage";

// Then replace the existing /requests route with these inside <Route element={<DashboardLayout />}>:

/*
  <Route path="/requests" element={<CustomRequestsPage />} />
  <Route path="/requests/orders" element={<CustomRequestOrdersPage />} />
  <Route path="/requests/open" element={<OpenRequestsPage />} />
  <Route path="/requests/make-offer" element={<MakeOfferPage />} />
  <Route path="/requests/details/:id" element={<RequestDetailsPage />} />
  <Route path="/requests/order-details/:id" element={<RequestDetailsPage />} />
*/

// ─── Full updated App.jsx ────────────────────────────────────────────────────

import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProductsPage from "./pages/ProductsPage";
import CreateProductPage from "./pages/CreateProductPage";
import EditProductPage from "./pages/EditProductPage";
import ProductInfoPage from "./pages/ProductInfoPage";
import ProductRejectionPage from "./pages/ProductRejectionPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/Orderdetailpage";
import { PromosPage, ChatPage, SettingsPage } from "./pages/PlaceholderPages";

import OpenRequestsPagee from "./pages/OpenRequestsPagee";
import MakeOfferPagee from "./pages/MakeOfferPagee";
import CustomRequestsPagee from "./pages/CustomRequestsPagee";
import CustomRequestOrdersPagee from "./pages/CustomRequestOrdersPagee";
import RequestDetailsPagee from "./pages/RequestDetailsPagee";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((o) => !o);

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
      <div
        className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
        onClick={closeSidebar}
      />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
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
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<DashboardLayout />}>
            <Route path="/home" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/create" element={<CreateProductPage />} />
            <Route path="/products/edit/:id" element={<EditProductPage />} />
            <Route path="/products/info/:id" element={<ProductInfoPage />} />
            <Route
              path="/products/rejection/:id"
              element={<ProductRejectionPage />}
            />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            <Route path="/promos" element={<PromosPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Custom Requests */}
            <Route path="/requests" element={<CustomRequestsPagee />} />
            <Route
              path="/requests/orders"
              element={<CustomRequestOrdersPagee />}
            />
            <Route path="/requests/open" element={<OpenRequestsPagee />} />
            <Route path="/requests/make-offer" element={<MakeOfferPagee />} />
            <Route
              path="/requests/details/:id"
              element={<RequestDetailsPagee />}
            />
            <Route
              path="/requests/order-details/:id"
              element={<RequestDetailsPagee />}
            />

            {/* Chats  */}

            <Route path="/chat" element={<ChatsPage />} />
            <Route path="/chat/:chatId" element={<ChatConversationPage />} />
            <Route path="/chat/new" element={<ChatConversationPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}


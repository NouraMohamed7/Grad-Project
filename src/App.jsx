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

// PromosPage, ChatPage, SettingsPage are temporary placeholder pages
import { PromosPage, ChatPage, SettingsPage } from "./pages/PlaceholderPages";

// ─── Custom Requests feature ────────────────────────────────────────────────────
import OpenRequestsPage from "./pages/OpenRequestsPage";
import MakeOfferPage from "./pages/MakeOfferPage";
import CustomRequestsPage from "./pages/CustomRequestsPage";
import CustomRequestOrdersPage from "./pages/CustomRequestOrdersPage";
import RequestDetailsPage from "./pages/RequestDetailsPage";

// ─── Chat pages ───────────────────────────────────────────────────────────────
import ChatsPage from "./pages/ChatsPage";
import ChatConversationPage from "./pages/ChatConversationPage";

// ─── Auth guard component ─────────────────────────────────────────────────────
import PrivateRoute from "./components/PrivateRoute";

// ─── DashboardLayout ──────────────────────────────────────────────────────────
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

// ─── App (root component) ─────────────────────────────────────────────────────
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
          {/* ── Public routes ── */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Protected routes ── */}
          <Route element={<DashboardLayout />}>

            {/* Core pages */}
            <Route path="/home" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />

            {/* Products */}
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/create" element={<CreateProductPage />} />
            <Route path="/products/edit/:id" element={<EditProductPage />} />
            <Route path="/products/info/:id" element={<ProductInfoPage />} />
            <Route
              path="/products/*"
              element={
                <PrivateRoute>
                  <ProductsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/products/rejection/:id"
              element={<ProductRejectionPage />}
            />

            {/* Orders */}
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />

            {/* Placeholder pages */}
            <Route path="/promos" element={<PromosPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Custom Requests */}
            <Route path="/requests" element={<CustomRequestsPage />} />
            <Route
              path="/requests/orders"
              element={<CustomRequestOrdersPage />}
            />
            <Route path="/requests/open" element={<OpenRequestsPage />} />
            <Route path="/requests/make-offer" element={<MakeOfferPage />} />
            <Route
              path="/requests/details/:id"
              element={<RequestDetailsPage />}
            />
            <Route
              path="/requests/order-details/:id"
              element={<RequestDetailsPage />}
            />

            {/* Chat */}
            <Route path="/chat" element={<ChatsPage />} />
            <Route path="/chat/:chatId" element={<ChatConversationPage />} />
            <Route path="/chat/new" element={<ChatConversationPage />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
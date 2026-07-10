// src/App.jsx
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Register from './pages/Register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProductsPage from './pages/ProductsPage';
import CreateProductPage from './pages/CreateProductPage';
import EditProductPage from './pages/EditProductPage';
import ProductInfoPage from './pages/ProductInfoPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProductRejectionPage from './pages/ProductRejectionPage';
import OrdersPage from './pages/OrdersPage';
import { PromosPage, ChatPage, SettingsPage } from './pages/PlaceholderPages';
import OpenRequestsPage from './pages/OpenRequestsPage';
import MakeOfferPage from './pages/MakeOfferPage';
import CustomRequestsPage from './pages/CustomRequestsPage';
import CustomRequestOrdersPage from './pages/CustomRequestOrdersPage';
import CustomRequestOffersPage from './pages/CustomRequestOffersPage';
import RequestDetailsPage from './pages/RequestDetailsPage';
import ChatsPage from './pages/ChatsPage';
import ChatConversationPage from './pages/ChatConversationPage';
import SupplierProfilePage from './pages/SupplierProfilePage';
import PrivateRoute from './components/PrivateRoute';

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((value) => !value);

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
      <div className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={closeSidebar} />
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
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />

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
            <Route path="/products/*" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
            <Route path="/products/rejection/:id" element={<ProductRejectionPage />} />

            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />

            <Route path="/promos" element={<PromosPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<SupplierProfilePage />} />

            <Route path="/requests" element={<CustomRequestsPage />} />
            <Route path="/requests/open" element={<OpenRequestsPage />} />
            <Route path="/requests/offers" element={<CustomRequestOffersPage />} />
            <Route path="/requests/orders" element={<CustomRequestOrdersPage />} />
            <Route path="/requests/make-offer" element={<MakeOfferPage />} />
            <Route path="/requests/details/:id" element={<RequestDetailsPage />} />
            <Route path="/requests/order-details/:id" element={<RequestDetailsPage />} />

            <Route path="/chat" element={<ChatsPage />} />
            <Route path="/chat/:chatId" element={<ChatConversationPage />} />
            <Route path="/chat/new" element={<ChatConversationPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
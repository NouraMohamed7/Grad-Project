import axios from 'axios';

const BASE_URL = 'https://medconnect-one-pi.vercel.app/api/api';

const authHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ─────────────────────────────────────────────────────────────
// GET /v1/order/supplier/show
// Returns all orders for the logged-in supplier
// ─────────────────────────────────────────────────────────────
export const getSupplierOrders = async () => {
  const res = await axios.get(`${BASE_URL}/v1/order/supplier/show`, {
    headers: authHeaders(),
  });
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// GET /v1/order/supplier/show/{id}
// Returns single order details
// ─────────────────────────────────────────────────────────────
export const getSupplierOrderById = async (orderId) => {
  const res = await axios.get(`${BASE_URL}/v1/order/supplier/show/${orderId}`, {
    headers: authHeaders(),
  });
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// POST /v1/order/supplier/status/{orderId}
// Update order status (supplier only)
// Body: { status: string }
// Allowed: processing, ready
// ─────────────────────────────────────────────────────────────
export const assignOrderStatus = async (orderId, status) => {
  const res = await axios.post(
    `${BASE_URL}/v1/order/supplier/status/${orderId}`,
    { status },
    { headers: authHeaders() }
  );
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// POST /v1/orders/supplier/return/{orderId}
// Return rental product
// Body: { product_id: number }
// ─────────────────────────────────────────────────────────────
export const returnRentalProduct = async (orderId, productId) => {
  const res = await axios.post(
    `${BASE_URL}/v1/orders/supplier/return/${orderId}`,
    { product_id: productId },
    { headers: authHeaders() }
  );
  return res.data;
};
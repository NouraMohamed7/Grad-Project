import axios from 'axios';

const BASE_URL = 'https://med-connect-backend-ten.vercel.app/api/api';
const TOKEN_KEYS = ['token', 'supplier_token', 'doctor_token', 'admin_token'];

const getStoredToken = (preferredKey = '') => {
  const keys = [preferredKey, ...TOKEN_KEYS].filter(Boolean);
  const seen = new Set();
  for (const key of keys) {
    if (seen.has(key)) continue;
    seen.add(key);
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  return null;
};

const authHeaders = (preferredKey = 'supplier_token') => {
  const token = getStoredToken(preferredKey);
  return {
    Accept: 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getErrorMessage = (error) => {
  if (error.response?.status === 403) {
    return 'You are not authorized to access this resource.';
  }
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    'Request failed'
  );
};

export const getSupplierOrders = async (per_page = 100) => {
  try {
    const res = await axios.get(`${BASE_URL}/v1/order/supplier/show`, {
      headers: authHeaders(),
      params: { per_page },
    });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getSupplierOrderById = async (orderId) => {
  try {
    const res = await axios.get(`${BASE_URL}/v1/order/supplier/show/${orderId}`, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const assignOrderStatus = async (orderId, status) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/v1/order/supplier/status/${orderId}`,
      { status },
      { headers: authHeaders() }
    );
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const returnRentalProduct = async (orderId, productId) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/v1/orders/supplier/return/${orderId}`,
      { product_id: productId },
      { headers: authHeaders() }
    );
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
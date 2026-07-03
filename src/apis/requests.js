// src/apis/requests.js
import axios from 'axios';

const BASE_URL = 'https://medconnect-one-pi.vercel.app/api/api/v1';

const getStoredToken = (role = 'supplier') => {
  const tokenKey = role === 'doctor' ? 'doctor_token' : 'supplier_token';
  return localStorage.getItem(tokenKey) || localStorage.getItem('token');
};

const authHeaders = (role = 'supplier') => {
  const token = getStoredToken(role);
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const extractMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  if (typeof data?.message === 'string' && data.message) return data.message;
  if (typeof data?.error === 'string' && data.error) return data.error;
  if (data?.errors && typeof data.errors === 'object') {
    return Object.values(data.errors).flat().join(' | ');
  }
  return error?.message || 'Request failed';
};

export const getErrorMessage = (error) => extractMessage(error);

// ✅ CONFIRMED via Postman docs: GET /v1/customRequest/supplier/show
// Supplier's view of all open custom requests from doctors
export const getOpenRequests = async (page = 1, perPage = 15) => {
  const response = await axios.get(`${BASE_URL}/customRequest/supplier/show`, {
    headers: authHeaders('supplier'),
    params: { page, per_page: perPage },
  });
  return response.data;
};

// ✅ CONFIRMED via Postman docs (July 2026):
// POST /v1/offerRequest/create/{customRequestId}
// The customRequestId goes in the URL path (not in request body).
// Body contains only: price, delivery_days, notes
export const createOffer = async (customRequestId, { price, delivery_days, notes }) => {
  const response = await axios.post(
    `${BASE_URL}/offerRequest/create/${customRequestId}`,
    {
      price: Number(price),
      delivery_days: Number(delivery_days),
      notes: notes?.trim() || '',
    },
    { headers: authHeaders('supplier') }
  );
  return response.data;
};

// ✅ CONFIRMED via Postman docs: GET /v1/offerRequest/supplier/show/order
// (list all orders without id segment). This is the "list all" sibling,
// following the same pattern as product/doctor/show vs product/doctor/show/{id}.
export const getSupplierOfferOrders = async (page = 1, perPage = 15) => {
  const response = await axios.get(`${BASE_URL}/offerRequest/supplier/show/order`, {
    headers: authHeaders('supplier'),
    params: { page, per_page: perPage },
  });
  return response.data;
};

// ✅ CONFIRMED via Postman docs: GET /v1/offerRequest/supplier/show/order/{id}
// Returns details of a specific order for the supplier.
export const getSupplierOrderById = async (orderId) => {
  const response = await axios.get(`${BASE_URL}/offerRequest/supplier/show/order/${orderId}`, {
    headers: authHeaders('supplier'),
  });
  return response.data;
};

// ✅ CONFIRMED via Postman docs: GET /v1/offerRequest/supplier/show
// Supplier's own submitted offers (list form).
export const getSupplierOffers = async (page = 1, perPage = 15) => {
  const response = await axios.get(`${BASE_URL}/offerRequest/supplier/show`, {
    headers: authHeaders('supplier'),
    params: { page, per_page: perPage },
  });
  return response.data;
};

// ✅ CONFIRMED via Postman docs: GET /v1/customRequest/doctor/show
// Doctor's custom requests (can filter by status).
export const getDoctorCustomRequests = async (page = 1, perPage = 15, status = '') => {
  const params = { page, per_page: perPage };
  if (status) params.status = status;
  const response = await axios.get(`${BASE_URL}/customRequest/doctor/show`, {
    headers: authHeaders('doctor'),
    params,
  });
  return response.data;
};

// ✅ CONFIRMED via Postman docs: GET /v1/offerRequest/doctor/show/{customRequestId}
// Doctor's view of all offers received for a specific custom request.
export const getDoctorOffersForRequest = async (customRequestId) => {
  const response = await axios.get(`${BASE_URL}/offerRequest/doctor/show/${customRequestId}`, {
    headers: authHeaders('doctor'),
  });
  return response.data;
};

// ✅ CONFIRMED via Postman docs: POST /v1/offerRequest/doctor/response/{offerRequestId}
// Body: { response: "accepted" | "rejected" }
export const respondToOffer = async (offerRequestId, responseValue) => {
  const response = await axios.post(
    `${BASE_URL}/offerRequest/doctor/response/${offerRequestId}`,
    { response: responseValue },
    { headers: authHeaders('doctor') }
  );
  return response.data;
};

// ✅ CONFIRMED via Postman docs: DELETE /v1/customRequest/delete/{id}
// Doctor only. Deletes a custom request.
export const deleteCustomRequest = async (id) => {
  const response = await axios.delete(`${BASE_URL}/customRequest/delete/${id}`, {
    headers: authHeaders('doctor'),
  });
  return response.data;
};

// ✅ CONFIRMED via Postman docs: POST /v1/customRequest/cancel/{id}
// Doctor only. Cancels a custom request.
// Note: No supplier-facing cancel endpoint exists — used only for doctor-side flow.
export const cancelCustomRequest = async (id) => {
  const response = await axios.post(`${BASE_URL}/customRequest/cancel/${id}`, {}, {
    headers: authHeaders('doctor'),
  });
  return response.data;
};

// ✅ CONFIRMED via Postman docs ("assignOrder" entry):
// POST /v1/offerRequest/supplier/order/status/{id}
// Body: { status }
// The order id goes in the URL path, not in the body.
export const updateOfferOrderStatus = async (orderId, status) => {
  const response = await axios.post(
    `${BASE_URL}/offerRequest/supplier/order/status/${orderId}`,
    { status },
    { headers: authHeaders('supplier') }
  );
  return response.data;
};
// src/apis/offerRequests.js
import axios from 'axios';

const BASE_URL = 'https://medconnect-one-pi.vercel.app/api/api';

const authHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ─────────────────────────────────────────────
// OPEN REQUESTS  →  OpenRequestsPage (Supplier view)
// GET /v1/customRequest/supplier/show?per_page=15&page=1&status=open
// Response: { success, message, data: [...], last_page, per_page, total }
// Each item: { id, doctor_id, additionalDetails, budget, item[], type, expires_at,
//              rent_start_date, rent_end_date, status, created_at, updated_at }
// ─────────────────────────────────────────────
export const getOpenRequests = async (page = 1, perPage = 15, status = 'open') => {
  const res = await axios.get(`${BASE_URL}/v1/customRequest/supplier/show`, {
    headers: authHeaders(),
    params: { page, per_page: perPage, status },
  });
  return res.data; // { success, data: [], last_page, per_page, total }
};

// ─────────────────────────────────────────────
// CREATE OFFER  →  MakeOfferPage
// POST /v1/offerRequest/create/{customRequestId}
// Body: { price, delivery_days, notes }
// ─────────────────────────────────────────────
export const createOffer = async (customRequestId, { price, delivery_days, notes }) => {
  const res = await axios.post(
    `${BASE_URL}/v1/offerRequest/create/${customRequestId}`,
    { price, delivery_days, notes },
    { headers: authHeaders() }
  );
  return res.data;
};

// ─────────────────────────────────────────────
// ALL ORDERS  →  CustomRequestOrdersPage
// GET /v1/offerRequest/supplier/show/order
// Response: { success, message, data: [{ id, status, request_id, supplier_id, custom_request: { doctor: { all_user: { email, fullname } } } }], last_page, per_page, total }
// ─────────────────────────────────────────────
export const getSupplierOfferOrders = async (page = 1, perPage = 15) => {
  const res = await axios.get(`${BASE_URL}/v1/offerRequest/supplier/show/order`, {
    headers: authHeaders(),
    params: { page, per_page: perPage },
  });
  return res.data;
};

// ─────────────────────────────────────────────
// ORDER BY ID  →  RequestDetailsPage (supplier order detail)
// GET /v1/offerRequest/supplier/show/order/{id}
// Response: { success, message, data: [{ id, request_id, supplier_id, price, delivery_days,
//   notes, status, created_at, updated_at, custom_request: { id, doctor_id, item[], type,
//   budget, additionalDetails, expires_at, rent_start_date, rent_end_date, status,
//   doctor: { all_user: { email, fullname, address } } } }] }
// ─────────────────────────────────────────────
export const getSupplierOrderById = async (orderId) => {
  const res = await axios.get(`${BASE_URL}/v1/offerRequest/supplier/show/order/${orderId}`, {
    headers: authHeaders(),
  });
  return res.data;
};

// ─────────────────────────────────────────────
// SHOW OPEN OFFER REQUESTS  (supplier's sent offers)
// GET /v1/offerRequest/supplier/show
// Response: { success, message, data: [{ id, request_id, supplier_id, price, delivery_days, notes, status }], last_page, per_page, total }
// ─────────────────────────────────────────────
export const getSupplierOffers = async (page = 1, perPage = 15) => {
  const res = await axios.get(`${BASE_URL}/v1/offerRequest/supplier/show`, {
    headers: authHeaders(),
    params: { page, per_page: perPage },
  });
  return res.data;
};

// ─────────────────────────────────────────────
// DOCTOR: Show own custom requests
// GET /v1/customRequest/doctor/show?page=1&per_page=15&status=open
// ─────────────────────────────────────────────
export const getDoctorCustomRequests = async (page = 1, perPage = 15, status = '') => {
  const params = { page, per_page: perPage };
  if (status) params.status = status;
  const res = await axios.get(`${BASE_URL}/v1/customRequest/doctor/show`, {
    headers: authHeaders(),
    params,
  });
  return res.data;
};

// ─────────────────────────────────────────────
// DOCTOR: Show offers for a specific custom request
// GET /v1/offerRequest/doctor/show/{customRequestId}
// Response: { success, message, data: [{ id, request_id, supplier_id, price, delivery_days,
//   notes, status, supplier: { id, company_name, company_image_url } }] }
// ─────────────────────────────────────────────
export const getDoctorOffersForRequest = async (customRequestId) => {
  const res = await axios.get(`${BASE_URL}/v1/offerRequest/doctor/show/${customRequestId}`, {
    headers: authHeaders(),
  });
  return res.data;
};

// ─────────────────────────────────────────────
// DOCTOR: Accept or reject an offer
// POST /v1/offerRequest/doctor/response/{offerRequestId}
// Body: { response: "accepted" | "rejected" }
// ─────────────────────────────────────────────
export const respondToOffer = async (offerRequestId, response) => {
  const res = await axios.post(
    `${BASE_URL}/v1/offerRequest/doctor/response/${offerRequestId}`,
    { response },
    { headers: authHeaders() }
  );
  return res.data;
};

// ─────────────────────────────────────────────
// DOCTOR: Delete a custom request
// DELETE /v1/customRequest/delete/{id}
// ─────────────────────────────────────────────
export const deleteCustomRequest = async (id) => {
  const res = await axios.delete(`${BASE_URL}/v1/customRequest/delete/${id}`, {
    headers: authHeaders(),
  });
  return res.data;
};
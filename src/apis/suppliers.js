// src/apis/supplier.js
import axios from 'axios';

const BASE_URL = 'https://medconnect-one-pi.vercel.app/api/api';

const authHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ─────────────────────────────────────────────────────────────
// GET supplier profile via their own products (first product's supplier_id)
// Used to resolve the logged-in supplier's ID after login
// GET /v1/product/supplier-profile/show/{id}  ← called with page=1&per_page=1
// We pass supplierId stored in localStorage; if missing we can't resolve it here.
// The login page should save supplier.id to localStorage as 'supplierId'
// ─────────────────────────────────────────────────────────────
export const getSupplierProfile = async (supplierId) => {
  const res = await axios.get(
    `${BASE_URL}/v1/product/supplier-profile/show/${supplierId}`,
    {
      headers: authHeaders(),
      params: { page: 1, per_page: 1 },
    }
  );
  return res.data;
};
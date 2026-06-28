import axios from "axios";

const BASE_URL = "https://medconnect-one-pi.vercel.app/api/api";

// ─── Auth Helper ─────────────────────────────────────────────
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Supplier Login ──────────────────────────────────────────
export const supplierLogin = async (email, password) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/v1/supplier/login`,
      { email, password, role: "supplier" },
      { headers: { Accept: "application/json" } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ─── Supplier Register ───────────────────────────────────────
export const supplierRegister = async (formData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/v1/supplier/register`,
      formData,
      { headers: { Accept: "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Register Error:", error);
    throw error.response?.data || error;
  }
};

// ─── Logout ──────────────────────────────────────────────────
export const logoutUser = async () => {
  try {
    const response = await axios.post(
      `${BASE_URL}/v1/logout`,
      {},
      {
        headers: {
          Accept: "application/json",
          ...getAuthHeader(),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  } finally {
    localStorage.removeItem("token");
  }
};
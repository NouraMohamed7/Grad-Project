import axios from "axios";

const BASE_URL = "https://med-connect-backend-ten.vercel.app/api/api";
const TOKEN_KEYS = ["token", "supplier_token", "doctor_token", "admin_token"];

export const getStoredToken = (preferredKey = "") => {
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

const findTokenInPayload = (payload) => {
  const stack = [payload];

  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;

    if (typeof current.token === "string" && current.token) return current.token;
    if (typeof current.access_token === "string" && current.access_token) return current.access_token;
    if (typeof current.accessToken === "string" && current.accessToken) return current.accessToken;
    if (typeof current.supplier_token === "string" && current.supplier_token) return current.supplier_token;
    if (typeof current.doctor_token === "string" && current.doctor_token) return current.doctor_token;
    if (typeof current.admin_token === "string" && current.admin_token) return current.admin_token;

    stack.push(...Object.values(current));
  }

  return null;
};

export const persistAuthState = (payload = {}) => {
  const token = findTokenInPayload(payload);
  const user = payload?.user || payload?.data?.user || payload?.data || null;

  if (token) {
    localStorage.setItem("token", token);
    localStorage.setItem("supplier_token", token);
    localStorage.setItem("doctor_token", token);
    localStorage.setItem("admin_token", token);
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  return { token, user };
};

const getAuthHeader = (preferredKey = "") => {
  const token = getStoredToken(preferredKey);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const supplierLogin = async (email, password) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/v1/supplier/login`,
      { email, password, role: "supplier" },
      { headers: { Accept: "application/json" } }
    );

    persistAuthState(response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const doctorRegister = async (formData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/v1/doctor/register`,
      formData,
      { headers: { Accept: "application/json" } }
    );
    persistAuthState(response.data);
    return response.data;
  } catch (error) {
    console.error("Doctor register error:", error);
    throw error.response?.data || error;
  }
};

export const supplierRegister = async (formData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/v1/supplier/register`,
      formData,
      { headers: { Accept: "application/json" } }
    );
    persistAuthState(response.data);
    return response.data;
  } catch (error) {
    console.error("Register Error:", error);
    throw error.response?.data || error;
  }
};

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
    TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem("user");
    localStorage.removeItem("supplierId");
  }
};

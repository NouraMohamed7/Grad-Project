// src/apis/login.js
import axios from "axios";

const BASE_URL = "https://medconnect-one-pi.vercel.app/api/api";

// Supplier Login
export const supplierLogin = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/v1/supplier/login`, {
      email,
      password,
      role: "supplier",
    }, {
      headers: {
        Accept: "application/json",
      },
    });

    return response.data;
    

  } catch (error) {
    // رجّع رسالة الباك
    throw error.response?.data || error;
  }
};
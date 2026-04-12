// src/apis/logout.js
import axios from "axios";

const BASE_URL = "https://medconnect-one-pi.vercel.app/api/api";

export const logoutUser = async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      `${BASE_URL}/v1/logout`,
      {},
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  } finally {
    // امسح التوكن دايمًا حتى لو الباك رجع error
    localStorage.removeItem("token");
  }
};
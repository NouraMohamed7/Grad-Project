import axios from "axios";

const BASE_URL = "https://medconnect-one-pi.vercel.app/api/api";

// Supplier Register
export const supplierRegister = async (formData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/v1/supplier/register`,
      formData,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Register Error:", error);
    throw error.response?.data || error;
  }
};
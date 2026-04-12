// src/apis/Products.js
import axios from "axios";

const BASE_URL = "https://medconnect-one-pi.vercel.app/api/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ─────────────────────────────────────────────────────────────────────
// GET /v1/product/show  →  all products with filter, sort, pagination
// ─────────────────────────────────────────────────────────────────────
export const getAllProducts = async ({
  page = 1,
  per_page = 15,
  sort_by = "id",
  sort_order = "asc",
  filter_by = null,
  filter_value = null,
} = {}) => {
  const params = { page, per_page, sort_by, sort_order };
  if (filter_by && filter_value) {
    params.filter_by = filter_by;
    params.filter_value = filter_value;
  }

  const response = await axios.get(`${BASE_URL}/v1/product/show`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────
// GET /v1/product/show/{id}  →  single product by id (admin endpoint)
// ─────────────────────────────────────────────────────────────────────
export const getProductById = async (productId) => {
  const response = await axios.get(
    `${BASE_URL}/v1/product/show/${productId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────
// GET /v1/product/supplier-profile/show/{supplier_id}
// ─────────────────────────────────────────────────────────────────────
export const getSupplierProducts = async (supplierId, page = 1, perPage = 15) => {
  const response = await axios.get(
    `${BASE_URL}/v1/product/supplier-profile/show/${supplierId}`,
    {
      headers: getAuthHeaders(),
      params: { page, per_page: perPage },
    }
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────
// POST /v1/product/create  →  create new product (multipart/form-data)
// Required: name, price, stock, category_id
// Optional: setup_duration, description, is_rentable, warranty,
//           configuration, price_daily, minimum_rental_days,
//           maximum_rental_days, available_units, preparation_duration,
//           restock_date, specification[], images[]
// ─────────────────────────────────────────────────────────────────────
export const createProduct = async (productData) => {
  const formData = new FormData();

  const scalarFields = [
    "name",
    "price",
    "stock",
    "category_id",
    "description",
    "is_rentable",
    "warranty",
    "configuration",
    "restock_date",
    // rental fields
    "price_daily",
    "minimum_rental_days",
    "maximum_rental_days",
    "available_units",
    "preparation_duration",
  ];

  scalarFields.forEach((field) => {
    const val = productData[field];
    if (val !== undefined && val !== null && val !== "") {
      formData.append(field, val);
    }
  });

  // setup_duration is always required — default to "0" if missing
  formData.append(
    "setup_duration",
    productData.setup_duration !== undefined &&
      productData.setup_duration !== null &&
      productData.setup_duration !== ""
      ? productData.setup_duration
      : "0"
  );

  // Specifications array: specification[0][key] = value
  if (productData.specifications && productData.specifications.length > 0) {
    productData.specifications.forEach((spec, index) => {
      Object.entries(spec).forEach(([key, value]) => {
        formData.append(`specification[${index}][${key}]`, value);
      });
    });
  }

  // Images
  if (productData.images && productData.images.length > 0) {
    productData.images.forEach((img) => formData.append("images[]", img));
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/v1/product/create`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.data?.errors) {
      const message = Object.values(error.response.data.errors)
        .flat()
        .join(" | ");
      throw new Error(message);
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || "Failed to create product");
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /v1/product/update/{id}  →  update product (multipart/form-data)
// Only sends changed fields + new images
// ─────────────────────────────────────────────────────────────────────
export const updateProduct = async (productId, productData, originalData = {}) => {
  const formData = new FormData();

  const scalarFields = [
    "name",
    "price",
    "stock",
    "setup_duration",
    "category_id",
    "description",
    "is_rentable",
    "warranty",
    "configuration",
    "restock_date",
    // rental fields
    "price_daily",
    "minimum_rental_days",
    "maximum_rental_days",
    "available_units",
    "preparation_duration",
  ];

  // Only send fields that have actually changed
  scalarFields.forEach((field) => {
    const newVal = productData[field];
    const oldVal = originalData?.[field];

    // Skip unchanged fields (but always include if no originalData provided)
    if (originalData && newVal === oldVal) return;

    if (newVal !== undefined && newVal !== null && newVal !== "") {
      formData.append(field, newVal);
    }
  });

  // Specifications array
  if (productData.specifications && productData.specifications.length > 0) {
    productData.specifications.forEach((spec, index) => {
      Object.entries(spec).forEach(([key, value]) => {
        formData.append(`specification[${index}][${key}]`, value);
      });
    });
  }

  // New images to add
  if (productData.images && productData.images.length > 0) {
    productData.images.forEach((img) => formData.append("images[]", img));
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/v1/product/update/${productId}`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.data?.errors) {
      const message = Object.values(error.response.data.errors)
        .flat()
        .join(" | ");
      throw new Error(message);
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to update product");
  }
};

// ─────────────────────────────────────────────────────────────────────
// DELETE /v1/product/delete/{id}
// ─────────────────────────────────────────────────────────────────────
export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/v1/product/delete/${productId}`,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    // Log full error for debugging
    console.error("Delete error:", error.response?.status, error.response?.data);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error(`Failed to delete product (${error.response?.status || 'unknown error'})`);
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /v1/product/archive/{id}  →  archive / unarchive
// body: { is_archive: 0 | 1 }
// ─────────────────────────────────────────────────────────────────────
export const updateProductArchive = async (productId, isArchive) => {
  const response = await axios.post(
    `${BASE_URL}/v1/product/archive/${productId}`,
    { is_archive: isArchive },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────
// POST /v1/product/status/{id}  →  admin: update product status
// body: { status: "create_accepted" | "create_rejected" | ... }
// ─────────────────────────────────────────────────────────────────────
export const updateProductStatus = async (productId, status) => {
  const response = await axios.post(
    `${BASE_URL}/v1/product/status/${productId}`,
    { status },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────
// GET /v1/category/show  →  all categories (for dropdowns)
// ─────────────────────────────────────────────────────────────────────
export const getCategories = async (page = 1, perPage = 100) => {
  const response = await axios.get(`${BASE_URL}/v1/category/show`, {
    headers: getAuthHeaders(),
    params: { page, per_page: perPage },
  });
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────
// GET /v1/category/show/{id}  →  single category
// ─────────────────────────────────────────────────────────────────────
export const getCategoryById = async (categoryId) => {
  const response = await axios.get(
    `${BASE_URL}/v1/category/show/${categoryId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};
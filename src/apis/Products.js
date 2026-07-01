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
// GET /v1/product/show
// Supplier: returns all products belonging to the logged-in supplier
// Supports: page, per_page, sort_by, sort_order, filter_by, filter_value
// ─────────────────────────────────────────────────────────────────────
export const getAllProducts = async ({
  page = 1,
  per_page = 8,
  sort_by = "id",
  sort_order = "asc",
  filter_by = null,
  filter_value = null,
} = {}) => {
  const params = { page, per_page, sort_by, sort_order };
  if (filter_by && filter_value) {
    params.filter_by    = filter_by;
    params.filter_value = filter_value;
  }

  const response = await axios.get(`${BASE_URL}/v1/product/show`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────
// GET /v1/product/show/{id}
// Returns a single product by ID for the supplier
// Response: { success, message, data: { id, name, status, image[], ... } }
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
// Returns products of a specific supplier (used in public supplier profile)
// ─────────────────────────────────────────────────────────────────────
export const getSupplierProducts = async (supplierId, page = 1, perPage = 8) => {
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
// POST /v1/product/create
// Creates a new product (multipart/form-data)
// Required: name, price, stock, category_id
// Optional: setup_duration, description, is_rentable, warranty,
//           configuration, price_daily, minimum_rental_days,
//           maximum_rental_days, available_units, preparation_duration,
//           restock_date, specification[], images[]
// ─────────────────────────────────────────────────────────────────────
export const createProduct = async (productData) => {
  const formData = new FormData();

  const scalarFields = [
    "name", "price", "stock", "category_id", "description",
    "is_rentable", "warranty", "configuration", "restock_date",
    "price_daily", "minimum_rental_days", "maximum_rental_days",
    "available_units", "preparation_duration",
  ];

  scalarFields.forEach((field) => {
    const val = productData[field];
    if (val !== undefined && val !== null && val !== "") {
      formData.append(field, val);
    }
  });

  // setup_duration — default "0" if missing
  formData.append(
    "setup_duration",
    productData.setup_duration !== undefined &&
    productData.setup_duration !== null &&
    productData.setup_duration !== ""
      ? productData.setup_duration
      : "0"
  );

  // Specifications: specification[0][key] = value
  if (productData.specification && productData.specification.length > 0) {
    productData.specification.forEach((spec, index) => {
      Object.entries(spec).forEach(([key, value]) => {
        formData.append(`specification[${index}][${key}]`, value);
      });
    });
  } else {
    // API requires at least one specification
    formData.append("specification[0][type]", "Standard");
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
      throw new Error(Object.values(error.response.data.errors).flat().join(" | "));
    }
    throw new Error(error.response?.data?.message || error.message || "Failed to create product");
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /v1/product/update/{id}
// Updates a product (multipart/form-data)
//
// IMPORTANT: This function is now "diff-only" — it appends ONLY the keys
// that exist on `productData`. It does NOT assume a fixed list of fields
// and does NOT resend the whole form. The caller (EditProductPage) is
// responsible for computing which fields actually changed and passing
// just those in `productData`.
//
// Special keys handled separately:
//   - images:        array of File objects -> appended as images[]
//   - specification: array of { key: value } objects -> specification[i][key]
//   - is_rentable:   normalized to "0" / "1" if present
// Everything else in productData is sent as a plain scalar field.
// ─────────────────────────────────────────────────────────────────────
export const updateProduct = async (productId, productData) => {
  const formData = new FormData();

  const { images, specification, is_rentable, ...rest } = productData;

  // Only the fields actually passed in (i.e. the ones that changed)
  Object.entries(rest).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      formData.append(key, val);
    }
  });

  // is_rentable must be 0 or 1 (not true/false string) — only sent if provided
  if (is_rentable !== undefined) {
    formData.append("is_rentable", is_rentable ? "1" : "0");
  }

  // Specifications — only sent if provided
  if (specification && specification.length > 0) {
    specification.forEach((spec, index) => {
      Object.entries(spec).forEach(([key, value]) => {
        formData.append(`specification[${index}][${key}]`, value);
      });
    });
  }

  // New images — only sent if the user actually uploaded new ones
  if (images && images.length > 0) {
    images.forEach((img) => formData.append("images[]", img));
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
    // Show the real server error message
    const serverMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      (error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(" | ")
        : null);

    throw new Error(serverMsg || `HTTP ${error.response?.status} — Failed to update product`);
  }
};

// ─────────────────────────────────────────────────────────────────────
// DELETE /v1/product/delete/{id}
// ─────────────────────────────────────────────────────────────────────
export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/v1/product/delete/${productId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      `HTTP ${error.response?.status} error`
    );
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /v1/product/archive/{id}
// Body: { is_archive: 0 | 1 }
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
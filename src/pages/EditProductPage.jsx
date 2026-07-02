// src/pages/EditProductPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getProductById, updateProduct, getCategories } from "../apis/products";

const FieldSkeleton = ({ wide }) => (
  <div
    style={{
      height: 40,
      borderRadius: 8,
      background: "#f0f2f5",
      width: wide ? "100%" : "60%",
      animation: "pulse 1.5s ease-in-out infinite",
      marginBottom: 16,
    }}
  />
);

export default function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [originalForm, setOriginalForm] = useState({});
  const [errors, setErrors] = useState({});
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [productStatus, setProductStatus] = useState(null);
  const [specFields, setSpecFields] = useState([{ key: "", value: "" }]);
  const isPending =
    productStatus === "create_pending" || productStatus === "edit_pending";

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    price: "",
    stock: "",
    description: "",
    is_rentable: false,
    price_daily: "",
    minimum_rental_days: "",
    maximum_rental_days: "",
    available_units: "",
    preparation_duration: "",
    setup_duration: "",
    warranty: "",
    configuration: "",
    restock_date: "",
  });

  // ── Load product + categories ────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    Promise.all([getProductById(id), getCategories()])
      .then(([productRes, catRes]) => {
        setCategories(catRes.data || []);

        // API: { success, message, data: { ... } }
        const p = productRes.data || productRes;
        const rental = p.rental_details || {};

        setExistingImages(p.image || []);
        setProductStatus(p.status || null);

        // Load existing specification into editable fields
        if (p.specification && p.specification.length > 0) {
          setSpecFields(
            p.specification.map((spec) => {
              const [key, value] = Object.entries(spec)[0] || ["", ""];
              return { key, value: String(value ?? "") };
            }),
          );
        }

        const productData = {
          name: p.name || "",
          category_id: p.category_id || "",
          price: p.price || "",
          stock: p.stock ?? "",
          description: p.description || "",
          is_rentable: !!p.is_rentable,
          setup_duration: p.setup_duration || "",
          warranty: p.warranty || "",
          configuration: p.configuration || "",
          restock_date: p.restock_date ? p.restock_date.slice(0, 10) : '',
          // rental fields — from rental_details object if present
          price_daily: rental.price_daily || p.price_daily || "",
          minimum_rental_days:
            rental.minimum_rental_days || p.minimum_rental_days || "",
          maximum_rental_days:
            rental.maximum_rental_days || p.maximum_rental_days || "",
          available_units: rental.available_units ?? p.available_units ?? "",
          preparation_duration:
            rental.preparation_duration || p.preparation_duration || "",
        };

        setForm(productData);
        setOriginalForm(productData);
        setOriginalForm({
          ...productData,
          __specSnapshot: (p.specification || []).map((spec) => {
            const [key, value] = Object.entries(spec)[0] || ["", ""];
            return { [key]: String(value ?? "") };
          }),
        });
      })
      .catch((err) => {
        toast.error(err?.message || "Failed to load product");
        navigate("/products");
      })
      .finally(() => setPageLoading(false));
  }, [id]);

  // ── Field change ─────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
  };

  // ── Specification handling ───────────────────────────────────────────
  const addSpecField = () => {
    setSpecFields((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeSpecField = (index) => {
    setSpecFields((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSpecField = (index, field, val) => {
    setSpecFields((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: val } : s)),
    );
  };

  // ── Image handling ───────────────────────────────────────────────────
  const addImages = (files) => {
    const validFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (!validFiles.length) {
      toast.error("Please upload valid image files");
      return;
    }
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setNewPreviews((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
    setNewImages((prev) => [...prev, ...validFiles]);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Validation ───────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Product name is required";
    if (!form.price || parseFloat(form.price) <= 0)
      newErrors.price = "Valid price is required";
    if (form.is_rentable) {
      if (!form.price_daily || parseFloat(form.price_daily) <= 0)
        newErrors.price_daily = "Daily rate is required";
      if (!form.minimum_rental_days)
        newErrors.minimum_rental_days = "Minimum rental days required";
      if (!form.maximum_rental_days)
        newErrors.maximum_rental_days = "Maximum rental days required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Build a diff of only the fields that actually changed ────────────
  // This is the key change: instead of resending the whole form (name,
  // price, description, ...) every time, we only send the field(s) the
  // user actually touched — e.g. edit just "stock" -> only "stock" gets
  // sent to the API.
  const getChangedFields = () => {
    const changed = {};

    Object.keys(form).forEach((key) => {
      if (key === "is_rentable") {
        const newVal = form[key] ? 1 : 0;
        const oldVal = originalForm[key] ? 1 : 0;
        if (newVal !== oldVal) changed.is_rentable = newVal;
        return;
      }
      if (String(form[key]) !== String(originalForm[key])) {
        changed[key] = form[key];
      }
    });

    return changed;
  };

  // ── Submit ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fix the highlighted errors");
      return;
    }

    const changedFields = getChangedFields();

    if (Object.keys(changedFields).length === 0 && newImages.length === 0) {
      return toast.info("No changes detected");
    }

    // Only attach images if the user actually added new ones
    if (newImages.length > 0) {
      changedFields.images = newImages;
    }

    setSubmitting(true);
    try {
      // Send ONLY what changed — not the full form
      await updateProduct(id, changedFields);
      toast.success("Product updated successfully!");
      navigate("/products");
    } catch (err) {
      // Show the real error from the server (e.g. "edit_pending" state error)
      toast.error(err?.message || "Failed to update product", {
        autoClose: 6000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const ErrorField = ({ name }) =>
    errors[name] ? (
      <span
        style={{
          color: "#dc2626",
          fontSize: 12,
          marginTop: 4,
          display: "block",
        }}
      >
        <i className="bi bi-exclamation-circle" /> {errors[name]}
      </span>
    ) : null;

  return (
    <div className="dashboard-content">
      {/* Breadcrumb */}
      <div className="breadcrumb-row">
        <span className="bc-link" onClick={() => navigate("/")}>
          <i className="bi bi-grid-fill" /> Dashboard
        </span>
        <i className="bi bi-chevron-right bc-sep" />
        <span className="bc-link" onClick={() => navigate("/products")}>
          Products
        </span>
        <i className="bi bi-chevron-right bc-sep" />
        <span className="bc-current">Edit Product</span>
      </div>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-title">
          <h1>Edit Product</h1>
          {!pageLoading && (
            <p style={{ fontSize: 13, color: "#9ca3af", margin: "2px 0 0" }}>
              ID: {id}
            </p>
          )}
        </div>
        <div className="header-actions">
          <button
            className="btn-export"
            onClick={() => navigate("/products")}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="btn-add"
            onClick={handleSubmit}
            disabled={submitting || pageLoading || isPending}
          >
            {submitting ? (
              <>
                <i className="bi bi-hourglass-split" /> Updating...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-repeat" /> Update Product
              </>
            )}
          </button>
        </div>
      </div>

      <div className="form-card">
        {!pageLoading && isPending && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#fffbeb",
              border: "1.5px solid #fde68a",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              fontSize: 13,
              color: "#92400e",
            }}
          >
            <i
              className="bi bi-info-circle-fill"
              style={{ fontSize: 16, color: "#d97706", flexShrink: 0 }}
            />
            <span>
              This product is currently <strong>under admin review</strong> (
              {productStatus === "create_pending"
                ? "pending approval"
                : "pending edit approval"}
              ). You can't make changes until the review is finished.
            </span>
          </div>
        )}
        {pageLoading ? (
          <div>
            <FieldSkeleton wide />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <FieldSkeleton />
              <FieldSkeleton />
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
            <FieldSkeleton wide />
            <div
              style={{
                height: 100,
                borderRadius: 8,
                background: "#f0f2f5",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>
        ) : (
          <>
            <fieldset
              disabled={isPending}
              style={{ border: "none", padding: 0, margin: 0 }}
            >
              <div className="form-two-col">
                {/* LEFT — General Info */}
                <div>
                  <div className="section-heading">
                    <div className="section-icon blue">
                      <i className="bi bi-pencil-fill" />
                    </div>
                    General Information
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      className={`form-input ${errors.name ? "is-invalid" : ""}`}
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                    />
                    <ErrorField name="name" />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-input form-select"
                        name="category_id"
                        value={form.category_id}
                        onChange={handleChange}
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Warranty</label>
                      <input
                        className="form-input"
                        name="warranty"
                        value={form.warranty}
                        onChange={handleChange}
                        placeholder="e.g. 2 Years"
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Price (EGP) *</label>
                      <input
                        className={`form-input ${errors.price ? "is-invalid" : ""}`}
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        type="number"
                        min="0"
                      />
                      <ErrorField name="price" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Stock Quantity</label>
                      <input
                        className="form-input"
                        name="stock"
                        value={form.stock}
                        onChange={handleChange}
                        type="number"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Setup Duration</label>
                      <input
                        className="form-input"
                        name="setup_duration"
                        value={form.setup_duration}
                        onChange={handleChange}
                        placeholder="e.g. 15min"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Restock Date</label>
                      <input
                        className="form-input"
                        name="restock_date"
                        value={form.restock_date}
                        onChange={handleChange}
                        type="date"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Configuration / Box Contents
                    </label>
                    <input
                      className="form-input"
                      name="configuration"
                      value={form.configuration}
                      onChange={handleChange}
                      placeholder="e.g. 1x Device, 2x Batteries"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-input form-textarea"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={5}
                    />
                  </div>

                  {/* Specifications */}
                  <div className="form-group">
                    <label className="form-label">Specifications</label>
                    {specFields.map((spec, index) => (
                      <div
                        key={index}
                        style={{ display: "flex", gap: 8, marginBottom: 8 }}
                      >
                        <input
                          className="form-input"
                          placeholder="Key (e.g. Weight)"
                          value={spec.key}
                          onChange={(e) =>
                            updateSpecField(index, "key", e.target.value)
                          }
                          style={{ flex: 1 }}
                        />
                        <input
                          className="form-input"
                          placeholder="Value (e.g. 2kg)"
                          value={spec.value}
                          onChange={(e) =>
                            updateSpecField(index, "value", e.target.value)
                          }
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          className="action-btn prod-btn-delete"
                          onClick={() => removeSpecField(index)}
                          disabled={specFields.length === 1}
                          title="Remove"
                        >
                          <i className="bi bi-trash3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-export"
                      onClick={addSpecField}
                      style={{ marginTop: 4 }}
                    >
                      <i className="bi bi-plus" /> Add Specification
                    </button>
                  </div>
                </div>{" "}
                {/* ← هنا تقفل الـ LEFT div */}
                {/* RIGHT — Images */}
                <div>
                  {existingImages.length > 0 && (
                    <>
                      <div className="section-heading">
                        <div
                          className="section-icon blue"
                          style={{ width: 28, height: 28, fontSize: 13 }}
                        >
                          <i className="bi bi-images" />
                        </div>
                        Current Images
                      </div>
                      <div
                        className="current-images-grid"
                        style={{ marginBottom: 20 }}
                      >
                        {existingImages.map((img, i) => (
                          <div
                            key={img.id || i}
                            className="current-image-wrap"
                            style={{ background: "#f3f4f6" }}
                          >
                            {i === 0 && (
                              <span className="img-main-badge">Main</span>
                            )}
                            <img
                              src={img.image}
                              alt={`product-${i}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: 8,
                              }}
                              onError={(e) => {
                                e.target.src =
                                  "https://placehold.co/80x80?text=No+Img";
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="section-heading">
                    <div className="section-icon blue">
                      <i className="bi bi-cloud-arrow-up-fill" />
                    </div>
                    Upload New Images
                  </div>

                  <div
                    className={`dropzone ${dragOver ? "dragover" : ""}`}
                    style={{ height: 140 }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      addImages(e.dataTransfer.files);
                    }}
                    onClick={() =>
                      document.getElementById("editFileInput").click()
                    }
                  >
                    <input
                      id="editFileInput"
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => addImages(e.target.files)}
                    />
                    <div className="dropzone-inner">
                      <div className="dropzone-icon">
                        <i className="bi bi-cloud-arrow-up" />
                      </div>
                      <div className="dropzone-text">
                        <span className="dropzone-link">Browse</span> or drag
                        &amp; drop
                      </div>
                      <div className="dropzone-hint">
                        Supports: JPG, PNG, WEBP (Max 5MB)
                      </div>
                    </div>
                  </div>

                  {newPreviews.length > 0 && (
                    <div
                      className="current-images-grid"
                      style={{ marginTop: 12 }}
                    >
                      {newPreviews.map((src, i) => (
                        <div
                          key={i}
                          className="current-image-wrap"
                          style={{ background: "#f3f4f6" }}
                        >
                          <span
                            className="img-main-badge"
                            style={{ background: "#2563eb" }}
                          >
                            New
                          </span>
                          <img
                            src={src}
                            alt={`new-${i}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                          <button
                            className="img-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNewImage(i);
                            }}
                          >
                            <i className="bi bi-trash3-fill" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Rental Options */}
              <div className="rental-section">
                <div className="rental-header">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      className="section-icon blue"
                      style={{ width: 36, height: 36, fontSize: 16 }}
                    >
                      <i className="bi bi-calendar-week" />
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#1a1d23",
                        }}
                      >
                        Rental Options
                      </div>
                      <div style={{ fontSize: 12.5, color: "#9ca3af" }}>
                        Configure rental pricing and availability
                      </div>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="is_rentable"
                      checked={form.is_rentable}
                      onChange={handleChange}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                {form.is_rentable && (
                  <div className="rental-fields">
                    {[
                      {
                        label: "DAILY RATE",
                        name: "price_daily",
                        prefix: "$",
                        placeholder: "0.00",
                        error: errors.price_daily,
                      },
                      {
                        label: "MIN DAYS",
                        name: "minimum_rental_days",
                        prefix: "",
                        placeholder: "1",
                        error: errors.minimum_rental_days,
                      },
                      {
                        label: "MAX DAYS",
                        name: "maximum_rental_days",
                        prefix: "",
                        placeholder: "30",
                        error: errors.maximum_rental_days,
                      },
                      {
                        label: "AVAILABLE UNITS",
                        name: "available_units",
                        prefix: "",
                        placeholder: "0",
                      },
                      {
                        label: "PREP DURATION",
                        name: "preparation_duration",
                        prefix: "",
                        placeholder: "0min",
                      },
                    ].map((f) => (
                      <div key={f.name} className="rental-field">
                        <label className="rental-label">{f.label}</label>
                        <div className="rental-input-wrap">
                          {f.prefix && (
                            <span className="rental-prefix">{f.prefix}</span>
                          )}
                          <input
                            className={`form-input rental-input ${f.prefix ? "has-prefix" : ""} ${f.error ? "is-invalid" : ""}`}
                            name={f.name}
                            value={form[f.name]}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            type={f.prefix === "$" ? "number" : "text"}
                            min="0"
                          />
                        </div>
                        {f.error && (
                          <span
                            style={{
                              color: "#dc2626",
                              fontSize: 11,
                              marginTop: 3,
                            }}
                          >
                            {f.error}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom actions */}
              <div className="form-actions">
                <button
                  className="btn-export"
                  onClick={() => navigate("/products")}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  className="btn-add"
                  onClick={handleSubmit}
                  disabled={submitting || isPending}
                >
                  {submitting ? (
                    <>
                      <i className="bi bi-hourglass-split" /> Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-repeat" /> Update Product
                    </>
                  )}
                </button>
              </div>
            </fieldset>
          </>
        )}
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}

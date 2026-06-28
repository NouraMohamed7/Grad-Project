import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supplierRegister } from "../apis/auth";


// ─── Static data ──────────────────────────────────────────────────────────────
const EGYPT_GOVERNORATES = [
  "Cairo", "Alexandria", "Giza", "Sharkia", "Dakahlia", "Beheira",
  "Qalyubia", "Monufia", "Gharbia", "Kafr el-Sheikh", "Damietta",
  "Port Said", "Ismailia", "Suez", "North Sinai", "South Sinai",
  "Faiyum", "Beni Suef", "Minya", "Asyut", "Sohag", "Qena",
  "Luxor", "Aswan", "Red Sea", "New Valley", "Matruh",
];

// ─── ErrorField component ─────────────────────────────────────────────────────
// Reusable inline error message shown directly under each input.
const ErrorField = ({ msg }) => {
  if (!msg) return null;
  return (
    <div className="field-error" style={{
      color: "#dc2626",
      fontSize: 13,
      marginTop: 6,
      display: "flex",
      alignItems: "center",
      gap: 6,
    }}>
      <svg width="14" height="14" fill="#dc2626" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      {msg}
    </div>
  );
};

// ─── Register Component ───────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();

  // ── File states ──────────────────────────────────────────────────────────
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [commercialFile, setCommercialFile] = useState(null);
  const [taxFile, setTaxFile] = useState(null);
  const [certFile, setCertFile] = useState(null);

  // ── Text field states ─────────────────────────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [certificateName, setCertificateName] = useState("");
  const [agreed, setAgreed] = useState(false);

  // ── Error states ──────────────────────────────────────────────────────────
  // Each key maps to the backend field name so we can match API errors directly.
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [loading, setLoading] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const clearError = (field) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // ── Logo handler ──────────────────────────────────────────────────────────
  const handleLogo = (e) => {
    const f = e.target.files[0];
    if (f) {
      setLogoFile(f);
      setLogoPreview(URL.createObjectURL(f));
      clearError("company_image_url");
    }
  };

  // ── Client-side validation ──────────────────────────────────────────────
  const validateClient = () => {
    const newErrors = {};

    if (!fullName.trim()) newErrors.full_name = "Full name is required.";
    else if (fullName.trim().length < 3) newErrors.full_name = "Full name must be at least 3 characters.";

    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email address.";

    if (!phone.trim()) newErrors.phone = "Phone number is required.";
    else if (!/^\+?[0-9\s\-]{7,15}$/.test(phone.replace(/\s/g, ""))) newErrors.phone = "Please enter a valid phone number.";

    if (!nationalId.trim()) newErrors.national_id = "National ID is required.";
    else if (!/^\d{14}$/.test(nationalId.trim())) newErrors.national_id = "National ID must be exactly 14 digits.";

    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters.";

    if (!companyName.trim()) newErrors.company_name = "Company name is required.";

    if (!address.trim()) newErrors.address = "Business address is required.";

    if (!governorate) newErrors.governorate = "Please select a governorate.";

    if (!logoFile) newErrors.company_image_url = "Company logo is required.";

    if (!commercialFile) newErrors.commercial_register_image = "Commercial register image is required.";

    if (!taxFile) newErrors.tax_card_image = "Tax card image is required.";

    if (!agreed) newErrors.terms = "You must agree to the Terms of Service and Privacy Policy.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Form submission handler ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark everything as touched so errors show immediately
    setTouched({
      full_name: true, email: true, phone: true, national_id: true,
      password: true, company_name: true, address: true, governorate: true,
      company_image_url: true, commercial_register_image: true,
      tax_card_image: true, certificate_name: true, terms: true,
    });

    if (loading) return;

    // Run client-side validation first
    const isValid = validateClient();
    if (!isValid) {
      toast.error("Please fix the highlighted errors before submitting.");
      return;
    }

    try {
      setLoading(true);
      setErrors({}); // clear previous API errors

      const formData = new FormData();

      formData.append("company_image_url", logoFile);
      formData.append("full_name", fullName.trim());
      formData.append("email", email.trim());
      formData.append("password", password);
      formData.append("password_confirmation", password);
      formData.append("address", address.trim());
      formData.append("governorate", governorate);
      formData.append("national_id", nationalId.trim());
      formData.append("phone", phone.trim());
      formData.append("company_name", companyName.trim());
      formData.append("commercial_register_image", commercialFile);
      formData.append("tax_card_image", taxFile);
      formData.append("certificate_name", certificateName.trim());

      if (certFile) {
        formData.append("certificate_image", certFile);
      }

      await supplierRegister(formData);

      toast.success(
        "Registration successful! Please check your email to verify your account."
      );

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Register error:", error);

      // ── Backend error handling ──────────────────────────────────────────
      // The API may return errors in different shapes. We try the most common ones.
      let apiErrors = {};
      let genericMsg = "Registration failed. Please try again.";

      if (error && typeof error === "object") {
        // Shape 1: { errors: { email: ["..."], password: ["..."] } }
        if (error.errors && typeof error.errors === "object") {
          apiErrors = Object.fromEntries(
            Object.entries(error.errors).map(([k, v]) => [
              k,
              Array.isArray(v) ? v[0] : v,
            ])
          );
        }
        // Shape 2: { message: "..." } or { error: "..." }
        else if (error.message) {
          genericMsg = error.message;
        } else if (error.error) {
          genericMsg = error.error;
        }
        // Shape 3: flat object with field keys directly
        else {
          apiErrors = Object.fromEntries(
            Object.entries(error).map(([k, v]) => [
              k,
              Array.isArray(v) ? v[0] : v,
            ])
          );
        }
      }

      if (Object.keys(apiErrors).length > 0) {
        setErrors(apiErrors);
        toast.error("Please correct the errors highlighted below.");
      } else {
        toast.error(genericMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="register-page">
      <div className="top-bar" />

      {/* ── Navbar ── */}
      <nav className="med-navbar d-flex align-items-center justify-content-between">
        <Link to="/login" className="brand">
          <div className="brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.53 15.48 1 12 1S6 2.53 6 4.64C6 5.12 6.11 5.56 6.18 6H4C2.9 6 2 6.9 2 8v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-8-3c2.07 0 4 .96 4 1.64C16 5.44 14.07 6 12 6S8 5.44 8 4.64C8 3.96 9.93 3 12 3zM13 15v3h-2v-3H8v-2h3v-3h2v3h3v2h-3z" />
            </svg>
          </div>
          MedSupply <span style={{ color: "var(--primary)" }}>Pro</span>
        </Link>
        <div className="d-flex align-items-center gap-4">
          <a href="#" className="nav-link">Home</a>
          <a href="#" className="nav-link">Products</a>
          <a href="#" className="nav-link">Support</a>
          <Link to="/login" className="btn-primary-med btn">Login</Link>
        </div>
      </nav>

      {/* ── Page header ── */}
      <div className="register-header">
        <h1>Supplier Registration</h1>
        <p>
          Join our global network of verified medical equipment providers and
          reach thousands of healthcare facilities.
        </p>
      </div>

      {/* ── Registration form ── */}
      <div className="container" style={{ maxWidth: 760, paddingBottom: 60 }}>
        <form onSubmit={handleSubmit} noValidate>

          {/* ════ Section 1: Personal Information ════ */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              Personal Information
            </div>

            <div className="row g-3">
              {/* Full Name */}
              <div className="col-md-6">
                <label className="form-label-med d-block">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  className={`form-control-med no-icon ${errors.full_name && touched.full_name ? "is-invalid" : ""}`}
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); clearError("full_name"); }}
                  onBlur={() => markTouched("full_name")}
                  required
                />
                <ErrorField msg={touched.full_name ? errors.full_name : null} />
              </div>

              {/* Email */}
              <div className="col-md-6">
                <label className="form-label-med d-block">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className={`form-control-med no-icon ${errors.email && touched.email ? "is-invalid" : ""}`}
                  placeholder="john@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                  onBlur={() => markTouched("email")}
                  required
                />
                <ErrorField msg={touched.email ? errors.email : null} />
              </div>

              {/* Phone */}
              <div className="col-md-6">
                <label className="form-label-med d-block">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className={`form-control-med no-icon ${errors.phone && touched.phone ? "is-invalid" : ""}`}
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); clearError("phone"); }}
                  onBlur={() => markTouched("phone")}
                  required
                />
                <ErrorField msg={touched.phone ? errors.phone : null} />
              </div>

              {/* National ID */}
              <div className="col-md-6">
                <label className="form-label-med d-block">National ID</label>
                <input
                  type="text"
                  name="national_id"
                  className={`form-control-med no-icon ${errors.national_id && touched.national_id ? "is-invalid" : ""}`}
                  placeholder="14-digit ID Number"
                  value={nationalId}
                  onChange={(e) => { setNationalId(e.target.value); clearError("national_id"); }}
                  onBlur={() => markTouched("national_id")}
                  maxLength={14}
                  required
                />
                <ErrorField msg={touched.national_id ? errors.national_id : null} />
              </div>

              {/* Password */}
              <div className="col-12">
                <label className="form-label-med d-block">Password</label>
                <input
                  type="password"
                  name="password"
                  className={`form-control-med no-icon ${errors.password && touched.password ? "is-invalid" : ""}`}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                  onBlur={() => markTouched("password")}
                  required
                />
                <ErrorField msg={touched.password ? errors.password : null} />
              </div>
            </div>
          </div>

          {/* ════ Section 2: Company Details ════ */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                </svg>
              </div>
              Company Details
            </div>

            <div className="row g-3">
              {/* Company Name */}
              <div className="col-12">
                <label className="form-label-med d-block">Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  className={`form-control-med no-icon ${errors.company_name && touched.company_name ? "is-invalid" : ""}`}
                  placeholder="Official Business Name"
                  value={companyName}
                  onChange={(e) => { setCompanyName(e.target.value); clearError("company_name"); }}
                  onBlur={() => markTouched("company_name")}
                  required
                />
                <ErrorField msg={touched.company_name ? errors.company_name : null} />
              </div>

              {/* Company Logo */}
              <div className="col-12">
                <label className="form-label-med d-block mb-2">
                  Company Logo / Image
                </label>
                <label
                  className={`upload-zone d-block ${errors.company_image_url && touched.company_image_url ? "upload-error" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="file"
                    name="company_image_url"
                    accept="image/png,image/jpeg"
                    style={{ display: "none" }}
                    onChange={handleLogo}
                  />
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      style={{ maxHeight: 80, borderRadius: 8, objectFit: "contain" }}
                    />
                  ) : (
                    <>
                      <div className="upload-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                        </svg>
                      </div>
                      <div>
                        <span className="upload-link">Upload Company Logo</span>
                        <span className="upload-text"> or drag and drop</span>
                      </div>
                      <div className="upload-hint">PNG, JPG up to 10MB</div>
                    </>
                  )}
                </label>
                <ErrorField msg={touched.company_image_url ? errors.company_image_url : null} />
              </div>

              {/* Governorate */}
              <div className="col-md-6">
                <label className="form-label-med d-block">
                  Governorate / Region
                </label>
                <select
                  name="governorate"
                  className={`select-med ${errors.governorate && touched.governorate ? "is-invalid" : ""}`}
                  value={governorate}
                  onChange={(e) => { setGovernorate(e.target.value); clearError("governorate"); }}
                  onBlur={() => markTouched("governorate")}
                  required
                >
                  <option value="">Select your region</option>
                  {EGYPT_GOVERNORATES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <ErrorField msg={touched.governorate ? errors.governorate : null} />
              </div>

              {/* Address */}
              <div className="col-md-6">
                <label className="form-label-med d-block">Business Address</label>
                <input
                  type="text"
                  name="address"
                  className={`form-control-med no-icon ${errors.address && touched.address ? "is-invalid" : ""}`}
                  placeholder="Street name, Building, Floor"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); clearError("address"); }}
                  onBlur={() => markTouched("address")}
                  required
                />
                <ErrorField msg={touched.address ? errors.address : null} />
              </div>
            </div>
          </div>

          {/* ════ Section 3: Legal Documentation ════ */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                </svg>
              </div>
              Legal Documentation
            </div>

            <div className="row g-3">
              {/* Commercial Register */}
              <div className="col-md-6">
                <label className="form-label-med d-block mb-2">
                  Commercial Register Image
                </label>
                <label
                  className={`upload-zone-sm d-block ${errors.commercial_register_image && touched.commercial_register_image ? "upload-error" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="file"
                    name="commercial_register_image"
                    accept="image/*,.pdf"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      setCommercialFile(e.target.files[0]);
                      clearError("commercial_register_image");
                      markTouched("commercial_register_image");
                    }}
                  />
                  <div className="upload-icon-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                    </svg>
                  </div>
                  <div className="upload-text-sm">
                    {commercialFile ? commercialFile.name : "Click to upload document"}
                  </div>
                </label>
                <ErrorField msg={touched.commercial_register_image ? errors.commercial_register_image : null} />
              </div>

              {/* Tax Card */}
              <div className="col-md-6">
                <label className="form-label-med d-block mb-2">
                  Tax Card Image
                </label>
                <label
                  className={`upload-zone-sm d-block ${errors.tax_card_image && touched.tax_card_image ? "upload-error" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="file"
                    name="tax_card_image"
                    accept="image/*,.pdf"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      setTaxFile(e.target.files[0]);
                      clearError("tax_card_image");
                      markTouched("tax_card_image");
                    }}
                  />
                  <div className="upload-icon-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
                    </svg>
                  </div>
                  <div className="upload-text-sm">
                    {taxFile ? taxFile.name : "Click to upload document"}
                  </div>
                </label>
                <ErrorField msg={touched.tax_card_image ? errors.tax_card_image : null} />
              </div>

              {/* Certificate Name */}
              <div className="col-md-6">
                <label className="form-label-med d-block">Certificate Name</label>
                <input
                  type="text"
                  name="certificate_name"
                  className="form-control-med no-icon"
                  placeholder="e.g., ISO 9001, Quality Assurance"
                  value={certificateName}
                  onChange={(e) => { setCertificateName(e.target.value); clearError("certificate_name"); }}
                  onBlur={() => markTouched("certificate_name")}
                />
                <ErrorField msg={touched.certificate_name ? errors.certificate_name : null} />
              </div>

              {/* Certificate Image */}
              <div className="col-md-6">
                <label className="form-label-med d-block mb-2">
                  Certificate Image
                </label>
                <label style={{ cursor: "pointer", display: "block" }}>
                  <input
                    type="file"
                    name="certificate_image"
                    accept="image/*,.pdf"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      setCertFile(e.target.files[0]);
                      clearError("certificate_image");
                      markTouched("certificate_image");
                    }}
                  />
                  <div className="cert-upload-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    {certFile ? certFile.name : "Upload Certificate Image"}
                  </div>
                </label>
                <ErrorField msg={touched.certificate_image ? errors.certificate_image : null} />
              </div>
            </div>
          </div>

          {/* ── Terms & Privacy checkbox ── */}
          <div className="terms-row">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={agreed}
              onChange={(e) => { setAgreed(e.target.checked); clearError("terms"); }}
              onBlur={() => markTouched("terms")}
            />
            <label htmlFor="terms">
              I agree to the <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </label>
          </div>
          <ErrorField msg={touched.terms ? errors.terms : null} />

          {/* ── Submit button ── */}
          <button
            type="submit"
            className="btn-complete mb-3"
            disabled={loading}
          >
            {loading ? "Registering..." : "Complete Supplier Registration"}
          </button>

          <p className="footer-text">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </form>
      </div>

      <footer className="page-footer">
        <span>© 2024 MedSupply Pro. Trusted Medical Supply Management.</span>
      </footer>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
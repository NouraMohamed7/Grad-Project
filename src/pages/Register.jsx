import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";
import { supplierRegister } from "../apis/signup.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const EGYPT_GOVERNORATES = [
  "Cairo",
  "Alexandria",
  "Giza",
  "Sharkia",
  "Dakahlia",
  "Beheira",
  "Qalyubia",
  "Monufia",
  "Gharbia",
  "Kafr el-Sheikh",
  "Damietta",
  "Port Said",
  "Ismailia",
  "Suez",
  "North Sinai",
  "South Sinai",
  "Faiyum",
  "Beni Suef",
  "Minya",
  "Asyut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
  "Red Sea",
  "New Valley",
  "Matruh",
];

export default function Register() {
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [commercialFile, setCommercialFile] = useState(null);
  const [taxFile, setTaxFile] = useState(null);
  const [certFile, setCertFile] = useState(null);
  const [agreed, setAgreed] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [certificateName, setCertificateName] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogo = (e) => {
    const f = e.target.files[0];
    if (f) {
      setLogoFile(f);
      setLogoPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!agreed) {
      toast.error("Please agree to Terms and Privacy Policy");
      return;
    }

    if (!logoFile || !commercialFile || !taxFile) {
      toast.error("Please upload all required documents");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("company_image_url", logoFile);
      formData.append("full_name", fullName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("address", address);
      formData.append("governorate", governorate);
      formData.append("national_id", nationalId);
      formData.append("phone", phone);
      formData.append("company_name", companyName);
      formData.append("commercial_register_image", commercialFile);
      formData.append("tax_card_image", taxFile);
      formData.append("certificate_name", certificateName);

      if (certFile) {
        formData.append("certificate_image", certFile);
      }

      await supplierRegister(formData);

      toast.success("Registration successful 🎉");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.error ||
          error?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="top-bar" />

      {/* Navbar */}
      <nav className="med-navbar d-flex align-items-center justify-content-between">
        <Link to="/login" className="brand">
          <div className="brand-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.53 15.48 1 12 1S6 2.53 6 4.64C6 5.12 6.11 5.56 6.18 6H4C2.9 6 2 6.9 2 8v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-8-3c2.07 0 4 .96 4 1.64C16 5.44 14.07 6 12 6S8 5.44 8 4.64C8 3.96 9.93 3 12 3zM13 15v3h-2v-3H8v-2h3v-3h2v3h3v2h-3z" />
            </svg>
          </div>
          MedSupply <span style={{ color: "var(--primary)" }}>Pro</span>
        </Link>
        <div className="d-flex align-items-center gap-4">
          <a href="#" className="nav-link">
            Home
          </a>
          <a href="#" className="nav-link">
            Products
          </a>
          <a href="#" className="nav-link">
            Support
          </a>
          <Link to="/login" className="btn-primary-med btn">
            Login
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="register-header">
        <h1>Supplier Registration</h1>
        <p>
          Join our global network of verified medical equipment providers and
          reach thousands of healthcare facilities.
        </p>
      </div>

      {/* Form */}
      <div className="container" style={{ maxWidth: 760, paddingBottom: 60 }}>
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              Personal Information
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label-med d-block">Full Name</label>
                <input
                  type="text"
                  className="form-control-med no-icon"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label-med d-block">Email Address</label>
                <input
                  type="email"
                  className="form-control-med no-icon"
                  placeholder="john@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label-med d-block">Phone Number</label>
                <input
                  type="tel"
                  className="form-control-med no-icon"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label-med d-block">National ID</label>
                <input
                  type="text"
                  className="form-control-med no-icon"
                  placeholder="ID Number"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label-med d-block">Password</label>
                <input
                  type="password"
                  className="form-control-med no-icon"
                  placeholder="Min. 8 characters"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                </svg>
              </div>
              Company Details
            </div>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label-med d-block">Company Name</label>
                <input
                  type="text"
                  className="form-control-med no-icon"
                  placeholder="Official Business Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label-med d-block mb-2">
                  Company Logo / Image
                </label>
                <label
                  className="upload-zone d-block"
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    style={{ display: "none" }}
                    onChange={handleLogo}
                  />
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      style={{
                        maxHeight: 80,
                        borderRadius: 8,
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <>
                      <div className="upload-icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="28"
                          height="28"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
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
              </div>

              <div className="col-md-6">
                <label className="form-label-med d-block">
                  Governorate / Region
                </label>
                <select
                  className="select-med"
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  required
                >
                  <option value="">Select your region</option>
                  {EGYPT_GOVERNORATES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label-med d-block">
                  Business Address
                </label>
                <input
                  type="text"
                  className="form-control-med no-icon"
                  placeholder="Street name, Building, Floor"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Legal Documentation */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                </svg>
              </div>
              Legal Documentation
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label-med d-block mb-2">
                  Commercial Register Image
                </label>
                <label
                  className="upload-zone-sm d-block"
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: "none" }}
                    onChange={(e) => setCommercialFile(e.target.files[0])}
                  />
                  <div className="upload-icon-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                    </svg>
                  </div>
                  <div className="upload-text-sm">
                    {commercialFile
                      ? commercialFile.name
                      : "Click to upload document"}
                  </div>
                </label>
              </div>

              <div className="col-md-6">
                <label className="form-label-med d-block mb-2">
                  Tax Card Image
                </label>
                <label
                  className="upload-zone-sm d-block"
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: "none" }}
                    onChange={(e) => setTaxFile(e.target.files[0])}
                  />
                  <div className="upload-icon-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
                    </svg>
                  </div>
                  <div className="upload-text-sm">
                    {taxFile ? taxFile.name : "Click to upload document"}
                  </div>
                </label>
              </div>

              <div className="col-md-6">
                <label className="form-label-med d-block">
                  Certificate Name
                </label>
                <input
                  type="text"
                  className="form-control-med no-icon"
                  placeholder="e.g., ISO 9001, Quality Assurance"
                  value={certificateName}
                  onChange={(e) => setCertificateName(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label-med d-block mb-2">
                  Certificate Image
                </label>
                <label style={{ cursor: "pointer", display: "block" }}>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: "none" }}
                    onChange={(e) => setCertFile(e.target.files[0])}
                  />
                  <div className="cert-upload-btn">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="17"
                      height="17"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    {certFile ? certFile.name : "Upload Certificate Image"}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="terms-row">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label htmlFor="terms">
              I agree to the <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </label>
          </div>

          {/* Submit */}
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

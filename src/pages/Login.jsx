/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { supplierLogin, persistAuthState } from "../apis/auth";


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

// ─── Login Component ──────────────────────────────────────────────────────────
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ── Redirect if already logged in ────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home", { replace: true });
    }
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
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

  // ── Client-side validation ────────────────────────────────────────────
  const validateClient = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Form submission handler ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark everything as touched so errors show immediately
    setTouched({ email: true, password: true });

    if (loading) return;

    // Run client-side validation first
    const isValid = validateClient();
    if (!isValid) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const data = await supplierLogin(form.email.trim(), form.password);

      // DEBUG: log full response (remove in production)
      console.log("Login response:", JSON.stringify(data, null, 2));

      // ── Extract token & user from all possible response shapes ─────────
      const authState = persistAuthState(data);
      const token = authState.token;
      const user  = authState.user || data?.user || data?.data?.user || data?.data;

      if (!token) {
        // API returned 200 but no token — treat as error
        const apiError = data?.error || data?.message || "Login failed — no token received.";
        setErrors({ general: apiError });
        toast.error(apiError);
        return;
      }

      // ── Store auth data ────────────────────────────────────────────────
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user || {}));

      // supplierId from all possible locations
      const supplierId =
        user?.supplier?.id ??
        user?.supplier_id  ??
        user?.id           ??
        '';
      localStorage.setItem("supplierId", String(supplierId));

      // Remember me
      if (remember) {
        localStorage.setItem("rememberEmail", form.email.trim());
      } else {
        localStorage.removeItem("rememberEmail");
      }

      toast.success(`Welcome back, ${user?.fullname || user?.name || user?.email || "Supplier"}!`);

      setTimeout(() => {
        navigate("/home", { replace: true });
      }, 1200);

    } catch (error) {
      console.error("Login error full:", error);

      // ── Backend error handling ───────────────────────────────────────
      // The API returns errors in different shapes. We try the most common ones.
      let apiErrors = {};
      let genericMsg = "Login failed. Please try again.";

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
        // Shape 2: { error: "..." } or { message: "..." }
        else if (error.error) {
          genericMsg = error.error;
        } else if (error.message) {
          genericMsg = error.message;
        }
      }

      if (Object.keys(apiErrors).length > 0) {
        setErrors(apiErrors);
      } else {
        setErrors({ general: genericMsg });
        toast.error(genericMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Load remembered email on mount ─────────────────────────────────────
  useEffect(() => {
    const remembered = localStorage.getItem("rememberEmail");
    if (remembered) {
      setForm((prev) => ({ ...prev, email: remembered }));
      setRemember(true);
    }
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="page-bg">
      <div className="top-bar" />

      <div className="login-wrapper">
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.53 15.48 1 12 1S6 2.53 6 4.64C6 5.12 6.11 5.56 6.18 6H4C2.9 6 2 6.9 2 8v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-8-3c2.07 0 4 .96 4 1.64C16 5.44 14.07 6 12 6S8 5.44 8 4.64C8 3.96 9.93 3 12 3zM13 15v3h-2v-3H8v-2h3v-3h2v3h3v2h-3z"/>
              </svg>
            </div>
            <span className="login-logo-text">MedSupply Pro</span>
          </div>

          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Enter your credentials to access the supplier portal</p>

          {/* ── General error banner ── */}
          {errors.general && (
            <div className="alert alert-danger" style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 16,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <svg width="18" height="18" fill="#dc2626" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label-med d-block mb-1">Email Address</label>
              <div className="input-group-med">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  className={`form-control-med ${errors.email && touched.email ? "is-invalid" : ""}`}
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    clearError("email");
                  }}
                  onBlur={() => markTouched("email")}
                  required
                />
              </div>
              <ErrorField msg={touched.email ? errors.email : null} />
            </div>

            {/* Password */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label-med mb-0">Password</label>
                <a href="#" className="forgot-link">Forgot Password?</a>
              </div>
              <div className="input-group-med">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-control-med has-right-icon ${errors.password && touched.password ? "is-invalid" : ""}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    clearError("password");
                  }}
                  onBlur={() => markTouched("password")}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  )}
                </button>
              </div>
              <ErrorField msg={touched.password ? errors.password : null} />
            </div>

            {/* Remember */}
            <div className="mb-4">
              <label className="check-med">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Sign In */}
            <button
              type="submit"
              className="btn-sign-in mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 17l5-5-5-5v10zm11-5c0-5.52-4.48-10-10-10S1 6.48 1 12s4.48 10 10 10 10-4.48 10-10z"/>
                  </svg>
                </>
              )}
            </button>

            <div className="divider-or mb-3">or continue with</div>

            <p className="footer-text">
              New to MedSupply Pro?{' '}
              <Link to="/register">Create an account</Link>
            </p>
          </form>
        </div>
      </div>

      <footer className="page-footer">
        <span>© 2024 MedSupply Pro. All rights reserved.</span>
        <br />
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
      </footer>
    </div>
  );
}
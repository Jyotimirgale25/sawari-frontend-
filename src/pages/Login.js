import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/Sawari_logo.png"; // adjust extension if needed
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  function onChange(e) {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text; }

      if (!res.ok) {
        setError(typeof data === "string" ? data : data.message || "Login failed");
        return;
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(data));

      const role = data.role?.toUpperCase();
      if (role === "DRIVER") navigate("/dashboard/my-rides");
      else if (role === "ADMIN") navigate("/dashboard/admin-sos");
      else navigate("/dashboard");

    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <div className="auth-page">
        {/* ── LEFT PANEL ── */}
        <div className="auth-left">
          <div className="auth-left-content">
            <img src={logo} alt="SAWARI" className="auth-left-logo" />
            <h1 className="auth-left-title">SAWARI</h1>
            <p className="auth-left-tag">Because they deserve a safe ride.</p>

            <div className="auth-left-features">
              {[
                { icon: "ti-shield-check", text: "Identity Verified Users" },
                { icon: "ti-map-pin",      text: "Live GPS Tracking" },
                { icon: "ti-alert-triangle", text: "One-Tap SOS Alert" },
                { icon: "ti-car",          text: "Women-only Rides" },
              ].map((f, i) => (
                <div className="auth-feature" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="auth-feature-icon">
                    <i className={`ti ${f.icon}`} />
                  </div>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>

            {/* decorative rings */}
            <div className="auth-left-ring r1" />
            <div className="auth-left-ring r2" />
            <div className="auth-left-ring r3" />
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="auth-right">
          <div className="auth-form-wrap">

            {/* top logo for mobile */}
            <div className="auth-mobile-brand">
              <img src={logo} alt="SAWARI" className="auth-mobile-logo" />
              <span className="auth-mobile-name">SAWARI</span>
            </div>

            <div className="auth-form-head">
              <h2 className="auth-form-title">Welcome back</h2>
              <p className="auth-form-sub">Sign in to your SAWARI account</p>
            </div>

            {error && (
              <div className="auth-error">
                <i className="ti ti-alert-circle" />
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="auth-form-inner">

              {/* Email */}
              <div className="auth-field">
                <label className="auth-field-label">Email address</label>
                <div className="auth-field-input-wrap">
                  <i className="ti ti-mail auth-field-icon" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="you@example.com"
                    className="auth-input"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field">
                <label className="auth-field-label">Password</label>
                <div className="auth-field-input-wrap">
                  <i className="ti ti-lock auth-field-icon" />
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={onChange}
                    placeholder="••••••••"
                    className="auth-input"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-pass-toggle"
                    onClick={() => setShowPass(!showPass)}
                    tabIndex={-1}
                  >
                    <i className={`ti ${showPass ? "ti-eye-off" : "ti-eye"}`} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`auth-submit-btn ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <i className="ti ti-arrow-right" />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>New to SAWARI?</span>
            </div>

            <Link to="/register" className="auth-register-link">
              Create an account
              <i className="ti ti-user-plus" />
            </Link>

          </div>
        </div>
      </div>
    </>
  );
}
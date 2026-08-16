import Navbar from "../components/Navbar";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Sawari_logo.png";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("USER");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    aadhar: "",
    orgId: "",
    password: "",
  });

  function onChange(e) {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validate() {
    if (form.phone && form.phone.length !== 10)
      return "Phone number must be exactly 10 digits.";
    if (role === "USER" && form.aadhar && form.aadhar.length !== 12)
      return "Aadhar number must be exactly 12 digits.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    return null;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: role,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Account created! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1800);
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const roles = [
    { value: "USER",   label: "Rider",  icon: "ti-user",       desc: "Find & book rides" },
    { value: "DRIVER", label: "Driver", icon: "ti-steering-wheel", desc: "Create & offer rides" },
  ];

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
                { icon: "ti-shield-check",    text: "Identity Verified Users" },
                { icon: "ti-map-pin",         text: "Live GPS Tracking" },
                { icon: "ti-alert-triangle",  text: "One-Tap SOS Alert" },
                { icon: "ti-car",             text: "Women-only Rides" },
              ].map((f, i) => (
                <div className="auth-feature" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="auth-feature-icon">
                    <i className={`ti ${f.icon}`} />
                  </div>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>

            <div className="auth-left-ring r1" />
            <div className="auth-left-ring r2" />
            <div className="auth-left-ring r3" />
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="auth-right">
          <div className="auth-form-wrap">

            {/* mobile brand */}
            <div className="auth-mobile-brand">
              <img src={logo} alt="SAWARI" className="auth-mobile-logo" />
              <span className="auth-mobile-name">SAWARI</span>
            </div>

            <div className="auth-form-head">
              <h2 className="auth-form-title">Create account</h2>
              <p className="auth-form-sub">Join SAWARI and ride safely.</p>
            </div>

            {/* error / success */}
            {error && (
              <div className="auth-error">
                <i className="ti ti-alert-circle" /> {error}
              </div>
            )}
            {success && (
              <div className="auth-success-msg">
                <i className="ti ti-circle-check" /> {success}
              </div>
            )}

            <form onSubmit={onSubmit} className="auth-form-inner">

              {/* ── ROLE SELECTOR ── */}
              <div className="auth-role-wrap">
                <span className="auth-role-label">I want to</span>
                <div className="auth-role-pills">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      className={`auth-role-pill ${role === r.value ? "active" : ""}`}
                      onClick={() => { setRole(r.value); setError(""); }}
                    >
                      <i className={`ti ${r.icon}`} />
                      <span>{r.label}</span>
                      <small style={{ fontSize: 11, opacity: 0.7 }}>{r.desc}</small>
                    </button>
                  ))}
                </div>
              </div>

              {/* note */}
              <div className="auth-note">
                <i className="ti ti-info-circle" />
                {role === "DRIVER"
                  ? "Drivers must complete document verification before creating rides."
                  : "SAWARI is women-safety-first. Users must verify identity after registration."}
              </div>

              {/* Full Name */}
              <div className="auth-field">
                <label className="auth-field-label">Full Name</label>
                <div className="auth-field-input-wrap">
                  <i className="ti ti-user auth-field-icon" />
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="As per ID proof"
                    className="auth-input"
                    required
                  />
                </div>
              </div>

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

              {/* Phone */}
              <div className="auth-field">
                <label className="auth-field-label">Phone Number</label>
                <div className="auth-field-input-wrap">
                  <i className="ti ti-phone auth-field-icon" />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="10-digit mobile number"
                    className="auth-input"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* USER-only fields */}
              {role === "USER" && (
                <>
                  <div className="auth-field">
                    <label className="auth-field-label">Aadhar Number</label>
                    <div className="auth-field-input-wrap">
                      <i className="ti ti-id auth-field-icon" />
                      <input
                        name="aadhar"
                        value={form.aadhar}
                        onChange={onChange}
                        placeholder="12-digit Aadhar number"
                        className="auth-input"
                        maxLength={12}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="auth-field-label">
                      College / Company ID
                      <span className="auth-optional">optional</span>
                    </label>
                    <div className="auth-field-input-wrap">
                      <i className="ti ti-building auth-field-icon" />
                      <input
                        name="orgId"
                        value={form.orgId}
                        onChange={onChange}
                        placeholder="Student / Employee ID"
                        className="auth-input"
                      />
                    </div>
                  </div>
                </>
              )}

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
                    placeholder="Min. 6 characters"
                    className="auth-input"
                    required
                    autoComplete="new-password"
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Register as {role === "DRIVER" ? "Driver" : "Rider"}
                    <i className="ti ti-arrow-right" />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>Already have an account?</span>
            </div>

            <Link to="/login" className="auth-login-link">
              Sign in instead
              <i className="ti ti-login" />
            </Link>

          </div>
        </div>
      </div>
    </>
  );
}
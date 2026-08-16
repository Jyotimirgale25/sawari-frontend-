import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import "../../styles/rides.css";

export default function CreateRide() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const [verified, setVerified] = useState(null);
  const [form, setForm] = useState({
    fromLocation: "",
    toLocation: "",
    date: "",
    time: "",
    seats: 2,
    womenOnly: false,
    community: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8080/api/verification/driver/${user.id}`)
      .then((res) => (res.status === 404 ? null : res.json()))
      .then((data) => setVerified(data?.status === "APPROVED"))
      .catch(() => setVerified(false));
  }, [user.id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function changeSeats(delta) {
    setForm((prev) => ({
      ...prev,
      seats: Math.min(10, Math.max(1, prev.seats + delta)),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("http://localhost:8080/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, driverId: user.id }),
      });
      if (!response.ok) throw new Error("Failed to create ride");
      setSuccess("Ride created successfully!");
      setForm({ fromLocation: "", toLocation: "", date: "", time: "", seats: 2, womenOnly: false, community: "" });
      setTimeout(() => navigate("/dashboard/my-rides"), 1500);
    } catch {
      setError("Failed to create ride. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (verified === null) {
    return (
      <DashboardLayout title="Create Ride">
        <div className="p-muted">Checking verification status...</div>
      </DashboardLayout>
    );
  }

  if (!verified) {
    return (
      <DashboardLayout title="Create Ride">
        <div className="cr-card">
          <p className="cr-title">Verification required</p>
          <p className="cr-sub" style={{ color: "var(--color-text-danger)" }}>
            You must be verified before creating a ride. Please complete your verification first.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Create Ride">
      <div className="cr-wrap">
        <div className="cr-card">
          <div className="cr-header">
            <p className="cr-title">Create a new ride</p>
            <p className="cr-sub">Fill in the details to offer a ride to passengers.</p>
          </div>

          {error && <div className="cr-alert cr-alert-error">{error}</div>}
          {success && <div className="cr-alert cr-alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Route */}
            <div className="cr-route">
              <div className="cr-route-dot">
                <div className="cr-dot"></div>
                <input className="cr-route-input" name="fromLocation" placeholder="From — pickup location"
                  value={form.fromLocation} onChange={handleChange} required />
              </div>
              <div className="cr-route-line" />
              <div className="cr-route-dot">
                <div className="cr-dot cr-dot-end"></div>
                <input className="cr-route-input" name="toLocation" placeholder="To — drop location"
                  value={form.toLocation} onChange={handleChange} required />
              </div>
            </div>

            {/* Date & Time */}
            <div className="cr-grid">
              <div className="cr-field">
                <label className="cr-label">Date</label>
                <input className="cr-input" type="date" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="cr-field">
                <label className="cr-label">Time</label>
                <input className="cr-input" type="time" name="time" value={form.time} onChange={handleChange} required />
              </div>
            </div>

            {/* Community */}
            <div className="cr-field">
              <label className="cr-label">Community</label>
              <input className="cr-input" name="community" placeholder="e.g. COEP, TCS Hinjewadi, Infosys..."
                value={form.community} onChange={handleChange} />
            </div>

            <hr className="cr-divider" />

            {/* Seats */}
            <div className="cr-field">
              <label className="cr-label">Available seats</label>
              <div className="cr-seats-row">
                <button type="button" className="cr-seats-btn" onClick={() => changeSeats(-1)}>−</button>
                <span className="cr-seats-count">{form.seats}</span>
                <button type="button" className="cr-seats-btn" onClick={() => changeSeats(1)}>+</button>
                <span className="cr-seats-label">seats available</span>
              </div>
            </div>

            {/* Women-only toggle */}
            <div className="cr-toggle-row">
              <div>
                <div className="cr-toggle-label">Women-only ride</div>
                <div className="cr-toggle-desc">Only female passengers can book this ride</div>
              </div>
              <label className="cr-toggle">
                <input type="checkbox" name="womenOnly" checked={form.womenOnly} onChange={handleChange} />
                <span className="cr-slider"></span>
              </label>
            </div>

            <button className="cr-btn" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create ride"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
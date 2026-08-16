import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";


const BASE_URL = "http://localhost:8080";

export default function AdminRides() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = (user.role || "user").toLowerCase();

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${BASE_URL}/api/rides/admin/all`)
      .then((res) => res.json())
      .then((data) => { setRides(data); setLoading(false); })
      .catch(() => { setError("Failed to load rides."); setLoading(false); });
  }, []);

  async function handleCancel(id) {
    if (!window.confirm("Cancel this ride?")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/rides/${id}/cancel`, { method: "PUT" });
      if (!res.ok) throw new Error();
      setRides((prev) => prev.map((r) => r.id === id ? { ...r, status: "CANCELLED" } : r));
    } catch {
      alert("Failed to cancel ride.");
    }
  }

  if (role !== "admin") {
    return (
      <DashboardLayout title="Admin Rides">
        <div className="section">
          <h3 className="section-title">Admin only</h3>
          <div className="section-sub">Switch role to Admin to access this page.</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Rides">
      <div className="section">
        <div className="section-head">
          <div>
            <h3 className="section-title">All Rides</h3>
            <div className="section-sub">Admin can cancel risky rides instantly.</div>
          </div>
          <span className="badge-pro">{rides.length} total</span>
        </div>

        {loading && <div className="p-muted">Loading...</div>}
        {error && <div className="p-muted" style={{ color: "red" }}>{error}</div>}

        {!loading && rides.length === 0 && (
          <div className="p-muted">No rides found.</div>
        )}

        <div className="list">
          {rides.map((r) => (
            <div key={r.id} className="row-card">
              <div className="row-main">
                <div className="row-title">
                  {r.fromLocation} → {r.toLocation}{" "}
                  <span className={`badge-pro ${r.womenOnly ? "badge-safe" : "badge-open"}`} style={{ marginLeft: 8 }}>
                    {r.womenOnly ? "Women-only" : "Open"}
                  </span>
                </div>
                <div className="row-sub">
                  <span>{r.date} • {r.time}</span>
                  <span>•</span>
                  <span>Seats: <b>{r.seats}</b></span>
                  <span>•</span>
                  <span>{r.community || "General"}</span>
                  <span>•</span>
                  <span>Driver ID: <b>{r.driverId}</b></span>
                  <span>•</span>
                  <span className={`badge-pro ${r.status === "CANCELLED" ? "badge-bad" : "badge-ok"}`}>
                    {r.status}
                  </span>
                </div>
              </div>

              <div className="row-actions">
                {r.status === "ACTIVE" && (
                  <button className="btn-danger-pro" onClick={() => handleCancel(r.id)}>
                    Cancel Ride
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
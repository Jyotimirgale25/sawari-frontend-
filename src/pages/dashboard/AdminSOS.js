import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

const BASE_URL = "http://localhost:8080";

export default function AdminSOS() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = (user.role || "user").toLowerCase();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/sos/admin/all`)
      .then((res) => res.json())
      .then((data) => { setAlerts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleResolve(id) {
    try {
      const res = await fetch(`${BASE_URL}/api/sos/${id}/resolve`, { method: "PUT" });
      if (!res.ok) throw new Error();
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "RESOLVED" } : a));
    } catch {
      alert("Failed to resolve.");
    }
  }

  if (role !== "admin") {
    return (
      <DashboardLayout title="Admin SOS">
        <div className="section">
          <h3 className="section-title">Admin only</h3>
          <div className="section-sub">Switch role to Admin to access SOS monitoring.</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin SOS">
      <div className="section">
        <div className="section-head">
          <div>
            <h3 className="section-title">SOS Alerts</h3>
            <div className="section-sub">Latest alerts with ride context.</div>
          </div>
          <span className="badge-pro">{alerts.length} total</span>
        </div>

        {loading && <div className="p-muted">Loading...</div>}

        {!loading && alerts.length === 0 && (
          <div className="p-muted">No SOS events yet.</div>
        )}

        <div className="list">
          {alerts.map((a) => (
            <div key={a.id} className="row-card" style={{ alignItems: "flex-start" }}>
              <div className="row-main">
                <div className="row-title">
                  SOS Triggered{" "}
                  <span className={`badge-pro ${a.status === "RESOLVED" ? "badge-ok" : "badge-bad"}`} style={{ marginLeft: 8 }}>
                    {a.status}
                  </span>
                </div>

                <div className="row-sub">
                  <span>{new Date(a.triggeredAt).toLocaleString()}</span>
                  <span>•</span>
                  <span>Role: <b>{a.role}</b></span>
                  <span>•</span>
                  <span>User ID: <b>{a.userId}</b></span>
                </div>

                {a.rideFrom && (
                  <div className="row-sub" style={{ marginTop: 8 }}>
                    <span><b>Ride:</b> {a.rideFrom} → {a.rideTo}</span>
                    <span>•</span>
                    <span>{a.rideDate} • {a.rideTime}</span>
                  </div>
                )}
              </div>

              <div className="row-actions">
                {a.status === "SENT" && (
                  <button className="btn-primary-pro" onClick={() => handleResolve(a.id)}>
                    Mark Resolved
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
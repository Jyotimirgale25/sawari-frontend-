import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import "../../styles/rides.css";


export default function MyRides() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8080/api/rides/driver/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setRides(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load your rides.");
        setLoading(false);
      });
  }, [user.id]);

  async function handleCancel(rideId) {
    if (!window.confirm("Cancel this ride?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/rides/${rideId}/cancel`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error();
      setRides((prev) =>
        prev.map((r) => r.id === rideId ? { ...r, status: "CANCELLED" } : r)
      );
    } catch {
      alert("Failed to cancel ride.");
    }
  }

  return (
    <DashboardLayout title="My Rides">
      <div className="section">
        <div className="section-head">
          <div>
            <h3 className="section-title">My Rides</h3>
            <div className="section-sub">Rides you have offered as a driver.</div>
          </div>
          <span className="badge-pro">{rides.length} total</span>
        </div>

        {loading && <div className="p-muted">Loading...</div>}
        {error && <div className="p-muted" style={{ color: "red" }}>{error}</div>}

        {!loading && rides.length === 0 && (
          <div className="p-muted">You have not created any rides yet.</div>
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
                  <span className={`badge-pro ${r.status === "CANCELLED" ? "badge-bad" : "badge-ok"}`}>
                    {r.status}
                  </span>
                </div>
              </div>

              <div className="row-actions">
                {r.status === "ACTIVE" && (
                  <button className="btn-danger-pro" onClick={() => handleCancel(r.id)}>
                    Cancel
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
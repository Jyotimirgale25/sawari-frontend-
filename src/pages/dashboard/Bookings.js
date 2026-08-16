import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

const BASE = "http://localhost:8080";

export default function Bookings() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [bookings, setBookings] = useState([]);
  const [rides, setRides]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState("ALL");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetch(`${BASE}/api/bookings/passenger/${user.id}`)
      .then((r) => r.json())
      .then(async (data) => {
        setBookings(data);
        const rideDetails = {};
        await Promise.all(
          data.map(async (b) => {
            try {
              const r = await fetch(`${BASE}/api/rides/${b.rideId}`);
              if (r.ok) rideDetails[b.rideId] = await r.json();
            } catch {}
          })
        );
        setRides(rideDetails);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load your bookings."); setLoading(false); });
  }, [user.id]);

  async function handleCancel(bookingId) {
    if (!window.confirm("Cancel this booking?")) return;
    setCancellingId(bookingId);
    try {
      const res = await fetch(`${BASE}/api/bookings/${bookingId}/cancel`, { method: "PUT" });
      if (!res.ok) throw new Error();
      setBookings((prev) =>
        prev.map((b) => b.id === bookingId ? { ...b, status: "CANCELLED" } : b)
      );
    } catch {
      setError("Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  }

  const filters = ["ALL", "CONFIRMED", "CANCELLED"];

  const displayed = filter === "ALL"
    ? bookings
    : bookings.filter((b) => b.status === filter);

  const counts = {
    ALL: bookings.length,
    CONFIRMED: bookings.filter(b => b.status === "CONFIRMED").length,
    CANCELLED: bookings.filter(b => b.status === "CANCELLED").length,
  };

  return (
    <DashboardLayout title="My Bookings">

      {/* ── STATS ROW ── */}
      <div className="bk-stats">
        <div className="bk-stat">
          <div className="bk-stat-n">{counts.ALL}</div>
          <div className="bk-stat-l">Total Bookings</div>
        </div>
        <div className="bk-stat confirmed">
          <div className="bk-stat-n">{counts.CONFIRMED}</div>
          <div className="bk-stat-l">Confirmed</div>
        </div>
        <div className="bk-stat cancelled">
          <div className="bk-stat-n">{counts.CANCELLED}</div>
          <div className="bk-stat-l">Cancelled</div>
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="bk-tabs">
        {filters.map((f) => (
          <button
            key={f}
            className={`bk-tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            <span className="bk-tab-count">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div className="fr-error">
          <i className="ti ti-alert-circle" /> {error}
          <button onClick={() => setError("")}><i className="ti ti-x" /></button>
        </div>
      )}

      {/* ── LOADING ── */}
      {loading && (
        <div className="fr-loading">
          {[1,2,3].map(i => <div key={i} className="fr-skeleton" />)}
        </div>
      )}

      {/* ── EMPTY ── */}
      {!loading && displayed.length === 0 && (
        <div className="fr-empty">
          <i className="ti ti-ticket fr-empty-icon" />
          <h4>No bookings found</h4>
          <p>{filter !== "ALL" ? `No ${filter.toLowerCase()} bookings.` : "You haven't booked any rides yet."}</p>
          {filter === "ALL" && (
            <a href="/dashboard/find-ride" className="fr-verify-btn">
              Find a Ride <i className="ti ti-arrow-right" />
            </a>
          )}
        </div>
      )}

      {/* ── BOOKING CARDS ── */}
      {!loading && (
        <div className="bk-list">
          {displayed.map((b, idx) => {
            const ride = rides[b.rideId];
            const isConfirmed  = b.status === "CONFIRMED";
            const isCancelled  = b.status === "CANCELLED";
            const isPending    = b.status === "PENDING";

            return (
              <div
                className={`bk-card ${isCancelled ? "cancelled" : ""}`}
                key={b.id}
                style={{ animationDelay: `${idx * 0.07}s` }}
              >
                {/* status strip */}
                <div className={`bk-strip ${isConfirmed ? "ok" : isCancelled ? "bad" : "pending"}`} />

                <div className="bk-card-inner">
                  {/* route */}
                  <div className="bk-route">
                    {ride ? (
                      <>
                        <div className="bk-place">
                          <span className="bk-place-label">From</span>
                          <span className="bk-place-name">{ride.fromLocation}</span>
                        </div>
                        <div className="bk-route-arrow">
                          <i className="ti ti-arrow-right" />
                        </div>
                        <div className="bk-place">
                          <span className="bk-place-label">To</span>
                          <span className="bk-place-name">{ride.toLocation}</span>
                        </div>
                      </>
                    ) : (
                      <div className="bk-place">
                        <span className="bk-place-name">Ride #{b.rideId}</span>
                      </div>
                    )}

                    {/* status badge */}
                    <div className={`bk-status-badge ${isConfirmed ? "ok" : isCancelled ? "bad" : "pending"}`}>
                      <i className={`ti ${isConfirmed ? "ti-circle-check" : isCancelled ? "ti-circle-x" : "ti-clock"}`} />
                      {b.status}
                    </div>
                  </div>

                  {/* meta */}
                  {ride && (
                    <div className="fr-meta" style={{ marginTop: 12 }}>
                      <div className="fr-meta-item">
                        <i className="ti ti-calendar" />
                        <span>{ride.date}</span>
                      </div>
                      <div className="fr-meta-item">
                        <i className="ti ti-clock" />
                        <span>{ride.time}</span>
                      </div>
                      <div className="fr-meta-item">
                        <i className="ti ti-armchair" />
                        <span>{ride.seats} seats left</span>
                      </div>
                      {ride.community && (
                        <div className="fr-meta-item">
                          <i className="ti ti-building" />
                          <span>{ride.community}</span>
                        </div>
                      )}
                      <div className={`fr-meta-item ${ride.womenOnly ? "women-tag" : ""}`}>
                        <i className={`ti ${ride.womenOnly ? "ti-gender-female" : "ti-users"}`} />
                        <span>{ride.womenOnly ? "Women-only" : "Open"}</span>
                      </div>
                    </div>
                  )}

                  {/* booking id */}
                  <div className="bk-id">Booking #{b.id}</div>
                </div>

                {/* actions */}
                {(isConfirmed || isPending) && (
                  <div className="bk-actions">
                    <button
                      className="bk-cancel-btn"
                      onClick={() => handleCancel(b.id)}
                      disabled={cancellingId === b.id}
                    >
                      {cancellingId === b.id ? (
                        <><span className="fr-btn-spinner dark" /> Cancelling...</>
                      ) : (
                        <><i className="ti ti-x" /> Cancel Booking</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
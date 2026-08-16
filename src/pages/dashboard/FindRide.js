import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import "../../styles/rides.css";

const BASE = "http://localhost:8080";

export default function FindRide() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const [verified, setVerified]   = useState(null);
  const [rides, setRides]         = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [bookingId, setBookingId] = useState(null); // which ride is being booked
  const [search, setSearch]       = useState("");
  const [filterWomen, setFilterWomen] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/user-verification/user/${user.id}`)
      .then((r) => r.status === 404 ? null : r.json())
      .then((d) => setVerified(d?.status === "APPROVED"))
      .catch(() => setVerified(false));
  }, [user.id]);

  useEffect(() => {
    if (verified !== true) return;
    fetch(`${BASE}/api/rides`)
      .then((r) => r.json())
      .then((d) => { setRides(d); setFiltered(d); setLoading(false); })
      .catch(() => { setError("Failed to load rides."); setLoading(false); });
  }, [verified]);

  // filter logic
  useEffect(() => {
    let list = [...rides];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.fromLocation?.toLowerCase().includes(q) ||
        r.toLocation?.toLowerCase().includes(q) ||
        r.community?.toLowerCase().includes(q)
      );
    }
    if (filterWomen) list = list.filter(r => r.womenOnly);
    setFiltered(list);
  }, [search, filterWomen, rides]);

  async function handleBook(rideId) {
    setBookingId(rideId);
    try {
      const res = await fetch(`${BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rideId, passengerId: user.id }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Booking failed");
        return;
      }

      const booking = await res.json();
      localStorage.setItem("lastBooking", JSON.stringify(booking));

      const rideRes = await fetch(`${BASE}/api/rides/${rideId}`);
      if (rideRes.ok) localStorage.setItem("activeRide", JSON.stringify(await rideRes.json()));

      navigate("/dashboard/booking-confirmation");
    } catch {
      setError("Failed to book ride. Please try again.");
    } finally {
      setBookingId(null);
    }
  }

  // ── NOT VERIFIED ────────────────────────────────────────
  if (verified === null) return (
    <DashboardLayout title="Find Ride">
      <div className="fr-checking">
        <div className="fr-checking-spinner" />
        <span>Checking verification status...</span>
      </div>
    </DashboardLayout>
  );

  if (verified === false) return (
    <DashboardLayout title="Find Ride">
      <div className="fr-unverified">
        <div className="fr-unverified-icon">
          <i className="ti ti-shield-x" />
        </div>
        <h3>Verification Required</h3>
        <p>You must be verified before you can book a ride. Please complete your identity verification first.</p>
        <a href="/dashboard/verification" className="fr-verify-btn">
          Complete Verification <i className="ti ti-arrow-right" />
        </a>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Find Ride">

      {/* ── SEARCH + FILTER BAR ── */}
      <div className="fr-toolbar">
        <div className="fr-search-wrap">
          <i className="ti ti-search fr-search-icon" />
          <input
            className="fr-search"
            placeholder="Search by location or community..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="fr-search-clear" onClick={() => setSearch("")}>
              <i className="ti ti-x" />
            </button>
          )}
        </div>

        <button
          className={`fr-filter-btn ${filterWomen ? "active" : ""}`}
          onClick={() => setFilterWomen(!filterWomen)}
        >
          <i className="ti ti-gender-female" />
          Women-only
        </button>

        <div className="fr-count-badge">
          {filtered.length} ride{filtered.length !== 1 ? "s" : ""}
        </div>
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
      {!loading && filtered.length === 0 && (
        <div className="fr-empty">
          <i className="ti ti-car-off fr-empty-icon" />
          <h4>No rides found</h4>
          <p>{search || filterWomen ? "Try adjusting your filters." : "No rides available right now. Check back later."}</p>
        </div>
      )}

      {/* ── RIDE CARDS ── */}
      {!loading && (
        <div className="fr-grid">
          {filtered.map((r, idx) => (
            <div
              className="fr-card"
              key={r.id}
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              {/* type badge */}
              <div className={`fr-card-badge ${r.womenOnly ? "women" : "open"}`}>
                <i className={`ti ${r.womenOnly ? "ti-gender-female" : "ti-users"}`} />
                {r.womenOnly ? "Women-only" : "Open"}
              </div>

              {/* route */}
              <div className="fr-route">
                <div className="fr-route-point">
                  <div className="fr-route-dot from" />
                  <span className="fr-route-label">From</span>
                  <span className="fr-route-place">{r.fromLocation}</span>
                </div>
                <div className="fr-route-line">
                  <i className="ti ti-arrow-right fr-route-arrow" />
                </div>
                <div className="fr-route-point">
                  <div className="fr-route-dot to" />
                  <span className="fr-route-label">To</span>
                  <span className="fr-route-place">{r.toLocation}</span>
                </div>
              </div>

              {/* meta */}
              <div className="fr-meta">
                <div className="fr-meta-item">
                  <i className="ti ti-calendar" />
                  <span>{r.date}</span>
                </div>
                <div className="fr-meta-item">
                  <i className="ti ti-clock" />
                  <span>{r.time}</span>
                </div>
                <div className="fr-meta-item">
                  <i className="ti ti-armchair" />
                  <span>{r.seats} seat{r.seats !== 1 ? "s" : ""}</span>
                </div>
                {r.community && (
                  <div className="fr-meta-item">
                    <i className="ti ti-building" />
                    <span>{r.community}</span>
                  </div>
                )}
              </div>

              {/* seat bar */}
              <div className="fr-seat-bar">
                <div
                  className="fr-seat-fill"
                  style={{ width: `${Math.min((r.seats / 6) * 100, 100)}%` }}
                />
              </div>

              {/* action */}
              <button
                className={`fr-book-btn ${r.seats === 0 ? "full" : ""}`}
                onClick={() => handleBook(r.id)}
                disabled={r.seats === 0 || bookingId === r.id}
              >
                {bookingId === r.id ? (
                  <><span className="fr-btn-spinner" /> Booking...</>
                ) : r.seats === 0 ? (
                  <><i className="ti ti-ban" /> Fully Booked</>
                ) : (
                  <><i className="ti ti-check" /> Book this ride</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
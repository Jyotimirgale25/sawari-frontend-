import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const booking = JSON.parse(localStorage.getItem("lastBooking") || "null");
  const rideId = booking?.rideId;
  const [ride, setRide] = useState(null);

  useEffect(() => {
    if (!rideId) return;
    fetch(`http://localhost:8080/api/rides/${rideId}`)
      .then((res) => res.json())
      .then((data) => setRide(data))
      .catch(() => {});
  }, [rideId]);

  if (!booking) {
    return (
      <DashboardLayout title="Booking Confirmation">
        <div className="section">
          <h3 className="section-title">No booking found</h3>
          <div className="section-sub">Book a ride first.</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Booking Confirmation">
      <div className="section">
        <div className="section-head">
          <div>
            <h3 className="section-title">✅ Booking Confirmed</h3>
            <div className="section-sub">Your ride has been booked successfully.</div>
          </div>
          <span className="badge-pro badge-ok">{booking.status}</span>
        </div>

        {ride ? (
          <div style={{ marginTop: 16 }}>
            <div className="row-card">
              <div className="row-main">
                <div className="row-title">
                  {ride.fromLocation} → {ride.toLocation}
                </div>
                <div className="row-sub">
                  <span>{ride.date} • {ride.time}</span>
                  <span>•</span>
                  <span>{ride.community || "General"}</span>
                  <span>•</span>
                  <span>{ride.womenOnly ? "Women-only" : "Open"}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-muted">Loading ride details...</div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <button
            className="btn-primary-pro"
            onClick={() => navigate("/dashboard/bookings")}
          >
            View My Bookings
          </button>
          <button
            className="btn-outline"
            onClick={() => navigate("/dashboard/find-ride")}
          >
            Find More Rides
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
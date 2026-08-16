import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import DashboardLayout from "../../layouts/DashboardLayout";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const BASE_URL = "http://localhost:8080";

export default function LiveTracking() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isDriver = user.role?.toLowerCase() === "driver";

  const [activeRide, setActiveRide] = useState(null);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [loadingRide, setLoadingRide] = useState(true);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState("");
  const [watching, setWatching] = useState(false);
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    const fetchActiveRide = async () => {
      try {
        if (isDriver) {
          // Driver — fetch their active ride from backend
          const res = await fetch(`${BASE_URL}/api/rides/driver/${user.id}`);
          if (res.ok) {
            const rides = await res.json();
            const active = rides.find((r) => r.status === "ACTIVE") || null;
            setActiveRide(active);
          }
        } else {
          // User — fetch their confirmed booking then get ride details
          const res = await fetch(`${BASE_URL}/api/bookings/passenger/${user.id}`);
          if (res.ok) {
            const bookings = await res.json();
            const activeBooking = bookings.find((b) => b.status === "CONFIRMED") || null;

            if (activeBooking) {
              setActiveBookingId(activeBooking.id);
              const rideRes = await fetch(`${BASE_URL}/api/rides/${activeBooking.rideId}`);
              if (rideRes.ok) {
                const rideData = await rideRes.json();
                setActiveRide(rideData);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch active ride:", err);
      } finally {
        setLoadingRide(false);
      }
    };

    fetchActiveRide();
  }, [user.id, isDriver]);

  // Start GPS once ride is loaded
  useEffect(() => {
    if (!activeRide) return;
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setWatching(true);
      },
      (err) => setError("Unable to get location: " + err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    setWatchId(id);
    return () => navigator.geolocation.clearWatch(id);
  }, [activeRide]);

  async function handleEndRide() {
    if (watchId) navigator.geolocation.clearWatch(watchId);

    if (isDriver && activeRide?.id) {
      // Driver completes ride
      try {
        await fetch(`${BASE_URL}/api/rides/${activeRide.id}/complete`, {
          method: "PUT",
        });
      } catch {
        console.error("Failed to complete ride");
      }
    } else if (!isDriver && activeBookingId) {
      // User cancels booking
      try {
        await fetch(`${BASE_URL}/api/bookings/${activeBookingId}/cancel`, {
          method: "PUT",
        });
      } catch {
        console.error("Failed to cancel booking");
      }
      localStorage.removeItem("activeRide");
    }

    navigate("/dashboard");
  }

  if (loadingRide) {
    return (
      <DashboardLayout title="Live Tracking">
        <div className="p-muted">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!activeRide) {
    return (
      <DashboardLayout title="Live Tracking">
        <div className="section">
          <h3 className="section-title">No active ride</h3>
          <div className="section-sub">
            {isDriver
              ? "Create a ride first to enable live tracking."
              : "Book a ride first to enable live tracking."}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Live Tracking">
      <div className="section">
        <div className="section-head">
          <div>
            <h3 className="section-title">Live Tracking</h3>
            <div className="section-sub">
              {activeRide.fromLocation} → {activeRide.toLocation}
            </div>
          </div>
          <span className={`badge-pro ${watching ? "badge-ok" : "badge-pending"}`}>
            {watching ? "GPS Active" : "Locating..."}
          </span>
        </div>

        {/* Ride Info */}
        <div className="row-card" style={{ marginBottom: 16 }}>
          <div className="row-main">
            <div className="row-title">
              {activeRide.fromLocation} → {activeRide.toLocation}
              {isDriver && (
                <span className="badge-pro badge-ok" style={{ marginLeft: 8 }}>
                  Your Ride
                </span>
              )}
            </div>
            <div className="row-sub">
              <span>{activeRide.date} • {activeRide.time}</span>
              <span>•</span>
              <span>{activeRide.community || "General"}</span>
              <span>•</span>
              <span>{activeRide.womenOnly ? "Women-only" : "Open"}</span>
              {isDriver && (
                <>
                  <span>•</span>
                  <span>Seats: <b>{activeRide.seats}</b></span>
                </>
              )}
            </div>
          </div>
          <div className="row-actions">
            <button className="btn-danger-pro" onClick={handleEndRide}>
              {isDriver ? "Complete Ride" : "End Ride"}
            </button>
            <button
              className="btn-outline"
              onClick={() => navigate("/dashboard/sos")}
            >
              🚨 SOS
            </button>
          </div>
        </div>

        {error && (
          <div className="p-muted" style={{ color: "red", marginBottom: 12 }}>
            {error}
          </div>
        )}

        {/* Live position info */}
        {position && (
          <div className="row-card" style={{ marginBottom: 16 }}>
            <div className="row-main">
              <div className="row-title">Your Location</div>
              <div className="row-sub">
                <span>Lat: <b>{position.lat.toFixed(5)}</b></span>
                <span>•</span>
                <span>Lng: <b>{position.lng.toFixed(5)}</b></span>
                <span>•</span>
                <span>Accuracy: <b>{Math.round(position.accuracy)}m</b></span>
              </div>
            </div>
          </div>
        )}

        {/* Map */}
        <div style={{ borderRadius: 12, overflow: "hidden", height: 420, width: "100%" }}>
          {position ? (
            <MapContainer
              center={[position.lat, position.lng]}
              zoom={16}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[position.lat, position.lng]}>
                <Popup>
                  {user.name || "You"} — {activeRide.fromLocation} → {activeRide.toLocation}
                </Popup>
              </Marker>
              <Circle
                center={[position.lat, position.lng]}
                radius={position.accuracy}
                pathOptions={{ color: "blue", fillOpacity: 0.1 }}
              />
            </MapContainer>
          ) : (
            <div style={{
              height: "100%", display: "flex", alignItems: "center",
              justifyContent: "center", background: "#f5f5f5", borderRadius: 12
            }}>
              <div className="p-muted">
                {error ? "Location unavailable" : "Getting your location..."}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
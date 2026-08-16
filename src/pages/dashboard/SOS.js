import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

const BASE_URL = "http://localhost:8080";

export default function SOS() {
  const [open, setOpen]       = useState(false);
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);

  // triple-tap state
  const [tapCount, setTapCount]   = useState(0);
  const [showTap, setShowTap]     = useState(false); // visual indicator
  const tapTimer                  = useRef(null);
  const tapCountRef               = useRef(0);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const contacts = useMemo(() => {
    try {
      const list = JSON.parse(localStorage.getItem("emergencyContacts") || "[]");
      return Array.isArray(list) ? list.filter((c) => c?.name || c?.phone) : [];
    } catch { return []; }
  }, []);

  const activeRide = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("activeRide") || "null");
    } catch { return null; }
  }, []);

  // ── TRIPLE TAP LOGIC ──────────────────────────────────────
  const handleTripleTap = useCallback(() => {
    // don't trigger if modal is already open or inside a button/input
    tapCountRef.current += 1;
    setTapCount(tapCountRef.current);
    setShowTap(true);

    // reset timer on each tap
    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      tapCountRef.current = 0;
      setTapCount(0);
      setShowTap(false);
    }, 600); // 600ms window between taps

    if (tapCountRef.current >= 3) {
      // triggered
      tapCountRef.current = 0;
      setTapCount(0);
      setShowTap(false);
      clearTimeout(tapTimer.current);
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    const onTouch = (e) => {
      // ignore taps on buttons, inputs, selects
      const tag = e.target.tagName.toLowerCase();
      if (["button", "input", "select", "textarea", "a"].includes(tag)) return;
      handleTripleTap();
    };

    // use touchstart for mobile, click for desktop
    window.addEventListener("touchstart", onTouch);
    window.addEventListener("click", onTouch);

    return () => {
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("click", onTouch);
      clearTimeout(tapTimer.current);
    };
  }, [handleTripleTap]);

  // ── SEND SOS ──────────────────────────────────────────────
  async function sendSOS() {
    setSending(true);
    try {
      const res = await fetch(`${BASE_URL}/api/sos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          role: user.role,
          message: "SOS triggered from dashboard",
          rideFrom: activeRide?.fromLocation || null,
          rideTo:   activeRide?.toLocation   || null,
          rideDate: activeRide?.date         || null,
          rideTime: activeRide?.time         || null,
        }),
      });

      if (!res.ok) throw new Error();
      setSent(true);
      setOpen(false);
      setTimeout(() => setSent(false), 3000);
    } catch {
      alert("Failed to send SOS. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <DashboardLayout title="SOS">

      {/* ── TRIPLE TAP INDICATOR ── */}
      {showTap && (
        <div className="sos-tap-indicator">
          <div className="sos-tap-rings">
            <div className="sos-tap-ring" />
            <div className="sos-tap-ring r2" />
          </div>
          <div className="sos-tap-dots">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`sos-tap-dot ${tapCount >= n ? "active" : ""}`}
              />
            ))}
          </div>
          <div className="sos-tap-label">
            {tapCount >= 3 ? "SOS Activated!" : `Tap ${3 - tapCount} more time${3 - tapCount !== 1 ? "s" : ""}...`}
          </div>
        </div>
      )}

      {/* ── TRIPLE TAP HINT BANNER ── */}
      <div className="sos-hint-banner">
        <span className="sos-hint-icon">👆</span>
        <span>Triple tap <b>anywhere on screen</b> to instantly trigger SOS</span>
      </div>

      <div className="grid-2">
        {/* ── SOS CARD ── */}
        <div className="warn-card">
          <h3>Emergency SOS</h3>
          <p className="muted">
            Use SOS only in emergencies. This will notify admin & emergency contacts.
            You can also <b>triple tap anywhere</b> on screen to trigger instantly.
          </p>

          {activeRide ? (
            <div className="mini-card" style={{ marginTop: 12 }}>
              <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>
                Active Ride Context:
              </div>
              <div style={{ fontWeight: 800 }}>
                {activeRide.fromLocation} → {activeRide.toLocation}
              </div>
              <div className="muted">
                {activeRide.date} • {activeRide.time}
              </div>
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 10 }}>
              No active ride currently.
            </p>
          )}

          <button className="sos-btn" onClick={() => setOpen(true)}>
            SOS
          </button>

          {sent && <div className="success">✅ SOS Sent — Admin & contacts notified</div>}
        </div>

        {/* ── CONTACTS CARD ── */}
        <div className="mini-card">
          <h3 style={{ marginTop: 0 }}>Emergency Contacts</h3>
          {contacts.length === 0 ? (
            <p className="muted">
              No contacts saved. Add them in <b>Settings</b>.
            </p>
          ) : (
            <div className="contact-list">
              {contacts.map((c, i) => (
                <div key={i} className="contact-row">
                  <div className="contact-name">{c.name || "Unnamed"}</div>
                  <div className="contact-phone muted">{c.phone || "-"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CONFIRM MODAL ── */}
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal sos-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sos-modal-icon">🚨</div>
            <h3 style={{ marginTop: 8 }}>Confirm SOS Alert</h3>
            <p className="muted">
              This will immediately alert admin and notify your emergency contacts.
            </p>

            {activeRide && (
              <div className="mini-card" style={{ marginTop: 12 }}>
                <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                  Ride context will be shared:
                </div>
                <div style={{ fontWeight: 800 }}>
                  {activeRide.fromLocation} → {activeRide.toLocation}
                </div>
                <div className="muted">{activeRide.date} • {activeRide.time}</div>
              </div>
            )}

            {contacts.length > 0 && (
              <div className="mini-card" style={{ marginTop: 12 }}>
                <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                  Contacts to notify:
                </div>
                <div className="contact-list">
                  {contacts.map((c, i) => (
                    <div key={i} className="contact-row">
                      <div className="contact-name">{c.name || "Unnamed"}</div>
                      <div className="contact-phone muted">{c.phone || "-"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-secondary-pro" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button
                className="btn-danger-pro"
                onClick={sendSOS}
                disabled={sending}
                style={{ minWidth: 120 }}
              >
                {sending ? "Sending..." : "🚨 Send SOS"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
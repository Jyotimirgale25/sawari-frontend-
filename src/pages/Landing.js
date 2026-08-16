import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import "../styles/landing.css";
import logo from "../assets/Sawari_logo.png"; // change to .jpeg if needed

export default function Landing() {
  return (
    <>
      {/* ── SPLASH SCREEN ── */}
      <div className="lp-splash">
        <div className="lp-splash-ring r1" />
        <div className="lp-splash-ring r2" />
        <div className="lp-splash-ring r3" />
        <img src={logo} alt="SAWARI" className="lp-splash-logo" />
        <div className="lp-splash-name">SAWARI</div>
        <div className="lp-splash-tag">Because they deserve a safe ride.</div>
      </div>

      <Navbar />

      <main className="lp">

        {/* ── BACKGROUND WATERMARKS ── */}
        <div className="lp-wm-bg" aria-hidden="true">
          <img src={logo} className="lp-wm lp-wm1" alt="" />
          <img src={logo} className="lp-wm lp-wm2" alt="" />
          <img src={logo} className="lp-wm lp-wm3" alt="" />
        </div>

        {/* ── HERO ── */}
        <section className="lp-hero">
          <div className="lp-hero-inner">
            <div className="lp-hero-left">
              <div className="lp-kicker">
                <span className="lp-kicker-dot" />
                SAWARI • Women safety oriented car sharing system
              </div>

              <h1 className="lp-title">
                Because they deserve a{" "}
                <span className="lp-title-accent">safe ride.</span>
              </h1>

              <p className="lp-sub">
                Verified users. Verified drivers. Live tracking & SOS.
                SAWARI is built to make ride-sharing safer, smarter and more accountable.
              </p>

              <div className="lp-cta">
                <Link className="lp-btn lp-btn-primary" to="/register">
                  Get Started <span className="lp-arrow">→</span>
                </Link>
                <Link className="lp-btn lp-btn-ghost" to="/login">Login</Link>
              </div>

              <div className="lp-trust">
                <div className="lp-trust-item"><span className="lp-dot" /> Identity Verification</div>
                <div className="lp-trust-item"><span className="lp-dot" /> SOS + Admin Monitor</div>
                <div className="lp-trust-item"><span className="lp-dot" /> Live Tracking Ready</div>
              </div>
            </div>

            <div className="lp-hero-right">
              <div className="lp-mock">
                <img src={logo} className="lp-mock-wm" alt="" aria-hidden="true" />

                <div className="lp-mock-top">
                  <div className="lp-mock-pill">SAWARI Dashboard Preview</div>
                  <div className="lp-mock-status">
                    <span className="lp-status-dot" /> Verified
                  </div>
                </div>

                <div className="lp-mock-cards">
                  <div className="lp-mock-card">
                    <div className="lp-mock-h">Ride Type</div>
                    <div className="lp-mock-v">Women-only / Open</div>
                  </div>
                  <div className="lp-mock-card">
                    <div className="lp-mock-h">Safety</div>
                    <div className="lp-mock-v">SOS + Contacts</div>
                  </div>
                  <div className="lp-mock-card">
                    <div className="lp-mock-h">Tracking</div>
                    <div className="lp-mock-v">Live Map Ready</div>
                  </div>
                </div>

                <div className="lp-mock-map">
                  <div className="lp-mock-road" />
                  <div className="lp-map-car">🚗</div>
                  <div className="lp-map-pulse">
                    <div className="lp-map-dot" />
                    <div className="lp-map-ripple" />
                    <div className="lp-map-ripple r2" />
                  </div>
                  <div className="lp-map-text">Map placeholder (future integration)</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="lp-stats">
          <div className="lp-stats-inner">
            {[
              { n: "100%", l: "Verified Drivers" },
              { n: "3-Role", l: "Access Control" },
              { n: "1-Tap", l: "SOS Alert" },
              { n: "Live", l: "GPS Tracking" },
            ].map((s, i) => (
              <div className="lp-stat-wrap" key={i}>
                <div className="lp-stat">
                  <div className="lp-stat-n">{s.n}</div>
                  <div className="lp-stat-l">{s.l}</div>
                </div>
                {i < 3 && <div className="lp-stat-div" />}
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="lp-section">
          <div className="lp-section-head">
            <div className="lp-section-label">Features</div>
            <h2 className="lp-h2">Safety features that actually matter</h2>
            <p className="lp-p">
              SAWARI focuses on trust, verification, and quick help — not just "booking rides".
            </p>
          </div>

          <div className="lp-grid">
            {[
              { icon: "ti-shield-check", color: "#4f46e5", bg: "rgba(79,70,229,0.09)", title: "Identity Verification", desc: "Users and drivers go through verification to reduce fake accounts and improve accountability." },
              { icon: "ti-car", color: "#0891b2", bg: "rgba(8,145,178,0.09)", title: "Women-only Ride Option", desc: "Every ride clearly shows the type — Women-only or Open — so riders can choose confidently." },
              { icon: "ti-map-pin", color: "#16a34a", bg: "rgba(22,163,74,0.09)", title: "Live Tracking", desc: "Tracking activates during an active ride. Built map-ready for Google Maps / Mapbox integration." },
              { icon: "ti-alert-triangle", color: "#dc2626", bg: "rgba(220,38,38,0.09)", title: "SOS in One Tap", desc: "SOS shares ride context and alerts emergency contacts + admin panel for faster response." },
              { icon: "ti-device-desktop-analytics", color: "#9333ea", bg: "rgba(147,51,234,0.09)", title: "Admin Monitoring", desc: "Admin can monitor SOS alerts, verify users/drivers, and remove risky rides instantly." },
              { icon: "ti-circle-check", color: "#ea580c", bg: "rgba(234,88,12,0.09)", title: "Safe Booking Flow", desc: "Only verified users can book rides. Booking → Start Ride → Live Tracking → SOS support." },
            ].map((f, i) => (
              <div className="lp-card" key={i} style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="lp-ic-wrap" style={{ background: f.bg }}>
                  <i className={`ti ${f.icon}`} style={{ color: f.color, fontSize: 22 }} aria-hidden="true" />
                </div>
                <h3 className="lp-h3">{f.title}</h3>
                <p className="lp-muted">{f.desc}</p>
                <div className="lp-card-bar" style={{ background: f.color }} />
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="lp-section lp-section-soft">
          <div className="lp-section-head">
            <div className="lp-section-label">How it works</div>
            <h2 className="lp-h2">How SAWARI works</h2>
            <p className="lp-p">A simple flow designed around safety and trust.</p>
          </div>

          <div className="lp-steps">
            {[
              { n: "01", icon: "ti-user-plus", t: "Register", d: "Choose User or Driver and create your account." },
              { n: "02", icon: "ti-id-badge", t: "Verify", d: "Submit documents for identity verification and approval." },
              { n: "03", icon: "ti-car", t: "Ride", d: "Find/Book rides (users). Drivers create rides (verified drivers)." },
              { n: "04", icon: "ti-radar", t: "Track + SOS", d: "Start ride → live tracking → SOS with contacts + admin monitoring." },
            ].map((s, i) => (
              <div className="lp-step" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="lp-step-num">{s.n}</div>
                <div className="lp-step-icon">
                  <i className={`ti ${s.icon}`} aria-hidden="true" />
                </div>
                <div className="lp-step-t">{s.t}</div>
                <div className="lp-muted">{s.d}</div>
                {i < 3 && <div className="lp-step-conn" />}
              </div>
            ))}
          </div>

          <div className="lp-bottom-cta">
            <div className="lp-bottom-card">
              <img src={logo} alt="SAWARI" className="lp-bottom-logo" />
              <h3 className="lp-h3" style={{ marginTop: 0 }}>Ready to start?</h3>
              <p className="lp-muted">Create your account and explore the dashboard experience.</p>
              <div className="lp-cta" style={{ justifyContent: "center" }}>
                <Link className="lp-btn lp-btn-primary" to="/register">
                  Create Account <span className="lp-arrow">→</span>
                </Link>
                <Link className="lp-btn lp-btn-ghost" to="/login">Login</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <div className="lp-footer-inner">
            <div className="lp-footer-brand">
              <img src={logo} alt="SAWARI" className="lp-footer-logo" />
              <div>
                <div className="lp-footer-name">SAWARI</div>
                <div className="lp-footer-tag">Because they deserve a safe ride.</div>
              </div>
            </div>
            <div className="lp-footer-links">
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
              <Link to="/dashboard">Dashboard</Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
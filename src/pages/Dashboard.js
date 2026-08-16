import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/dashboard.css";

const BASE = "http://localhost:8080";

export default function Dashboard() {
  const user   = JSON.parse(localStorage.getItem("user") || "{}");
  const role   = (user.role || "user").toLowerCase();
  const navigate = useNavigate();

  const [verification,   setVerification]   = useState(null);
  const [rides,          setRides]           = useState([]);
  const [bookings,       setBookings]        = useState([]);
  const [loading,        setLoading]         = useState(true);

  // Admin stats
  const [pendingDrivers, setPendingDrivers] = useState(0);
  const [pendingUsers,   setPendingUsers]   = useState(0);
  const [totalRides,     setTotalRides]     = useState(0);
  const [totalSOS,       setTotalSOS]       = useState(0);
  const [pendingSOS,     setPendingSOS]     = useState(0);
  const [totalUsers,     setTotalUsers]     = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        if (role === "admin") {
          const [dR, uR, rR, sR] = await Promise.all([
            fetch(`${BASE}/api/verification/admin/all`),
            fetch(`${BASE}/api/user-verification/admin/all`),
            fetch(`${BASE}/api/rides/admin/all`),
            fetch(`${BASE}/api/sos/admin/all`),
          ]);
          if (dR.ok) { const d = await dR.json(); setPendingDrivers(d.filter(x=>x.status==="PENDING").length); setTotalUsers(p=>p+d.length); }
          if (uR.ok) { const u = await uR.json(); setPendingUsers(u.filter(x=>x.status==="PENDING").length);   setTotalUsers(p=>p+u.length); }
          if (rR.ok) { const r = await rR.json(); setTotalRides(r.length); }
          if (sR.ok) { const s = await sR.json(); setTotalSOS(s.length); setPendingSOS(s.filter(x=>x.status==="SENT").length); }
        } else {
          const ep = role === "driver"
            ? `${BASE}/api/verification/driver/${user.id}`
            : `${BASE}/api/user-verification/user/${user.id}`;
          const vR = await fetch(ep);
          if (vR.ok) setVerification(await vR.json());

          if (role === "driver") {
            const rR = await fetch(`${BASE}/api/rides/driver/${user.id}`);
            if (rR.ok) setRides(await rR.json());
          } else {
            const bR = await fetch(`${BASE}/api/bookings/passenger/${user.id}`);
            if (bR.ok) setBookings(await bR.json());
          }
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user.id, role]);

  const verifyStatus = verification?.status || null;
  const verifyBadge  = verifyStatus==="APPROVED" ? "ok" : verifyStatus==="REJECTED" ? "bad" : "pending";
  const verifyLabel  = !verifyStatus ? "Not submitted"
    : verifyStatus==="APPROVED" ? `Verified ${role==="driver"?"Driver":"User"}`
    : verifyStatus==="REJECTED" ? "Rejected — resubmit"
    : "Pending review";

  const activeRide = role==="driver"
    ? rides.find(r=>r.status==="ACTIVE")
    : bookings.find(b=>b.status==="CONFIRMED");

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  // ── ADMIN ────────────────────────────────────────────────
  if (role === "admin") {
    return (
      <DashboardLayout title="Overview">
        <div className="db-greeting">
          <div>
            <h2 className="db-greeting-text">{greeting()}, Admin 👋</h2>
            <p className="db-greeting-sub">Here's your platform overview.</p>
          </div>
        </div>

        {loading ? <div className="db-loading"><span className="db-spinner" />Loading...</div> : (
          <>
            <div className="db-kpi-grid">
              {[
                { label:"Total Registrations", value: totalUsers,               icon:"ti-users",          color:"#4f46e5" },
                { label:"Total Rides",          value: totalRides,               icon:"ti-car",            color:"#0891b2" },
                { label:"Pending Verifications",value: pendingDrivers+pendingUsers, icon:"ti-clock",       color: pendingDrivers+pendingUsers>0?"#d97706":"#16a34a" },
                { label:"Unresolved SOS",       value: pendingSOS,               icon:"ti-alert-triangle", color: pendingSOS>0?"#dc2626":"#16a34a" },
              ].map((k,i)=>(
                <div className="db-kpi" key={i} style={{"--kpi-color": k.color}}>
                  <div className="db-kpi-icon"><i className={`ti ${k.icon}`} /></div>
                  <div className="db-kpi-val">{k.value}</div>
                  <div className="db-kpi-label">{k.label}</div>
                </div>
              ))}
            </div>

            <div className="db-grid-2">
              {/* verifications */}
              <div className="db-card">
                <div className="db-card-head">
                  <div className="db-card-icon" style={{background:"rgba(79,70,229,0.08)",color:"#4f46e5"}}>
                    <i className="ti ti-id-badge" />
                  </div>
                  <div>
                    <h3 className="db-card-title">Verifications</h3>
                    <p className="db-card-sub">Pending approvals needing attention</p>
                  </div>
                  <span className={`db-badge ${pendingDrivers+pendingUsers>0?"warn":"ok"}`}>
                    {pendingDrivers+pendingUsers>0?"Action needed":"All clear"}
                  </span>
                </div>
                <div className="db-stat-rows">
                  <div className="db-stat-row">
                    <div className="db-stat-row-icon" style={{background:"rgba(8,145,178,0.08)",color:"#0891b2"}}><i className="ti ti-steering-wheel"/></div>
                    <span>Driver verifications pending</span>
                    <b className="db-stat-row-val">{pendingDrivers}</b>
                  </div>
                  <div className="db-stat-row">
                    <div className="db-stat-row-icon" style={{background:"rgba(79,70,229,0.08)",color:"#4f46e5"}}><i className="ti ti-user"/></div>
                    <span>User verifications pending</span>
                    <b className="db-stat-row-val">{pendingUsers}</b>
                  </div>
                </div>
                <button className="db-action-btn" onClick={()=>navigate("/dashboard/admin-verification")}>
                  Review Drivers <i className="ti ti-arrow-right"/>
                </button>
              </div>

              {/* SOS */}
              <div className="db-card">
                <div className="db-card-head">
                  <div className="db-card-icon" style={{background:"rgba(220,38,38,0.08)",color:"#dc2626"}}>
                    <i className="ti ti-alert-triangle" />
                  </div>
                  <div>
                    <h3 className="db-card-title">SOS Alerts</h3>
                    <p className="db-card-sub">Emergency alerts requiring response</p>
                  </div>
                  <span className={`db-badge ${pendingSOS>0?"danger":"ok"}`}>
                    {pendingSOS>0?"Urgent":"All clear"}
                  </span>
                </div>
                <div className="db-stat-rows">
                  <div className="db-stat-row">
                    <div className="db-stat-row-icon" style={{background:"rgba(220,38,38,0.08)",color:"#dc2626"}}><i className="ti ti-bell-ringing"/></div>
                    <span>Unresolved SOS alerts</span>
                    <b className="db-stat-row-val" style={{color:"#dc2626"}}>{pendingSOS}</b>
                  </div>
                  <div className="db-stat-row">
                    <div className="db-stat-row-icon" style={{background:"rgba(15,23,42,0.05)",color:"#64748b"}}><i className="ti ti-list"/></div>
                    <span>Total SOS events</span>
                    <b className="db-stat-row-val">{totalSOS}</b>
                  </div>
                </div>
                <button className="db-action-btn danger" onClick={()=>navigate("/dashboard/admin-sos")}>
                  View SOS Alerts <i className="ti ti-arrow-right"/>
                </button>
              </div>
            </div>
          </>
        )}
      </DashboardLayout>
    );
  }

  // ── USER / DRIVER ────────────────────────────────────────
  return (
    <DashboardLayout title="Overview">
      <div className="db-greeting">
        <div>
          <h2 className="db-greeting-text">{greeting()}, {user.name?.split(" ")[0] || "there"} 👋</h2>
          <p className="db-greeting-sub">
            {role==="driver" ? "Manage your rides and stay safe." : "Find rides and travel safely with SAWARI."}
          </p>
        </div>
        <div className={`db-verify-chip ${verifyBadge}`}>
          <i className={`ti ${verifyBadge==="ok"?"ti-shield-check":verifyBadge==="bad"?"ti-shield-x":"ti-clock"}`}/>
          {verifyLabel}
        </div>
      </div>

      {loading ? <div className="db-loading"><span className="db-spinner"/>Loading...</div> : (
        <>
          <div className="db-kpi-grid">
            {(() => {
  const kpis = role === "driver" ? [
    { label: "Total Rides",   value: rides.length,                                icon: "ti-car",          color: "#4f46e5" },
    { label: "Active Rides",  value: rides.filter(r => r.status === "ACTIVE").length,   icon: "ti-player-play",  color: "#16a34a" },
    { label: "Completed",     value: rides.filter(r => r.status === "COMPLETED").length, icon: "ti-circle-check", color: "#0891b2" },
    { label: "Cancelled",     value: rides.filter(r => r.status === "CANCELLED").length, icon: "ti-ban",          color: "#dc2626" },
  ] : [
    { label: "Total Bookings", value: bookings.length,                                   icon: "ti-ticket",       color: "#4f46e5" },
    { label: "Confirmed",      value: bookings.filter(b => b.status === "CONFIRMED").length, icon: "ti-circle-check", color: "#16a34a" },
    { label: "Cancelled",      value: bookings.filter(b => b.status === "CANCELLED").length, icon: "ti-ban",          color: "#dc2626" },
    { label: "Verification",   value: verifyLabel, icon: "ti-shield", color: verifyBadge === "ok" ? "#16a34a" : verifyBadge === "bad" ? "#dc2626" : "#d97706", isText: true },
  ];

  return kpis.map((kpi, idx) => (
    <div className="db-kpi" key={idx} style={{ "--kpi-color": kpi.color }}>
      <div className="db-kpi-icon"><i className={`ti ${kpi.icon}`} /></div>
      <div className={`db-kpi-val ${kpi.isText ? "db-kpi-val-sm" : ""}`}>{kpi.value}</div>
      <div className="db-kpi-label">{kpi.label}</div>
    </div>
  ));
})()}
          </div>

          <div className="db-grid-2">
            {/* active ride / booking */}
            <div className="db-card">
              <div className="db-card-head">
                <div className="db-card-icon" style={{background:"rgba(79,70,229,0.08)",color:"#4f46e5"}}>
                  <i className={`ti ${role==="driver"?"ti-car":"ti-ticket"}`}/>
                </div>
                <div>
                  <h3 className="db-card-title">{role==="driver"?"Active Ride":"Current Booking"}</h3>
                  <p className="db-card-sub">{role==="driver"?"Your currently active ride":"Your confirmed booking"}</p>
                </div>
                <span className={`db-badge ${activeRide?"ok":""}`}>{activeRide?"Active":"None"}</span>
              </div>

              {!activeRide ? (
                <div className="db-empty-state">
                  <i className={`ti ${role==="driver"?"ti-car-off":"ti-ticket-off"} db-empty-icon`}/>
                  <p>{role==="driver"?"No active ride. Create one!":"No confirmed booking. Find a ride!"}</p>
                  <button className="db-action-btn" onClick={()=>navigate(role==="driver"?"/dashboard/create-ride":"/dashboard/find-ride")}>
                    {role==="driver"?"Create Ride":"Find a Ride"} <i className="ti ti-arrow-right"/>
                  </button>
                </div>
              ) : (
                <div className="db-active-ride">
                  {role==="driver" ? (
                    <>
                      <div className="db-ride-route">
                        <div className="db-route-pt">
                          <div className="db-route-dot from"/>
                          <span>{activeRide.fromLocation}</span>
                        </div>
                        <i className="ti ti-arrow-right db-route-arrow"/>
                        <div className="db-route-pt">
                          <div className="db-route-dot to"/>
                          <span>{activeRide.toLocation}</span>
                        </div>
                      </div>
                      <div className="db-ride-meta">
                        <span><i className="ti ti-calendar"/> {activeRide.date}</span>
                        <span><i className="ti ti-clock"/> {activeRide.time}</span>
                        <span><i className="ti ti-armchair"/> {activeRide.seats} seats</span>
                      </div>
                    </>
                  ) : (
                    <div className="db-booking-info">
                      <div className="db-badge ok"><i className="ti ti-circle-check"/> Booking #{activeRide.id}</div>
                      <p className="db-booking-status">Status: <b>{activeRide.status}</b></p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* safety / verification */}
            <div className="db-card">
              <div className="db-card-head">
                <div className="db-card-icon" style={{background:"rgba(220,38,38,0.08)",color:"#dc2626"}}>
                  <i className="ti ti-shield"/>
                </div>
                <div>
                  <h3 className="db-card-title">Safety</h3>
                  <p className="db-card-sub">Your safety tools and verification</p>
                </div>
              </div>

              <div className="db-stat-rows">
                <div className="db-stat-row">
                  <div className={`db-stat-row-icon`} style={{background:`rgba(${verifyBadge==="ok"?"22,163,74":verifyBadge==="bad"?"220,38,38":"217,119,6"},0.08)`, color: verifyBadge==="ok"?"#16a34a":verifyBadge==="bad"?"#dc2626":"#d97706"}}>
                    <i className={`ti ${verifyBadge==="ok"?"ti-shield-check":verifyBadge==="bad"?"ti-shield-x":"ti-clock"}`}/>
                  </div>
                  <span>Identity verification</span>
                  <b className="db-stat-row-val">{verifyLabel}</b>
                </div>
                <div className="db-stat-row">
                  <div className="db-stat-row-icon" style={{background:"rgba(220,38,38,0.08)",color:"#dc2626"}}><i className="ti ti-alert-triangle"/></div>
                  <span>SOS — triple tap anywhere</span>
                  <b className="db-stat-row-val" style={{color:"#16a34a"}}>Ready</b>
                </div>
              </div>

              <div className="db-card-actions">
                <button className="db-action-btn" onClick={()=>navigate("/dashboard/verification")}>
                  {verifyStatus==="APPROVED"?"View Verification":"Complete Verification"} <i className="ti ti-arrow-right"/>
                </button>
                <button className="db-action-btn danger" onClick={()=>navigate("/dashboard/sos")}>
                  <i className="ti ti-alert-triangle"/> SOS
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
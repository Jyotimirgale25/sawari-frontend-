import { NavLink, useNavigate } from "react-router-dom";

export default function DashboardLayout({ title, children }) {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role?.toLowerCase();

  const isAdmin = role === "admin";
  const isDriver = role === "driver";
  const isUser = role === "user";

  function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="dash-shell">
      <aside className="sidebar">
        <div className="sb-top">
          <div className="brand">
            <div className="brand-name">SAWARI</div>
            <div className="safety-badge">
              Because they deserve a safe ride
            </div>
          </div>

          <div className="role-box">
            <div className="role-line">
              <span className="role-label">ROLE</span>
              <span className="role-value">{role || "user"}</span>
            </div>
          </div>
        </div>

        <nav className="sb-nav">

          {/* USER NAV */}
          {isUser && (
            <div className="nav-section">
              <div className="nav-head">Main</div>
              <NavLink to="/dashboard" end className="nav-item">Overview</NavLink>
              <NavLink to="/dashboard/find-ride" className="nav-item">Find Ride</NavLink>
              <NavLink to="/dashboard/verification" className="nav-item">Verification</NavLink>
              <NavLink to="/dashboard/live-tracking" className="nav-item">Live Tracking</NavLink>
              <NavLink to="/dashboard/sos" className="nav-item">SOS</NavLink>
            </div>
          )}

          {isUser && (
            <div className="nav-section">
              <div className="nav-head">Your Activity</div>
              <NavLink to="/dashboard/bookings" className="nav-item">My Bookings</NavLink>
              <NavLink to="/dashboard/settings" className="nav-item">Settings</NavLink>
            </div>
          )}

          {/* DRIVER NAV */}
          {isDriver && (
            <div className="nav-section">
              <div className="nav-head">Main</div>
              <NavLink to="/dashboard" end className="nav-item">Overview</NavLink>
              <NavLink to="/dashboard/create-ride" className="nav-item">Create Ride</NavLink>
              <NavLink to="/dashboard/verification" className="nav-item">Verification</NavLink>
              <NavLink to="/dashboard/live-tracking" className="nav-item">Live Tracking</NavLink>
              <NavLink to="/dashboard/sos" className="nav-item">SOS</NavLink>
            </div>
          )}

          {isDriver && (
            <div className="nav-section">
              <div className="nav-head">Your Activity</div>
              <NavLink to="/dashboard/my-rides" className="nav-item">My Rides</NavLink>
              <NavLink to="/dashboard/settings" className="nav-item">Settings</NavLink>
            </div>
          )}

          {/* ADMIN NAV */}
          {isAdmin && (
            <div className="nav-section">
              <div className="nav-head">Main</div>
              <NavLink to="/dashboard" end className="nav-item">Overview</NavLink>
            </div>
          )}

          {isAdmin && (
            <div className="nav-section">
              <div className="nav-head">Admin</div>
              <NavLink to="/dashboard/admin-sos" className="nav-item">Admin SOS</NavLink>
              <NavLink to="/dashboard/admin-rides" className="nav-item">Admin Rides</NavLink>
              <NavLink to="/dashboard/admin-verification" className="nav-item">Verify Drivers</NavLink>
              <NavLink to="/dashboard/admin-users" className="nav-item">Verify Users</NavLink>
            </div>
          )}

        </nav>

        <div className="sb-bottom">
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
          <div className="sb-foot">SAWARI • Dashboard</div>
        </div>
      </aside>

      <main className="dash-main">
        <div className="topbar">
          <div className="top-title">{title || "Dashboard"}</div>
          <div className="top-right">
            <div className={`pill ${isAdmin ? "pill-admin" : isDriver ? "pill-driver" : "pill-user"}`}>
              {isAdmin ? "Admin" : isDriver ? "Driver" : "User"}
            </div>
          </div>
        </div>

        <div className="dash-content">{children}</div>
      </main>
    </div>
  );
}
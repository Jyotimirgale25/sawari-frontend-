import { Link, NavLink } from "react-router-dom";
import "../styles/navbar.css";
import logo from "../assets/Sawari_logo.png"; // make sure logo is in src/assets/

export default function Navbar() {
  return (
    <header className="nb">
      <div className="nb-inner">
        {/* Brand */}
        <Link to="/" className="nb-brand">
          <img src={logo} alt="Sawari Logo" className="nb-logo" />
          <span className="nb-name">SAWARI</span>
        </Link>

        {/* Links */}
        <nav className="nb-links">
          <NavLink to="/" end className={({ isActive }) => `nb-link ${isActive ? "active" : ""}`}>
            Home
          </NavLink>

          <NavLink to="/login" className={({ isActive }) => `nb-link ${isActive ? "active" : ""}`}>
            Login
          </NavLink>

          <Link to="/register" className="nb-btn">
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}

import { NavLink, useLocation } from "react-router-dom";
import robot from "../../assets/Waving Futuristic Robot Mascot.png";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();

  return (
    <nav className={`navbar ${location.pathname === "/" ? "home-navbar" : "other-navbar"}`}>
      <NavLink to="/" className="navbar-logo">
        <img src={robot} alt="LinguaFlow Robot" className="robot-logo" />

        <span className="logo-text">
          LinguaFlow <span>AI</span>
        </span>
      </NavLink>

      <ul className="nav-links">
        <li><NavLink to="/" end>Home</NavLink></li>
        <li><NavLink to="/about">About</NavLink></li>
        <li><NavLink to="/login">Login</NavLink></li>
      </ul>

      <NavLink to="/signup" className="nav-start-btn">
        Sign Up <span>→</span>
      </NavLink>
    </nav>
  );
}

export default Navbar;





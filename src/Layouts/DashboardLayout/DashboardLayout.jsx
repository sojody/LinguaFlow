import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../../supabaseClient";
import robot from "../../assets/Waving Futuristic Robot Mascot.png";
import "./DashboardLayout.css";

function DashboardLayout() {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async (event) => {
    event.preventDefault();

    if (loggingOut) return;

    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Logout failed. Please try again.");
      setLoggingOut(false);
      return;
    }

    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-layout">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">

        <NavLink to="/" className="dashboard-logo">
          <img src={robot} alt="LinguaFlow Robot" />
          <span>
            LinguaFlow <strong>AI</strong>
          </span>
        </NavLink>

        <div className="sidebar-menu">

          <p className="sidebar-title">MENU</p>

          <NavLink to="/dashboard" end className="sidebar-link">
            <span>🏠</span>
            Dashboard
          </NavLink>

          <NavLink to="/choose-scenario" className="sidebar-link">
            <span>🎯</span>
            Choose Scenario
          </NavLink>

          <NavLink to="/dictionary" className="sidebar-link">
            <span>📖</span>
            Dictionary
          </NavLink>

          <NavLink to="/vocabulary" className="sidebar-link">
            <span>📝</span>
            Vocabulary
          </NavLink>

          <NavLink to="/progress" className="sidebar-link">
            <span>📊</span>
            Progress
          </NavLink>

          <NavLink to="/profile" className="sidebar-link">
            <span>👤</span>
            Profile
          </NavLink>

        </div>

        <div className="sidebar-bottom">
          <NavLink
            to="/login"
            className="sidebar-link"
            onClick={handleLogout}
          >
            <span>🚪</span>
            {loggingOut ? "Logging out..." : "Log Out"}
          </NavLink>
        </div>

      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <Outlet />
      </main>

    </div>
  );
}

export default DashboardLayout;


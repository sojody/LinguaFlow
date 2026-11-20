
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import "./MainLayout.css";

function MainLayout() {
  const location = useLocation();

  let layoutClass = "";

  if (location.pathname === "/") {
    layoutClass = "home-layout";
  } else if (location.pathname === "/about") {
    layoutClass = "about-layout";
  }

  return (
    <div className={`main-layout ${layoutClass}`}>
      <Navbar />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;


import { Routes, Route } from "react-router-dom";

import MainLayout from "./Layouts/MainLayout";
import DashboardLayout from "./Layouts/DashboardLayout/DashboardLayout";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Login from "./pages/Login/Login";
import SignUp from "./pages/SignUp/SignUp";

import Dashboard from "./pages/Dashboard/Dashboard";
import ChooseScenario from "./pages/ChooseScenario/ChooseScenario";
import Conversation from "./pages/Conversation/Conversation";
import Dictionary from "./pages/Dictionary/Dictionary";
import Vocabulary from "./pages/Vocabulary/Vocabulary";
import Progress from "./pages/Progress/Progress";
import Profile from "./pages/Profile/Profile";

function App() {
  return (
    <Routes>

      {/* Main Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Route>

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/choose-scenario" element={<ChooseScenario />} />
          <Route path="/conversation" element={<Conversation />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/profile" element={<Profile />} />

        </Route>
      </Route>

    </Routes>
  );
}

export default App;




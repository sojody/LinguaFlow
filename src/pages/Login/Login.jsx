
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import robot from "../../assets/Waving Futuristic Robot Mascot.png";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        navigate("/dashboard");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">

        {/* Left Side */}
        <div className="login-left">

          <Link to="/" className="login-logo">
            <img src={robot} alt="LinguaFlow Robot" />
            <span>
              LinguaFlow <strong>AI</strong>
            </span>
          </Link>

          <div className="login-welcome">
            <h1>Welcome Back!</h1>

            <p>
              Continue your language learning journey
              and become a confident speaker.
            </p>
          </div>

          <div className="login-robot">
            <img src={robot} alt="AI Robot" />
          </div>

          <div className="login-quote">
            "Every conversation brings you one step closer
            to fluency."
          </div>

        </div>

        {/* Right Side */}
        <div className="login-right">

          <div className="login-form-container">

            <h2>Login to your account</h2>

            <p className="login-subtitle">
              Welcome back! Please enter your details.
            </p>

            <form className="login-form" onSubmit={handleLogin}>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>

                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>

                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="login-options">

                <label className="remember-me">
                  <input type="checkbox" />
                  Remember me
                </label>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>

              </div>

              {error && (
                <p style={{ color: "red", fontSize: "14px" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
                {!loading && <span>→</span>}
              </button>

            </form>

            <div className="login-divider">
              <span>OR</span>
            </div>

            <p className="signup-text">
              Don't have an account?
              <Link to="/signup"> Sign Up</Link>
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;


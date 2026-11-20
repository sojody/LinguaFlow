
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import robot from "../../assets/Waving Futuristic Robot Mascot.png";
import "./SignUp.css";

function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSignUp(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    // Check password
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,

        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setMessage(
          "Account created successfully! Check your email to confirm your account."
        );

        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-page">

      <div className="signup-container">

        {/* Left Side */}
        <div className="signup-left">

          <Link to="/" className="signup-logo">
            <img src={robot} alt="LinguaFlow Robot" />

            <span>
              LinguaFlow <strong>AI</strong>
            </span>
          </Link>

          <div className="signup-welcome">
            <h1>Start Your Journey!</h1>

            <p>
              Join LinguaFlow AI and discover a smarter
              and more exciting way to learn languages.
            </p>
          </div>

          <div className="signup-robot">
            <img src={robot} alt="LinguaFlow AI Robot" />
          </div>

          <div className="signup-quote">
            "Your journey to speaking a new language
            starts with one step."
          </div>

        </div>

        {/* Right Side */}
        <div className="signup-right">

          <div className="signup-form-container">

            <h2>Create Account</h2>

            <p className="signup-subtitle">
              Create your account and start learning today.
            </p>

            <form className="signup-form" onSubmit={handleSignUp}>

              {/* Full Name */}
              <div className="signup-form-group">
                <label htmlFor="fullname">Full Name</label>

                <input
                  type="text"
                  id="fullname"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="signup-form-group">
                <label htmlFor="signup-email">Email Address</label>

                <input
                  type="email"
                  id="signup-email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="signup-form-group">
                <label htmlFor="signup-password">Password</label>

                <input
                  type="password"
                  id="signup-password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {/* Confirm Password */}
              <div className="signup-form-group">
                <label htmlFor="confirm-password">
                  Confirm Password
                </label>

                <input
                  type="password"
                  id="confirm-password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {/* Terms */}
              <label className="signup-terms">
                <input type="checkbox" required />

                <span>
                  I agree to the Terms & Conditions
                </span>
              </label>

              {/* Error Message */}
              {error && (
                <p style={{ color: "red", fontSize: "14px" }}>
                  {error}
                </p>
              )}

              {/* Success Message */}
              {message && (
                <p style={{ color: "green", fontSize: "14px" }}>
                  {message}
                </p>
              )}

              {/* Button */}
              <button
                type="submit"
                className="signup-submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <span>→</span>}
              </button>

            </form>

            <div className="signup-divider">
              <span>OR</span>
            </div>

            <p className="login-text">
              Already have an account?
              <Link to="/login"> Login</Link>
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default SignUp;


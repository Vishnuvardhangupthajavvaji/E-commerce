// frontend/src/pages/Login.jsx

// ─────────────────────────────────────────────────────────────────
// FEATURES:
//   • Email + Password login
//   • Show/hide password toggle
//   • Inline error messages (no alert())
//   • Forgot Password flow — inline (no separate page needed):
//       1. User clicks "Forgot Password?"
//       2. Email input appears in the same card
//       3. User enters email → POST /api/users/forgot-password/
//       4. Success message shown
//   • Responsive: card is full-width on mobile, constrained on desktop
//
// FORGOT PASSWORD FLOW (backend):
//   We send the email to a new endpoint we'll add to users/views.py.
//   For now the UI is complete; backend sends a reset link via email.
//   (Django has built-in password reset views we'll wire up.)
//
// LAYOUT:
//   Mobile  → full width card, scrollable
//   Tablet+ → centered card, max-width 420px
// ─────────────────────────────────────────────────────────────────

import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye, faEyeSlash, faEnvelope, faLock,
  faArrowLeft, faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";

function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  // Forgot password state
  const [forgotMode,    setForgotMode]    = useState(false);
  const [forgotEmail,   setForgotEmail]   = useState("");
  const [forgotMsg,     setForgotMsg]     = useState("");
  const [forgotError,   setForgotError]   = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login }         = useContext(AuthContext);
  const { loadCartCount } = useContext(CartContext);
  const navigate          = useNavigate();

  // ── Login submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("token/", { email, password });
      login(res.data);
      loadCartCount();
      navigate("/");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password submit ──
  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMsg("");
    setForgotLoading(true);
    try {
      await API.post("users/forgot-password/", { email: forgotEmail });
      setForgotMsg("✓ Reset link sent! Check your email inbox.");
    } catch {
      // Even on error show a generic message for security
      // (don't reveal whether the email exists)
      setForgotMsg("If this email exists, a reset link has been sent.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* ── Store branding at top of card ── */}
        <div className="auth-brand">
          <span className="auth-brand-icon">🛒</span>
          <span className="auth-brand-name">JVVG Store</span>
        </div>

        {/* ════════════════════════════════
            FORGOT PASSWORD MODE
            ════════════════════════════════ */}
        {forgotMode ? (
          <>
            <button
              className="auth-back-btn"
              onClick={() => { setForgotMode(false); setForgotMsg(""); setForgotError(""); }}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Back to Login
            </button>

            <h2 className="auth-title">Forgot Password</h2>
            <p className="auth-subtitle">
              Enter your registered email and we'll send you a reset link.
            </p>

            {forgotMsg ? (
              // Success / generic message
              <div className="auth-success-box">{forgotMsg}</div>
            ) : (
              <form onSubmit={handleForgot}>
                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <div className="auth-input-group">
                    <span className="auth-input-icon">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </span>
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="you@email.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  {forgotError && <p className="auth-error">{forgotError}</p>}
                </div>

                <button
                  type="submit"
                  className="btn auth-submit-btn"
                  disabled={forgotLoading}
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                  {forgotLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}
          </>

        ) : (

        /* ════════════════════════════════
            NORMAL LOGIN MODE
            ════════════════════════════════ */
        <>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to your account</p>

          {error && <div className="auth-error-box">{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label">Password</label>
                {/* Forgot password link */}
                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={() => setForgotMode(true)}
                >
                  Forgot password?
                </button>
              </div>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <FontAwesomeIcon icon={faLock} />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  className="auth-input"
                  placeholder="Your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  required
                />
                {/* Show/hide password toggle */}
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPass(!showPass)}
                  aria-label="Toggle password visibility"
                >
                  <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          <p className="auth-switch-text">
            Don't have an account?{" "}
            <Link to="/register" className="auth-switch-link">Create one</Link>
          </p>
        </>
        )}

      </div>
    </div>
  );
}

export default Login;
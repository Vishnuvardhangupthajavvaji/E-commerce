// frontend/src/pages/ResetPassword.jsx
//
// Route: /reset-password/:token
//
// The user arrives here by clicking the link in their email:
//   http://localhost:5173/reset-password/a3f9c2...64hex...
//
// STATES:
//   idle      → show the new password form
//   loading   → POST in progress
//   success   → password reset, show link to login
//   error     → token invalid/expired, or validation failed
//
// SECURITY:
//   Token is read from the URL and sent to the backend.
//   Backend validates it, checks expiry, then deletes it after use.
//   One token = one use only.

import { useState }           from "react";
import { useParams, Link }    from "react-router-dom";
import API                    from "../api/axios";
import { FontAwesomeIcon }    from "@fortawesome/react-fontawesome";
import {
  faLock, faEye, faEyeSlash,
  faCheckCircle, faCircleExclamation,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

function ResetPassword() {
  const { token } = useParams();   // from /reset-password/:token in App.jsx

  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");

  // Client-side validation before hitting the API
  const validate = () => {
    if (password.length < 8)       return "Password must be at least 8 characters.";
    if (password !== confirm)      return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      await API.post(`users/reset-password/${token}/`, { new_password: password });
      setSuccess(true);
    } catch (err) {
      // Backend returns { error: "..." } for invalid/expired tokens
      setError(
        err.response?.data?.error ||
        "Something went wrong. Please request a new reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── PASSWORD STRENGTH INDICATOR ─────────────────────────────────
  const getStrength = (pw) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8)                    score++;
    if (pw.length >= 12)                   score++;
    if (/[A-Z]/.test(pw))                  score++;
    if (/[0-9]/.test(pw))                  score++;
    if (/[^A-Za-z0-9]/.test(pw))           score++;
    if (score <= 1) return { label: "Weak",   color: "var(--danger)",  width: "25%" };
    if (score <= 3) return { label: "Fair",   color: "var(--accent)",  width: "60%" };
    return             { label: "Strong", color: "#22c55e",         width: "100%" };
  };

  const strength = getStrength(password);

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Brand */}
        <div className="auth-brand">
          <span className="auth-brand-icon">🛒</span>
          <span className="auth-brand-name">JVVG Store</span>
        </div>

        {/* ── SUCCESS STATE ── */}
        {success ? (
          <div className="rp-success">
            <div className="rp-success-icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <h2 className="auth-title">Password Reset!</h2>
            <p className="auth-subtitle">
              Your password has been updated successfully.
              You can now sign in with your new password.
            </p>
            <Link to="/login" className="btn auth-submit-btn text-center">
              Go to Login
              <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
            </Link>
          </div>

        ) : (
        /* ── FORM STATE ── */
        <>
          <h2 className="auth-title">Set New Password</h2>
          <p className="auth-subtitle">
            Choose a strong password for your account.
          </p>

          {/* Error box — shown for invalid/expired token or mismatch */}
          {error && (
            <div className="auth-error-box">
              <FontAwesomeIcon icon={faCircleExclamation} className="me-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* New password */}
            <div className="auth-field">
              <label className="auth-label">New Password</label>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <FontAwesomeIcon icon={faLock} />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  className="auth-input"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPass(p => !p)}
                  aria-label="Toggle visibility"
                >
                  <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                </button>
              </div>

              {/* Strength bar */}
              {strength && (
                <div className="rp-strength">
                  <div className="rp-strength-bar">
                    <div
                      className="rp-strength-fill"
                      style={{ width: strength.width, background: strength.color }}
                    />
                  </div>
                  <span className="rp-strength-label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="auth-field">
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <FontAwesomeIcon icon={faLock} />
                </span>
                <input
                  type={showConfirm ? "text" : "password"}
                  className={`auth-input ${
                    confirm && confirm !== password ? "auth-input--error" : ""
                  }`}
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError(""); }}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirm(p => !p)}
                  aria-label="Toggle visibility"
                >
                  <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
                </button>
              </div>
              {/* Inline mismatch hint */}
              {confirm && confirm !== password && (
                <p className="auth-error">Passwords don't match</p>
              )}
            </div>

            <button
              type="submit"
              className="btn auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

          </form>

          <p className="auth-switch-text">
            Remember it?{" "}
            <Link to="/login" className="auth-switch-link">Back to Login</Link>
          </p>
        </>
        )}

      </div>
    </div>
  );
}

export default ResetPassword;
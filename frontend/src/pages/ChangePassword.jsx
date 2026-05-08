// frontend/src/pages/ChangePassword.jsx

import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faLock, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

function ChangePassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ old_password: "", new_password: "" });
  const [showOld,  setShowOld]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [success,  setSuccess]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null, non_field: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    API.post("users/change-password/", form)
      .then(() => { setSuccess(true); setTimeout(() => navigate("/profile"), 1500); })
      .catch(err => {
        if (err.response?.data) setErrors(err.response.data);
        else setErrors({ non_field: "Something went wrong." });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <button className="auth-back-btn mb-3" onClick={() => navigate("/profile")}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Profile
        </button>

        <div className="auth-brand">
          <span className="auth-brand-icon">🔒</span>
          <span className="auth-brand-name">Security</span>
        </div>

        <h2 className="auth-title">Change Password</h2>
        <p className="auth-subtitle">Keep your account safe with a strong password</p>

        {success && <div className="auth-success-box">✓ Password changed! Redirecting...</div>}
        {errors.non_field && <div className="auth-error-box">{errors.non_field}</div>}

        <form onSubmit={handleSubmit}>

          {/* Old password */}
          <div className="auth-field">
            <label className="auth-label">Current Password</label>
            <div className="auth-input-group">
              <span className="auth-input-icon"><FontAwesomeIcon icon={faLock} /></span>
              <input
                type={showOld ? "text" : "password"}
                name="old_password"
                className="auth-input"
                placeholder="Your current password"
                value={form.old_password}
                onChange={handleChange}
                required
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowOld(!showOld)}>
                <FontAwesomeIcon icon={showOld ? faEyeSlash : faEye} />
              </button>
            </div>
            {errors.old_password && <p className="auth-error">{Array.isArray(errors.old_password) ? errors.old_password[0] : errors.old_password}</p>}
          </div>

          {/* New password */}
          <div className="auth-field">
            <label className="auth-label">New Password</label>
            <div className="auth-input-group">
              <span className="auth-input-icon"><FontAwesomeIcon icon={faLock} /></span>
              <input
                type={showNew ? "text" : "password"}
                name="new_password"
                className="auth-input"
                placeholder="Min. 8 characters"
                value={form.new_password}
                onChange={handleChange}
                required
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowNew(!showNew)}>
                <FontAwesomeIcon icon={showNew ? faEyeSlash : faEye} />
              </button>
            </div>
            {errors.new_password && <p className="auth-error">{Array.isArray(errors.new_password) ? errors.new_password[0] : errors.new_password}</p>}
          </div>

          <button type="submit" className="btn auth-submit-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default ChangePassword;
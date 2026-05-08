// frontend/src/pages/Register.jsx

// ─────────────────────────────────────────────────────────────────
// IMPROVEMENTS vs original:
//   • Grouped into sections: Account Info + Address Info
//   • Inline field-level error messages from API
//   • Show/hide password toggle
//   • No alert() — errors shown in the card
//   • Responsive: full-width mobile, constrained desktop
//   • Loading state on submit button
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye, faEyeSlash, faUser, faPhone,
  faEnvelope, faLock, faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "", phone: "",   email:   "",
    password: "", address: "", state:   "",
    city:     "", pincode: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [errors,   setErrors]   = useState({});    // field-level errors from API
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear the error for this field as user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await API.post("users/register/", form);
      navigate("/login");
    } catch (err) {
      // Django REST returns field-level errors as { fieldname: ["error msg"] }
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ non_field: "Registration failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to render a field error
  const FieldError = ({ name }) =>
    errors[name] ? <p className="auth-error">{Array.isArray(errors[name]) ? errors[name][0] : errors[name]}</p> : null;

  return (
    <div className="auth-page auth-page--register">
      <div className="auth-card auth-card--wide">

        {/* Branding */}
        <div className="auth-brand">
          <span className="auth-brand-icon">🛒</span>
          <span className="auth-brand-name">JVVG Store</span>
        </div>

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Join thousands of happy shoppers</p>

        {errors.non_field && <div className="auth-error-box">{errors.non_field}</div>}

        <form onSubmit={handleSubmit}>

          {/* ── Section: Account Info ── */}
          <p className="auth-section-label">Account Information</p>

          <div className="auth-grid-2">

            {/* Username */}
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-group">
                <span className="auth-input-icon"><FontAwesomeIcon icon={faUser} /></span>
                <input name="username" className="auth-input" placeholder="Your name"
                  value={form.username} onChange={handleChange} required />
              </div>
              <FieldError name="username" />
            </div>

            {/* Phone */}
            <div className="auth-field">
              <label className="auth-label">Phone Number</label>
              <div className="auth-input-group">
                <span className="auth-input-icon"><FontAwesomeIcon icon={faPhone} /></span>
                <input name="phone" className="auth-input" placeholder="+91 98765 43210"
                  value={form.phone} onChange={handleChange} required />
              </div>
              <FieldError name="phone" />
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-group">
                <span className="auth-input-icon"><FontAwesomeIcon icon={faEnvelope} /></span>
                <input type="email" name="email" className="auth-input" placeholder="you@email.com"
                  value={form.email} onChange={handleChange} required />
              </div>
              <FieldError name="email" />
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-group">
                <span className="auth-input-icon"><FontAwesomeIcon icon={faLock} /></span>
                <input type={showPass ? "text" : "password"} name="password" className="auth-input"
                  placeholder="Min. 8 characters" value={form.password} onChange={handleChange} required />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPass(!showPass)}>
                  <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                </button>
              </div>
              <FieldError name="password" />
            </div>

          </div>

          {/* ── Section: Address ── */}
          <p className="auth-section-label">Delivery Address</p>

          <div className="auth-field">
            <label className="auth-label">Street Address</label>
            <div className="auth-input-group">
              <span className="auth-input-icon"><FontAwesomeIcon icon={faLocationDot} /></span>
              <input name="address" className="auth-input" placeholder="Door no, Street, Area"
                value={form.address} onChange={handleChange} />
            </div>
            <FieldError name="address" />
          </div>

          <div className="auth-grid-3">

            <div className="auth-field">
              <label className="auth-label">State</label>
              <input name="state" className="auth-input auth-input--standalone"
                placeholder="Telangana" value={form.state} onChange={handleChange} />
              <FieldError name="state" />
            </div>

            <div className="auth-field">
              <label className="auth-label">City</label>
              <input name="city" className="auth-input auth-input--standalone"
                placeholder="Hyderabad" value={form.city} onChange={handleChange} />
              <FieldError name="city" />
            </div>

            <div className="auth-field">
              <label className="auth-label">Pincode</label>
              <input name="pincode" className="auth-input auth-input--standalone"
                placeholder="500001" value={form.pincode} onChange={handleChange} />
              <FieldError name="pincode" />
            </div>

          </div>

          <button type="submit" className="btn auth-submit-btn mt-2" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        <p className="auth-switch-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-switch-link">Sign in</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
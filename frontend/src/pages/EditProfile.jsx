// frontend/src/pages/EditProfile.jsx

import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser, faPhone, faLocationDot,
  faCity, faMap, faHashtag, faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

function EditProfile() {
  const [form,    setForm]    = useState({});
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const navigate              = useNavigate();

  useEffect(() => {
    API.get("users/me/").then(res => setForm(res.data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    API.put("users/me/update", form)
      .then(() => { setSaved(true); setTimeout(() => navigate("/profile"), 1200); })
      .catch(err => {
        if (err.response?.data) setErrors(err.response.data);
      })
      .finally(() => setLoading(false));
  };

  const FieldError = ({ name }) =>
    errors[name] ? <p className="auth-error">{Array.isArray(errors[name]) ? errors[name][0] : errors[name]}</p> : null;

  // ── Reusable input with icon ──
  const Field = ({ icon, label, name, placeholder, type = "text" }) => (
    <div className="auth-field">
      <label className="auth-label">{label}</label>
      <div className="auth-input-group">
        <span className="auth-input-icon"><FontAwesomeIcon icon={icon} /></span>
        <input
          type={type}
          name={name}
          className="auth-input"
          placeholder={placeholder}
          value={form[name] || ""}
          onChange={handleChange}
        />
      </div>
      <FieldError name={name} />
    </div>
  );

  return (
    <div className="auth-page auth-page--register">
      <div className="auth-card auth-card--wide">

        {/* Back button */}
        <button className="auth-back-btn mb-3" onClick={() => navigate("/profile")}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Profile
        </button>

        {/* Brand */}
        <div className="auth-brand">
          <span className="auth-brand-icon">🛒</span>
          <span className="auth-brand-name">JVVG Store</span>
        </div>

        <h2 className="auth-title">Edit Profile</h2>
        <p className="auth-subtitle">Update your personal information</p>

        {/* Success message */}
        {saved && <div className="auth-success-box">✓ Profile updated! Redirecting...</div>}

        <form onSubmit={handleSubmit}>

          <p className="auth-section-label">Personal Details</p>
          <div className="auth-grid-2">
            <Field icon={faUser}  label="Full Name"     name="username" placeholder="Your name" />
            <Field icon={faPhone} label="Phone Number"  name="phone"    placeholder="+91 98765 43210" />
          </div>

          <p className="auth-section-label">Delivery Address</p>
          <Field icon={faLocationDot} label="Street Address" name="address" placeholder="Door no, Street, Area" />

          <div className="auth-grid-3">
            <div className="auth-field">
              <label className="auth-label">State</label>
              <input name="state" className="auth-input auth-input--standalone"
                placeholder="Telangana" value={form.state || ""} onChange={handleChange} />
              <FieldError name="state" />
            </div>
            <div className="auth-field">
              <label className="auth-label">City</label>
              <input name="city" className="auth-input auth-input--standalone"
                placeholder="Hyderabad" value={form.city || ""} onChange={handleChange} />
              <FieldError name="city" />
            </div>
            <div className="auth-field">
              <label className="auth-label">Pincode</label>
              <input name="pincode" className="auth-input auth-input--standalone"
                placeholder="500001" value={form.pincode || ""} onChange={handleChange} />
              <FieldError name="pincode" />
            </div>
          </div>

          <button type="submit" className="btn auth-submit-btn mt-3" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default EditProfile;
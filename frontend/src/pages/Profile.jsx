// frontend/src/pages/Profile.jsx

// ─────────────────────────────────────────────────────────────────
// LAYOUT:
//   ┌─────────────────────────────────────────┐
//   │  [Avatar initials]  Name  Email         │  ← Profile header card
//   │  Admin badge (if is_staff)              │
//   └─────────────────────────────────────────┘
//   ┌──────────────────┐  ┌──────────────────┐
//   │ Contact Details  │  │ Address Details  │  ← Two-column info
//   └──────────────────┘  └──────────────────┘
//   [Edit Profile]  [Change Password]  [Logout]  ← Action buttons
//
// RESPONSIVE:
//   Desktop → two info columns side by side
//   Mobile  → stacked single column
// ─────────────────────────────────────────────────────────────────

import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser, faEnvelope, faPhone, faLocationDot,
  faCity, faMap, faHashtag, faPen,
  faLock, faRightFromBracket, faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

// ── Info row inside the detail cards ──
function InfoRow({ icon, label, value }) {
  return (
    <div className="profile-info-row">
      <span className="profile-info-icon">
        <FontAwesomeIcon icon={icon} />
      </span>
      <div>
        <p className="profile-info-label">{label}</p>
        <p className="profile-info-value">{value || <span className="profile-info-empty">Not provided</span>}</p>
      </div>
    </div>
  );
}

function Profile() {
  const navigate           = useNavigate();
  const { user, logout, loading } = useContext(AuthContext);

  // We read user from AuthContext (already fetched on login)
  // No extra API call needed

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading || !user) {
    return (
      <div className="container py-5">
        <div className="profile-skeleton">
          <div className="placeholder-glow">
            <span className="placeholder d-block mb-3" style={{ height: 120, borderRadius: 12 }} />
            <span className="placeholder col-8 d-block mb-2" />
            <span className="placeholder col-5 d-block" />
          </div>
        </div>
      </div>
    );
  }

  // Build initials for avatar: "Vishnu Vardhan" → "VV"
  const initials = user.username
    ? user.username.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="profile-page">
      <div className="container py-4">

        {/* ══ HEADER CARD ══════════════════════════════════════ */}
        <div className="profile-header-card">

          {/* Avatar */}
          <div className="profile-avatar">{initials}</div>

          <div className="profile-header-info">
            <div className="profile-name-row">
              <h1 className="profile-name">{user.username}</h1>
              {/* Admin badge */}
              {user.is_staff && (
                <span className="profile-admin-badge">
                  <FontAwesomeIcon icon={faShieldHalved} className="me-1" />
                  Admin
                </span>
              )}
            </div>
            <p className="profile-email">
              <FontAwesomeIcon icon={faEnvelope} className="me-2" />
              {user.email}
            </p>
          </div>

          {/* Action buttons — top-right on desktop, bottom on mobile */}
          <div className="profile-header-actions">
            <button className="btn profile-btn-edit" onClick={() => navigate("/profile/edit")}>
              <FontAwesomeIcon icon={faPen} className="me-2" />
              Edit Profile
            </button>
          </div>

        </div>

        {/* ══ INFO CARDS ══════════════════════════════════════ */}
        <div className="row g-4 mt-1">

          {/* Contact details */}
          <div className="col-12 col-md-6">
            <div className="profile-info-card">
              <h3 className="profile-info-card-title">Contact Details</h3>
              <InfoRow icon={faUser}     label="Full Name"     value={user.username} />
              <InfoRow icon={faEnvelope} label="Email"         value={user.email} />
              <InfoRow icon={faPhone}    label="Phone"         value={user.phone} />
            </div>
          </div>

          {/* Address details */}
          <div className="col-12 col-md-6">
            <div className="profile-info-card">
              <h3 className="profile-info-card-title">Delivery Address</h3>
              <InfoRow icon={faLocationDot} label="Address" value={user.address} />
              <InfoRow icon={faCity}        label="City"    value={user.city} />
              <InfoRow icon={faMap}         label="State"   value={user.state} />
              <InfoRow icon={faHashtag}     label="Pincode" value={user.pincode} />
            </div>
          </div>

        </div>

        {/* ══ ACTION BUTTONS ROW ══════════════════════════════ */}
        <div className="profile-actions-row">

          <button className="btn profile-action-btn profile-action-btn--primary"
            onClick={() => navigate("/profile/edit")}>
            <FontAwesomeIcon icon={faPen} className="me-2" />
            Edit Profile
          </button>

          <button className="btn profile-action-btn profile-action-btn--secondary"
            onClick={() => navigate("/change-password")}>
            <FontAwesomeIcon icon={faLock} className="me-2" />
            Change Password
          </button>

          {user.is_staff && (
            <button className="btn profile-action-btn profile-action-btn--admin"
              onClick={() => navigate("/admin/products")}>
              <FontAwesomeIcon icon={faShieldHalved} className="me-2" />
              Admin Panel
            </button>
          )}

          <button className="btn profile-action-btn profile-action-btn--logout"
            onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} className="me-2" />
            Logout
          </button>

        </div>

      </div>
    </div>
  );
}

export default Profile;
// frontend/src/pages/admin/AdminUsers.jsx
// Route: /admin/users
//
// FEATURES:
//   • Lists all registered users
//   • Search by name or email
//   • Toggle admin (is_staff) status per user
//   • Cannot demote yourself (backend also enforces this)
//   • Shows join date, user count badge

import { useEffect, useState, useContext } from "react";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faMagnifyingGlass, faUser,
} from "@fortawesome/free-solid-svg-icons";

function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useContext(AuthContext);

  useEffect(() => {
    API.get("users/admin/users/")
      .then(res => setUsers(res.data))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleStaff = (userId) => {
    API.patch(`users/admin/users/${userId}/toggle-staff/`)
      .then(res => {
        setUsers(prev =>
          prev.map(u => u.id === userId ? { ...u, is_staff: res.data.is_staff } : u)
        );
      })
      .catch(err => {
        const msg = err.response?.data?.error || "Failed to update admin status";
        alert(msg);
      });
  };

  // Filter in-memory (list is small)
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-overview">

      <div className="admin-page-header-row">
        <div>
          <h1 className="admin-page-title">Users</h1>
          <p className="admin-page-subtitle">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Search */}
      <div className="admin-filters">
        <div className="admin-search-wrap">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="admin-search-icon" />
          <input
            className="admin-search-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table admin-table--full">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(null).map((_, i) => (
                <tr key={i}>
                  {Array(6).fill(null).map((__, j) => (
                    <td key={j}><span className="placeholder-glow"><span className="placeholder col-10" /></span></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">No users found.</td>
              </tr>
            ) : filtered.map(u => (
              <tr key={u.id} className={u.id === currentUser?.id ? "admin-table-row--self" : ""}>

                {/* Avatar + name */}
                <td>
                  <div className="admin-user-cell">
                    <div className="admin-user-avatar">
                      {u.username?.[0]?.toUpperCase() || <FontAwesomeIcon icon={faUser} />}
                    </div>
                    <div>
                      <p className="admin-user-name">
                        {u.username}
                        {u.id === currentUser?.id && (
                          <span className="admin-you-badge">You</span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="admin-text-muted">{u.email}</td>
                <td className="admin-text-muted">{u.phone || "—"}</td>

                {/* Joined date */}
                <td className="admin-text-muted">
                  {u.date_joined
                    ? new Date(u.date_joined).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                    : "—"}
                </td>

                {/* Role badge */}
                <td>
                  <span className={`admin-role-badge ${u.is_staff ? "admin-role-badge--admin" : "admin-role-badge--user"}`}>
                    {u.is_staff ? "Admin" : "User"}
                  </span>
                </td>

                {/* Toggle action */}
                <td>
                  <button
                    className={`admin-icon-btn ${u.is_staff ? "admin-icon-btn--red" : "admin-icon-btn--green"}`}
                    onClick={() => toggleStaff(u.id)}
                    disabled={u.id === currentUser?.id}
                    title={
                      u.id === currentUser?.id
                        ? "Cannot change your own role"
                        : u.is_staff ? "Revoke admin" : "Grant admin"
                    }
                  >
                    <FontAwesomeIcon icon={u.is_staff ? faShieldHalved : faShieldHalved} />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default AdminUsers;
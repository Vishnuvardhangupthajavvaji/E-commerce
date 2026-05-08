// frontend/src/pages/admin/AdminOrders.jsx
// Upgraded UI — card-based layout, expandable order details, smooth status update

import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import API                     from "../../api/axios";
import ConfirmModal            from "../../components/ConfirmModal";
import { FontAwesomeIcon }     from "@fortawesome/react-fontawesome";
import {
  faBoxOpen, faSpinner, faChevronDown, faChevronUp,
  faCheck, faXmark, faTruck, faUser, faPhone,
  faMapMarkerAlt, faReceipt, faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

const ALL_STATUSES = [
  { value: "",                 label: "All Orders",       color: "" },
  { value: "placed",           label: "Placed",           color: "placed" },
  { value: "confirmed",        label: "Confirmed",        color: "confirmed" },
  { value: "shipped",          label: "Shipped",          color: "shipped" },
  { value: "out_for_delivery", label: "Out for Delivery", color: "out_for_delivery" },
  { value: "delivered",        label: "Delivered",        color: "delivered" },
  { value: "cancelled",        label: "Cancelled",        color: "cancelled" },
];

const UPDATABLE_STATUSES = ALL_STATUSES.filter(s => s.value && s.value !== "cancelled");

function StatusBadge({ status }) {
  return (
    <span className={`order-status-badge order-status-badge--${status}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function AdminOrders() {
  const navigate = useNavigate();

  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState("");
  const [expandedId,   setExpandedId]   = useState(null);   // which order card is expanded
  const [editingId,    setEditingId]    = useState(null);   // which order is being status-edited
  const [editStatus,   setEditStatus]   = useState("");
  const [editNote,     setEditNote]     = useState("");
  const [saving,       setSaving]       = useState(false);
  const [saveMsg,      setSaveMsg]      = useState({});
  const [modal,        setModal]        = useState(null);

  const fetchOrders = (status = filter) => {
    setLoading(true);
    const url = status ? `orders/admin/?status=${status}` : "orders/admin/";
    API.get(url)
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(""); }, []);

  const handleFilter = (val) => {
    setFilter(val);
    fetchOrders(val);
    setExpandedId(null);
    setEditingId(null);
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
    if (editingId === id) setEditingId(null);
  };

  const startEdit = (order) => {
    setEditingId(order.id);
    setEditStatus(order.status);
    setEditNote("");
  };

  const cancelEdit = () => { setEditingId(null); setEditNote(""); };

  const saveStatus = async (orderId) => {
    setSaving(true);
    try {
      await API.patch(`orders/admin/${orderId}/status/`, {
        status: editStatus,
        note:   editNote,
      });
      setSaveMsg(prev => ({ ...prev, [orderId]: "saved" }));
      setTimeout(() => setSaveMsg(prev => ({ ...prev, [orderId]: null })), 2500);
      setEditingId(null);
      fetchOrders();
    } catch (err) {
      setModal({
        title:   "Update Failed",
        message: err.response?.data?.error || "Failed to update order status. Please try again.",
        confirm: "OK",
        cancel:  null,
        danger:  true,
        onConfirm: () => setModal(null),
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Status filter tab counts ──────────────────────────────────
  const countByStatus = (val) =>
    val === "" ? orders.length : orders.filter(o => o.status === val).length;

  const fmt = n => Number(n).toLocaleString("en-IN");

  return (
    <>
    <div className="admin-overview">

      {/* ── Header ── */}
      <div className="admin-page-header-row">
        <div>
          <h1 className="admin-page-title">
            <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
            Orders
          </h1>
          <p className="admin-page-subtitle">
            Manage and update all customer orders
          </p>
        </div>
      </div>

      {/* ── Status filter tabs ── */}
      <div className="ao-filter-tabs">
        {ALL_STATUSES.map(s => (
          <button
            key={s.value}
            className={`ao-filter-tab ${filter === s.value ? "ao-filter-tab--active" : ""}`}
            onClick={() => handleFilter(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="text-center py-5">
          <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: "2rem", color: "var(--primary)" }} />
        </div>
      ) : orders.length === 0 ? (
        <div className="admin-empty-state">No orders found.</div>
      ) : (
        <div className="ao-cards">
          {orders.map(order => {
            const isExpanded = expandedId === order.id;
            const isEditing  = editingId  === order.id;
            const canUpdate  = !["delivered", "cancelled"].includes(order.status);

            return (
              <div key={order.id} className={`ao-card ${isExpanded ? "ao-card--expanded" : ""}`}>

                {/* ── Card header (always visible) ── */}
                <div className="ao-card-header" onClick={() => toggleExpand(order.id)}>

                  <div className="ao-card-header-left">
                    <span className="ao-order-num">#{order.id}</span>
                    <StatusBadge status={order.status} />
                    {saveMsg[order.id] === "saved" && (
                      <span className="ao-save-flash">
                        <FontAwesomeIcon icon={faCircleCheck} className="me-1" />Saved
                      </span>
                    )}
                  </div>

                  <div className="ao-card-header-mid">
                    <span className="ao-customer-name">
                      <FontAwesomeIcon icon={faUser} className="me-1" />
                      {order.full_name}
                    </span>
                    <span className="ao-order-meta">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      &nbsp;·&nbsp;
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="ao-card-header-right">
                    <span className="ao-order-amount">₹{fmt(order.total_amount)}</span>
                    <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown}
                      style={{ color: "var(--text-muted)", fontSize: "0.85rem" }} />
                  </div>
                </div>

                {/* ── Expanded detail ── */}
                {isExpanded && (
                  <div className="ao-card-body">

                    <div className="row g-3">

                      {/* Items list */}
                      <div className="col-12 col-md-5">
                        <p className="ao-section-label">
                          <FontAwesomeIcon icon={faReceipt} className="me-1" />Items
                        </p>
                        <div className="ao-items-list">
                          {order.items.map(item => (
                            <div key={item.id} className="ao-item-row">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="ao-item-img" />
                              )}
                              <div className="ao-item-info">
                                <p className="ao-item-name">{item.name}</p>
                                <p className="ao-item-meta">
                                  {item.quantity} × ₹{fmt(item.price)}
                                  &nbsp;=&nbsp;
                                  <strong>₹{fmt(item.subtotal)}</strong>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="ao-total-row">
                          Total: <strong>₹{fmt(order.total_amount)}</strong>
                          &nbsp;·&nbsp; COD
                        </div>
                      </div>

                      {/* Shipping address */}
                      <div className="col-12 col-md-3">
                        <p className="ao-section-label">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />Shipping
                        </p>
                        <div className="ao-address-block">
                          <p className="ao-address-name">{order.full_name}</p>
                          <p className="ao-address-line">
                            <FontAwesomeIcon icon={faPhone} className="me-1" style={{ fontSize: "0.7rem" }} />
                            {order.phone}
                          </p>
                          <p className="ao-address-line">{order.address}</p>
                          <p className="ao-address-line">{order.city}, {order.state}</p>
                          <p className="ao-address-line">PIN: {order.pincode}</p>
                        </div>
                      </div>

                      {/* Status update */}
                      <div className="col-12 col-md-4">
                        <p className="ao-section-label">
                          <FontAwesomeIcon icon={faTruck} className="me-1" />Update Status
                        </p>

                        {/* Timeline */}
                        <div className="ao-mini-timeline">
                          {["placed","confirmed","shipped","out_for_delivery","delivered"].map((s, i, arr) => {
                            const statuses = ["placed","confirmed","shipped","out_for_delivery","delivered","cancelled"];
                            const curIdx   = statuses.indexOf(order.status);
                            const sIdx     = statuses.indexOf(s);
                            const done     = sIdx <= curIdx && order.status !== "cancelled";
                            return (
                              <div key={s} className="ao-mini-step">
                                <div className={`ao-mini-dot ${done ? "ao-mini-dot--done" : ""}`} />
                                {i < arr.length - 1 && (
                                  <div className={`ao-mini-line ${sIdx < curIdx && order.status !== "cancelled" ? "ao-mini-line--done" : ""}`} />
                                )}
                                <span className="ao-mini-label">{s.replace(/_/g, " ")}</span>
                              </div>
                            );
                          })}
                        </div>

                        {canUpdate && !isEditing && (
                          <button
                            className="btn ao-update-btn mt-2"
                            onClick={() => startEdit(order)}
                          >
                            <FontAwesomeIcon icon={faTruck} className="me-2" />
                            Update Status
                          </button>
                        )}

                        {canUpdate && isEditing && (
                          <div className="ao-edit-form mt-2">
                            <select
                              className="admin-filter-select w-100 mb-2"
                              value={editStatus}
                              onChange={e => setEditStatus(e.target.value)}
                            >
                              {UPDATABLE_STATUSES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <input
                              className="admin-search-input mb-2"
                              placeholder="Note, e.g. Dispatched via DTDC (optional)"
                              value={editNote}
                              onChange={e => setEditNote(e.target.value)}
                            />
                            <div className="d-flex gap-2">
                              <button
                                className="btn ao-save-btn"
                                onClick={() => saveStatus(order.id)}
                                disabled={saving}
                              >
                                {saving
                                  ? <FontAwesomeIcon icon={faSpinner} spin />
                                  : <><FontAwesomeIcon icon={faCheck} className="me-1" />Save</>
                                }
                              </button>
                              <button className="btn ao-cancel-btn" onClick={cancelEdit}>
                                <FontAwesomeIcon icon={faXmark} className="me-1" />Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {!canUpdate && (
                          <p className="ao-final-note">
                            Order is {order.status} — no further updates.
                          </p>
                        )}

                        {/* History log */}
                        {order.history?.length > 0 && (
                          <div className="ao-history mt-3">
                            <p className="ao-section-label mb-1">History</p>
                            {order.history.map((h, i) => (
                              <div key={i} className="ao-history-row">
                                <span className={`ao-history-dot ao-history-dot--${h.status}`} />
                                <div>
                                  <span className="ao-history-status">{h.status.replace(/_/g, " ")}</span>
                                  {h.note && <span className="ao-history-note"> — {h.note}</span>}
                                  <span className="ao-history-time">
                                    {new Date(h.timestamp).toLocaleString("en-IN", {
                                      day: "numeric", month: "short",
                                      hour: "2-digit", minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>

    {modal && <ConfirmModal {...modal} onCancel={() => setModal(null)} />}
      </>
  );
}

export default AdminOrders;